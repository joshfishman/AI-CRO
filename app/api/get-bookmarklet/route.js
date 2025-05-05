export async function GET() {
  // Host URL (for API requests)
  const host = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  // Create the bookmarklet code that will be executed when clicked
  const bookmarkletScript = `
    (function() {
      // Load the AI CRO client script from our server
      var script = document.createElement('script');
      script.src = '${host}/api/client-script';
      script.onload = function() {
        // Initialize AICRO when script loads
        if (window.AICRO) {
          window.AICRO.debug(true).init();
          console.log('AI CRO initialized through bookmarklet');
          
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
          notice.textContent = 'AI CRO activated';
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
    })();
  `;

  // Encode the script as a javascript URL (this is the bookmarklet format)
  const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;

  return Response.json({
    code: bookmarkletCode
  });
} 