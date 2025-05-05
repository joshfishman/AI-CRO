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

  // Create a simple bookmarklet script that works directly without template literals
  const bookmarkletScript = `
    (function() {
      // Prevent multiple initializations
      if (window.AICRO_SELECTOR_ACTIVE) {
        console.log('AI CRO selector is already active');
        return;
      }
      window.AICRO_SELECTOR_ACTIVE = true;
      
      // Create notification to show it's working
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
      notice.textContent = 'Loading AI CRO...';
      document.body.appendChild(notice);
      
      // Load selector module directly
      var script = document.createElement('script');
      script.src = '${host}/api/selector-module?cachebust=' + Date.now();
      script.onload = function() {
        if (window.AICRO && window.AICRO.selector) {
          window.AICRO.selector.start();
          notice.textContent = 'AI CRO Selector activated';
          
          // Remove the notice after 3 seconds
          setTimeout(function() {
            notice.style.opacity = '0';
            notice.style.transition = 'opacity 0.5s';
            setTimeout(function() {
              if (notice.parentNode) {
                document.body.removeChild(notice);
              }
            }, 500);
          }, 3000);
        } else {
          notice.textContent = 'Error: AI CRO not initialized';
          notice.style.background = '#f44336';
        }
      };
      
      script.onerror = function(error) {
        console.error('Failed to load AI CRO selector module:', error);
        notice.textContent = 'Error loading AI CRO';
        notice.style.background = '#f44336';
      };
      
      document.head.appendChild(script);
    })();
  `;

  // Encode the script as a javascript URL (this is the bookmarklet format)
  const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;

  return new Response(JSON.stringify({
    code: bookmarkletCode
  }), { headers });
} 