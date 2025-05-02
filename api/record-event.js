import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { eventType, pageUrl, workspaceId, selector, variant, userType } = req.body;
    
    if (!eventType || !pageUrl || !workspaceId) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'eventType, pageUrl, and workspaceId are required' 
      });
    }
    
    // Log the event
    console.log('Recording event:', { 
      eventType, 
      pageUrl, 
      workspaceId, 
      selector, 
      variant,
      userType 
    });
    
    // Get Edge Config client
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    if (!edgeConfig) {
      console.error('Edge Config not initialized');
      return res.status(500).json({ error: 'Edge Config not available' });
    }
    
    // Define keys for stats
    const statsKey = `stats:${workspaceId}:${pageUrl}`;
    
    try {
      // Get current stats from Edge Config
      let stats = await edgeConfig.get(statsKey);
      
      // If no stats exist yet, initialize them
      if (!stats) {
        stats = {
          impressions: 0,
          events: {},
          variants: {},
          userTypes: {},
          winner: null,
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Update stats based on event type
      switch (eventType) {
        case 'impression':
          // Track an impression (page view with personalization)
          stats.impressions = (stats.impressions || 0) + 1;
          break;
          
        case 'ctaClick':
          // Track a CTA click for a specific selector and variant
          if (selector) {
            // Initialize selectors object if it doesn't exist
            if (!stats.events[selector]) {
              stats.events[selector] = { clicks: 0, variants: {} };
            }
            
            // Increment total clicks for this selector
            stats.events[selector].clicks = (stats.events[selector].clicks || 0) + 1;
            
            // If a specific variant is provided, track it
            if (variant) {
              if (!stats.events[selector].variants[variant]) {
                stats.events[selector].variants[variant] = 0;
              }
              stats.events[selector].variants[variant]++;
            }
            
            // Check if we have a statistical winner
            const winner = determineWinner(stats.events[selector]);
            if (winner) {
              stats.winner = { 
                selector, 
                variant: winner,
                confidence: 0.95, // Placeholder - actual confidence calculation would be more complex
                timestamp: new Date().toISOString()
              };
            }
          }
          break;
          
        case 'conversion':
          // Track a conversion event (e.g., form submission, purchase)
          if (!stats.conversions) stats.conversions = 0;
          stats.conversions++;
          break;
          
        default:
          // For custom events, just increment a counter
          if (!stats.customEvents) stats.customEvents = {};
          if (!stats.customEvents[eventType]) stats.customEvents[eventType] = 0;
          stats.customEvents[eventType]++;
      }
      
      // Track by user type if provided
      if (userType) {
        if (!stats.userTypes[userType]) {
          stats.userTypes[userType] = { impressions: 0, clicks: 0 };
        }
        
        if (eventType === 'impression') {
          stats.userTypes[userType].impressions = (stats.userTypes[userType].impressions || 0) + 1;
        } else if (eventType === 'ctaClick') {
          stats.userTypes[userType].clicks = (stats.userTypes[userType].clicks || 0) + 1;
        }
      }
      
      // Update timestamp
      stats.lastUpdated = new Date().toISOString();
      
      // Save updated stats to Edge Config
      await edgeConfig.set(statsKey, stats);
      
      return res.status(200).json({ 
        success: true,
        statsKey,
        eventRecorded: eventType,
        winner: stats.winner
      });
    } catch (edgeError) {
      console.error('Error updating Edge Config stats:', edgeError);
      return res.status(500).json({ 
        error: 'Failed to update stats',
        message: edgeError.message 
      });
    }
  } catch (error) {
    console.error('Error in record-event:', error);
    return res.status(500).json({ error: 'Failed to record event' });
  }
}

/**
 * Simple algorithm to determine if there's a statistically significant winner
 * Note: In a production system, you'd use a more robust statistical method
 */
function determineWinner(selectorStats) {
  if (!selectorStats || !selectorStats.variants) return null;
  
  const variants = selectorStats.variants;
  const variantNames = Object.keys(variants);
  
  // Need at least two variants and some minimum number of clicks
  if (variantNames.length < 2 || selectorStats.clicks < 20) return null;
  
  // Find the variant with the most clicks
  let bestVariant = null;
  let bestClicks = 0;
  
  for (const [variant, clicks] of Object.entries(variants)) {
    if (clicks > bestClicks) {
      bestClicks = clicks;
      bestVariant = variant;
    }
  }
  
  // Simple heuristic: if the best variant has at least 60% of the clicks 
  // and at least 10 clicks total, consider it a winner
  const totalClicks = Object.values(variants).reduce((sum, clicks) => sum + clicks, 0);
  const winnerRatio = bestClicks / totalClicks;
  
  if (winnerRatio >= 0.6 && bestClicks >= 10) {
    return bestVariant;
  }
  
  return null;
} 