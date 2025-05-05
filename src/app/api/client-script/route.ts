import { NextResponse } from 'next/server';

export async function GET() {
  // Host URL (for API requests)
  const host = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

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
        testData: {}
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
      
      // Log if in debug mode
      function log(...args) {
        if (config.debug) {
          console.log("[AI CRO]", ...args);
        }
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
        
        // Start personalizing content
        personalizeContent();
        
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
          body: JSON.stringify({
            url,
            selector,
            userId: config.userId,
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
        
        fetch(\`\${config.apiHost}/api/track\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
      
      // Auto-personalize all tagged elements
      function personalizeContent() {
        // Look for elements with data-aicro attribute
        const elements = document.querySelectorAll('[data-aicro]');
        log("Found", elements.length, "elements to personalize");
        
        elements.forEach(element => {
          const selector = getUniqueSelector(element);
          AICRO.personalize(selector);
        });
      }
      
      // Generate a unique CSS selector for an element
      function getUniqueSelector(element) {
        if (element.id) {
          return '#' + element.id;
        }
        
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c);
          if (classes.length > 0) {
            return element.tagName.toLowerCase() + '.' + classes[0];
          }
        }
        
        // Fallback to a data attribute
        if (!element.hasAttribute('data-aicro-id')) {
          const id = 'aicro-' + Math.random().toString(36).substring(2, 9);
          element.setAttribute('data-aicro-id', id);
        }
        
        return '[data-aicro-id="' + element.getAttribute('data-aicro-id') + '"]';
      }
      
      // Auto-initialize if data-aicro-auto is present
      if (document.querySelector('[data-aicro-auto]')) {
        AICRO.init();
      }
    })();
  `;

  return new NextResponse(clientScript, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
} 