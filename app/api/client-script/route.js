export async function OPTIONS(request) {
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
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '*';
  const referer = request.headers.get('referer');
  const clientDomain = referer ? new URL(referer).hostname : '';
  
  // Set CORS headers to allow the script to be loaded from any domain
  const headers = {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'max-age=3600, public',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // Set dynamic host based on request
  let host = 'https://ai-cro-three.vercel.app';
  
  // If the request comes from the client, try using their domain to avoid CORS
  if (request.headers.get('host')) {
    const requestHost = request.headers.get('host');
    // Only change the host if it's our domain to prevent security issues
    if (requestHost.includes('vercel.app') || requestHost.includes('localhost')) {
      host = `https://${requestHost}`;
    }
  }

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
          enabled: true,
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
        
        // Merge options with defaults
        Object.assign(config, options);
        
        log("Initializing with config:", config);
        
        // Set up mutation observer for dynamic content
        if (config.autoDetection.enabled) {
          setupMutationObserver();
        }
        
        // Start personalizing content
        personalizeContent();
        
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
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          log("No elements found for selector:", selector);
          return this;
        }
        
        log("Personalizing elements:", elements);
        
        // Get current URL
        const url = window.location.href;
        
        // Request personalized content from the API
        fetch(\`\${config.apiHost}/api/personalize\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            url,
            selector,
            userId: config.userId,
            originalContent: elements[0].innerHTML,
            elementType: elements[0].tagName.toLowerCase(),
            userAttributes: options.attributes || {}
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.personalized) {
            log("Received personalized content:", data);
            
            // Store test data for tracking
            config.testData[selector] = {
              testId: data.testId,
              variantId: data.variantId
            };
            
            // Apply content to all matching elements
            elements.forEach(element => {
              element.innerHTML = data.content;
              
              // Mark element as personalized
              element.setAttribute('data-aicro-personalized', 'true');
              
              // Track impression
              trackEvent('impression', selector);
            });
          } else {
            log("No personalization available for:", selector);
          }
        })
        .catch(error => {
          console.error("[AI CRO] Error fetching personalized content:", error);
        });
        
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
        fetch(\`\${config.apiHost}/api/track\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
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
        
        try {
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
          AICRO.personalize(selector);
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
        
        // Check if the element matches any important element criteria
        if (isImportantElement(element)) {
          const selector = getUniqueSelector(element);
          AICRO.personalize(selector);
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
          AICRO.personalize(selector);
        });
      }
      
      // Check if element is important for personalization
      function isImportantElement(element) {
        if (!isVisibleElement(element)) return false;
        
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
        const text = element.textContent.trim().toLowerCase();
        const ctaWords = ['sign up', 'register', 'submit', 'subscribe', 'buy', 'purchase', 'order', 'get', 'download', 'try', 'start', 'learn more', 'contact'];
        
        const hasCtaText = ctaWords.some(word => text.includes(word));
        const hasCtaStyle = element.className.toLowerCase().includes('btn') || 
                           element.className.toLowerCase().includes('button') ||
                           element.className.toLowerCase().includes('cta') ||
                           getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)';
        
        return hasCtaText && hasCtaStyle;
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
        const text = element.textContent.trim();
        
        // Product descriptions tend to be paragraphs of a certain length
        return element.tagName.toLowerCase() === 'p' && 
               text.length > 50 && 
               text.length < 1000 && 
               element.className.toLowerCase().includes('desc');
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
        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Banners tend to be full-width or nearly full-width elements
        return rect.width > viewportWidth * 0.8 && 
               rect.height > 100 && 
               element.className.toLowerCase().includes('banner') || 
               element.className.toLowerCase().includes('hero');
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
                    AICRO.personalize(selector);
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
        }
      };
      
      // Selector mode UI
      AICRO.selector = {
        // State
        active: false,
        selectedElements: [],
        audienceInfo: '',
        intentInfo: '',
        
        // Start selector mode
        start: function() {
          if (this.active) return;
          
          this.active = true;
          this.selectedElements = [];
          
          // Create the UI
          this._createUI();
          
          // Highlight important elements on hover
          this._setupElementHighlighting();
          
          log("Selector mode started");
          return AICRO;
        },
        
        // Stop selector mode
        stop: function() {
          if (!this.active) return;
          
          this.active = false;
          
          // Remove UI
          const ui = document.getElementById('aicro-selector-ui');
          if (ui) document.body.removeChild(ui);
          
          // Remove event listeners
          document.removeEventListener('mouseover', this._hoverHandler);
          document.removeEventListener('mouseout', this._hoverOutHandler);
          document.removeEventListener('click', this._clickHandler);
          
          log("Selector mode stopped");
          return AICRO;
        },
        
        // Create the UI panel
        _createUI: function() {
          const ui = document.createElement('div');
          ui.id = 'aicro-selector-ui';
          ui.style.position = 'fixed';
          ui.style.bottom = '20px';
          ui.style.right = '20px';
          ui.style.width = '350px';
          ui.style.backgroundColor = 'white';
          ui.style.borderRadius = '8px';
          ui.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          ui.style.zIndex = '999999';
          ui.style.fontFamily = 'Arial, sans-serif';
          ui.style.fontSize = '14px';
          ui.style.color = '#333';
          ui.style.padding = '16px';
          
          // Create UI content
          ui.innerHTML = \`
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h3 style="margin:0;font-size:16px;font-weight:600;">AI CRO Selector</h3>
              <button id="aicro-close-btn" style="background:none;border:none;cursor:pointer;color:#999;font-size:18px;">×</button>
            </div>
            
            <div style="background-color:#f5f8ff;border-radius:6px;padding:12px;margin-bottom:16px;border:1px solid #e0e8ff;">
              <h4 style="margin:0 0 8px 0;font-size:15px;color:#2563eb;">Page-Level Personalization</h4>
              
              <div style="margin-bottom:12px;">
                <label style="display:block;margin-bottom:4px;font-weight:500;">Target Audience</label>
                <textarea id="aicro-audience" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;height:50px;" placeholder="Who is your target audience? (e.g., business professionals, parents, tech enthusiasts)"></textarea>
              </div>
              
              <div style="margin-bottom:6px;">
                <label style="display:block;margin-bottom:4px;font-weight:500;">Page Intent</label>
                <textarea id="aicro-intent" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;height:50px;" placeholder="What's your goal? (e.g., drive sales, educate visitors, increase sign-ups)"></textarea>
              </div>
              
              <p style="margin:8px 0 0;font-size:12px;color:#6b7280;font-style:italic;">These settings will influence all selected elements</p>
            </div>
            
            <div style="margin-bottom:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <label style="font-weight:500;">Selected Elements (<span id="aicro-element-count">0</span>)</label>
                <button id="aicro-auto-select-btn" style="padding:4px 8px;background:#f1f1f1;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Auto Select</button>
              </div>
              <div id="aicro-elements-list" style="max-height:120px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;padding:8px;background:#f9f9f9;"></div>
              <p style="margin:6px 0 0;font-size:12px;color:#6b7280;">Click on elements to select them, or use Auto Select</p>
            </div>
            
            <div style="display:flex;justify-content:space-between;">
              <button id="aicro-clear-btn" style="padding:8px 12px;background:#f1f1f1;border:none;border-radius:4px;cursor:pointer;">Clear All</button>
              <button id="aicro-personalize-btn" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">Personalize Content</button>
            </div>
          \`;
          
          document.body.appendChild(ui);
          
          // Set up event listeners
          document.getElementById('aicro-close-btn').addEventListener('click', () => this.stop());
          document.getElementById('aicro-clear-btn').addEventListener('click', () => this._clearSelectedElements());
          document.getElementById('aicro-personalize-btn').addEventListener('click', () => this._personalizeSelectedElements());
          document.getElementById('aicro-audience').addEventListener('input', (e) => this.audienceInfo = e.target.value);
          document.getElementById('aicro-intent').addEventListener('input', (e) => this.intentInfo = e.target.value);
          document.getElementById('aicro-auto-select-btn').addEventListener('click', () => this._autoSelectElements());
        },
        
        // Set up element highlighting
        _setupElementHighlighting: function() {
          // Store this for event handlers
          const self = this;
          
          // Create hover style
          const style = document.createElement('style');
          style.id = 'aicro-highlight-style';
          style.textContent = \`
            .aicro-highlight {
              outline: 2px dashed #4CAF50 !important;
              outline-offset: 2px !important;
              cursor: pointer !important;
            }
            .aicro-selected {
              outline: 2px solid #2196F3 !important;
              outline-offset: 2px !important;
              background-color: rgba(33, 150, 243, 0.1) !important;
            }
          \`;
          document.head.appendChild(style);
          
          // Define hover handler
          this._hoverHandler = function(e) {
            if (!self.active) return;
            
            // Don't highlight the UI itself
            if (e.target.closest('#aicro-selector-ui')) return;
            
            // Only highlight specific elements
            if (self._isTargetableElement(e.target)) {
              e.target.classList.add('aicro-highlight');
              
              // Prevent bubbling
              e.stopPropagation();
            }
          };
          
          // Define hover out handler
          this._hoverOutHandler = function(e) {
            if (!self.active) return;
            
            // Remove highlight class
            if (e.target.classList && e.target.classList.contains('aicro-highlight')) {
              e.target.classList.remove('aicro-highlight');
            }
          };
          
          // Define click handler
          this._clickHandler = function(e) {
            if (!self.active) return;
            
            // Don't select the UI itself
            if (e.target.closest('#aicro-selector-ui')) return;
            
            // Only select targetable elements
            if (self._isTargetableElement(e.target)) {
              self._toggleElementSelection(e.target);
              
              // Prevent default action and bubbling
              e.preventDefault();
              e.stopPropagation();
            }
          };
          
          // Add event listeners
          document.addEventListener('mouseover', this._hoverHandler, true);
          document.addEventListener('mouseout', this._hoverOutHandler, true);
          document.addEventListener('click', this._clickHandler, true);
        },
        
        // Check if an element is targetable for personalization
        _isTargetableElement: function(element) {
          // Skip basic elements
          if (['html', 'body', 'script', 'style', 'meta', 'head'].includes(element.tagName.toLowerCase())) {
            return false;
          }
          
          // Skip tiny or hidden elements
          if (element.offsetWidth < 10 || element.offsetHeight < 10) {
            return false;
          }
          
          // Skip elements with no content
          if (element.textContent.trim() === '' && !element.querySelector('img')) {
            return false;
          }
          
          // Target specific elements
          const tag = element.tagName.toLowerCase();
          
          // Headers, paragraphs, buttons, links
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'button', 'a'].includes(tag)) {
            return true;
          }
          
          // Divs with text or images
          if (tag === 'div' && (element.textContent.trim() !== '' || element.querySelector('img'))) {
            // But skip if it has too many children (probably a container)
            if (element.children.length < 5) {
              return true;
            }
          }
          
          // Images
          if (tag === 'img') {
            return true;
          }
          
          // Input elements like buttons
          if (tag === 'input' && ['button', 'submit'].includes(element.type)) {
            return true;
          }
          
          // Check for common classes that might indicate important elements
          const classList = Array.from(element.classList || []);
          if (classList.some(cls => 
            ['btn', 'button', 'cta', 'hero', 'title', 'heading', 'banner'].some(keyword => 
              cls.toLowerCase().includes(keyword)
            )
          )) {
            return true;
          }
          
          return false;
        },
        
        // Toggle element selection
        _toggleElementSelection: function(element, forceSelect = false) {
          // Check if already selected
          const index = this.selectedElements.findIndex(e => e.element === element);
          
          if (index > -1 && !forceSelect) {
            // Remove selection
            element.classList.remove('aicro-selected');
            this.selectedElements.splice(index, 1);
          } else if (index === -1) {
            // Add selection
            element.classList.add('aicro-selected');
            element.classList.remove('aicro-highlight');
            
            this.selectedElements.push({
              element: element,
              selector: getUniqueSelector(element),
              originalContent: element.innerHTML,
              type: element.tagName.toLowerCase()
            });
          }
          
          // Update UI
          this._updateSelectedElementsList();
        },
        
        // Update the selected elements list in the UI
        _updateSelectedElementsList: function() {
          const listEl = document.getElementById('aicro-elements-list');
          const countEl = document.getElementById('aicro-element-count');
          
          if (!listEl || !countEl) return;
          
          // Update count
          countEl.textContent = this.selectedElements.length;
          
          // Clear list
          listEl.innerHTML = '';
          
          // Add elements to list
          this.selectedElements.forEach((item, i) => {
            const el = document.createElement('div');
            el.style.padding = '4px 0';
            el.style.borderBottom = i < this.selectedElements.length - 1 ? '1px solid #eee' : 'none';
            el.style.display = 'flex';
            el.style.justifyContent = 'space-between';
            el.style.alignItems = 'center';
            
            // Truncate content for display
            let content = item.element.textContent.trim();
            if (content.length > 30) {
              content = content.substring(0, 27) + '...';
            }
            
            el.innerHTML = \`
              <span style="font-size:12px;color:#666;">\${item.type.toUpperCase()}: \${content}</span>
              <button class="aicro-remove-el" data-index="\${i}" style="background:none;border:none;color:#999;cursor:pointer;font-size:16px;">×</button>
            \`;
            
            listEl.appendChild(el);
          });
          
          // Add remove listeners
          document.querySelectorAll('.aicro-remove-el').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const index = parseInt(e.target.dataset.index);
              if (!isNaN(index) && index >= 0 && index < this.selectedElements.length) {
                const item = this.selectedElements[index];
                item.element.classList.remove('aicro-selected');
                this.selectedElements.splice(index, 1);
                this._updateSelectedElementsList();
              }
            });
          });
        },
        
        // Clear all selected elements
        _clearSelectedElements: function() {
          // Remove selected class from all elements
          this.selectedElements.forEach(item => {
            item.element.classList.remove('aicro-selected');
          });
          
          // Clear array
          this.selectedElements = [];
          
          // Update UI
          this._updateSelectedElementsList();
        },
        
        // Personalize selected elements
        _personalizeSelectedElements: function() {
          if (this.selectedElements.length === 0) {
            alert('Please select at least one element to personalize.');
            return;
          }
          
          // Get audience and intent info from the UI
          this.audienceInfo = document.getElementById('aicro-audience').value;
          this.intentInfo = document.getElementById('aicro-intent').value;
          
          // Store page-level audience and intent in the config
          config.pageAudience = this.audienceInfo;
          config.pageIntent = this.intentInfo;
          
          // Show element-specific UI to generate options (don't instantly personalize)
          this._showElementWorkspace();
        },
        
        // Show workspace UI for managing element-specific prompts and options
        _showElementWorkspace: function() {
          // Create the workspace container
          const workspace = document.createElement('div');
          workspace.id = 'aicro-element-workspace';
          workspace.style.position = 'fixed';
          workspace.style.top = '0';
          workspace.style.right = '0';
          workspace.style.width = '400px';
          workspace.style.height = '100vh';
          workspace.style.backgroundColor = 'white';
          workspace.style.boxShadow = '-5px 0 15px rgba(0,0,0,0.1)';
          workspace.style.zIndex = '999999';
          workspace.style.display = 'flex';
          workspace.style.flexDirection = 'column';
          workspace.style.fontFamily = 'Arial, sans-serif';
          workspace.style.fontSize = '14px';
          workspace.style.color = '#333';
          workspace.style.transition = 'transform 0.3s ease-in-out';
          
          // Create workspace header
          const header = document.createElement('div');
          header.style.padding = '16px';
          header.style.borderBottom = '1px solid #eee';
          header.style.display = 'flex';
          header.style.justifyContent = 'space-between';
          header.style.alignItems = 'center';
          
          header.innerHTML = \`
            <h3 style="margin:0;font-size:18px;font-weight:600;">Content Variations</h3>
            <button id="aicro-close-workspace" style="background:none;border:none;cursor:pointer;color:#999;font-size:20px;">×</button>
          \`;
          
          workspace.appendChild(header);
          
          // Create elements list
          const elementsList = document.createElement('div');
          elementsList.style.flex = '0 0 auto';
          elementsList.style.padding = '16px';
          elementsList.style.borderBottom = '1px solid #eee';
          elementsList.style.backgroundColor = '#f9f9f9';
          
          let elementsListHTML = \`
            <h4 style="margin:0 0 8px 0;font-size:14px;font-weight:600;">Selected Elements (${this.selectedElements.length})</h4>
            <div style="max-height:120px;overflow-y:auto;">
          \`;
          
          this.selectedElements.forEach((item, index) => {
            const content = item.element.textContent.trim().substring(0, 30) + (item.element.textContent.trim().length > 30 ? '...' : '');
            const isActive = index === 0 ? 'background-color:#ebf5ff;border-color:#2196F3;' : '';
            
            elementsListHTML += \`
              <div class="aicro-element-item" data-index="${index}" style="${isActive}margin-bottom:6px;padding:8px;border-radius:4px;border:1px solid #ddd;cursor:pointer;">
                <div style="font-weight:500;font-size:13px;">${item.element.tagName.toLowerCase()}</div>
                <div style="font-size:12px;color:#666;margin-top:2px;">${content}</div>
              </div>
            \`;
          });
          
          elementsListHTML += '</div>';
          elementsList.innerHTML = elementsListHTML;
          workspace.appendChild(elementsList);
          
          // Create element editing area (start with first element)
          const editingArea = document.createElement('div');
          editingArea.id = 'aicro-editing-area';
          editingArea.style.flex = '1';
          editingArea.style.padding = '16px';
          editingArea.style.overflowY = 'auto';
          editingArea.style.display = 'flex';
          editingArea.style.flexDirection = 'column';
          
          workspace.appendChild(editingArea);
          
          // Create actions area
          const actionsArea = document.createElement('div');
          actionsArea.style.padding = '16px';
          actionsArea.style.borderTop = '1px solid #eee';
          actionsArea.style.display = 'flex';
          actionsArea.style.justifyContent = 'space-between';
          
          actionsArea.innerHTML = \`
            <button id="aicro-back-btn" style="padding:8px 16px;background:#f1f1f1;border:none;border-radius:4px;cursor:pointer;">Back</button>
            <button id="aicro-finish-btn" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:500;">Save & Exit</button>
          \`;
          
          workspace.appendChild(actionsArea);
          
          // Add workspace to the page
          document.body.appendChild(workspace);
          
          // Add event listeners
          document.getElementById('aicro-close-workspace').addEventListener('click', () => {
            document.body.removeChild(workspace);
          });
          
          document.getElementById('aicro-back-btn').addEventListener('click', () => {
            document.body.removeChild(workspace);
          });
          
          document.getElementById('aicro-finish-btn').addEventListener('click', () => {
            this._savePersonalizationChanges();
            document.body.removeChild(workspace);
          });
          
          // Add element selection event listeners
          const elementItems = workspace.querySelectorAll('.aicro-element-item');
          elementItems.forEach(item => {
            item.addEventListener('click', (e) => {
              const index = parseInt(e.currentTarget.dataset.index);
              this._loadElementEditor(index);
              
              // Update active state
              elementItems.forEach(el => {
                el.style.backgroundColor = '';
                el.style.borderColor = '#ddd';
              });
              e.currentTarget.style.backgroundColor = '#ebf5ff';
              e.currentTarget.style.borderColor = '#2196F3';
            });
          });
          
          // Load editor for the first element by default
          this._loadElementEditor(0);
        },
        
        // Load the editor UI for a specific element
        _loadElementEditor: function(elementIndex) {
          const editingArea = document.getElementById('aicro-editing-area');
          const element = this.selectedElements[elementIndex];
          
          if (!editingArea || !element) return;
          
          // Get element details
          const tagName = element.element.tagName.toLowerCase();
          const text = element.element.innerText || element.element.textContent || '';
          const html = element.element.innerHTML || '';
          const selector = element.selector;
          
          // Clear editing area
          editingArea.innerHTML = '';
          
          // Create element preview
          const preview = document.createElement('div');
          preview.style.marginBottom = '16px';
          preview.style.padding = '12px';
          preview.style.border = '1px solid #ddd';
          preview.style.borderRadius = '4px';
          preview.style.backgroundColor = '#f9f9f9';
          
          preview.innerHTML = \`
            <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:500;font-size:13px;">Element Preview</span>
              <span style="font-size:12px;color:#666;">${tagName}</span>
            </div>
            <div id="aicro-preview-content" style="padding:8px;border:1px solid #eee;background:white;border-radius:4px;word-break:break-word;">${html}</div>
          \`;
          
          editingArea.appendChild(preview);
          
          // Create generation prompt
          const promptSection = document.createElement('div');
          promptSection.style.marginBottom = '20px';
          
          const elementTypeDesc = this._getElementDescription(tagName, text);
          const defaultPrompt = this._generateDefaultPrompt(elementTypeDesc, text, this.audienceInfo, this.intentInfo);
          
          promptSection.innerHTML = \`
            <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:500;font-size:13px;">Customization Prompt</span>
              <button id="aicro-generate-btn" style="padding:4px 10px;background:#2196F3;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Generate Options</button>
            </div>
            <textarea id="aicro-gen-prompt" style="width:100%;height:100px;padding:8px;border:1px solid #ddd;border-radius:4px;font-family:inherit;font-size:13px;resize:vertical;">${defaultPrompt}</textarea>
          \`;
          
          editingArea.appendChild(promptSection);
          
          // Create options section (initially empty)
          const optionsSection = document.createElement('div');
          optionsSection.id = 'aicro-options-section';
          optionsSection.style.marginBottom = '16px';
          
          optionsSection.innerHTML = \`
            <div style="margin-bottom:8px;font-weight:500;font-size:13px;">Content Options</div>
            <div id="aicro-options-list" style="font-size:13px;color:#666;font-style:italic;text-align:center;padding:20px;">
              Click "Generate Options" to create content variations
            </div>
          \`;
          
          editingArea.appendChild(optionsSection);
          
          // Add event listeners
          document.getElementById('aicro-generate-btn').addEventListener('click', () => {
            this._generateContentOptions(elementIndex);
          });
        },
        
        // Generate description based on element type
        _getElementDescription: function(tagName, text) {
          switch (tagName) {
            case 'h1': return 'primary heading';
            case 'h2': return 'secondary heading';
            case 'h3': 
            case 'h4': 
            case 'h5': 
            case 'h6': return 'heading';
            case 'p': return 'paragraph';
            case 'button': return 'button';
            case 'a': return text.length < 20 ? 'call-to-action link' : 'link';
            case 'li': return 'list item';
            case 'img': return 'image alt text';
            case 'span': return 'text snippet';
            default: return 'content element';
          }
        },
        
        // Generate a default prompt for content variations
        _generateDefaultPrompt: function(elementType, originalText, audience, intent) {
          let prompt = \`Generate 5 alternative versions for this \${elementType}\`;
          
          // Add original text
          if (originalText) {
            prompt += \`:\n\n"\${originalText.trim()}"\`;
          }
          
          // Add audience if available
          if (audience) {
            prompt += \`\n\nTarget audience: \${audience}\`;
          }
          
          // Add intent if available
          if (intent) {
            prompt += \`\n\nContent goal: \${intent}\`;
          }
          
          // Add guidance based on element type
          if (elementType.includes('heading')) {
            prompt += '\n\nMake the headings compelling, concise, and action-oriented.';
          } else if (elementType.includes('button') || elementType.includes('call-to-action')) {
            prompt += '\n\nMake the text clear, compelling, and action-oriented. Keep it concise.';
          } else if (elementType.includes('paragraph')) {
            prompt += '\n\nMaintain approximately the same length while making the content more engaging and persuasive.';
          }
          
          return prompt;
        },
        
        // Generate content options based on the prompt
        _generateContentOptions: function(elementIndex) {
          const element = this.selectedElements[elementIndex];
          const prompt = document.getElementById('aicro-gen-prompt').value;
          const optionsList = document.getElementById('aicro-options-list');
          
          if (!element || !optionsList) return;
          
          // Show loading state
          optionsList.innerHTML = \`
            <div style="text-align:center;padding:20px;">
              <div style="margin-bottom:10px;font-style:normal;">Generating options...</div>
              <div style="display:inline-block;width:20px;height:20px;border:2px solid #2196F3;border-radius:50%;border-top-color:transparent;animation:aicro-spin 1s linear infinite;"></div>
            </div>
            <style>
              @keyframes aicro-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          \`;
          
          // For demo purposes, generate 5 variations based on the element type
          // In a real implementation, this would call an AI API
          setTimeout(() => {
            this._displayGeneratedOptions(elementIndex, this._generateDemoOptions(element));
          }, 1500);
        },
        
        // Generate demo options based on element type (simulating AI response)
        _generateDemoOptions: function(element) {
          const tagName = element.element.tagName.toLowerCase();
          const originalText = element.element.innerText || element.element.textContent || '';
          const options = [];
          
          // Different variations based on element type
          if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
            // Heading variations
            options.push(\`Discover \${originalText}\`);
            options.push(\`\${originalText} - Reimagined for You\`);
            options.push(\`Experience the Power of \${originalText}\`);
            options.push(\`Transform Your Results with \${originalText}\`);
            options.push(\`\${originalText}: Your Ultimate Solution\`);
          } else if (tagName === 'button' || (tagName === 'a' && originalText.length < 20)) {
            // Button/CTA variations
            options.push(\`Get Started Now\`);
            options.push(\`Try It Free\`);
            options.push(\`See Results Today\`);
            options.push(\`Yes, I Want This!\`);
            options.push(\`Claim Your \${originalText}\`);
          } else if (tagName === 'p') {
            // Paragraph variations
            const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
            for (let i = 0; i < 5; i++) {
              let newText = '';
              sentences.forEach(sentence => {
                // Add a variation of the sentence
                if (sentence.length > 0) {
                  const words = sentence.split(' ');
                  if (i % 2 === 0 && words.length > 3) {
                    // Add an adjective
                    const adjectives = ['amazing', 'excellent', 'outstanding', 'remarkable', 'exceptional'];
                    words.splice(2, 0, adjectives[i % adjectives.length]);
                  }
                  if (i % 3 === 0) {
                    // Make it more direct
                    words.unshift('You\'ll find that');
                  }
                  newText += words.join(' ') + '. ';
                }
              });
              options.push(newText.trim());
            }
          } else {
            // Generic text variations
            for (let i = 0; i < 5; i++) {
              options.push(\`Option \${i+1}: \${originalText} (variation \${i+1})\`);
            }
          }
          
          return options;
        },
        
        // Display generated options
        _displayGeneratedOptions: function(elementIndex, options) {
          const element = this.selectedElements[elementIndex];
          const optionsList = document.getElementById('aicro-options-list');
          
          if (!element || !optionsList || !options || options.length === 0) return;
          
          // Store options with the element
          element.variations = options;
          
          // Build options HTML
          let optionsHTML = '';
          
          options.forEach((option, i) => {
            optionsHTML += \`
              <div class="aicro-option-item" style="margin-bottom:12px;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
                <div style="padding:8px;background:#f9f9f9;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:500;font-size:12px;">Option \${i+1}</span>
                  <div>
                    <button class="aicro-preview-option" data-option="${i}" style="padding:3px 8px;background:#f1f1f1;border:none;border-radius:3px;margin-right:5px;font-size:11px;cursor:pointer;">Preview</button>
                    <button class="aicro-select-option" data-option="${i}" style="padding:3px 8px;background:#2196F3;color:white;border:none;border-radius:3px;font-size:11px;cursor:pointer;">Select</button>
                  </div>
                </div>
                <div style="padding:8px;word-break:break-word;">${option}</div>
              </div>
            \`;
          });
          
          // Update the options list
          optionsList.innerHTML = optionsHTML;
          
          // Add event listeners
          const previewButtons = optionsList.querySelectorAll('.aicro-preview-option');
          previewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const optionIndex = parseInt(e.target.dataset.option);
              this._previewOption(elementIndex, optionIndex);
            });
          });
          
          const selectButtons = optionsList.querySelectorAll('.aicro-select-option');
          selectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const optionIndex = parseInt(e.target.dataset.option);
              this._selectOption(elementIndex, optionIndex);
            });
          });
        },
        
        // Preview an option
        _previewOption: function(elementIndex, optionIndex) {
          const element = this.selectedElements[elementIndex];
          if (!element || !element.variations || !element.variations[optionIndex]) return;
          
          // Update the preview content
          const previewContent = document.getElementById('aicro-preview-content');
          if (previewContent) {
            // Store original content if not already stored
            if (!element.originalPreviewContent) {
              element.originalPreviewContent = previewContent.innerHTML;
            }
            
            // Show the option content
            previewContent.innerHTML = element.variations[optionIndex];
          }
        },
        
        // Select an option as the chosen variation
        _selectOption: function(elementIndex, optionIndex) {
          const element = this.selectedElements[elementIndex];
          if (!element || !element.variations || !element.variations[optionIndex]) return;
          
          // Store the selected option
          element.selectedVariation = element.variations[optionIndex];
          
          // Update the preview content
          const previewContent = document.getElementById('aicro-preview-content');
          if (previewContent) {
            previewContent.innerHTML = element.selectedVariation;
          }
          
          // Highlight the selected option
          const optionItems = document.querySelectorAll('.aicro-option-item');
          optionItems.forEach((item, i) => {
            if (i === optionIndex) {
              item.style.borderColor = '#4CAF50';
              item.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
            } else {
              item.style.borderColor = '#ddd';
              item.style.boxShadow = 'none';
            }
          });
        },
        
        // Save all personalization changes
        _savePersonalizationChanges: function() {
          const elementsToPersonalize = [];
          
          // Find elements with selected variations
          this.selectedElements.forEach(element => {
            if (element.selectedVariation) {
              elementsToPersonalize.push({
                selector: element.selector,
                content: element.selectedVariation
              });
            }
          });
          
          if (elementsToPersonalize.length === 0) {
            alert('No content variations were selected. Please select at least one option to continue.');
            return;
          }
          
          // Show loading notification
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.bottom = '20px';
          notification.style.right = '20px';
          notification.style.background = '#4CAF50';
          notification.style.color = 'white';
          notification.style.padding = '16px';
          notification.style.borderRadius = '4px';
          notification.style.zIndex = '9999';
          notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          notification.innerHTML = \`
            <div style="font-weight:bold;margin-bottom:4px;">Saving Changes</div>
            <div>Personalizing \${elementsToPersonalize.length} elements...</div>
          \`;
          
          document.body.appendChild(notification);
          
          // Process each element
          let processed = 0;
          
          elementsToPersonalize.forEach(item => {
            // Find the element
            const elements = document.querySelectorAll(item.selector);
            
            elements.forEach(el => {
              // Update the content
              el.innerHTML = item.content;
              
              // Mark as personalized
              el.setAttribute('data-aicro-personalized', 'true');
            });
            
            // Track as processed
            processed++;
            
            // For demo, we'll just log this instead of sending to API
            log("Personalized element:", item.selector);
          });
          
          // Update notification after processing
          setTimeout(() => {
            notification.innerHTML = \`
              <div style="font-weight:bold;margin-bottom:4px;">Changes Applied</div>
              <div>Successfully personalized \${processed} elements</div>
            \`;
            
            // Remove after a delay
            setTimeout(() => {
              notification.style.opacity = '0';
              notification.style.transition = 'opacity 0.5s';
              setTimeout(() => {
                if (notification.parentNode) {
                  document.body.removeChild(notification);
                }
              }, 500);
            }, 3000);
          }, 1000);
          
          // Clean up UI
          this.stop();
        }
      };
      
      // Add commands to the bookmarklet
      AICRO.startSelector = function() {
        this.selector.start();
        return this;
      };
      
      AICRO.stopSelector = function() {
        this.selector.stop();
        return this;
      };
    })();
  `;

  return new Response(clientScript, { headers });
} 