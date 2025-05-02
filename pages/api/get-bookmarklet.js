// API endpoint to generate a custom bookmarklet with provided parameters
export default function handler(req, res) {
  const { baseUrl, editorKey } = req.query;
  
  if (!baseUrl) {
    return res.status(400).json({ error: 'Missing baseUrl parameter' });
  }
  
  // Create the bookmarklet code with the provided parameters
  const bookmarkletCode = `javascript:(function(){
  window.NEXT_PUBLIC_CURSOR_API_BASE='${baseUrl}';
  window.CURSOR_EDITOR_KEY='${editorKey || ''}';
  var s=document.createElement('script');
  s.src='${baseUrl}/selector-bookmarklet.js';
  document.body.appendChild(s);
})();`;
  
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/plain');
  
  // Return the bookmarklet code
  res.status(200).send(bookmarkletCode);
} 