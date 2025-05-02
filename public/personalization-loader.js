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
    startTime: Date.now(),
    appliedVariants: {}, // Track which variants were applied for each selector
    cachedResults: {}, // Cache of personalization results
    lastCacheUpdate: null // When cache was last updated
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
    
    // Get workspace ID from data attribute or URL
    const urlParams = new URLSearchParams(window.location.search);
    state.workspaceId = scriptTag.getAttribute('data-cursor-workspace') || 
                       urlParams.get('workspace') || 
                       'default';
    
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
    
    // Add dashboard toggle button for easy access
    addDashboardToggleButton();
    
    // Add keyboard shortcut for dashboard
    setupDashboardShortcut();
  }
  
  // Get the user type from the API
  async function getUserType() {
    try {
      // Check URL parameters first for testing purposes
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('user_type')) {
        const paramUserType = urlParams.get('user_type');
        console.log(`Cursor AI-CRO: User type from URL parameter: ${paramUserType}`);
        return paramUserType;
      }
      
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
      // Check if URL parameter sets a force refresh
      const urlParams = new URLSearchParams(window.location.search);
      const forceRefresh = urlParams.has('force_refresh') || urlParams.get('cache') === 'false';
      
      // Check for local cache first (unless force refresh is requested)
      if (!forceRefresh && useCachedConfigIfAvailable()) {
        console.log('Cursor AI-CRO: Using cached page configuration');
        return state.config;
      }
      
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
      
      // Save to local storage cache with timestamp
      saveConfigToCache(config);
      
      console.log(`Cursor AI-CRO: Configuration loaded (${config.selectors?.length || 0} selectors)`);
      return config;
    } catch (error) {
      console.error('Cursor AI-CRO: Error getting page configuration', error);
      
      // If fetch fails, try to use cached config as fallback
      if (useCachedConfigIfAvailable()) {
        console.log('Cursor AI-CRO: Using cached configuration as fallback');
        return state.config;
      }
      
      return null;
    }
  }
  
  // Save config to localStorage cache
  function saveConfigToCache(config) {
    try {
      const cacheData = {
        config: config,
        timestamp: Date.now(),
        userType: state.userType,
        workspaceId: state.workspaceId
      };
      
      const cacheKey = `cursor_config_${state.workspaceId}_${state.pageUrl}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      state.lastCacheUpdate = cacheData.timestamp;
      
      console.log(`Cursor AI-CRO: Saved configuration to cache for workspace ${state.workspaceId}`);
    } catch (e) {
      console.warn('Cursor AI-CRO: Failed to cache config in localStorage', e);
    }
  }
  
  // Try to use cached config if it's available and fresh enough
  function useCachedConfigIfAvailable() {
    try {
      const cacheKey = `cursor_config_${state.workspaceId}_${state.pageUrl}`;
      const cachedDataStr = localStorage.getItem(cacheKey);
      
      if (!cachedDataStr) return false;
      
      const cachedData = JSON.parse(cachedDataStr);
      const config = cachedData.config;
      const timestamp = cachedData.timestamp;
      
      // Check if cache is still valid (less than 24 hours old)
      const cacheAge = Date.now() - timestamp;
      const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (config && cacheAge < maxCacheAge) {
        state.config = config;
        state.lastCacheUpdate = timestamp;
        return true;
      }
      
      return false;
    } catch (e) {
      console.warn('Cursor AI-CRO: Error reading from cache', e);
      return false;
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
      // Check if URL parameter sets a force refresh
      const urlParams = new URLSearchParams(window.location.search);
      const forceRefresh = urlParams.has('force_refresh') || urlParams.get('cache') === 'false';
      
      // For multivariate testing, we'll select the variants to show directly from stored config
      // This prevents calling the AI for every page load
      const selectedVariants = selectVariantsForUserType(state.config.selectors, state.userType);
      
      // Apply the selected variants directly
      applySelectedVariants(selectedVariants);
      
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
          selectors: Object.keys(selectedVariants),
          fromCache: !forceRefresh
        }
      }));
    } catch (error) {
      console.error('Cursor AI-CRO: Error applying personalization', error);
      state.processing = false;
      document.body.classList.remove('personalized-loading');
      document.body.classList.add('personalized-error');
    }
  }

  // Select the appropriate variants for the user type
  function selectVariantsForUserType(selectors, userType) {
    const selectedVariants = {};
    
    selectors.forEach(selectorConfig => {
      const { selector, variants, contentType, default: defaultContent } = selectorConfig;
      
      // Find variants that match this user type, or the 'all' user type
      const matchingVariants = variants.filter(variant => 
        variant.userType === userType || variant.userType === 'all'
      );
      
      // If there's a variant specifically for this user type, prioritize it
      const userTypeVariant = matchingVariants.find(v => v.userType === userType);
      const allUsersVariant = matchingVariants.find(v => v.userType === 'all');
      
      // Find the default variant
      const defaultVariant = variants.find(v => v.isDefault);
      
      // The variant to use (in order of priority)
      const variantToUse = userTypeVariant || allUsersVariant || defaultVariant || variants[0];
      
      // Record the applied variant in state
      selectedVariants[selector] = {
        content: variantToUse.content,
        contentType: contentType || 'text',
        variantName: variantToUse.name || 'Variant',
        variantId: variants.indexOf(variantToUse),
        isDefault: variantToUse.isDefault || false,
        userType: variantToUse.userType || 'all'
      };
    });
    
    return selectedVariants;
  }
  
  // Apply the selected variants to the page
  function applySelectedVariants(selectedVariants) {
    // Get all selectors
    const selectors = Object.keys(selectedVariants);
    
    selectors.forEach(selector => {
      try {
        const { content, contentType, variantName, variantId, isDefault } = selectedVariants[selector];
        
        // Find elements matching the selector
        const elements = document.querySelectorAll(selector);
        
        if (elements.length === 0) {
          console.warn(`Cursor AI-CRO: No elements found for selector: ${selector}`);
          return;
        }
        
        // Apply content to each matching element
        elements.forEach(element => {
          // Add tracking class
          element.classList.add('personalize-target');
          element.setAttribute('data-cursor-personalized', 'true');
          element.setAttribute('data-cursor-variant-id', variantId);
          element.setAttribute('data-cursor-variant-name', variantName);
          element.setAttribute('data-cursor-content-type', contentType);
          
          // Store original content for reference
          if (!element.hasAttribute('data-cursor-original')) {
            if (contentType === 'image') {
              element.setAttribute('data-cursor-original', element.src || '');
            } else if (contentType === 'link') {
              element.setAttribute('data-cursor-original', element.href || '');
            } else if (contentType === 'bg-image') {
              const style = window.getComputedStyle(element);
              element.setAttribute('data-cursor-original', style.backgroundImage || '');
            } else {
              element.setAttribute('data-cursor-original', element.innerHTML.trim());
            }
          }
          
          // Apply the content based on content type
          applyContentToElement(element, content, contentType);
          
          // Store the variant info for tracking
          element.setAttribute('data-cursor-variant', isDefault ? 'default' : variantName);
          
          // Record in state.appliedVariants
          state.appliedVariants[selector] = {
            variantId,
            variantName,
            isDefault,
            contentType
          };
        });
      } catch (error) {
        console.error(`Cursor AI-CRO: Error applying content for selector ${selector}:`, error);
      }
    });
  }
  
  // Apply content to element based on content type
  function applyContentToElement(element, content, contentType) {
    switch (contentType) {
      case 'image':
        if (element.tagName === 'IMG') {
          element.src = content;
        } else {
          console.warn('Cursor AI-CRO: Cannot apply image content to non-image element');
        }
        break;
        
      case 'bg-image':
        element.style.backgroundImage = `url('${content}')`;
        break;
        
      case 'link':
        if (element.tagName === 'A') {
          element.href = content;
        } else {
          console.warn('Cursor AI-CRO: Cannot apply link content to non-anchor element');
        }
        break;
        
      case 'text':
      default:
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.value = content;
        } else {
          element.innerHTML = content;
        }
        break;
    }
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
          const variantName = target.getAttribute('data-cursor-variant-name');
          const variantId = target.getAttribute('data-cursor-variant-id');
          
          recordEvent('ctaClick', selector, variantId, variantName);
          break;
        }
        target = target.parentElement;
        depth++;
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', event => {
      // Find the selector that was clicked if any
      const target = event.target;
      
      // Record conversion event
      // If a button was recently clicked, include that in the conversion tracking
      const lastClickedSelector = state.lastClickedSelector;
      const lastClickedVariant = state.lastClickedVariant;
      const lastClickedVariantName = state.lastClickedVariantName;
      
      if (lastClickedSelector && lastClickedVariant) {
        recordEvent('conversion', lastClickedSelector, lastClickedVariant, lastClickedVariantName);
      } else {
        recordEvent('conversion', null, null, null);
      }
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
  async function recordEvent(eventType, selector, variant, variantName) {
    try {
      // Store the last clicked selector and variant for conversion tracking
      if (eventType === 'ctaClick' && selector) {
        state.lastClickedSelector = selector;
        state.lastClickedVariant = variant;
        state.lastClickedVariantName = variantName;
      }
      
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
          variantName,
          timestamp: new Date().toISOString()
        })
      });
      
      // Also send event to Google Tag Manager if available
      if (window.dataLayer) {
        window.dataLayer.push({
          event: `cursor_${eventType}`,
          cursor_selector: selector,
          cursor_variant: variant,
          cursor_variant_name: variantName,
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
  
  // Check if the user is a site owner and should see test results
  function checkShowTestResults() {
    // Check URL parameter or localStorage preference
    const urlParams = new URLSearchParams(window.location.search);
    const showResults = urlParams.has('show_cursor_results') || localStorage.getItem('cursor_show_results') === 'true';
    
    if (showResults) {
      // Store preference in localStorage
      localStorage.setItem('cursor_show_results', 'true');
      // Load and display test results
      loadTestResults();
    }
  }
  
  // Load test results from the API
  async function loadTestResults() {
    try {
      const resultsUrl = `${state.apiBase}/api/get-test-results?path=${encodeURIComponent(state.pageUrl)}&workspace=${encodeURIComponent(state.workspaceId)}`;
      const response = await fetch(resultsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to get test results: ${response.status}`);
      }
      
      const data = await response.json();
      showTestResultsDashboard(data);
    } catch (error) {
      console.error('Cursor AI-CRO: Error loading test results', error);
    }
  }
  
  // Create and show test results dashboard
  function showTestResultsDashboard(data) {
    // Remove existing dashboard if any
    const existingDashboard = document.getElementById('cursor-results-dashboard');
    if (existingDashboard) {
      existingDashboard.remove();
    }
    
    // Create dashboard element
    const dashboard = document.createElement('div');
    dashboard.id = 'cursor-results-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 70vh;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 999999;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      transition: all 0.3s ease;
    `;
    
    // Dashboard header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #4f46e5;
      color: white;
      padding: 12px 16px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    `;
    header.innerHTML = `
      <div style="flex: 1;">
        <span style="font-size: 14px;">Cursor AI CRO Results</span>
        <div style="display: flex; align-items: center; margin-top: 2px;">
          <span style="font-size: 11px; opacity: 0.8;">${state.pageUrl}</span>
          <span style="font-size: 10px; background: rgba(255,255,255,0.2); padding: 1px 6px; border-radius: 10px; margin-left: 6px;">
            ${state.workspaceId}
          </span>
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="font-size: 10px; opacity: 0.7; margin-right: 10px;">Ctrl+Shift+D</span>
        <button id="cursor-dashboard-share" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          margin-right: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
        ">Share</button>
        <button id="cursor-dashboard-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
      </div>
    `;
    dashboard.appendChild(header);
    
    // Dashboard content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px;
      overflow-y: auto;
      max-height: calc(70vh - 58px);
    `;
    
    // Add workspace selector
    const workspaceSelector = document.createElement('div');
    workspaceSelector.style.cssText = `
      margin-bottom: 16px;
      padding: 10px;
      background: #f5f8ff;
      border-radius: 6px;
      border: 1px solid #e0e7ff;
    `;
    
    workspaceSelector.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label style="font-weight: bold; font-size: 12px;">Workspace:</label>
        <div style="display: flex; align-items: center;">
          <input 
            id="cursor-dash-workspace" 
            type="text" 
            value="${state.workspaceId}" 
            placeholder="Enter workspace ID" 
            style="padding: 4px; border-radius: 4px; border: 1px solid #ddd; width: 120px; margin-right: 6px; font-size: 12px;"
          />
          <button 
            id="cursor-dash-workspace-switch" 
            style="background: #4f46e5; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;"
          >
            Switch
          </button>
        </div>
      </div>
    `;
    
    content.appendChild(workspaceSelector);
    
    // Overall stats
    content.innerHTML += `
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
        <div style="font-size: 13px; margin-bottom: 8px; color: #555;">Overall Statistics</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
          <div>
            <div style="font-size: 18px; font-weight: bold;">${data.totalImpressions || 0}</div>
            <div style="font-size: 11px; color: #777;">Impressions</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: bold;">${data.totalCtaClicks || 0}</div>
            <div style="font-size: 11px; color: #777;">Clicks</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: bold;">${
              data.totalImpressions > 0 
                ? ((data.totalCtaClicks / data.totalImpressions) * 100).toFixed(1) + '%' 
                : '0%'
            }</div>
            <div style="font-size: 11px; color: #777;">CTR</div>
          </div>
        </div>
      </div>
    `;
    
    // For each selector, show results
    const results = data.results || {};
    Object.keys(results).forEach(selector => {
      const selectorData = results[selector];
      if (!selectorData.variants || selectorData.variants.length === 0) return;
      
      const selectorElement = document.createElement('div');
      selectorElement.style.cssText = `
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      `;
      
      let selectorHtml = `
        <div style="margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: bold; margin-bottom: 4px; word-break: break-all;">${selector}</div>
          <div style="font-size: 11px; color: #777;">
            Content type: ${selectorData.contentType || 'text'}
            ${selectorData.confidence > 0 
              ? `<span style="margin-left: 8px; background: ${
                  selectorData.confidence > 95 ? '#4ade80' : selectorData.confidence > 85 ? '#facc15' : '#d1d5db'
                }; color: ${
                  selectorData.confidence > 95 ? '#064e3b' : selectorData.confidence > 85 ? '#78350f' : '#1f2937'
                }; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                  ${selectorData.confidence}% confidence
                </span>`
              : ''
            }
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="text-align: left; border-bottom: 1px solid #eee;">
              <th style="padding: 4px 8px 8px 0;">Variant</th>
              <th style="padding: 4px 8px 8px 0; text-align: center;">User</th>
              <th style="padding: 4px 8px 8px 0; text-align: center;">Views</th>
              <th style="padding: 4px 8px 8px 0; text-align: center;">Clicks</th>
              <th style="padding: 4px 8px 8px 0; text-align: center;">CTR</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Add rows for each variant
      selectorData.variants.forEach(variant => {
        const isWinner = variant.variantId === selectorData.winner;
        selectorHtml += `
          <tr style="${isWinner ? 'background: rgba(79, 70, 229, 0.05);' : ''}">
            <td style="padding: 8px 8px 8px 0; display: flex; align-items: center;">
              ${isWinner 
                ? '<span style="color: #4f46e5; margin-right: 4px;">★</span>' 
                : '<span style="opacity: 0; margin-right: 4px;">○</span>'
              }
              <span style="${variant.isDefault ? 'font-style: italic;' : ''} ${isWinner ? 'font-weight: bold;' : ''}">
                ${variant.name}
                ${variant.isDefault ? ' (default)' : ''}
              </span>
            </td>
            <td style="padding: 8px 8px 8px 0; text-align: center;">
              <span style="
                background: ${
                  variant.userType === 'all' ? '#e0e7ff' : 
                  variant.userType === 'none' || variant.userType === '' ? '#f3f4f6' : 
                  '#d1fae5'
                };
                color: ${
                  variant.userType === 'all' ? '#3730a3' : 
                  variant.userType === 'none' || variant.userType === '' ? '#4b5563' : 
                  '#065f46'
                };
                padding: 2px 4px;
                border-radius: 4px;
                font-size: 10px;
              ">
                ${variant.userType === 'all' ? 'All' : 
                  variant.userType === 'none' || variant.userType === '' ? 'None' : 
                  variant.userType}
              </span>
            </td>
            <td style="padding: 8px 8px 8px 0; text-align: center;">${variant.impressions}</td>
            <td style="padding: 8px 8px 8px 0; text-align: center;">${variant.ctaClicks}</td>
            <td style="padding: 8px 8px 8px 0; text-align: center; ${isWinner ? 'font-weight: bold; color: #4f46e5;' : ''}">
              ${variant.ctr}%
              ${variant.improvement > 0 && !variant.isDefault 
                ? `<span style="display: block; color: #16a34a; font-size: 10px;">+${variant.improvement.toFixed(1)}%</span>` 
                : variant.improvement < 0 && !variant.isDefault
                ? `<span style="display: block; color: #dc2626; font-size: 10px;">${variant.improvement.toFixed(1)}%</span>`
                : ''
              }
            </td>
          </tr>
        `;
      });
      
      selectorHtml += `
          </tbody>
        </table>
      `;
      
      selectorElement.innerHTML = selectorHtml;
      content.appendChild(selectorElement);
    });
    
    // No results message
    if (Object.keys(results).length === 0) {
      content.innerHTML += `
        <div style="text-align: center; padding: 20px 0; color: #777; font-size: 13px;">
          No test results available yet.
        </div>
      `;
    }
    
    dashboard.appendChild(content);
    
    // Add event listeners for the workspace switcher
    const dashboardWorkspaceInput = document.getElementById('cursor-dash-workspace');
    const dashboardWorkspaceSwitch = document.getElementById('cursor-dash-workspace-switch');
    
    if (dashboardWorkspaceSwitch) {
      dashboardWorkspaceSwitch.addEventListener('click', () => {
        const newWorkspace = dashboardWorkspaceInput.value.trim();
        if (newWorkspace && newWorkspace !== state.workspaceId) {
          // Update URL with new workspace
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('workspace', newWorkspace);
          currentUrl.searchParams.set('show_cursor_results', 'true');
          
          // Redirect to the new workspace
          window.location.href = currentUrl.toString();
        }
      });
    }
    
    // Add close button handler
    dashboard.addEventListener('click', (e) => {
      if (e.target.id === 'cursor-dashboard-close') {
        dashboard.remove();
        localStorage.removeItem('cursor_show_results');
      } else if (e.target.id === 'cursor-dashboard-share') {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('show_cursor_results', 'true');
        currentUrl.searchParams.set('workspace', state.workspaceId);
        navigator.clipboard.writeText(currentUrl.toString()).then(() => {
          e.target.textContent = 'Copied!';
          setTimeout(() => {
            e.target.textContent = 'Share';
          }, 2000);
        });
      }
    });
    
    // Make dashboard draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - dashboard.getBoundingClientRect().left;
      offsetY = e.clientY - dashboard.getBoundingClientRect().top;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const left = e.clientX - offsetX;
      const top = e.clientY - offsetY;
      
      dashboard.style.left = Math.max(0, left) + 'px';
      dashboard.style.bottom = 'auto';
      dashboard.style.top = Math.max(0, top) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Add to document
    document.body.appendChild(dashboard);
  }
  
  // Initialize results check with a delay
  setTimeout(checkShowTestResults, 2000);

  // Add a floating button to toggle the dashboard
  function addDashboardToggleButton() {
    const toggleButton = document.createElement('div');
    toggleButton.id = 'cursor-dashboard-toggle';
    toggleButton.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 999998;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <span style="font-size: 18px; font-weight: bold;">CR</span>
      </div>
    `;
    
    // Add tooltip on hover
    const button = toggleButton.querySelector('div');
    button.title = 'Show A/B Test Results (Ctrl+Shift+D)';
    
    // Add toggle functionality
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', () => {
      toggleDashboard();
    });
    
    document.body.appendChild(toggleButton);
  }
  
  // Setup keyboard shortcut (Ctrl+Shift+D) to toggle dashboard
  function setupDashboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Check for Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDashboard();
      }
    });
  }
  
  // Toggle dashboard visibility
  function toggleDashboard() {
    const existingDashboard = document.getElementById('cursor-results-dashboard');
    
    if (existingDashboard) {
      // Dashboard exists, hide it
      existingDashboard.remove();
      localStorage.removeItem('cursor_show_results');
    } else {
      // Show dashboard
      localStorage.setItem('cursor_show_results', 'true');
      loadTestResults();
    }
  }
})();