import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  try {
    console.log('Edge Config URL:', process.env.EDGE_CONFIG);
    
    const client = createClient(process.env.EDGE_CONFIG);
    const greeting = await client.get('greeting');
    
    // Try to get test config if it exists
    let testConfig = null;
    try {
      testConfig = await client.get('page:/test');
    } catch (e) {
      console.log('Test config not found:', e.message);
    }
    
    return res.status(200).json({
      message: 'Edge Config test',
      greeting,
      testConfig,
      success: true
    });
  } catch (error) {
    console.error('Error accessing Edge Config:', error);
    return res.status(500).json({
      message: 'Failed to access Edge Config',
      error: error.message,
      success: false
    });
  }
} 