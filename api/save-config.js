import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check API key auth
  if (req.headers['x-api-key'] !== process.env.CURSOR_EDITOR_KEY) {
    console.error('Invalid API key provided');
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  
  try {
    const { url, selectors, workspaceId } = req.body;
    
    if (!url || !selectors || !Array.isArray(selectors)) {
      return res.status(400).json({ 
        error: 'Invalid request body', 
        message: 'URL and selectors array are required' 
      });
    }
    
    // Log the save request
    console.log('Saving config:', { 
      url, 
      selectors: selectors.length,
      workspaceId: workspaceId || 'default'
    });
    
    // Validate selectors for multivariate testing format
    const validatedSelectors = selectors.map(selector => {
      // Ensure all selectors have the required fields
      const validSelector = {
        selector: selector.selector,
        contentType: selector.contentType || 'text',
        prompt: selector.prompt || '',
        default: selector.default || '',
        variants: []
      };

      // Ensure each variant has required fields
      if (Array.isArray(selector.variants)) {
        validSelector.variants = selector.variants.map(variant => ({
          content: variant.content || '',
          userType: variant.userType || 'all',
          isDefault: !!variant.isDefault,
          name: variant.name || 'Variant'
        }));
      } else {
        // If no variants, create one default variant
        validSelector.variants = [{
          content: selector.default || '',
          userType: 'all',
          isDefault: true,
          name: 'Default'
        }];
      }

      return validSelector;
    });
    
    // Create Edge Config client
    const client = createClient(process.env.EDGE_CONFIG);
    if (!client) {
      return res.status(500).json({ error: 'Edge Config not available' });
    }
    
    // Construct the key with optional workspace ID
    const configKey = workspaceId ? `page:${workspaceId}:${url}` : `page:${url}`;
    
    // Store in Edge Config
    await client.set(configKey, { 
      url, 
      selectors: validatedSelectors,
      lastUpdated: new Date().toISOString(),
      version: 2 // Add a version to track schema updates
    });
    
    // Reset stats for this page to start fresh with the new test
    const statsKey = workspaceId ? `stats:${workspaceId}:${url}` : `stats:${url}`;
    try {
      await client.set(statsKey, {
        impressions: 0,
        events: {},
        userTypes: {},
        variants: {},
        lastUpdated: new Date().toISOString(),
        version: 2
      });
    } catch (statsError) {
      console.warn('Failed to reset stats:', statsError);
      // Non-critical error, continue
    }
    
    return res.status(200).json({ 
      saved: true,
      key: configKey,
      version: 2
    });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to save configuration',
      message: error.message 
    });
  }
}