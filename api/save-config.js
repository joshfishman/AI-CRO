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
    
    // Use default workspace if none provided
    const targetWorkspace = workspaceId || 'default';
    
    // Log the save request
    console.log('Saving config:', { 
      url, 
      selectors: selectors.length,
      workspaceId: targetWorkspace
    });
    
    // Create Edge Config client
    const client = createClient(process.env.EDGE_CONFIG);
    if (!client) {
      return res.status(500).json({ error: 'Edge Config not available' });
    }
    
    // Update the list of workspaces
    if (targetWorkspace !== 'default') {
      try {
        const workspacesKey = 'workspaces';
        const existingWorkspaces = await client.get(workspacesKey) || [];
        
        // Add the workspace if it doesn't exist
        if (!existingWorkspaces.includes(targetWorkspace)) {
          existingWorkspaces.push(targetWorkspace);
          await client.set(workspacesKey, existingWorkspaces);
          console.log(`Added new workspace: ${targetWorkspace}`);
        }
      } catch (workspaceError) {
        console.warn('Failed to update workspaces list:', workspaceError);
        // Non-critical error, continue with the save
      }
    }
    
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
    
    // Construct the key with workspace ID
    const configKey = `page:${targetWorkspace}:${url}`;
    
    // Store in Edge Config
    await client.set(configKey, { 
      url, 
      selectors: validatedSelectors,
      workspaceId: targetWorkspace,
      lastUpdated: new Date().toISOString(),
      version: 2 // Add a version to track schema updates
    });
    
    // Reset stats for this page to start fresh with the new test
    const statsKey = `stats:${targetWorkspace}:${url}`;
    try {
      await client.set(statsKey, {
        impressions: 0,
        events: {},
        userTypes: {},
        variants: {},
        workspaceId: targetWorkspace,
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
      workspaceId: targetWorkspace,
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