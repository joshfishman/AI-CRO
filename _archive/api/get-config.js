import { createClient } from '@vercel/edge-config';

export default async (req, res) => {
  // Get the page path from query params
  const { path, workspace } = req.query;
  
  if (!path) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }
  
  try {
    // Initialize Edge Config client
    const client = createClient(process.env.EDGE_CONFIG);
    
    // Determine the config key based on workspace
    const workspaceId = workspace || 'default';
    const configKey = `page:${workspaceId}:${path}`;
    
    // Get the config
    const config = await client.get(configKey);
    
    if (!config) {
      return res.status(404).json({ 
        error: 'Config not found',
        message: `No personalization configuration found for ${path} in workspace ${workspaceId}`
      });
    }
    
    // Add cache control headers to improve performance
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    
    // Return the configuration
    return res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch configuration',
      message: error.message
    });
  }
};