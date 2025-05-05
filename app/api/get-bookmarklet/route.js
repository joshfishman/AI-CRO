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

  // Check if this is a request for the selector module
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  if (type === 'selector') {
    // Redirect to the new selector module API
    return Response.redirect(new URL('/api/selector-module', request.url), 302);
  }

  // Use absolute URL for production or fallback to localhost for development
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Create the bookmarklet code that will be executed when clicked
  const bookmarkletScript = `
    (function() {
      // Load the AI CRO client script from our server with absolute URL
      if (window.AICRO_SELECTOR_ACTIVE) {
        console.log('AI CRO selector is already active');
        return;
      }
      
      // Initialize the client script
      var script = document.createElement('script');
      script.src = '${host}/api/client-script';
      script.onload = function() {
        // Initialize AICRO when script loads and start in selector mode
        if (window.AICRO) {
          window.AICRO
            .debug(true)
            .configureAutoDetection({ enabled: false }) // Disable auto-detection
            .init()
            .startSelector();
          
          console.log('AI CRO initialized through bookmarklet with selector mode');
          
          // Create a small notification to show it's working
          var notice = document.createElement('div');
          notice.style.position = 'fixed';
          notice.style.bottom = '20px';
          notice.style.right = '20px';
          notice.style.background = '#4CAF50';
          notice.style.color = 'white';
          notice.style.padding = '8px 16px';
          notice.style.borderRadius = '4px';
          notice.style.zIndex = '9999';
          notice.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          notice.textContent = 'AI CRO Selector activated';
          document.body.appendChild(notice);
          
          // Remove the notice after 3 seconds
          setTimeout(function() {
            notice.style.opacity = '0';
            notice.style.transition = 'opacity 0.5s';
            setTimeout(function() {
              document.body.removeChild(notice);
            }, 500);
          }, 3000);
        } else {
          alert('Failed to initialize AI CRO. Please try again.');
        }
      };
      script.onerror = function() {
        alert('Failed to load AI CRO client script. Please check your connection.');
      };
      document.head.appendChild(script);
      
      window.AICRO_SELECTOR_ACTIVE = true;
    })();
  `;

  // Encode the script as a javascript URL (this is the bookmarklet format)
  const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;

  return new Response(JSON.stringify({
    code: bookmarkletCode
  }), { headers });
} 