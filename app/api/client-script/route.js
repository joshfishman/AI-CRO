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
  // Set CORS headers to allow the script to be loaded from any domain
  const headers = {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'max-age=3600'
  };

  // Host URL (for API requests)
  const host = 'https://ai-cro-three.vercel.app';

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
            'Content-Type': 'application/json'
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
        if (element.id) {
          return '#' + element.id;
        }
        
        if (element.className) {
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
        
        while (current && current !== document.body) {
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
          
          // Show loading state
          const personalizeBtn = document.getElementById('aicro-personalize-btn');
          const originalText = personalizeBtn.textContent;
          personalizeBtn.textContent = 'Processing...';
          personalizeBtn.disabled = true;
          
          // Store page-level audience and intent in the config
          config.pageAudience = this.audienceInfo;
          config.pageIntent = this.intentInfo;
          
          // Personalize each element with the same page-level audience and intent
          const promises = this.selectedElements.map(item => {
            return new Promise((resolve) => {
              AICRO.personalize(item.selector, {
                attributes: {
                  pageAudience: this.audienceInfo,
                  pageIntent: this.intentInfo
                }
              });
              // Resolve after a short delay to avoid overloading
              setTimeout(resolve, 100);
            });
          });
          
          // When all personalization requests are sent
          Promise.all(promises).then(() => {
            // Exit selector mode
            this.stop();
            
            // Show success message
            const notice = document.createElement('div');
            notice.style.position = 'fixed';
            notice.style.bottom = '20px';
            notice.style.right = '20px';
            notice.style.background = '#4CAF50';
            notice.style.color = 'white';
            notice.style.padding = '16px';
            notice.style.borderRadius = '4px';
            notice.style.zIndex = '9999';
            notice.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            notice.innerHTML = \`
              <div style="font-weight:bold;margin-bottom:4px;">Personalization in Progress</div>
              <div>AI CRO is personalizing \${this.selectedElements.length} elements for your audience</div>
            \`;
            
            document.body.appendChild(notice);
            
            // Remove notice after 5 seconds
            setTimeout(() => {
              notice.style.opacity = '0';
              notice.style.transition = 'opacity 0.5s';
              setTimeout(() => {
                if (notice.parentNode) {
                  document.body.removeChild(notice);
                }
              }, 500);
            }, 5000);
          });
        },
        
        // Auto-select important elements on the page with enhanced capabilities
        _autoSelectElements: function() {
          // Clear current selections
          this._clearSelectedElements();
          
          // Find important elements by type
          const headings = Array.from(document.querySelectorAll('h1, h2')).filter(el => this._isTargetableElement(el));
          const buttons = Array.from(document.querySelectorAll('button, a.btn, .button, .cta, a[class*="btn"]')).filter(el => this._isTargetableElement(el));
          const paragraphs = Array.from(document.querySelectorAll('p.lead, p.intro, p[class*="description"]')).filter(el => this._isTargetableElement(el));
          const images = Array.from(document.querySelectorAll('img[class*="hero"], img[class*="banner"], img[role="banner"]')).filter(el => this._isTargetableElement(el));
          const ctaForms = Array.from(document.querySelectorAll('form[class*="signup"], form[class*="newsletter"], form[id*="contact"]')).filter(el => this._isTargetableElement(el));
          
          // Group elements by type for UI organization
          const groups = {
            'Headings': headings,
            'Buttons': buttons,
            'Paragraphs': paragraphs,
            'Images': images,
            'Forms': ctaForms
          };
          
          // Show selection dialog with grouped elements
          this._showGroupSelectionDialog(groups);
        },
        
        // Show a dialog with grouped elements for selection
        _showGroupSelectionDialog: function(groups) {
          // Create the dialog
          const dialog = document.createElement('div');
          dialog.id = 'aicro-group-selection';
          dialog.style.position = 'fixed';
          dialog.style.top = '50%';
          dialog.style.left = '50%';
          dialog.style.transform = 'translate(-50%, -50%)';
          dialog.style.width = '600px';
          dialog.style.maxHeight = '80vh';
          dialog.style.backgroundColor = 'white';
          dialog.style.borderRadius = '8px';
          dialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
          dialog.style.zIndex = '999999';
          dialog.style.fontFamily = 'Arial, sans-serif';
          dialog.style.fontSize = '14px';
          dialog.style.color = '#333';
          dialog.style.padding = '24px';
          dialog.style.overflowY = 'auto';
          
          // Create dialog content
          let dialogContent = "";
          
          // Add header
          dialogContent += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
          dialogContent += '<h3 style="margin:0;font-size:18px;font-weight:600;">Select Elements by Type</h3>';
          dialogContent += '<button id="aicro-close-group-dialog" style="background:none;border:none;cursor:pointer;color:#999;font-size:18px;">×</button>';
          dialogContent += '</div>';
          dialogContent += '<p style="margin-bottom:16px;color:#666;">Choose elements to personalize or use "Select All" for entire groups.</p>';
          
          // Create groups section
          for (const [groupName, elements] of Object.entries(groups)) {
            if (elements.length === 0) continue;
            
            // Add group header
            dialogContent += '<div style="margin-bottom:24px;border:1px solid #eee;border-radius:6px;overflow:hidden;">';
            dialogContent += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f9f9f9;border-bottom:1px solid #eee;">';
            dialogContent += '<h4 style="margin:0;font-size:16px;color:#333;">' + groupName + ' (' + elements.length + ')</h4>';
            dialogContent += '<label style="display:flex;align-items:center;cursor:pointer;">';
            dialogContent += '<input type="checkbox" class="aicro-group-select" data-group="' + groupName + '" style="margin-right:6px;">';
            dialogContent += '<span>Select All</span>';
            dialogContent += '</label>';
            dialogContent += '</div>';
            dialogContent += '<div style="max-height:200px;overflow-y:auto;padding:12px;">';
            
            // Add elements to the group
            elements.forEach((element, index) => {
              // Get a preview of the element's content
              let content = element.textContent.trim();
              if (content.length > 40) {
                content = content.substring(0, 37) + '...';
              }
              
              // For images, show alt text or src
              if (element.tagName.toLowerCase() === 'img') {
                content = element.alt || element.src.split('/').pop();
              }
              
              // Add border-top style for all but the first element
              const borderStyle = index > 0 ? 'border-top:1px solid #f0f0f0;' : '';
              
              dialogContent += '<div style="display:flex;align-items:center;padding:8px;' + borderStyle + '">';
              dialogContent += '<label style="display:flex;align-items:center;cursor:pointer;flex:1;">';
              dialogContent += '<input type="checkbox" class="aicro-element-select" data-group="' + groupName + '" data-index="' + index + '" style="margin-right:8px;">';
              dialogContent += '<span style="font-size:13px;font-weight:500;">' + element.tagName.toLowerCase() + '</span>';
              dialogContent += '<span style="margin-left:8px;font-size:12px;color:#666;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + content + '</span>';
              dialogContent += '</label>';
              dialogContent += '<button class="aicro-highlight-element" data-group="' + groupName + '" data-index="' + index + '" style="padding:2px 6px;background:#f1f1f1;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Preview</button>';
              dialogContent += '</div>';
            });
            
            // Close the group containers
            dialogContent += '</div>'; // Close inner div
            dialogContent += '</div>'; // Close group div
          }
          
          // Add action buttons
          dialogContent += '<div style="display:flex;justify-content:space-between;margin-top:16px;">';
          dialogContent += '<button id="aicro-cancel-selection" style="padding:8px 16px;background:#f1f1f1;border:none;border-radius:4px;cursor:pointer;">Cancel</button>';
          dialogContent += '<button id="aicro-apply-selection" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:500;">Apply Selection</button>';
          dialogContent += '</div>';
          
          // Set dialog content
          dialog.innerHTML = dialogContent;
          
          // Add dialog to page
          document.body.appendChild(dialog);
          
          // Add event listeners
          document.getElementById('aicro-close-group-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
          });
          
          document.getElementById('aicro-cancel-selection').addEventListener('click', () => {
            document.body.removeChild(dialog);
          });
          
          // Group select all checkboxes
          const groupCheckboxes = dialog.querySelectorAll('.aicro-group-select');
          groupCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
              const group = e.target.dataset.group;
              const isChecked = e.target.checked;
              
              // Select/deselect all elements in the group
              dialog.querySelectorAll('.aicro-element-select[data-group="' + group + '"]').forEach(cb => {
                cb.checked = isChecked;
              });
            });
          });
          
          // Element highlight buttons
          const highlightButtons = dialog.querySelectorAll('.aicro-highlight-element');
          highlightButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              const group = e.target.dataset.group;
              const index = parseInt(e.target.dataset.index);
              
              // Temporarily highlight the element
              const element = groups[group][index];
              this._previewElement(element);
            });
          });
          
          // Apply selection button
          document.getElementById('aicro-apply-selection').addEventListener('click', () => {
            // Collect all selected elements
            const selectedElements = [];
            
            for (const [groupName, elements] of Object.entries(groups)) {
              const checkboxes = dialog.querySelectorAll('.aicro-element-select[data-group="' + groupName + '"]');
              
              checkboxes.forEach((checkbox, index) => {
                if (checkbox.checked) {
                  selectedElements.push(elements[index]);
                }
              });
            }
            
            // Select all elements
            selectedElements.forEach(element => {
              this._toggleElementSelection(element, true);
            });
            
            // Remove dialog
            document.body.removeChild(dialog);
            
            // Show confirmation
            if (selectedElements.length > 0) {
              log("Selected", selectedElements.length, "elements");
            } else {
              alert("No elements selected. Please select at least one element to personalize.");
            }
          });
        },
        
        // Temporarily highlight an element to preview it
        _previewElement: function(element) {
          // Create highlight overlay
          const rect = element.getBoundingClientRect();
          const overlay = document.createElement('div');
          
          overlay.style.position = 'fixed';
          overlay.style.top = rect.top + 'px';
          overlay.style.left = rect.left + 'px';
          overlay.style.width = rect.width + 'px';
          overlay.style.height = rect.height + 'px';
          overlay.style.border = '3px solid #4CAF50';
          overlay.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
          overlay.style.zIndex = '99999';
          overlay.style.pointerEvents = 'none';
          overlay.style.transition = 'opacity 0.3s';
          
          document.body.appendChild(overlay);
          
          // Scroll element into view if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after a short delay
          setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
              if (overlay.parentNode) {
                document.body.removeChild(overlay);
              }
            }, 300);
          }, 1500);
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