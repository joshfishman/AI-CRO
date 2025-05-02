import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { path, workspace: workspaceId = 'default' } = req.query;
    
    if (!path) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'A path parameter is required to get test results' 
      });
    }
    
    console.log(`Getting test results for workspace: ${workspaceId}, path: ${path}`);
    
    // Initialize Edge Config client
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // Get test configuration
    const configKey = `page:${workspaceId}:${path}`;
    const config = await edgeConfig.get(configKey) || { selectors: [] };
    
    // Get test statistics
    const statsKey = `stats:${workspaceId}:${path}`;
    const stats = await edgeConfig.get(statsKey) || { 
      impressions: 0, 
      ctaClicks: 0, 
      conversions: 0,
      variants: {}
    };
    
    // Try to get list of available workspaces
    let availableWorkspaces = [];
    try {
      const workspacesKey = 'workspaces';
      availableWorkspaces = await edgeConfig.get(workspacesKey) || [];
      
      // If this workspace is not in the list, add it
      if (!availableWorkspaces.includes(workspaceId) && workspaceId !== 'default') {
        availableWorkspaces.push(workspaceId);
        await edgeConfig.set(workspacesKey, availableWorkspaces);
      }
    } catch (workspacesError) {
      console.warn('Error getting workspaces list:', workspacesError);
    }
    
    // Calculate performance metrics for each variant
    const results = calculateTestResults(config, stats);
    
    return res.status(200).json({
      path,
      workspaceId,
      results,
      totalImpressions: stats.impressions || 0,
      totalCtaClicks: stats.ctaClicks || 0,
      totalConversions: stats.conversions || 0,
      startDate: stats.startDate,
      lastUpdate: stats.lastUpdate || new Date().toISOString(),
      availableWorkspaces
    });
  } catch (error) {
    console.error('Error retrieving test results:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve test results',
      message: error.message 
    });
  }
}

/**
 * Calculate test results from config and stats
 */
function calculateTestResults(config, stats) {
  const results = {};
  
  // Process each selector in the config
  config.selectors?.forEach(selector => {
    const selectorPath = selector.selector;
    const selectorStats = stats.variants?.[selectorPath] || {};
    
    const variants = selector.variants?.map((variant, index) => {
      const variantId = index.toString();
      const variantStats = selectorStats[variantId] || { 
        impressions: 0, 
        ctaClicks: 0, 
        conversions: 0 
      };
      
      // Calculate CTR (Click-Through Rate) and CVR (Conversion Rate)
      const ctr = variantStats.impressions > 0 
        ? (variantStats.ctaClicks / variantStats.impressions) * 100 
        : 0;
        
      const cvr = variantStats.ctaClicks > 0 
        ? (variantStats.conversions / variantStats.ctaClicks) * 100 
        : 0;
      
      // Calculate improvement over default variant
      let improvement = 0;
      const defaultVariant = selector.variants.findIndex(v => v.isDefault);
      
      if (defaultVariant !== -1 && defaultVariant !== index) {
        const defaultStats = selectorStats[defaultVariant.toString()] || { impressions: 0, ctaClicks: 0 };
        const defaultCtr = defaultStats.impressions > 0 
          ? (defaultStats.ctaClicks / defaultStats.impressions) * 100 
          : 0;
          
        improvement = defaultCtr > 0 
          ? ((ctr - defaultCtr) / defaultCtr) * 100 
          : 0;
      }
      
      return {
        variantId,
        name: variant.name || `Variant ${index}`,
        userType: variant.userType || 'all',
        isDefault: variant.isDefault || false,
        impressions: variantStats.impressions || 0,
        ctaClicks: variantStats.ctaClicks || 0,
        conversions: variantStats.conversions || 0,
        ctr: parseFloat(ctr.toFixed(2)),
        cvr: parseFloat(cvr.toFixed(2)),
        improvement: parseFloat(improvement.toFixed(2))
      };
    }) || [];
    
    // Determine confidence level based on chi-squared test
    const confidenceData = calculateConfidence(variants);
    
    results[selectorPath] = {
      selector: selectorPath,
      contentType: selector.contentType || 'text',
      variants,
      confidence: confidenceData.confidence,
      winner: confidenceData.winner,
      significanceLevel: confidenceData.significanceLevel
    };
  });
  
  return results;
}

/**
 * Calculate statistical confidence using Chi-Squared test
 */
function calculateConfidence(variants) {
  if (!variants || variants.length < 2) {
    return { confidence: 0, winner: null, significanceLevel: 'none' };
  }
  
  // Find variant with highest CTR that has enough impressions
  const validVariants = variants.filter(v => v.impressions >= 30);
  if (validVariants.length < 2) {
    return { confidence: 0, winner: null, significanceLevel: 'not enough data' };
  }
  
  // Sort by CTR descending
  const sortedVariants = [...validVariants].sort((a, b) => b.ctr - a.ctr);
  const bestVariant = sortedVariants[0];
  const defaultVariant = variants.find(v => v.isDefault) || variants[0];
  
  // Calculate Chi-Squared statistic
  const bestSuccesses = bestVariant.ctaClicks;
  const bestFailures = bestVariant.impressions - bestVariant.ctaClicks;
  const defaultSuccesses = defaultVariant.ctaClicks;
  const defaultFailures = defaultVariant.impressions - defaultVariant.ctaClicks;
  
  // Ensure we have enough data
  if (bestSuccesses + bestFailures < 30 || defaultSuccesses + defaultFailures < 30) {
    return { confidence: 0, winner: null, significanceLevel: 'not enough data' };
  }
  
  // Simple chi-squared calculation for 2×2 contingency table
  const totalA = bestSuccesses + bestFailures;
  const totalB = defaultSuccesses + defaultFailures;
  const totalSuccess = bestSuccesses + defaultSuccesses;
  const totalFailure = bestFailures + defaultFailures;
  const grandTotal = totalA + totalB;
  
  const expectedA1 = (totalA * totalSuccess) / grandTotal;
  const expectedA2 = (totalA * totalFailure) / grandTotal;
  const expectedB1 = (totalB * totalSuccess) / grandTotal;
  const expectedB2 = (totalB * totalFailure) / grandTotal;
  
  const chiSquared = 
    Math.pow(bestSuccesses - expectedA1, 2) / expectedA1 +
    Math.pow(bestFailures - expectedA2, 2) / expectedA2 +
    Math.pow(defaultSuccesses - expectedB1, 2) / expectedB1 +
    Math.pow(defaultFailures - expectedB2, 2) / expectedB2;
  
  // Chi-squared with 1 degree of freedom
  // Significance levels: 3.84 for 95%, 6.63 for 99%, 10.83 for 99.9%
  let confidence = 0;
  let significanceLevel = 'none';
  
  if (chiSquared >= 10.83) {
    confidence = 99.9;
    significanceLevel = 'very high';
  } else if (chiSquared >= 6.63) {
    confidence = 99;
    significanceLevel = 'high';
  } else if (chiSquared >= 3.84) {
    confidence = 95;
    significanceLevel = 'medium';
  } else {
    confidence = Math.min(90, (chiSquared / 3.84) * 95);
    significanceLevel = 'low';
  }
  
  return {
    confidence: parseFloat(confidence.toFixed(1)),
    winner: bestVariant.variantId,
    significanceLevel
  };
} 