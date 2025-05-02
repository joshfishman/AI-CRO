// This API route redirects to the static selector bookmarklet file
export default function handler(req, res) {
  // Add CORS headers to support cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Instead of reading from the filesystem, redirect to the static file path
  // This is more reliable in a serverless environment
  const host = req.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Redirect to the minimized version to reduce function count
  return res.redirect(302, `${baseUrl}/selector-bookmarklet-min.js`);
} 