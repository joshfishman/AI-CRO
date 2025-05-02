import { createClient } from '@vercel/edge-config';

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  if (req.headers['x-api-key'] !== process.env.EDITOR_API_KEY)
    return res.status(401).end('Unauthorized');

  try {
    const { url, selectors } = req.body;
    const client = createClient(process.env.EDGE_CONFIG);
    await client.set(`page:${url}`, { url, selectors });
    return res.status(200).json({ saved: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Edge Config save failed' });
  }
};