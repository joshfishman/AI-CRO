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
    const { selector, pageUrl, workspaceId = 'default' } = req.body;
    
    if (!selector || !pageUrl) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'selector and pageUrl are required' 
      });
    }
    
    // Create Edge Config client
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // Construct the key for this selector's variants
    const variantsKey = `variants:${workspaceId}:${pageUrl}:${selector}`;
    
    console.log(`Checking for cached variants at ${variantsKey}`);
    
    // Get variants from Edge Config
    const variants = await edgeConfig.get(variantsKey);
    
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      console.log('No cached variants found');
      return res.status(404).json({
        error: 'Variants not found',
        message: 'No cached variants available for this selector'
      });
    }
    
    console.log(`Retrieved ${variants.length} cached variants`);
    
    // Return the cached variants
    return res.status(200).json({
      variants,
      selector,
      workspaceId,
      pageUrl,
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error retrieving cached variants:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve cached variants',
      message: error.message 
    });
  }
} 