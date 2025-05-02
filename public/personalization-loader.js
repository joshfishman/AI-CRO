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
    lastCacheUpdate: null, // When cache was last updated
    userSegments: [],
    visitorData: {},
    lastClickedSelector: null,
    lastClickedVariant: null,
    lastClickedVariantName: null
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
  
  // API request helper function
  async function apiRequest(endpoint, method = 'GET', data = null) {
    const apiBase = state.apiBase || 'https://ai-cro-eight.vercel.app';
    
    // Use the combined API endpoint
    let url = `${apiBase}/api/combined-ops?op=${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`Error in ${endpoint} request:`, err);
      return null;
    }
  }

  // Get user type from API
  async function getUserType() {
    if (state.userType !== 'unknown') {
      return state.userType;
    }
    
    try {
      const data = {
        cookies: document.cookie,
        url: state.pageUrl,
        referrer: document.referrer,
        workspace: state.workspaceId,
        device: getDeviceType(),
        time: getCurrentHourSegment()
      };
      
      const result = await apiRequest('get-user-type', 'POST', data);
      
      if (result && result.type) {
        state.userType = result.type;
        state.userSegments = result.segments || [];
        state.visitorData = result.visitorData || {};
        return state.userType;
      }
    } catch (err) {
      console.error('Error getting user type:', err);
    }
    
    return 'unknown';
  }

  // Get personalization config from API
  async function getConfig() {
    if (state.config) {
      return state.config;
    }
    
    try {
      const result = await apiRequest('get-config', 'POST', {
        url: state.pageUrl,
        workspace: state.workspaceId
      });
      
      if (result && result.selectors) {
        state.config = result;
        return result;
      }
    } catch (err) {
      console.error('Error getting personalization config:', err);
    }
    
    return null;
  }

  // Get personalized variants from API
  async function getVariants(selectors) {
    try {
      const data = {
        userType: state.userType,
        segments: state.userSegments,
        workspace: state.workspaceId,
        selectors: selectors
      };
      
      // Try to use cached variants first
      const cachedResult = await apiRequest('get-cached-variants', 'POST', data);
      
      if (cachedResult && cachedResult.variants) {
        return cachedResult.variants;
      }
      
      // Generate new variants if needed
      const result = await apiRequest('generate-variants', 'POST', data);
      
      if (result && result.variants) {
        // Cache the newly generated variants
        await apiRequest('cache-variants', 'POST', {
          workspace: state.workspaceId,
          userType: state.userType,
          variants: result.variants
        });
        
        return result.variants;
      }
    } catch (err) {
      console.error('Error getting variants:', err);
    }
    
    return {};
  }

  // Record personalization events
  function recordEvent(event, data = {}) {
    // Don't track events on local development
    if (window.location.hostname === 'localhost') {
      return;
    }
    
    const eventData = {
      workspace: state.workspaceId,
      event,
      userType: state.userType,
      segments: state.userSegments,
      url: state.pageUrl,
      selector: state.lastClickedSelector,
      variant: state.lastClickedVariant,
      variantName: state.lastClickedVariantName,
      timestamp: Date.now(),
      ...data
    };
    
    // Use navigator.sendBeacon for reliable event tracking
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
      navigator.sendBeacon(`${state.apiBase || 'https://ai-cro-eight.vercel.app'}/api/combined-ops?op=record-event`, blob);
    } else {
      // Fallback to fetch
      fetch(`${state.apiBase || 'https://ai-cro-eight.vercel.app'}/api/combined-ops?op=record-event`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).catch(err => console.error('Error recording event:', err));
    }
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
    if (!selectors || !selectors.length) {
      return [];
    }
    
    const userSegments = state.userSegments || [userType];
    
    return selectors.map(selector => {
      if (!selector.variants || !Array.isArray(selector.variants) || selector.variants.length === 0) {
        return {
          selector: selector.selector,
          contentType: selector.contentType || 'text',
          content: selector.default,
          isDefault: true,
          variantIndex: 0
        };
      }
      
      // Find all variants that match any of the user's segments
      const matchingVariants = selector.variants.filter(variant => 
        !variant.userType || 
        variant.userType === 'all' || 
        userSegments.includes(variant.userType)
      );
      
      // If no matching variants, use default variant
      if (matchingVariants.length === 0) {
        const defaultVariant = selector.variants.find(v => v.isDefault) || selector.variants[0];
        return {
          selector: selector.selector,
          contentType: selector.contentType || 'text',
          content: defaultVariant.content,
          isDefault: defaultVariant.isDefault || false,
          variantIndex: selector.variants.indexOf(defaultVariant)
        };
      }
      
      // Randomly select one of the matching variants (for A/B testing)
      // We weight exact matches higher than general matches
      const exactMatches = matchingVariants.filter(v => userSegments.includes(v.userType));
      
      let selectedVariant;
      if (exactMatches.length > 0) {
        // Prioritize exact matches
        selectedVariant = exactMatches[Math.floor(Math.random() * exactMatches.length)];
      } else {
        // Fall back to 'all' type variants
        selectedVariant = matchingVariants[Math.floor(Math.random() * matchingVariants.length)];
      }
      
      return {
        selector: selector.selector,
        contentType: selector.contentType || 'text',
        content: selectedVariant.content,
        isDefault: selectedVariant.isDefault || false,
        variantIndex: selector.variants.indexOf(selectedVariant)
      };
    });
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

  // Detect device type (mobile, desktop, tablet)
  function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  // Get browser information
  function getBrowserInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('firefox') > -1) {
      return 'firefox';
    } else if (userAgent.indexOf('edg') > -1) {
      return 'edge';
    } else if (userAgent.indexOf('chrome') > -1) {
      return 'chrome';
    } else if (userAgent.indexOf('safari') > -1) {
      return 'safari';
    } else if (userAgent.indexOf('opera') > -1 || userAgent.indexOf('opr') > -1) {
      return 'opera';
    } else if (userAgent.indexOf('trident') > -1 || userAgent.indexOf('msie') > -1) {
      return 'ie';
    }
    
    return 'unknown';
  }

  // Get time spent on site in seconds
  function getTimeOnSite() {
    // Check if we have a session start time in sessionStorage
    let sessionStart = sessionStorage.getItem('cursor_session_start');
    
    if (!sessionStart) {
      sessionStart = Date.now().toString();
      sessionStorage.setItem('cursor_session_start', sessionStart);
      return 0;
    }
    
    return Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
  }

  // Get page view count for current session
  function getPageViews() {
    let pageViews = parseInt(sessionStorage.getItem('cursor_page_views') || '0');
    
    // Increment page views for this session
    pageViews++;
    sessionStorage.setItem('cursor_page_views', pageViews.toString());
    
    return pageViews;
  }

  // Get timestamp of last visit
  function getLastVisitTimestamp() {
    const lastVisit = localStorage.getItem('cursor_last_visit');
    
    // Update last visit timestamp
    localStorage.setItem('cursor_last_visit', Date.now().toString());
    
    return lastVisit;
  }
})();