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
  
  // Get possible override from query param
  const url = new URL(request.url);
  const hostOverride = url.searchParams.get('host');
  
  // Final host URL to use, preferring the override if provided
  const finalHost = hostOverride || host;
  
  // Check if the bookmarklet helper should be activated
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
        script.src = '${finalHost}/api/selector-module';
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
        <p>Add the client script to your website:</p>
        <div class="code">&lt;script src="${finalHost}/api/client-script"&gt;&lt;/script&gt;</div>
        
        <p>And initialize it:</p>
        <div class="code">&lt;script&gt;
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.debug(true) // Enable debug mode (remove in production)
      .init();
  });
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
    // AI CRO Client Library - Self-initializing version for header inclusion
    (function() {
      // Create the base object
      window.AICRO = window.AICRO || {};
      
      // Configuration
      const config = {
        apiHost: "${finalHost}",
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
        pageIntent: '',
        pageSettings: {}
      };
      
      // Debug/logging helper
      function log(...args) {
        if (config.debug) {
          console.log("[AI CRO]", ...args);
        }
      }
      
      // Define all methods on the AICRO object upfront
      Object.assign(AICRO, {
        // Load saved page settings for the current URL if they exist
        loadPageSettings: function() {
          try {
            // Use normalized URL as key (without query parameters)
            const urlKey = window.location.origin + window.location.pathname;
            const storageKey = 'AICRO_PAGE_SETTINGS_' + urlKey.replace(/[^a-z0-9]/gi, '_');
            
            const savedSettings = localStorage.getItem(storageKey);
            if (savedSettings) {
              const settings = JSON.parse(savedSettings);
              
              // Apply saved settings to config
              if (settings.audience) config.pageAudience = settings.audience;
              if (settings.intent) config.pageIntent = settings.intent;
              
              // Store complete settings object
              config.pageSettings = settings;
              
              if (config.debug) {
                console.log('[AI CRO] Loaded page settings:', settings);
              }
              
              return settings;
            }
          } catch (e) {
            console.error('[AI CRO] Error loading page settings:', e);
          }
          
          return null;
        },
        
        // Add bookmarklet functionality - can be accessed via AICRO.openSelector()
        openSelector: function() {
          // Create and inject the bookmarklet code
          const script = document.createElement('script');
          script.src = '${finalHost}/api/selector-module';
          script.async = true;
          
          // Add error handling
          script.onerror = function(error) {
            console.error('[AI CRO] Error loading selector module from ' + script.src, error);
            alert('Error loading AI CRO selector module. Please check the console for details.');
          };
          
          document.head.appendChild(script);
          return this;
        },
        
        // Function to check if script can be loaded from a URL
        testConnection: function(url) {
          url = url || config.apiHost + '/api/selector-module';
          console.log('[AI CRO] Testing connection to: ' + url);
          
          return fetch(url, { 
            method: 'OPTIONS',
            mode: 'cors'
          })
          .then(function(response) {
            console.log('[AI CRO] Connection test result:', response.status, response.statusText);
            return response.ok;
          })
          .catch(function(error) {
            console.error('[AI CRO] Connection test failed:', error);
            return false;
          });
        },
        
        // Add a helper to show the bookmarklet UI
        getBookmarklet: function() {
          window.open('${finalHost}/api/client-script?bookmarklet=true', '_blank');
          return this;
        },
        
        // Save page settings to localStorage
        savePageSettings: function(settings) {
          try {
            // Use normalized URL as key (without query parameters)
            const urlKey = window.location.origin + window.location.pathname;
            const storageKey = 'AICRO_PAGE_SETTINGS_' + urlKey.replace(/[^a-z0-9]/gi, '_');
            
            // Update config values
            if (settings.audience) config.pageAudience = settings.audience;
            if (settings.intent) config.pageIntent = settings.intent;
            
            // Store complete settings in config
            config.pageSettings = {
              ...config.pageSettings,
              ...settings
            };
            
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(config.pageSettings));
            
            if (config.debug) {
              console.log('[AI CRO] Saved page settings:', config.pageSettings);
            }
            
            return this;
          } catch (e) {
            console.error('[AI CRO] Error saving page settings:', e);
            return this;
          }
        },
        
        // Get current page settings
        getPageSettings: function() {
          return config.pageSettings || {};
        },
        
        // Set audience for the current page and save it
        setPageAudience: function(audience) {
          return this.savePageSettings({ audience });
        },
        
        // Set intent for the current page and save it
        setPageIntent: function(intent) {
          return this.savePageSettings({ intent });
        },
        
        // Direct generation of bookmarklet code without server roundtrip
        getBookmarkletCode: function() {
          const bookmarkletScript = \`
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
              script.src = '${finalHost}/api/selector-module';
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
          \`;
          
          return 'javascript:' + encodeURIComponent(bookmarkletScript);
        },
        
        // Create a bookmarklet UI overlay that can be shown directly on the page
        showBookmarkletHelper: function() {
          // Create bookmarklet code
          const bookmarkletCode = this.getBookmarkletCode();
          
          // Create and show helper UI
          const helperUI = document.createElement('div');
          helperUI.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:999999;display:flex;align-items:center;justify-content:center;';
          
          const panel = document.createElement('div');
          panel.style.cssText = 'background:white;width:90%;max-width:600px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.4);overflow:hidden;';
          
          panel.innerHTML = \`
            <div style="padding:16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
              <h3 style="margin:0;font-size:18px;font-weight:600;color:#1e40af;">AI CRO Element Selector</h3>
              <button id="aicro-close-helper" style="background:none;border:none;font-size:18px;cursor:pointer;color:#6b7280;">×</button>
            </div>
            
            <div style="padding:24px;">
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:24px;margin-bottom:24px;text-align:center;">
                <p style="margin-top:0;">Drag this button to your bookmarks bar:</p>
                <a href="\${bookmarkletCode}" class="aicro-bookmarklet" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:4px;font-weight:bold;text-decoration:none;margin:12px 0;">AI CRO Selector</a>
              </div>
              
              <div>
                <h4 style="margin-top:0;font-weight:600;">How to use:</h4>
                <ol style="padding-left:20px;margin-bottom:24px;">
                  <li style="margin-bottom:8px;">Drag the button above to your bookmarks bar.</li>
                  <li style="margin-bottom:8px;">Navigate to any page where you want to test content variations.</li>
                  <li style="margin-bottom:8px;">Click the "AI CRO Selector" bookmark to activate the selection tool.</li>
                  <li style="margin-bottom:8px;">Select elements and create content variations.</li>
                </ol>
                
                <div>
                  <button id="aicro-activate-now" style="background:#2563eb;color:white;padding:8px 16px;border-radius:4px;font-weight:500;border:none;cursor:pointer;margin-right:8px;">Activate Now</button>
                  <button id="aicro-close-panel" style="background:#e5e7eb;color:#4b5563;padding:8px 16px;border-radius:4px;font-weight:500;border:none;cursor:pointer;">Close</button>
                </div>
              </div>
            </div>
          \`;
          
          // Add event listeners
          helperUI.appendChild(panel);
          document.body.appendChild(helperUI);
          
          // Event handlers
          const closeHelper = function() {
            document.body.removeChild(helperUI);
          };
          
          document.getElementById('aicro-close-helper').addEventListener('click', closeHelper);
          document.getElementById('aicro-close-panel').addEventListener('click', closeHelper);
          document.getElementById('aicro-activate-now').addEventListener('click', function() {
            AICRO.openSelector();
            closeHelper();
          });
          
          return this;
        },
        
        // Get a URL that will activate the selector when visited
        getSelectorURL: function() {
          const url = new URL(window.location.href);
          url.searchParams.set('aicro_selector', 'true');
          return url.toString();
        },
        
        // Initialize the AI CRO system
        init: function(options = {}) {
          if (config.initialized) {
            if (config.debug) {
              console.log('[AI CRO] Already initialized');
            }
            return this;
          }
          
          // Merge options with defaults
          if (options) {
            Object.keys(options).forEach(key => {
              config[key] = options[key];
            });
          }
          
          if (config.debug) {
            console.log('[AI CRO] Initializing with config:', config);
          }
          
          // Add helper button if in debug mode
          if (config.debug) {
            // Add a floating button for easy access in debug mode
            const addButtonToDOM = function() {
              if (document && document.body) {
                const helperButton = document.createElement('div');
                helperButton.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#2563eb;color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);z-index:99999;font-size:22px;';
                helperButton.innerHTML = '✏️';
                helperButton.title = 'AI CRO Tools';
                
                // Add click handler to show a simple menu
                let menuOpen = false;
                const menu = document.createElement('div');
                menu.style.cssText = 'position:absolute;bottom:60px;right:0;background:white;border-radius:8px;box-shadow:0 2px 15px rgba(0,0,0,0.2);display:none;min-width:180px;z-index:999999;';
                menu.innerHTML = \`
                  <div class="aicro-menu-item" id="aicro-open-selector" style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #eee;">Open Selector</div>
                  <div class="aicro-menu-item" id="aicro-get-bookmarklet" style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #eee;">Get Bookmarklet</div>
                  <div class="aicro-menu-item" id="aicro-copy-selector-url" style="padding:10px 16px;cursor:pointer;border-bottom:1px solid #eee;">Copy Selector URL</div>
                  <div class="aicro-menu-item" id="aicro-hide-button" style="padding:10px 16px;cursor:pointer;">Hide This Button</div>
                \`;
                
                helperButton.addEventListener('click', function(e) {
                  menuOpen = !menuOpen;
                  menu.style.display = menuOpen ? 'block' : 'none';
                  e.stopPropagation();
                });
                
                // Close menu when clicking outside
                document.addEventListener('click', function(e) {
                  if (menuOpen && !menu.contains(e.target) && !helperButton.contains(e.target)) {
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
                  const copySelectorUrlBtn = document.getElementById('aicro-copy-selector-url');
                  
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
                  
                  if (copySelectorUrlBtn) {
                    copySelectorUrlBtn.addEventListener('click', function() {
                      try {
                        // Get the selector URL for the current page
                        const selectorUrl = AICRO.getSelectorURL();
                        
                        // Copy to clipboard
                        navigator.clipboard.writeText(selectorUrl)
                          .then(() => {
                            // Show success message
                            const originalText = copySelectorUrlBtn.textContent;
                            copySelectorUrlBtn.textContent = 'URL Copied!';
                            
                            // Reset after a moment
                            setTimeout(() => {
                              copySelectorUrlBtn.textContent = originalText;
                            }, 1500);
                          })
                          .catch(err => {
                            console.error('[AI CRO] Failed to copy URL: ', err);
                            alert('Failed to copy URL: ' + err.message);
                          });
                      } catch (e) {
                        console.error('[AI CRO] Error copying selector URL:', e);
                        alert('Error generating selector URL');
                      }
                      
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
                
                if (config.debug) {
                  console.log("[AI CRO] Added helper button for bookmarklet access");
                }
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
        },
        
        // Enable debug mode
        debug: function(enable = true) {
          config.debug = enable;
          return this;
        }
      });
      
      // Check for selector mode parameter in URL
      function checkForSelectorModeParam() {
        try {
          // Look for 'aicro_selector' or 'aicro-selector' in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const isSelectorMode = urlParams.has('aicro_selector') || urlParams.has('aicro-selector') || urlParams.has('bookmarklet');
          
          if (isSelectorMode) {
            console.log('[AI CRO] Selector mode activated by URL parameter');
            
            // Auto initialize if not already initialized
            if (!config.initialized) {
              // Initialize with debug mode
              AICRO.debug(true).init();
            }
            
            // Wait a short moment to ensure the DOM is properly loaded
            setTimeout(() => {
              // Launch the selector
              AICRO.openSelector();
            }, 500);
          }
        } catch (e) {
          console.error('[AI CRO] Error checking for selector mode:', e);
        }
      }
      
      // Initialize and load settings immediately if needed
      function initAndLoadSettings() {
        try {
          // Try to load page settings even before initialization
          AICRO.loadPageSettings();
          
          // If a URL parameter requests automatically activating the selector
          checkForSelectorModeParam();
        } catch (e) {
          console.error('[AI CRO] Error during initialization:', e);
        }
      }
      
      // Make module exports available for CommonJS/AMD/UMD compatibility
      if (typeof module !== 'undefined' && module.exports) {
        module.exports = AICRO;
      } else if (typeof define === 'function' && define.amd) {
        define([], function() { return AICRO; });
      }
      
      // Execute immediately if possible
      if (typeof window !== 'undefined' && window.localStorage) {
        initAndLoadSettings();
      } else if (typeof document !== 'undefined') {
        // Wait for document to be ready
        document.addEventListener('DOMContentLoaded', initAndLoadSettings);
      }
      
      // Log this so users can see the script loaded properly
      console.log('[AI CRO] Client script loaded. Use AICRO.debug(true).init() to initialize.');
    })();
  `;

  return new Response(clientScript, { headers });
} 