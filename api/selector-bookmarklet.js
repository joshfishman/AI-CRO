// This API route redirects to the static selector bookmarklet file
export default function handler(req, res) {
  res.redirect(302, '/selector-bookmarklet.js');
} 