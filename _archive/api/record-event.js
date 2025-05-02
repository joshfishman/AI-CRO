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
    const { 
      eventType, 
      pageUrl, 
      workspaceId, 
      selector, 
      variant, 
      variantName, 
      userType,
      segments = [] // New parameter for segments
    } = req.body;
    
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
      variantName,
      userType,
      segments
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
          userTypes: {},
          segments: {}, // New structure for segment tracking
          variants: {},
          winner: null,
          lastUpdated: new Date().toISOString(),
          version: 3 // Increment version for schema change
        };
      }
      
      // Initialize segments tracking if not present
      if (!stats.segments) {
        stats.segments = {};
      }
      
      // Update stats based on event type
      switch (eventType) {
        case 'impression':
          // Track an impression (page view with personalization)
          stats.impressions = (stats.impressions || 0) + 1;
          
          // Track by user type if provided
          if (userType) {
            if (!stats.userTypes[userType]) {
              stats.userTypes[userType] = { impressions: 0, clicks: 0, conversions: 0 };
            }
            stats.userTypes[userType].impressions = (stats.userTypes[userType].impressions || 0) + 1;
          }
          
          // For multivariate testing - track impressions per selector and variant
          if (selector && variant !== null && variant !== undefined) {
            // Initialize or update the variant tracking structure
            if (!stats.variants) stats.variants = {};
            if (!stats.variants[selector]) stats.variants[selector] = {};
            if (!stats.variants[selector][variant]) {
              stats.variants[selector][variant] = {
                impressions: 0,
                ctaClicks: 0,
                conversions: 0,
                userTypes: {}
              };
            }
            
            // Increment impressions for this variant
            stats.variants[selector][variant].impressions++;
            
            // Track by user type within the variant
            if (userType) {
              if (!stats.variants[selector][variant].userTypes[userType]) {
                stats.variants[selector][variant].userTypes[userType] = {
                  impressions: 0,
                  ctaClicks: 0,
                  conversions: 0
                };
              }
              stats.variants[selector][variant].userTypes[userType].impressions++;
            }
          }
          
          // Track by segments if provided
          if (segments && segments.length > 0) {
            for (const segment of segments) {
              if (!stats.segments[segment]) {
                stats.segments[segment] = { 
                  impressions: 0, 
                  clicks: 0, 
                  conversions: 0,
                  variants: {} 
                };
              }
              stats.segments[segment].impressions = (stats.segments[segment].impressions || 0) + 1;
              
              // For multivariate testing - track impressions per selector, variant, and segment
              if (selector && variant !== null && variant !== undefined) {
                if (!stats.segments[segment].variants) {
                  stats.segments[segment].variants = {};
                }
                
                if (!stats.segments[segment].variants[selector]) {
                  stats.segments[segment].variants[selector] = {};
                }
                
                if (!stats.segments[segment].variants[selector][variant]) {
                  stats.segments[segment].variants[selector][variant] = {
                    impressions: 0,
                    ctaClicks: 0,
                    conversions: 0
                  };
                }
                
                stats.segments[segment].variants[selector][variant].impressions++;
              }
            }
          }
          break;
          
        case 'ctaClick':
          // Increment total CTA clicks
          stats.ctaClicks = (stats.ctaClicks || 0) + 1;
          
          // Track a CTA click for a specific selector and variant
          if (selector) {
            // Initialize selectors object if it doesn't exist
            if (!stats.events[selector]) {
              stats.events[selector] = { 
                clicks: 0, 
                variants: {},
                userTypes: {} 
              };
            }
            
            // Increment total clicks for this selector
            stats.events[selector].clicks = (stats.events[selector].clicks || 0) + 1;
            
            // If a specific variant is provided, track it
            if (variant !== null && variant !== undefined) {
              const variantKey = variantName || variant;
              if (!stats.events[selector].variants[variantKey]) {
                stats.events[selector].variants[variantKey] = {
                  clicks: 0,
                  impressions: 0,
                  conversions: 0,
                  userTypes: {}
                };
              }
              stats.events[selector].variants[variantKey].clicks = 
                (stats.events[selector].variants[variantKey].clicks || 0) + 1;
              
              // For multivariate testing - update the variant stats structure
              if (!stats.variants) stats.variants = {};
              if (!stats.variants[selector]) stats.variants[selector] = {};
              if (!stats.variants[selector][variant]) {
                stats.variants[selector][variant] = {
                  impressions: 0,
                  ctaClicks: 0,
                  conversions: 0,
                  userTypes: {}
                };
              }
              
              // Increment CTA clicks for this variant
              stats.variants[selector][variant].ctaClicks++;
              
              // Track by user type within the variant for multivariate testing
              if (userType) {
                if (!stats.variants[selector][variant].userTypes[userType]) {
                  stats.variants[selector][variant].userTypes[userType] = {
                    impressions: 0,
                    ctaClicks: 0,
                    conversions: 0
                  };
                }
                stats.variants[selector][variant].userTypes[userType].ctaClicks++;
              }
              
              // Track by user type if provided
              if (userType) {
                if (!stats.events[selector].userTypes[userType]) {
                  stats.events[selector].userTypes[userType] = { 
                    clicks: 0, 
                    variants: {} 
                  };
                }
                stats.events[selector].userTypes[userType].clicks = 
                  (stats.events[selector].userTypes[userType].clicks || 0) + 1;
                
                // Track user type + variant combination
                if (!stats.events[selector].userTypes[userType].variants[variantKey]) {
                  stats.events[selector].userTypes[userType].variants[variantKey] = 0;
                }
                stats.events[selector].userTypes[userType].variants[variantKey]++;
                
                // Also track in the variant's user type stats
                if (!stats.events[selector].variants[variantKey].userTypes[userType]) {
                  stats.events[selector].variants[variantKey].userTypes[userType] = 0;
                }
                stats.events[selector].variants[variantKey].userTypes[userType]++;
              }
            }
            
            // Track by user type globally if provided
            if (userType) {
              if (!stats.userTypes[userType]) {
                stats.userTypes[userType] = { impressions: 0, clicks: 0, conversions: 0 };
              }
              stats.userTypes[userType].clicks = (stats.userTypes[userType].clicks || 0) + 1;
            }
            
            // Check if we have a statistical winner
            const winner = determineWinner(stats.events[selector]);
            if (winner) {
              stats.winner = { 
                selector, 
                variant: winner.variant,
                variantName: winner.variantName,
                confidence: winner.confidence,
                timestamp: new Date().toISOString()
              };
            }
          }
          
          // Track by segments if provided
          if (segments && segments.length > 0) {
            for (const segment of segments) {
              if (!stats.segments[segment]) {
                stats.segments[segment] = { 
                  impressions: 0, 
                  clicks: 0, 
                  conversions: 0,
                  variants: {} 
                };
              }
              stats.segments[segment].clicks = (stats.segments[segment].clicks || 0) + 1;
              
              // For multivariate testing - track clicks per selector, variant, and segment
              if (selector && variant !== null && variant !== undefined) {
                if (!stats.segments[segment].variants) {
                  stats.segments[segment].variants = {};
                }
                
                if (!stats.segments[segment].variants[selector]) {
                  stats.segments[segment].variants[selector] = {};
                }
                
                if (!stats.segments[segment].variants[selector][variant]) {
                  stats.segments[segment].variants[selector][variant] = {
                    impressions: 0,
                    ctaClicks: 0,
                    conversions: 0
                  };
                }
                
                stats.segments[segment].variants[selector][variant].ctaClicks++;
                
                // Calculate CTR for this segment-variant combination
                const segVariant = stats.segments[segment].variants[selector][variant];
                if (segVariant.impressions > 0) {
                  segVariant.ctr = parseFloat(((segVariant.ctaClicks / segVariant.impressions) * 100).toFixed(2));
                }
                
                // Check if we have a statistical winner for this segment
                const segmentVariants = Object.keys(stats.segments[segment].variants[selector])
                  .map(varId => ({
                    variantId: varId,
                    impressions: stats.segments[segment].variants[selector][varId].impressions,
                    ctaClicks: stats.segments[segment].variants[selector][varId].ctaClicks,
                    ctr: stats.segments[segment].variants[selector][varId].ctr || 0
                  }));
                
                if (segmentVariants.length >= 2 && 
                    segmentVariants.every(v => v.impressions >= 50)) {
                  
                  // Find the variant with the highest CTR
                  const bestVariant = segmentVariants.reduce((best, current) => 
                    current.ctr > best.ctr ? current : best, segmentVariants[0]);
                  
                  // Check if the best variant is significantly better
                  if (bestVariant.ctr > 0 && bestVariant.impressions >= 100) {
                    if (!stats.segments[segment].winners) {
                      stats.segments[segment].winners = {};
                    }
                    
                    stats.segments[segment].winners[selector] = {
                      variantId: bestVariant.variantId,
                      confidence: 95, // Simplified calculation
                      ctr: bestVariant.ctr,
                      timestamp: new Date().toISOString()
                    };
                  }
                }
              }
            }
          }
          break;
          
        case 'conversion':
          // Track a conversion event (e.g., form submission, purchase)
          if (!stats.conversions) stats.conversions = 0;
          stats.conversions++;
          
          // Track by user type if provided
          if (userType) {
            if (!stats.userTypes[userType]) {
              stats.userTypes[userType] = { impressions: 0, clicks: 0, conversions: 0 };
            }
            stats.userTypes[userType].conversions = (stats.userTypes[userType].conversions || 0) + 1;
          }
          
          // Track for specific variant if provided
          if (selector && variant !== null && variant !== undefined) {
            const variantKey = variantName || variant;
            if (!stats.events[selector]) {
              stats.events[selector] = { clicks: 0, variants: {}, userTypes: {} };
            }
            
            if (!stats.events[selector].variants[variantKey]) {
              stats.events[selector].variants[variantKey] = {
                clicks: 0,
                impressions: 0,
                conversions: 0,
                userTypes: {}
              };
            }
            
            stats.events[selector].variants[variantKey].conversions = 
              (stats.events[selector].variants[variantKey].conversions || 0) + 1;
              
            // For multivariate testing - update the variant stats structure
            if (!stats.variants) stats.variants = {};
            if (!stats.variants[selector]) stats.variants[selector] = {};
            if (!stats.variants[selector][variant]) {
              stats.variants[selector][variant] = {
                impressions: 0,
                ctaClicks: 0,
                conversions: 0,
                userTypes: {}
              };
            }
            
            // Increment conversions for this variant
            stats.variants[selector][variant].conversions++;
            
            // Track by user type within the variant for multivariate testing
            if (userType) {
              if (!stats.variants[selector][variant].userTypes[userType]) {
                stats.variants[selector][variant].userTypes[userType] = {
                  impressions: 0,
                  ctaClicks: 0,
                  conversions: 0
                };
              }
              stats.variants[selector][variant].userTypes[userType].conversions++;
            }
          }
          
          // Track by segments if provided
          if (segments && segments.length > 0) {
            for (const segment of segments) {
              if (!stats.segments[segment]) {
                stats.segments[segment] = { 
                  impressions: 0, 
                  clicks: 0, 
                  conversions: 0,
                  variants: {} 
                };
              }
              stats.segments[segment].conversions = (stats.segments[segment].conversions || 0) + 1;
              
              // For multivariate testing - track conversions per selector, variant, and segment
              if (selector && variant !== null && variant !== undefined) {
                if (!stats.segments[segment].variants) {
                  stats.segments[segment].variants = {};
                }
                
                if (!stats.segments[segment].variants[selector]) {
                  stats.segments[segment].variants[selector] = {};
                }
                
                if (!stats.segments[segment].variants[selector][variant]) {
                  stats.segments[segment].variants[selector][variant] = {
                    impressions: 0,
                    ctaClicks: 0,
                    conversions: 0
                  };
                }
                
                stats.segments[segment].variants[selector][variant].conversions++;
              }
            }
          }
          break;
          
        default:
          // For custom events, just increment a counter
          if (!stats.customEvents) stats.customEvents = {};
          if (!stats.customEvents[eventType]) stats.customEvents[eventType] = 0;
          stats.customEvents[eventType]++;
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
 * More robust algorithm to determine if there's a statistically significant winner
 * Uses a basic implementation of chi-squared test
 */
function determineWinner(selectorStats) {
  if (!selectorStats || !selectorStats.variants) return null;
  
  const variants = selectorStats.variants;
  const variantNames = Object.keys(variants);
  
  // Need at least two variants and some minimum number of clicks
  if (variantNames.length < 2 || selectorStats.clicks < 30) return null;
  
  // Get total clicks for each variant
  const totalClicks = selectorStats.clicks;
  const expected = totalClicks / variantNames.length; // Expected clicks per variant if no difference
  
  // Find variant with best performance
  let bestVariant = null;
  let bestClicks = 0;
  let bestConversionRate = 0;
  
  for (const variantName of variantNames) {
    const variant = variants[variantName];
    const clicks = variant.clicks || 0;
    const conversions = variant.conversions || 0;
    
    // Calculate conversion rate (if conversion tracking is available)
    const conversionRate = clicks > 0 ? conversions / clicks : 0;
    
    if (clicks > bestClicks || (clicks === bestClicks && conversionRate > bestConversionRate)) {
      bestVariant = variantName;
      bestClicks = clicks;
      bestConversionRate = conversionRate;
    }
  }
  
  // Calculate chi-squared statistic
  let chiSquared = 0;
  for (const variantName of variantNames) {
    const observed = variants[variantName].clicks || 0;
    const difference = observed - expected;
    chiSquared += (difference * difference) / expected;
  }
  
  // For 95% confidence with N-1 degrees of freedom (where N is number of variants)
  // Simple approximation of chi-squared critical values
  const degreesOfFreedom = variantNames.length - 1;
  const criticalValue = getCriticalValue(degreesOfFreedom);
  
  const isSignificant = chiSquared > criticalValue;
  const confidence = isSignificant ? 0.95 : (chiSquared / criticalValue) * 0.95;
  
  // Only return a winner if it's statistically significant and has enough data
  if (isSignificant && bestClicks >= 15 && bestClicks / totalClicks > 0.55) {
    return {
      variant: bestVariant,
      variantName: bestVariant,
      confidence,
      chiSquared,
      totalSample: totalClicks
    };
  }
  
  return null;
}

/**
 * Get the chi-squared critical value for 95% confidence
 */
function getCriticalValue(degreesOfFreedom) {
  // Simplified critical values for common degrees of freedom
  const criticalValues = {
    1: 3.84,  // For 2 variants
    2: 5.99,  // For 3 variants
    3: 7.81,  // For 4 variants
    4: 9.49   // For 5 variants
  };
  
  return criticalValues[degreesOfFreedom] || 3.84; // Default to 1 degree of freedom
} 