export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain, element } = req.body;

  if (!domain || !element) {
    return res.status(400).json({ error: 'Domain and element are required' });
  }

  // TODO: Save the element selection to your database
  // For now, we'll just return a success response
  res.status(200).json({ success: true, message: 'Element saved successfully' });
} 