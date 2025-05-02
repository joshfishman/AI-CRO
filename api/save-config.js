import { kv } from '@vercel/kv';

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  if (req.headers['x-api-key'] !== process.env.EDITOR_API_KEY)
    return res.status(401).end('Unauthorized');

  try {
    const { url, selectors } = req.body;
    await kv.set(`page:${url}`, JSON.stringify({ url, selectors }));
    return res.status(200).json({ saved: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'KV save failed' });
  }
};