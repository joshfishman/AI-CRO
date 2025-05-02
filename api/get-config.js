import { kv } from '@vercel/kv';
export default async (req, res) => {
  const { path } = req.query;             // e.g.  "/landing"
  const json = await kv.get(`page:${path}`);
  if (!json) return res.status(404).end('No config');
  res.setHeader('Cache-Control', 's-maxage=300');
  return res.status(200).json(JSON.parse(json));
};