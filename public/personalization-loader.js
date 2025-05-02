/**
 * Cursor AI-CRO Personalization Loader
 * 
 * This script loads personalization configurations from Edge Config, 
 * gets the user type from the API, and applies personalized content to the page.
 * 
 * Embed this script in your website to enable AI personalization:
 * <script src="https://ai-cro-eight.vercel.app/personalization-loader.js" 
 *         data-cursor-workspace="YOUR_WORKSPACE_ID"></script>
 */
(function() {
  // Config and state
  const state = {
    config: null,
    userType: 'unknown',
    applied: false,
    processing: false,
    apiBase: null,
    workspaceId: null,
    pageUrl: window.location.pathname,
    startTime: Date.now()
  };

  // Initialize the personalization
  function initialize() {
    // Check if already initialized
    if (window.__cursorPersonalizationLoaded) {
      console.warn('Cursor AI-CRO personalization already loaded');
      return;
    }

    // Mark as loaded
    window.__cursorPersonalizationLoaded = true;
    
    // Get script tag and configuration
    const scriptTag = document.currentScript || 
      document.querySelector('script[src*="personalization-loader.js"]');
    
    if (!scriptTag) {
      console.error('Could not find Cursor AI-CRO script tag');
      return;
    }

    // Get API base from script src or default
    const scriptSrc = scriptTag.src || '';
    const srcUrl = new URL(scriptSrc);
    state.apiBase = `${srcUrl.protocol}//${srcUrl.host}`;
    
    // Get workspace ID from data attribute
    state.workspaceId = scriptTag.getAttribute('data-cursor-workspace') || 'default';
    
    // Add personalized-loading class to body
    document.body.classList.add('personalized-loading');
    
    console.log(`Cursor AI-CRO: Initializing personalization (workspace: ${state.workspaceId})`);
    
    // Start the personalization process
    getUserType()
      .then(getPageConfig)
      .then(applyPersonalization)
      .catch(error => {
        console.error('Cursor AI-CRO: Personalization failed', error);
        // Release any hidden elements even if personalization fails
        document.body.classList.remove('personalized-loading');
        document.body.classList.add('personalized-error');
      });
    
    // Set up event tracking
    setupEventTracking();
  }
  
  // Get the user type from the API
  async function getUserType() {
    try {
      // Try to get the user type based on various identifiers
      const email = getEmailFromPage() || getEmailFromCookie();
      const ipAddress = await getClientIP();
      
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (ipAddress) params.append('ipAddress', ipAddress);
      params.append('workspaceId', state.workspaceId);
      
      const response = await fetch(`${state.apiBase}/api/get-user-type?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user type: ${response.status}`);
      }
      
      const data = await response.json();
      state.userType = data.userType || 'unknown';
      console.log(`Cursor AI-CRO: User type detected: ${state.userType}`);
    } catch (error) {
      console.warn('Cursor AI-CRO: Error getting user type, using default', error);
      state.userType = 'unknown';
    }
    
    return state.userType;
  }
  
  // Try to find an email on the page (from forms, etc.)
  function getEmailFromPage() {
    const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"]');
    for (const input of emailInputs) {
      if (input.value && input.value.includes('@')) {
        return input.value.trim();
      }
    }
    return null;
  }
  
  // Try to get email from cookies or localStorage
  function getEmailFromCookie() {
    // Check various common cookie/storage names for email
    const storageKeys = [
      'email', 'userEmail', 'user_email', 'customerEmail', 'visitorEmail'
    ];
    
    // Check localStorage
    for (const key of storageKeys) {
      const value = localStorage.getItem(key);
      if (value && value.includes('@')) {
        return value.trim();
      }
    }
    
    // Check cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=').map(s => s.trim());
      if (storageKeys.some(key => name.toLowerCase().includes(key.toLowerCase())) && 
          value && value.includes('@')) {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  }
  
  // Get client IP address using a service
  async function getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        return data.ip;
      }
    } catch (error) {
      console.warn('Cursor AI-CRO: Could not determine IP address');
    }
    return null;
  }
  
  // Get page configuration from Edge Config
  async function getPageConfig() {
    try {
      // Create the URL for config retrieval
      const configUrl = `${state.apiBase}/api/get-config?path=${encodeURIComponent(state.pageUrl)}&workspace=${encodeURIComponent(state.workspaceId)}`;
      
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Cursor AI-CRO: No configuration found for ${state.pageUrl}`);
          return null;
        }
        throw new Error(`Failed to get page config: ${response.status}`);
      }
      
      const config = await response.json();
      state.config = config;
      
      console.log(`Cursor AI-CRO: Configuration loaded (${config.selectors?.length || 0} selectors)`);
      return config;
    } catch (error) {
      console.error('Cursor AI-CRO: Error getting page configuration', error);
      return null;
    }
  }
  
  // Apply personalization to the page
  async function applyPersonalization() {
    // If no config or no selectors, exit
    if (!state.config || !state.config.selectors || state.config.selectors.length === 0) {
      document.body.classList.remove('personalized-loading');
      document.body.classList.add('personalized-noconfig');
      recordEvent('impression', null, null);
      return;
    }
    
    state.processing = true;
    
    try {
      // Request personalized content from the API
      const response = await fetch(`${state.apiBase}/api/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectors: state.config.selectors,
          userType: state.userType,
          pageUrl: state.pageUrl,
          workspaceId: state.workspaceId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Personalization request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from personalization API');
      }
      
      // Apply the personalized content to the page
      applyPersonalizedContent(data.results);
      
      // Mark as applied
      state.applied = true;
      state.processing = false;
      
      // Update body classes
      document.body.classList.remove('personalized-loading');
      document.body.classList.add('personalized-loaded');
      
      // Record impression event
      recordEvent('impression', null, null);
      
      console.log(`Cursor AI-CRO: Personalization applied in ${Date.now() - state.startTime}ms`);
      
      // Dispatch an event that personalization is complete
      window.dispatchEvent(new CustomEvent('personalizationLoaded', {
        detail: {
          userType: state.userType,
          selectors: data.results.map(r => r.selector)
        }
      }));
    } catch (error) {
      console.error('Cursor AI-CRO: Error applying personalization', error);
      state.processing = false;
      document.body.classList.remove('personalized-loading');
      document.body.classList.add('personalized-error');
    }
  }
  
  // Apply the personalized content to DOM elements
  function applyPersonalizedContent(results) {
    results.forEach(result => {
      try {
        const { selector, result: content, default: defaultContent } = result;
        
        // Find the element(s) matching the selector
        const elements = document.querySelectorAll(selector);
        
        if (elements.length === 0) {
          console.warn(`Cursor AI-CRO: No elements found for selector: ${selector}`);
          return;
        }
        
        // Apply to each matching element
        elements.forEach(element => {
          // Add tracking class
          element.classList.add('personalize-target');
          element.setAttribute('data-cursor-personalized', 'true');
          
          // If the result has an error or no content, use the default
          const finalContent = (content && !result.error) ? content : defaultContent;
          
          // Store original content for reference
          if (!element.hasAttribute('data-cursor-original')) {
            element.setAttribute('data-cursor-original', element.innerHTML.trim());
          }
          
          // Apply the content based on element type
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = finalContent;
          } else if (element.tagName === 'IMG') {
            element.src = finalContent;
          } else {
            element.innerHTML = finalContent;
          }
          
          // Store the variant for tracking
          element.setAttribute('data-cursor-variant', finalContent === defaultContent ? 'default' : 'personalized');
        });
      } catch (error) {
        console.error(`Cursor AI-CRO: Error applying content for selector ${result.selector}:`, error);
      }
    });
  }
  
  // Set up event tracking (clicks, form submissions)
  function setupEventTracking() {
    // Track clicks on personalized elements
    document.addEventListener('click', event => {
      // Check if the clicked element or its parent is personalized
      let target = event.target;
      let depth = 0;
      const maxDepth = 3; // Only go up a few levels to prevent capturing unrelated clicks
      
      while (target && depth < maxDepth) {
        if (target.hasAttribute && target.hasAttribute('data-cursor-personalized')) {
          const selector = findSelectorForElement(target);
          const variant = target.getAttribute('data-cursor-variant');
          
          recordEvent('ctaClick', selector, variant);
          break;
        }
        target = target.parentElement;
        depth++;
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', event => {
      // Record conversion event
      recordEvent('conversion', null, null);
    });
  }
  
  // Try to find the CSS selector for an element
  function findSelectorForElement(element) {
    // If we have the config, look through the configured selectors
    if (state.config && state.config.selectors) {
      for (const selectorConfig of state.config.selectors) {
        const matchingElements = document.querySelectorAll(selectorConfig.selector);
        if (Array.from(matchingElements).includes(element)) {
          return selectorConfig.selector;
        }
      }
    }
    
    // Fallback: generate a selector
    if (element.id) {
      return `#${element.id}`;
    } else if (element.classList.length > 0) {
      return `.${Array.from(element.classList).join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }
  
  // Record an event to the stats API
  async function recordEvent(eventType, selector, variant) {
    try {
      await fetch(`${state.apiBase}/api/record-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          pageUrl: state.pageUrl,
          workspaceId: state.workspaceId,
          userType: state.userType,
          selector,
          variant,
          timestamp: new Date().toISOString()
        })
      });
      
      // Also send event to Google Tag Manager if available
      if (window.dataLayer) {
        window.dataLayer.push({
          event: `cursor_${eventType}`,
          cursor_selector: selector,
          cursor_variant: variant,
          cursor_user_type: state.userType
        });
      }
    } catch (error) {
      console.warn(`Cursor AI-CRO: Failed to record ${eventType} event:`, error);
    }
  }
  
  // Initialize when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();