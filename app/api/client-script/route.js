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
        <p>Add the client script to your website:</p>
        <div class="code">&lt;script src="${host}/api/client-script"&gt;&lt;/script&gt;</div>
        
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
    (function() {
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
      
      // Configure GTM integration
      AICRO.configureGTM = function(options = {}) {
        config.gtm = {
          ...config.gtm,
          ...options
        };
        return this;
      };
      
      // Configure auto-detection
      AICRO.configureAutoDetection = function(options = {}) {
        config.autoDetection = {
          ...config.autoDetection,
          ...options
        };
        return this;
      };
      
      // Add a custom personalization rule
      AICRO.addPersonalizationRule = function(rule) {
        config.autoPersonalizationRules.push(rule);
        return this;
      };
      
      // Log if in debug mode
      function log(...args) {
        if (config.debug) {
          console.log("[AI CRO]", ...args);
        }
      }
      
      // Push event to Google Tag Manager
      function pushToGTM(eventName, eventData) {
        if (!config.gtm.enabled) return;
        
        // Get or create dataLayer
        const dataLayerName = config.gtm.dataLayerName || 'dataLayer';
        window[dataLayerName] = window[dataLayerName] || [];
        
        // Push event to dataLayer
        const eventObject = {
          event: eventName,
          aicro: {
            ...eventData,
            timestamp: new Date().toISOString()
          }
        };
        
        log("Pushing to GTM:", eventObject);
        window[dataLayerName].push(eventObject);
      }
      
      // Initialize the personalization engine
      AICRO.init = function(options = {}) {
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
          
          // Menu item event handlers
          menu.querySelector('#aicro-open-selector').addEventListener('click', function() {
            AICRO.openSelector();
            menu.style.display = 'none';
            menuOpen = false;
          });
          
          menu.querySelector('#aicro-get-bookmarklet').addEventListener('click', function() {
            AICRO.getBookmarklet();
            menu.style.display = 'none';
            menuOpen = false;
          });
          
          menu.querySelector('#aicro-hide-button').addEventListener('click', function() {
            helperButton.style.display = 'none';
          });
          
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
          
          // Append elements to the document
          helperButton.appendChild(menu);
          document.body.appendChild(helperButton);
          
          log("Added helper button for bookmarklet access");
        }
        
        // Set up mutation observer for dynamic content if auto-detection is enabled
        if (config.autoDetection && config.autoDetection.enabled === true) {
          log("Auto-detection enabled, setting up mutation observer");
          setupMutationObserver();
          
          // Auto-detect important elements
          detectImportantElements();
        } else {
          log("Auto-detection disabled. Only explicitly tagged elements will be personalized.");
          
          // Only personalize elements with data-aicro attribute
          const taggedElements = document.querySelectorAll('[data-aicro]');
          log("Found", taggedElements.length, "explicitly tagged elements");
          
          taggedElements.forEach(element => {
            const selector = getUniqueSelector(element);
            // Personalize explicitly tagged elements
            AICRO.personalize(selector);
          });
        }
        
        // Push initialization event to GTM
        pushToGTM('aicro_initialized', {
          userId: config.userId,
          pageUrl: window.location.href
        });
        
        config.initialized = true;
        return this;
      };
      
      // Apply personalized content to a specific element
      AICRO.personalize = function(selector, options = {}) {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements.length === 0) {
            log("No elements found for selector:", selector);
            return this;
          }
          
          // Filter out bookmarklet UI elements
          const validElements = Array.from(elements).filter(element => !isBookmarkletUiElement(element));
          
          if (validElements.length === 0) {
            log("All matched elements are part of the bookmarklet UI, skipping personalization for:", selector);
            return this;
          }
          
          log("Personalizing elements:", validElements);
          
          // Get current URL
          const url = window.location.href;
          
          // Request personalized content from the API
          fetch(config.apiHost + '/api/personalize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({
              url,
              selector,
              userId: config.userId,
              originalContent: validElements[0].innerHTML,
              elementType: validElements[0].tagName.toLowerCase(),
              userAttributes: options.attributes || {},
              skipAutoPersonalization: options.skipAutoPersonalization !== false // Skip by default unless explicitly set to false
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('API responded with status: ' + response.status);
            }
            return response.json();
          })
          .then(data => {
            if (data.personalized) {
              log("Received personalized content:", data);
              
              // Store test data for tracking
              config.testData[selector] = {
                testId: data.testId,
                variantId: data.variantId
              };
              
              // Apply content to all matching elements
              validElements.forEach(element => {
                try {
                  // Preserve element attributes when updating content
                  if (typeof data.content === 'string' && !data.content.trim().startsWith('<')) {
                    // For text-only content, preserve the existing HTML structure
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = element.innerHTML;
                    
                    // Find all text nodes and replace their content
                    const textNodes = [];
                    const findTextNodes = function(node) {
                      if (node.nodeType === 3) { // Text node
                        textNodes.push(node);
                      } else if (node.nodeType === 1) { // Element node
                        for (let i = 0; i < node.childNodes.length; i++) {
                          findTextNodes(node.childNodes[i]);
                        }
                      }
                    };
                    
                    findTextNodes(tempDiv);
                    
                    // Replace the first text node content
                    if (textNodes.length > 0) {
                      textNodes[0].nodeValue = data.content;
                      element.innerHTML = tempDiv.innerHTML;
                    } else {
                      // If no text nodes, just set inner text preserving the wrapper
                      const wrapper = element.cloneNode(false);
                      wrapper.textContent = data.content;
                      element.parentNode.replaceChild(wrapper, element);
                    }
                  } else {
                    // For HTML content, try to preserve the element's attributes
                    const originalAttributes = {};
                    for (let i = 0; i < element.attributes.length; i++) {
                      const attr = element.attributes[i];
                      originalAttributes[attr.name] = attr.value;
                    }
                    
                    // Update the inner HTML
                    element.innerHTML = data.content;
                    
                    // Apply the original attributes back to the root element
                    if (element.tagName.toLowerCase() === 'div' || 
                        element.tagName.toLowerCase() === 'span') {
                      // Only restore attributes that don't conflict with the new content
                      for (const [name, value] of Object.entries(originalAttributes)) {
                        // Skip data-aicro attributes
                        if (name.startsWith('data-aicro')) continue;
                        
                        // Don't override existing attributes in the new content
                        if (!element.hasAttribute(name)) {
                          element.setAttribute(name, value);
                        }
                      }
                    }
                  }
                
                  // Mark element as personalized
                  element.setAttribute('data-aicro-personalized', 'true');
                  
                  // Track impression
                  trackEvent('impression', selector);
                } catch (elementError) {
                  console.error("[AI CRO] Error applying content to element:", elementError);
                }
              });
            } else {
              log("No personalization available for:", selector);
            }
          })
          .catch(error => {
            console.error("[AI CRO] Error fetching personalized content:", error.message);
            // Don't retry on CORS errors to avoid console spam
            if (error.message && !error.message.includes('CORS')) {
              log("Will retry personalization later");
            }
          });
        } catch (e) {
          console.error("[AI CRO] Error in personalize:", e);
        }
        
        return this;
      };
      
      // Track a conversion event
      AICRO.trackConversion = function(selector, metadata = {}) {
        return trackEvent('conversion', selector, metadata);
      };
      
      // Track a custom event
      AICRO.trackEvent = function(eventName, selector, metadata = {}) {
        return trackEvent(eventName, selector, metadata);
      };
      
      // Internal function to track events
      function trackEvent(event, selector, metadata = {}) {
        const testData = config.testData[selector];
        if (!testData) {
          log("No test data found for selector:", selector);
          return AICRO;
        }
        
        log("Tracking event:", event, "for test:", testData.testId);
        
        // Push to GTM
        pushToGTM(event === 'impression' ? 'aicro_impression' : 
                 (event === 'conversion' ? 'aicro_conversion' : 'aicro_event'), {
          event: event,
          testId: testData.testId,
          variantId: testData.variantId,
          selector: selector,
          metadata: metadata,
          userId: config.userId
        });
        
        // Send to tracking API
        fetch(config.apiHost + '/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            testId: testData.testId,
            variantId: testData.variantId,
            event,
            userId: config.userId,
            metadata
          })
        })
        .then(response => response.json())
        .then(data => {
          log("Event tracked:", data);
        })
        .catch(error => {
          console.error("[AI CRO] Error tracking event:", error);
        });
        
        return AICRO;
      }
      
      // Set up MutationObserver to watch for dynamic content
      function setupMutationObserver() {
        // Only set up if MutationObserver is available
        if (!window.MutationObserver) {
          log("MutationObserver not available in this browser");
          return;
        }
        
        try {
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Check if new nodes should be personalized
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                  checkAndPersonalizeElement(node);
                  
                  // Also check children
                  const elements = node.querySelectorAll('*');
                  elements.forEach(checkAndPersonalizeElement);
                }
              });
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        log("Mutation observer set up for dynamic content");
        } catch (e) {
          console.error("[AI CRO] Error setting up mutation observer:", e);
        }
      }
      
      // Auto-personalize all tagged elements and detect important elements
      function personalizeContent() {
        // 1. First, personalize elements with explicit data-aicro attribute
        const taggedElements = document.querySelectorAll('[data-aicro]');
        log("Found", taggedElements.length, "explicitly tagged elements");
        
        taggedElements.forEach(element => {
          const selector = getUniqueSelector(element);
          // Only personalize if explicitly requested via data-aicro attribute
          const skipAuto = element.getAttribute('data-aicro') !== 'personalize';
          AICRO.personalize(selector, { skipAutoPersonalization: skipAuto });
        });
        
        // 2. Auto-detect important elements if enabled
        if (config.autoDetection.enabled) {
          log("Auto-detecting important elements to personalize");
          detectImportantElements();
        }
        
        // 3. Apply custom personalization rules
        if (config.autoPersonalizationRules.length > 0) {
          log("Applying custom personalization rules");
          applyCustomPersonalizationRules();
        }
      }
      
      // Generate a unique CSS selector for an element
      function getUniqueSelector(element) {
        try {
        if (element.id) {
          return '#' + element.id;
        }
        
          if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c && !c.includes(':'));
          if (classes.length > 0) {
            const selector = element.tagName.toLowerCase() + '.' + classes.join('.');
            // Check if this selector is unique
            if (document.querySelectorAll(selector).length === 1) {
              return selector;
            }
          }
        }
        
        // Try a more specific path
        let path = '';
        let current = element;
        
          while (current && current !== document.body && current.parentNode) {
          let selector = current.tagName.toLowerCase();
          
          if (current.id) {
            selector = '#' + current.id;
            path = selector + (path ? ' > ' + path : '');
            break;
          } else {
            const siblings = Array.from(current.parentNode.children).filter(
              child => child.tagName === current.tagName
            );
            
            if (siblings.length > 1) {
              const index = siblings.indexOf(current) + 1;
              selector += ':nth-child(' + index + ')';
            }
            
            path = selector + (path ? ' > ' + path : '');
            current = current.parentNode;
          }
        }
        
        // Fallback to a data attribute if needed
        if (!path || document.querySelectorAll(path).length > 1) {
          if (!element.hasAttribute('data-aicro-id')) {
            const id = 'aicro-' + Math.random().toString(36).substring(2, 9);
            element.setAttribute('data-aicro-id', id);
          }
          
          return '[data-aicro-id="' + element.getAttribute('data-aicro-id') + '"]';
        }
        
        return path;
        } catch (e) {
          console.error("[AI CRO] Error generating selector:", e);
          return '';
        }
      }
      
      // Check if an element should be personalized and do so
      function checkAndPersonalizeElement(element) {
        // Skip if already personalized
        if (element.hasAttribute('data-aicro-personalized')) {
          return;
        }
        
        // Skip standalone bookmarklet UI elements
        if (isBookmarkletUiElement(element)) {
          return;
        }
        
        // Check if the element matches any important element criteria
        if (isImportantElement(element)) {
          const selector = getUniqueSelector(element);
          // Skip auto-personalization for dynamically detected elements
          AICRO.personalize(selector, { skipAutoPersonalization: true });
        }
      }
      
      // Check if an element is part of the bookmarklet UI
      function isBookmarkletUiElement(element) {
        try {
          // Skip if element is not valid
          if (!element || !element.nodeType) {
            return false;
          }
          
          // Check if element has aicro-* class
          let classNames = '';
          
          // Handle different types of className property
          if (element.className) {
            if (typeof element.className === 'string') {
              classNames = element.className;
            } else if (element.className.baseVal !== undefined) {
              // For SVG elements, className is an SVGAnimatedString
              classNames = element.className.baseVal;
            } else {
              // Try to get class using getAttribute as fallback
              const classAttr = element.getAttribute && element.getAttribute('class');
              if (classAttr) {
                classNames = classAttr;
              }
            }
          }
          
          // Check for aicro- classes
          if (classNames && /aicro-/.test(classNames)) {
            return true;
          }
          
          // Check for parents with aicro-* class
          let parent = element.parentElement;
          let depth = 0;
          const maxDepth = 10; // Prevent infinite loops
          
          while (parent && depth < maxDepth) {
            let parentClassNames = '';
            
            // Handle different types of className property for parent
            if (parent.className) {
              if (typeof parent.className === 'string') {
                parentClassNames = parent.className;
              } else if (parent.className.baseVal !== undefined) {
                parentClassNames = parent.className.baseVal;
              } else {
                const classAttr = parent.getAttribute && parent.getAttribute('class');
                if (classAttr) {
                  parentClassNames = classAttr;
                }
              }
            }
            
            if (parentClassNames && /aicro-/.test(parentClassNames)) {
              return true;
            }
            
            parent = parent.parentElement;
            depth++;
          }
          
          // Also check for the selector UI element
          const selectorUI = document.querySelector('.aicro-selector-ui');
          if (selectorUI && selectorUI.contains(element)) {
            return true;
          }
          
          // Check for modal overlays from the bookmarklet
          const modalOverlay = Array.from(document.querySelectorAll('div')).find(
            div => div.style && div.style.cssText && 
            div.style.cssText.includes('position:fixed') && 
            div.style.cssText.includes('z-index:999999')
          );
          
          if (modalOverlay && modalOverlay.contains(element)) {
            return true;
          }
          
          return false;
        } catch (e) {
          console.error("[AI CRO] Error in isBookmarkletUiElement:", e);
          return false;
        }
      }
      
      // Detect important elements on the page
      function detectImportantElements() {
        const importantElements = [];
        
        // Headings (h1, h2)
        if (config.autoDetection.headings) {
          const headings = document.querySelectorAll('h1, h2');
          headings.forEach(heading => {
            if (!heading.hasAttribute('data-aicro-personalized') && 
                !heading.closest('[data-aicro-personalized]') &&
                isVisibleElement(heading)) {
              importantElements.push(heading);
            }
          });
        }
        
        // Call to action buttons
        if (config.autoDetection.callToAction) {
          const ctaButtons = detectCTAButtons();
          ctaButtons.forEach(button => {
            if (!button.hasAttribute('data-aicro-personalized') && 
                !button.closest('[data-aicro-personalized]') &&
                isVisibleElement(button)) {
              importantElements.push(button);
            }
          });
        }
        
        // Product descriptions
        if (config.autoDetection.productDescriptions) {
          const productDescs = detectProductDescriptions();
          productDescs.forEach(element => {
            if (!element.hasAttribute('data-aicro-personalized') && 
                !element.closest('[data-aicro-personalized]') &&
                isVisibleElement(element)) {
              importantElements.push(element);
            }
          });
        }
        
        // Banners
        if (config.autoDetection.banners) {
          const banners = detectBanners();
          banners.forEach(banner => {
            if (!banner.hasAttribute('data-aicro-personalized') && 
                !banner.closest('[data-aicro-personalized]') &&
                isVisibleElement(banner)) {
              importantElements.push(banner);
            }
          });
        }
        
        // Personalize all important elements
        log("Auto-detected", importantElements.length, "important elements");
        importantElements.forEach(element => {
          const selector = getUniqueSelector(element);
          // In auto-detection mode, still skip auto-personalization by default
          AICRO.personalize(selector, { skipAutoPersonalization: true });
        });
      }
      
      // Check if element is important for personalization
      function isImportantElement(element) {
        if (!isVisibleElement(element)) return false;
        
        // Skip bookmarklet UI elements
        if (isBookmarkletUiElement(element)) {
          return false;
        }
        
        const tagName = element.tagName.toLowerCase();
        
        // Headings
        if (config.autoDetection.headings && 
            (tagName === 'h1' || tagName === 'h2') && 
            element.textContent.trim().length > 10) {
          return true;
        }
        
        // Buttons and CTAs
        if (config.autoDetection.callToAction && 
            (tagName === 'button' || 
             (tagName === 'a' && hasCtaCharacteristics(element)))) {
          return true;
        }
        
        // Product descriptions
        if (config.autoDetection.productDescriptions && 
            hasProductDescriptionCharacteristics(element)) {
          return true;
        }
        
        // Banners
        if (config.autoDetection.banners && hasBannerCharacteristics(element)) {
          return true;
        }
        
        return false;
      }
      
      // Detect call-to-action buttons
      function detectCTAButtons() {
        const buttons = [];
        
        // Regular buttons
        document.querySelectorAll('button, a.btn, a.button, .cta, [class*="cta"], [class*="call-to-action"]')
          .forEach(el => {
            if (hasCtaCharacteristics(el)) {
              buttons.push(el);
            }
          });
        
        // Links that look like buttons
        document.querySelectorAll('a')
          .forEach(el => {
            if (hasCtaCharacteristics(el)) {
              buttons.push(el);
            }
          });
        
        return buttons;
      }
      
      // Check if element has CTA characteristics
      function hasCtaCharacteristics(element) {
        try {
          // Skip if element is not valid
          if (!element || !element.nodeType) {
            return false;
          }
          
          const text = element.textContent.trim().toLowerCase();
          const ctaWords = ['sign up', 'register', 'submit', 'subscribe', 'buy', 'purchase', 'order', 'get', 'download', 'try', 'start', 'learn more', 'contact'];
          
          const hasCtaText = ctaWords.some(word => text.includes(word));
          
          // Get class names safely
          let classNames = '';
          if (element.className) {
            if (typeof element.className === 'string') {
              classNames = element.className.toLowerCase();
            } else if (element.className.baseVal !== undefined) {
              // For SVG elements, className is an SVGAnimatedString with baseVal
              classNames = element.className.baseVal.toLowerCase();
            } else {
              // If className is not a string and has no baseVal, try getAttribute
              const classAttr = element.getAttribute && element.getAttribute('class');
              if (classAttr) {
                classNames = classAttr.toLowerCase();
              }
            }
          }
          
          // Check if element has style that indicates it's a button
          let computedStyle = null;
          try {
            computedStyle = window.getComputedStyle(element);
          } catch (styleError) {
            // Ignore style errors - just continue with null style
          }
          
          const hasCtaStyle = classNames.includes('btn') || 
                             classNames.includes('button') ||
                             classNames.includes('cta') ||
                             (computedStyle && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)');
          
          return hasCtaText && hasCtaStyle;
        } catch (e) {
          console.error("[AI CRO] Error in hasCtaCharacteristics:", e);
          return false;
        }
      }
      
      // Detect product descriptions
      function detectProductDescriptions() {
        const elements = [];
        
        // Look for elements that might be product descriptions
        document.querySelectorAll('.product-description, .description, [class*="product"], [class*="description"]')
          .forEach(el => {
            if (hasProductDescriptionCharacteristics(el)) {
              elements.push(el);
            }
          });
        
        return elements;
      }
      
      // Check if element has product description characteristics
      function hasProductDescriptionCharacteristics(element) {
        try {
          // Skip if element is not valid
          if (!element || !element.nodeType) {
            return false;
          }
          
          const text = element.textContent.trim();
          
          // Get class names safely
          let classNames = '';
          if (element.className) {
            if (typeof element.className === 'string') {
              classNames = element.className.toLowerCase();
            } else if (element.className.baseVal !== undefined) {
              // For SVG elements, className is an SVGAnimatedString with baseVal
              classNames = element.className.baseVal.toLowerCase();
            } else {
              // If className is not a string and has no baseVal, try getAttribute
              const classAttr = element.getAttribute && element.getAttribute('class');
              if (classAttr) {
                classNames = classAttr.toLowerCase();
              }
            }
          }
        
          // Product descriptions tend to be paragraphs of a certain length
          return element.tagName.toLowerCase() === 'p' && 
                 text.length > 50 && 
                 text.length < 1000 && 
                 classNames.includes('desc');
        } catch (e) {
          console.error("[AI CRO] Error in hasProductDescriptionCharacteristics:", e);
          return false;
        }
      }
      
      // Detect banners
      function detectBanners() {
        const elements = [];
        
        // Look for elements that might be banners
        document.querySelectorAll('.banner, .hero, .jumbotron, [class*="banner"], [class*="hero"], header > div')
          .forEach(el => {
            if (hasBannerCharacteristics(el)) {
              elements.push(el);
            }
          });
        
        return elements;
      }
      
      // Check if element has banner characteristics
      function hasBannerCharacteristics(element) {
        try {
          // Skip if element is not valid
          if (!element || !element.nodeType) {
            return false;
          }
          
          const rect = element.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          
          // Get class names safely
          let classNames = '';
          if (element.className) {
            if (typeof element.className === 'string') {
              classNames = element.className.toLowerCase();
            } else if (element.className.baseVal !== undefined) {
              // For SVG elements, className is an SVGAnimatedString with baseVal
              classNames = element.className.baseVal.toLowerCase();
            } else {
              // If className is not a string and has no baseVal, try getAttribute
              const classAttr = element.getAttribute && element.getAttribute('class');
              if (classAttr) {
                classNames = classAttr.toLowerCase();
              }
            }
          }
        
          // Banners tend to be full-width or nearly full-width elements
          return rect.width > viewportWidth * 0.8 && 
                 rect.height > 100 && 
                 (classNames.includes('banner') || 
                 classNames.includes('hero'));
        } catch (e) {
          console.error("[AI CRO] Error in hasBannerCharacteristics:", e);
          return false;
        }
      }
      
      // Check if element is visible
      function isVisibleElement(element) {
        if (!element.offsetParent && element.offsetHeight === 0) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
      }
      
      // Apply custom personalization rules
      function applyCustomPersonalizationRules() {
        config.autoPersonalizationRules.forEach(rule => {
          if (typeof rule === 'function') {
            try {
              const elements = rule();
              if (Array.isArray(elements)) {
                elements.forEach(element => {
                  if (element && element.nodeType === 1) { // Element node
                    const selector = getUniqueSelector(element);
                    // Custom rules should specify explicitly if they want personalization
                    const skipAuto = !element.hasAttribute('data-aicro') || 
                                     element.getAttribute('data-aicro') !== 'personalize';
                    AICRO.personalize(selector, { skipAutoPersonalization: skipAuto });
                  }
                });
              }
            } catch (error) {
              console.error("[AI CRO] Error in custom personalization rule:", error);
            }
          }
        });
      }
      
      // Enhanced eCommerce integrations
      AICRO.ecommerce = {
        // Product view
        viewProduct: function(productData, selector) {
          const testData = selector ? config.testData[selector] : null;
          
          // Push to GTM
          pushToGTM('aicro_product_view', {
            product: productData,
            testData: testData,
            userId: config.userId
          });
          
          return AICRO;
        },
        
        // Add to cart
        addToCart: function(productData, selector) {
          const testData = selector ? config.testData[selector] : null;
          
          // Push to GTM
          pushToGTM('aicro_add_to_cart', {
            product: productData,
            testData: testData,
            userId: config.userId
          });
          
          return AICRO;
        },
        
        // Purchase
        purchase: function(orderData) {
          // Push to GTM
          pushToGTM('aicro_purchase', {
            order: orderData,
            userId: config.userId
          });
          
          return AICRO;
        },
        
        // Show active variations in a floating panel
        showActiveVariations: function() {
          // Remove existing panel if any
          const existingPanel = document.getElementById('aicro-variations-panel');
          if (existingPanel) {
            document.body.removeChild(existingPanel);
          }
          
          // Create panel
          const panel = document.createElement('div');
          panel.id = 'aicro-variations-panel';
          panel.style.position = 'fixed';
          panel.style.bottom = '20px';
          panel.style.right = '20px';
          panel.style.width = '320px';
          panel.style.maxHeight = '80vh';
          panel.style.overflowY = 'auto';
          panel.style.background = 'white';
          panel.style.borderRadius = '8px';
          panel.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
          panel.style.zIndex = '999995';
          panel.style.fontFamily = 'system-ui, -apple-system, sans-serif';
          panel.style.fontSize = '14px';
          panel.style.color = '#333';
          
          // Header
          const header = document.createElement('div');
          header.style.padding = '12px 16px';
          header.style.background = '#f9fafb';
          header.style.borderBottom = '1px solid #e5e7eb';
          header.style.display = 'flex';
          header.style.justifyContent = 'space-between';
          header.style.alignItems = 'center';
          header.innerHTML = '<h3 style="margin:0;font-size:16px;font-weight:600;">Active Variations</h3>' +
                            '<button id="aicro-close-variations" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;">×</button>';
          
          // Content
          const content = document.createElement('div');
          content.style.padding = '16px';
          
          // Check for active variations
          const activeVariations = [];
          try {
            // Get variations from localStorage
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('AICRO_VARIATION_')) {
                try {
                  const variation = JSON.parse(localStorage.getItem(key));
                  if (variation && variation.url === window.location.href) {
                    activeVariations.push(variation);
                  }
                } catch (e) {
                  console.error('[AI CRO] Error parsing variation:', e);
                }
              }
            }
          } catch (e) {
            console.error('[AI CRO] Error accessing localStorage:', e);
          }
          
          if (activeVariations.length === 0) {
            content.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;">No active variations found for this page.</div>';
          } else {
            // List variations
            const list = document.createElement('div');
            
            activeVariations.forEach(variation => {
              const item = document.createElement('div');
              item.style.padding = '12px';
              item.style.borderBottom = '1px solid #e5e7eb';
              item.style.marginBottom = '8px';
              
              item.innerHTML = 
                '<div style="font-weight:600;">' + (variation.elementType || 'Element') + '</div>' +
                '<div style="font-size:12px;color:#6b7280;margin-bottom:4px;">' + (variation.selector || 'Unknown selector') + '</div>' +
                '<div style="margin-bottom:8px;padding:6px;background:#f9fafb;border-radius:4px;">' +
                  '<div style="font-size:12px;font-weight:500;color:#6b7280;">Original:</div>' +
                  '<div style="white-space:pre-wrap;">' + (variation.originalContent || 'No content') + '</div>' +
                '</div>' +
                '<div style="padding:6px;background:#f0f7ff;border-radius:4px;">' +
                  '<div style="font-size:12px;font-weight:500;color:#6b7280;">Variation:</div>' +
                  '<div style="white-space:pre-wrap;">' + (variation.variantContent || 'No content') + '</div>' +
                '</div>';
              
              list.appendChild(item);
            });
            
            content.appendChild(list);
          }
          
          // Add elements to panel
          panel.appendChild(header);
          panel.appendChild(content);
          document.body.appendChild(panel);
          
          // Add event listeners
          document.getElementById('aicro-close-variations').addEventListener('click', function() {
            document.body.removeChild(panel);
          });
          
          return this;
        }
      };
      
      // Load the selector UI code only on demand to avoid impacting main script performance
      AICRO.startSelector = function(options = {}) {
        // Prevent double loading
        if (window.AICRO.selector && window.AICRO.selector.active) {
          console.log('AI CRO selector is already active');
          return this;
        }
        
        // Load the selector module on demand
        const script = document.createElement('script');
        // Use absolute URL with the correct host
        const apiHost = config.apiHost;
        if (!apiHost) {
          console.error("[AI CRO] Error: API host not configured properly");
          return this;
        }
        
        const selectorUrl = apiHost + '/api/selector-module?cachebust=' + Date.now();
        script.src = selectorUrl;
        console.log("[AI CRO] Loading selector module from:", selectorUrl);
        
        script.onload = function() {
          if (window.AICRO.selector && typeof window.AICRO.selector.start === 'function') {
            window.AICRO.selector.start(options);
          } else {
            console.error("[AI CRO] Selector module loaded but selector.start is not available");
          }
        };
        script.onerror = function(error) {
          console.error("[AI CRO] Error loading selector module:", error);
        };
        document.head.appendChild(script);
        
        return this;
      };
      
      // Stop selector if it's running
      AICRO.stopSelector = function() {
        if (window.AICRO.selector && typeof window.AICRO.selector.stop === 'function') {
          window.AICRO.selector.stop();
        }
        return this;
      };
    })();
  `;

  return new Response(clientScript, { headers });
} 