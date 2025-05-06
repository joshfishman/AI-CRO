export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function GET(request) {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'max-age=3600'
  };

  // Use absolute URL for production or fallback to localhost for development
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-cro-three.vercel.app';

  // Create a small bookmarklet that loads the full script from the server
  // This is much more reliable than trying to include the entire script in the bookmarklet
  const bookmarkletScript = `
    (function() {
      // Check if already loaded
      if (window.AICRO_SELECTOR_ACTIVE) {
        alert('AI CRO selector is already active');
        return;
      }
      
      // Show loading notification
      var notice = document.createElement('div');
      notice.id = 'aicro-loading-notice';
      notice.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#4CAF50;color:white;padding:8px 16px;border-radius:4px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
      notice.textContent = 'Loading AI CRO Element Selector...';
      document.body.appendChild(notice);
      
      // Load the full selector module script
      var script = document.createElement('script');
      script.src = '${host}/api/selector-module';
      script.async = true;
      
      // Handle loading errors
      script.onerror = function() {
        notice.style.background = '#f44336';
        notice.textContent = 'Error loading AI CRO Element Selector. Please try again.';
        setTimeout(function() {
          document.body.removeChild(notice);
        }, 3000);
      };
      
      // Add to page
      document.head.appendChild(script);
    })();
  `;

  // Encode the script as a javascript URL (this is the bookmarklet format)
  const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;

  return new Response(JSON.stringify({
    code: bookmarkletCode
  }), { headers });
} 