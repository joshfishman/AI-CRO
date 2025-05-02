import { createClient } from '@vercel/edge-config';

export default async (req, res) => {
  const { path } = req.query;             // e.g.  "/landing"
  try {
    const client = createClient(process.env.EDGE_CONFIG);
    const config = await client.get(`page:${path}`);
    
    if (!config) return res.status(404).end('No config');
    
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(config);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch config' });
  }
};