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
  
  // Set CORS headers to allow the script to be loaded from any domain
  const headers = {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'max-age=3600'
  };

  // Host URL (for API requests)
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-cro-three.vercel.app';

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
        
        // Get class names safely
        let classNames = '';
        if (element.className) {
          if (typeof element.className === 'string') {
            classNames = element.className.toLowerCase();
          } else if (element.className.baseVal) {
            // For SVG elements className is an SVGAnimatedString with baseVal
            classNames = element.className.baseVal.toLowerCase();
          }
        }
        
        // Banners tend to be full-width or nearly full-width elements
        return rect.width > viewportWidth * 0.8 && 
               rect.height > 100 && 
               (classNames.includes('banner') || 
               classNames.includes('hero'));
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
        script.src = config.apiHost + "/api/selector-module?cachebust=" + Date.now();
        script.onload = function() {
          if (window.AICRO.selector && typeof window.AICRO.selector.start === 'function') {
            window.AICRO.selector.start(options);
          }
        };
        script.onerror = function(error) {
          console.error("Error loading selector module:", error);
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