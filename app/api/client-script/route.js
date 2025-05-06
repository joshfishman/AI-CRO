export async function OPTIONS(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function GET(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  // Host URL (for API requests)
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-cro-three.vercel.app';
  
  // Check if the bookmarklet helper should be activated
  const url = new URL(request.url);
  const showBookmarklet = url.searchParams.get('bookmarklet') === 'true';
  
  // If the bookmarklet parameter is present, return the bookmarklet helper UI instead
  if (showBookmarklet) {
    // Create a simple but effective bookmarklet that loads the selector module
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
    
    // Create a bookmarklet helper page
    const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;
    const helperHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>AI CRO Bookmarklet Helper</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          margin-bottom: 24px;
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
        .instructions {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
        }
        .code {
          background: #f1f5f9;
          padding: 12px;
          border-radius: 4px;
          font-family: monospace;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>AI CRO Element Selector Bookmarklet</h1>
      
      <div class="bookmarklet-container">
        <p>Drag this button to your bookmarks bar:</p>
        <a href="${bookmarkletCode}" class="bookmarklet">AI CRO Selector</a>
        <p><small>The bookmarklet is only <strong>${bookmarkletCode.length}</strong> characters, well below browser limits</small></p>
      </div>
      
      <div class="instructions">
        <h2>How to use:</h2>
        <ol>
          <li>Drag the button above to your bookmarks bar.</li>
          <li>Navigate to any page where you want to test content variations.</li>
          <li>Click the "AI CRO Selector" bookmark to activate the selection tool.</li>
          <li>Select elements and create content variations.</li>
        </ol>
        
        <h2>After creating variations:</h2>
        <p>Add the client script to your website <strong>header</strong>:</p>
        <div class="code">&lt;script src="${host}/api/client-script"&gt;&lt;/script&gt;</div>
        
        <p>And initialize it right after (no need to wait for DOMContentLoaded):</p>
        <div class="code">&lt;script&gt;
  AICRO.debug(true) // Enable debug mode (remove in production)
    .init();
&lt;/script&gt;</div>
      </div>
    </body>
    </html>
    `;
    
    return new Response(helperHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'max-age=3600'
      }
    });
  }
  
  // Set CORS headers to allow the script to be loaded from any domain
  const headers = {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'max-age=3600'
  };

  const clientScript = `
    // AI CRO Client Library
    window.AICRO = window.AICRO || {};
      
    // Configuration
    const config = {
      apiHost: "${host}",
      userId: null,
      debug: false,
      initialized: false,
      testData: {},
      gtm: {
        enabled: true,
        dataLayerName: 'dataLayer'
      },
      autoDetection: {
        enabled: false,
        headings: true,
        buttons: true,
        images: false,
        callToAction: true,
        productDescriptions: true,
        banners: true
      },
      autoPersonalizationRules: [],
      pageAudience: '',
      pageIntent: ''
    };
    
    // Add bookmarklet functionality - can be accessed via AICRO.openSelector()
    AICRO.openSelector = function() {
      // Create and inject the bookmarklet code
      const script = document.createElement('script');
      script.src = '${host}/api/selector-module';
      document.head.appendChild(script);
      return this;
    };
    
    // Add a helper to show the bookmarklet UI
    AICRO.getBookmarklet = function() {
      window.open('${host}/api/client-script?bookmarklet=true', '_blank');
      return this;
    };
    
    // Show a simple floating button for quick access to the selector
    // Useful when script is loaded directly in the header
    AICRO.showQuickAccessButton = function(options = {}) {
      // Options with defaults
      const opts = {
        position: options.position || 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
        color: options.color || '#3b82f6',
        text: options.text || 'AI CRO',
        ...options
      };
      
      // Create button
      const button = document.createElement('div');
      
      // Position styling
      let positionStyle = 'position:fixed;z-index:99999;';
      if (opts.position === 'bottom-right') {
        positionStyle += 'bottom:20px;right:20px;';
      } else if (opts.position === 'bottom-left') {
        positionStyle += 'bottom:20px;left:20px;';
      } else if (opts.position === 'top-right') {
        positionStyle += 'top:20px;right:20px;';
      } else if (opts.position === 'top-left') {
        positionStyle += 'top:20px;left:20px;';
      }
      
      // Button styling
      button.style.cssText = positionStyle + \`
        background:\${opts.color};
        color:white;
        padding:8px 16px;
        border-radius:4px;
        box-shadow:0 2px 10px rgba(0,0,0,0.2);
        cursor:pointer;
        font-family:system-ui,-apple-system,sans-serif;
        font-size:14px;
        font-weight:500;
      \`;
      
      button.textContent = opts.text;
      
      // Add click handler to open the selector
      button.addEventListener('click', () => {
        this.openSelector();
      });
      
      // Wait for DOM to be ready if needed
      const addToDOM = () => {
        document.body.appendChild(button);
      };
      
      if (document.body) {
        addToDOM();
      } else {
        // If body isn't ready yet, wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', addToDOM);
      }
      
      return this;
    };

    // Make sure all core methods are defined up front
    
    // Set user ID
    AICRO.setUserId = function(userId) {
      config.userId = userId;
      return this;
    };
    
    // Enable debug mode
    AICRO.debug = function(enable = true) {
      config.debug = enable;
      return this;
    };
    
    // Initialize the personalization engine
    AICRO.init = function(options = {}) {
      // Log function that only outputs in debug mode
      function log(...args) {
        if (config.debug) {
          console.log("[AI CRO]", ...args);
        }
      }
      
      if (config.initialized) {
        log("Already initialized");
        return this;
      }
      
      // Always ensure autoDetection is disabled by default for safety
      if (!options.autoDetection || typeof options.autoDetection !== 'object') {
        options.autoDetection = { enabled: false };
      }
      
      // Only enable auto-detection if explicitly enabled
      if (options.autoDetection.enabled !== true) {
        options.autoDetection.enabled = false;
      }
      
      // Merge options with defaults
      Object.assign(config, options);
      
      log("Initializing with config:", config);
      
      // If in debug mode, add a small floating helper button to access the bookmarklet
      if (config.debug) {
        // Create a small floating button
        const helperButton = document.createElement('div');
        helperButton.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#3b82f6;color:white;padding:8px 16px;border-radius:4px;z-index:99999;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer;font-family:system-ui,-apple-system,sans-serif;font-size:14px;font-weight:500;';
        helperButton.textContent = 'AI CRO';
        
        // Create a small popup menu
        const menu = document.createElement('div');
        menu.style.cssText = 'position:absolute;bottom:100%;right:0;margin-bottom:8px;background:white;border-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,0.15);width:200px;display:none;';
        menu.innerHTML = \`
          <div style="padding:12px;border-bottom:1px solid #e5e7eb;">
            <div style="font-weight:600;color:#111;">AI CRO Tools</div>
          </div>
          <div class="aicro-menu-item" style="padding:8px 12px;cursor:pointer;color:#333;hover:background-color:#f9fafb;" id="aicro-open-selector">
            Open Element Selector
          </div>
          <div class="aicro-menu-item" style="padding:8px 12px;cursor:pointer;color:#333;hover:background-color:#f9fafb;" id="aicro-get-bookmarklet">
            Get Bookmarklet
          </div>
          <div class="aicro-menu-item" style="padding:8px 12px;cursor:pointer;color:#333;hover:background-color:#f9fafb;" id="aicro-hide-button">
            Hide This Button
          </div>
        \`;
        
        // Wait for DOM to be ready if needed
        const addButtonToDOM = () => {
          if (document.body) {
            // Handle menu toggle
            let menuOpen = false;
            helperButton.addEventListener('click', function(e) {
              if (!menuOpen) {
                menu.style.display = 'block';
                menuOpen = true;
                e.stopPropagation();
              }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function() {
              if (menuOpen) {
                menu.style.display = 'none';
                menuOpen = false;
              }
            });
            
            // Append elements to the document
            helperButton.appendChild(menu);
            document.body.appendChild(helperButton);
            
            // Add menu item event handlers
            setTimeout(() => {
              const openSelectorBtn = document.getElementById('aicro-open-selector');
              const getBookmarkletBtn = document.getElementById('aicro-get-bookmarklet');
              const hideButtonBtn = document.getElementById('aicro-hide-button');
              
              if (openSelectorBtn) {
                openSelectorBtn.addEventListener('click', function() {
                  AICRO.openSelector();
                  menu.style.display = 'none';
                  menuOpen = false;
                });
              }
              
              if (getBookmarkletBtn) {
                getBookmarkletBtn.addEventListener('click', function() {
                  AICRO.getBookmarklet();
                  menu.style.display = 'none';
                  menuOpen = false;
                });
              }
              
              if (hideButtonBtn) {
                hideButtonBtn.addEventListener('click', function() {
                  helperButton.style.display = 'none';
                });
              }
              
              // Apply hover effect to menu items
              const menuItems = menu.querySelectorAll('.aicro-menu-item');
              menuItems.forEach(item => {
                item.addEventListener('mouseover', function() {
                  this.style.backgroundColor = '#f3f4f6';
                });
                item.addEventListener('mouseout', function() {
                  this.style.backgroundColor = '';
                });
              });
            }, 100);
            
            log("Added helper button for bookmarklet access");
          } else {
            // If body isn't ready yet, try again in a moment
            setTimeout(addButtonToDOM, 50);
          }
        };
        
        addButtonToDOM();
      }
      
      // Set initialized to true before proceeding with rest of initialization
      config.initialized = true;
      return this;
    };
    
    // Make module exports available for CommonJS/AMD/UMD compatibility
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = AICRO;
    } else if (typeof define === 'function' && define.amd) {
      define([], function() { return AICRO; });
    }
    
    // Log this so users can see the script loaded properly
    if (console && console.log) {
      console.log('[AI CRO] Client script loaded. Use AICRO.debug(true).init() to initialize.');
    }

    // Return the AICRO object for immediate use
    return AICRO;
  `;

  return new Response(clientScript, { headers });
} 