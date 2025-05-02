// This API route redirects to the static selector bookmarklet file
export default function handler(req, res) {
  // Instead of reading from the filesystem, redirect to the static file path
  // This is more reliable in a serverless environment
  const host = req.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  return res.redirect(302, `${baseUrl}/selector-bookmarklet.js`);
} 