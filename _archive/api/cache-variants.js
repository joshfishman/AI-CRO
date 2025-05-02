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
    const { selector, variants, pageUrl, workspaceId = 'default' } = req.body;
    
    if (!selector || !variants || !Array.isArray(variants) || !pageUrl) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'selector, variants array, and pageUrl are required' 
      });
    }
    
    // Create Edge Config client
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    
    // Construct the key for this selector's variants
    const variantsKey = `variants:${workspaceId}:${pageUrl}:${selector}`;
    
    console.log(`Storing ${variants.length} variants at ${variantsKey}`);
    
    // Store variants in Edge Config
    await edgeConfig.set(variantsKey, variants);
    
    return res.status(200).json({
      success: true,
      variantsStored: variants.length,
      selector,
      workspaceId,
      pageUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error caching variants:', error);
    return res.status(500).json({ 
      error: 'Failed to cache variants',
      message: error.message 
    });
  }
} 