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
  const url = new URL(request.url);
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://ai-cro-three.vercel.app';
  
  const debuggerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>AI CRO Debug Helper</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2 {
          color: #2563eb;
        }
        .bookmarklet-container {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          text-align: center;
        }
        .bookmarklet {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          text-decoration: none;
          margin: 12px 0;
        }
        .section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .code {
          background: #f1f5f9;
          padding: 12px;
          border-radius: 4px;
          font-family: monospace;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 16px;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <h1>AI CRO Debug Helper</h1>
      <p>This tool helps diagnose issues with the AI CRO integration on your website.</p>
      
      <div class="bookmarklet-container">
        <p>Drag this button to your bookmarks bar:</p>
        <a href="javascript:(function(){
          // Create the debug panel
          var panel = document.createElement('div');
          panel.id = 'aicro-debug-panel';
          panel.style.cssText = 'position:fixed;top:20px;right:20px;width:400px;height:500px;background:white;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:999999;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;overflow:hidden;';
          
          // Create header
          var header = document.createElement('div');
          header.style.cssText = 'padding:12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;';
          header.innerHTML = '<h3 style=\"margin:0;font-size:16px;font-weight:600;\">AI CRO Debugger</h3><button id=\"aicro-debug-close\" style=\"background:none;border:none;font-size:20px;cursor:pointer;\">×</button>';
          
          // Create content area
          var content = document.createElement('div');
          content.style.cssText = 'flex:1;overflow-y:auto;padding:16px;font-size:14px;';
          
          // Create log area
          var log = document.createElement('div');
          log.id = 'aicro-debug-log';
          log.style.cssText = 'background:#f1f5f9;padding:12px;border-radius:4px;font-family:monospace;white-space:pre-wrap;margin-bottom:16px;max-height:200px;overflow-y:auto;';
          
          // Add log function
          window.aicroDebugLog = function(message, type) {
            var logEl = document.getElementById('aicro-debug-log');
            if (logEl) {
              var entry = document.createElement('div');
              entry.style.cssText = type === 'error' ? 'color:#dc2626;' : type === 'success' ? 'color:#16a34a;' : '';
              entry.textContent = '> ' + message;
              logEl.appendChild(entry);
              logEl.scrollTop = logEl.scrollHeight;
            }
            console.log('[AI CRO Debug]', message);
          };
          
          // Add buttons and info
          content.innerHTML = '<h4 style=\"margin-top:0;\">Script Status:</h4>' +
            '<div id=\"aicro-status\">Checking...</div>' +
            '<h4>Actions:</h4>' +
            '<div style=\"display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;\">' +
              '<button id=\"check-aicro\" style=\"background:#2563eb;color:white;border:none;border-radius:4px;padding:8px 12px;cursor:pointer;\">Check AICRO Status</button>' +
              '<button id=\"load-script\" style=\"background:#2563eb;color:white;border:none;border-radius:4px;padding:8px 12px;cursor:pointer;\">Load Script</button>' +
              '<button id=\"try-selector\" style=\"background:#2563eb;color:white;border:none;border-radius:4px;padding:8px 12px;cursor:pointer;\">Try Selector</button>' +
              '<button id=\"check-cors\" style=\"background:#2563eb;color:white;border:none;border-radius:4px;padding:8px 12px;cursor:pointer;\">Test CORS</button>' +
            '</div>' +
            '<h4>Debug Log:</h4>';
          
          content.appendChild(log);
          
          // Add panel to page
          panel.appendChild(header);
          panel.appendChild(content);
          document.body.appendChild(panel);
          
          // Add close handler
          document.getElementById('aicro-debug-close').addEventListener('click', function() {
            document.body.removeChild(panel);
          });
          
          // Check AICRO status
          document.getElementById('check-aicro').addEventListener('click', function() {
            var statusEl = document.getElementById('aicro-status');
            if (window.AICRO) {
              statusEl.innerHTML = '<div style=\"color:#16a34a;\">✓ AICRO object found</div>';
              
              // Check initialization
              if (window.AICRO.initialized || (window.AICRO._config && window.AICRO._config.initialized)) {
                statusEl.innerHTML += '<div style=\"color:#16a34a;\">✓ AICRO is initialized</div>';
              } else {
                statusEl.innerHTML += '<div style=\"color:#dc2626;\">✗ AICRO is not initialized</div>';
              }
              
              // Add init helper
              statusEl.innerHTML += '<div style=\"margin-top:8px;\"><button id=\"init-aicro\" style=\"background:#16a34a;color:white;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;\">Initialize AICRO</button></div>';
              document.getElementById('init-aicro').addEventListener('click', function() {
                try {
                  window.AICRO.debug(true).init();
                  aicroDebugLog('AICRO initialized successfully', 'success');
                  statusEl.innerHTML = '<div style=\"color:#16a34a;\">✓ AICRO object found and initialized</div>';
                } catch (e) {
                  aicroDebugLog('Error initializing AICRO: ' + e.message, 'error');
                }
              });
            } else {
              statusEl.innerHTML = '<div style=\"color:#dc2626;\">✗ AICRO object not found</div>';
              aicroDebugLog('AICRO object not found in the global scope', 'error');
            }
          });
          
          // Load script
          document.getElementById('load-script').addEventListener('click', function() {
            aicroDebugLog('Attempting to load AICRO script...');
            var script = document.createElement('script');
            script.src = '${host}/api/client-script/fixed-cors';
            script.async = true;
            
            script.onload = function() {
              aicroDebugLog('Script loaded successfully!', 'success');
              // Check again after a moment
              setTimeout(function() {
                document.getElementById('check-aicro').click();
              }, 500);
            };
            
            script.onerror = function() {
              aicroDebugLog('Failed to load script. Trying alternative method...', 'error');
              
              // Try fetch method
              fetch('${host}/api/client-script/fixed-cors')
                .then(function(response) {
                  if (!response.ok) throw new Error('Network response was not ok');
                  return response.text();
                })
                .then(function(text) {
                  var newScript = document.createElement('script');
                  newScript.textContent = text;
                  document.head.appendChild(newScript);
                  aicroDebugLog('Script loaded via fetch method!', 'success');
                  setTimeout(function() {
                    document.getElementById('check-aicro').click();
                  }, 500);
                })
                .catch(function(error) {
                  aicroDebugLog('All loading methods failed: ' + error.message, 'error');
                });
            };
            
            document.head.appendChild(script);
          });
          
          // Try selector
          document.getElementById('try-selector').addEventListener('click', function() {
            aicroDebugLog('Loading selector module...');
            var script = document.createElement('script');
            script.src = '${host}/api/selector-module/simple';
            script.async = true;
            
            script.onload = function() {
              aicroDebugLog('Selector module loaded!', 'success');
            };
            
            script.onerror = function() {
              aicroDebugLog('Failed to load selector. Trying fetch method...', 'error');
              
              fetch('${host}/api/selector-module/simple')
                .then(function(response) {
                  if (!response.ok) throw new Error('Network response was not ok');
                  return response.text();
                })
                .then(function(text) {
                  var newScript = document.createElement('script');
                  newScript.textContent = text;
                  document.head.appendChild(newScript);
                  aicroDebugLog('Selector loaded via fetch!', 'success');
                })
                .catch(function(error) {
                  aicroDebugLog('All selector loading methods failed: ' + error.message, 'error');
                });
            };
            
            document.head.appendChild(script);
          });
          
          // Check CORS
          document.getElementById('check-cors').addEventListener('click', function() {
            aicroDebugLog('Testing CORS to ${host}...');
            
            fetch('${host}/api/client-script/fixed-cors', { method: 'OPTIONS' })
              .then(function(response) {
                aicroDebugLog('CORS preflight status: ' + response.status, response.ok ? 'success' : 'error');
                return fetch('${host}/api/client-script/fixed-cors');
              })
              .then(function(response) {
                aicroDebugLog('CORS GET status: ' + response.status, response.ok ? 'success' : 'error');
                if (response.ok) {
                  aicroDebugLog('CORS test passed! API is accessible.', 'success');
                }
              })
              .catch(function(error) {
                aicroDebugLog('CORS test failed: ' + error.message, 'error');
              });
          });
          
          // Initial check
          setTimeout(function() {
            document.getElementById('check-aicro').click();
            aicroDebugLog('Debug panel initialized. Checking environment...');
            aicroDebugLog('Page URL: ' + window.location.href);
            aicroDebugLog('User Agent: ' + navigator.userAgent);
          }, 100);
        })();" class="bookmarklet">AI CRO Debugger</a>
      </div>
      
      <div class="section">
        <h2>How to Use This Tool</h2>
        <ol>
          <li>Drag the "AI CRO Debugger" button above to your bookmarks bar</li>
          <li>Navigate to the site where you're having issues with AI CRO</li>
          <li>Click the bookmarklet to open the debug panel</li>
          <li>Use the buttons to diagnose issues:</li>
        </ol>
        <ul>
          <li><strong>Check AICRO Status</strong>: Verifies if the AICRO object exists and is initialized</li>
          <li><strong>Load Script</strong>: Attempts to load the client script with error handling</li>
          <li><strong>Try Selector</strong>: Loads the element selector module</li>
          <li><strong>Test CORS</strong>: Checks if CORS is configured correctly</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Common Issues and Solutions</h2>
        
        <h3>Script Loading Failures</h3>
        <div class="code">
// If the debug panel shows script loading errors:
// 1. Try the direct fetch method:

fetch('https://ai-cro-three.vercel.app/api/client-script/fixed-cors')
  .then(response => response.text())
  .then(scriptText => {
    const script = document.createElement('script');
    script.textContent = scriptText;
    document.head.appendChild(script);
  });
        </div>
        
        <h3>CORS Issues</h3>
        <div class="warning">
          CORS errors typically appear as "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
        </div>
        <p>The fixed-cors script addresses most CORS issues, but if problems persist:</p>
        <div class="code">
// Try using a local proxy or CORS browser extension
// Or add this meta tag (for testing only - not recommended for production):
&lt;meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'"&gt;
        </div>
        
        <h3>Initialization Problems</h3>
        <div class="code">
// Make sure to initialize after the script has loaded:
document.addEventListener('DOMContentLoaded', function() {
  // Check every 100ms for up to 3 seconds
  let attempts = 0;
  const checkInterval = setInterval(function() {
    if (window.AICRO) {
      clearInterval(checkInterval);
      AICRO.debug(true).init();
      console.log('AICRO initialized successfully!');
    } else if (attempts >= 30) {
      clearInterval(checkInterval);
      console.error('Failed to load AICRO after 3 seconds');
    }
    attempts++;
  }, 100);
});
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(debuggerHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 