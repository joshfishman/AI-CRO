import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'text/javascript'
    }
  });
}

export async function GET(request) {
  // Get the host URL (for any dynamic references needed in the script)
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://ai-cro-three.vercel.app';
  
  // Debug mode detection
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === 'true';
  
  // The actual JavaScript content to be delivered
  const jsContent = `
/**
 * AI CRO Selector Module
 * Version: 1.0.0
 * Properly configured for cross-origin execution
 */
(function(window, document) {
  // Ensure AICRO namespace exists
  if (!window.AICRO) {
    console.error('[AI CRO] Main script must be loaded before selector module');
    return;
  }
  
  // Verify we don't add the selector twice
  if (window.AICRO.Selector) {
    window.AICRO._debug && console.log('[AI CRO] Selector module already loaded');
    return;
  }
  
  // Log loading if in debug mode
  window.AICRO._debug && console.log('[AI CRO] Selector module executing');
  
  // Create stylesheet for the selector UI
  function createStyles() {
    const style = document.createElement('style');
    style.textContent = \`
      .aicro-selector-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 999999;
        pointer-events: none;
      }
      
      .aicro-element-highlight {
        position: absolute;
        border: 2px solid #2196F3;
        background: rgba(33, 150, 243, 0.1);
        z-index: 1000000;
        pointer-events: none;
        box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.15);
      }
      
      .aicro-selector-controls {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 12px 20px;
        z-index: 1000001;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .aicro-selector-controls button {
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      }
      
      .aicro-selector-controls button.cancel {
        background: transparent;
        color: #666;
      }
      
      .aicro-selector-info {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 12px 20px;
        z-index: 1000001;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        color: #333;
      }
    \`;
    document.head.appendChild(style);
  }
  
  // Create the selector UI components
  function createUI() {
    const overlay = document.createElement('div');
    overlay.className = 'aicro-selector-overlay';
    
    const highlight = document.createElement('div');
    highlight.className = 'aicro-element-highlight';
    
    const controls = document.createElement('div');
    controls.className = 'aicro-selector-controls';
    controls.innerHTML = \`
      <button class="select">Select Element</button>
      <button class="cancel">Cancel</button>
    \`;
    
    const info = document.createElement('div');
    info.className = 'aicro-selector-info';
    info.textContent = 'Hover over an element and click to select it';
    
    document.body.appendChild(overlay);
    document.body.appendChild(highlight);
    document.body.appendChild(controls);
    document.body.appendChild(info);
    
    return { overlay, highlight, controls, info };
  }
  
  // Initialize the Selector module
  window.AICRO.Selector = {
    _active: false,
    _currentElement: null,
    _ui: null,
    
    // Start the element selection process
    start: function() {
      if (this._active) return;
      
      window.AICRO._debug && console.log('[AI CRO] Starting element selection');
      
      // Create UI components if they don't exist
      if (!this._ui) {
        createStyles();
        this._ui = createUI();
        
        // Set up event handlers
        this._ui.controls.querySelector('.select').addEventListener('click', () => {
          if (this._currentElement) {
            this.selectElement(this._currentElement);
          }
        });
        
        this._ui.controls.querySelector('.cancel').addEventListener('click', () => {
          this.stop();
        });
      }
      
      // Show UI components
      this._ui.overlay.style.display = 'block';
      this._ui.highlight.style.display = 'block';
      this._ui.controls.style.display = 'flex';
      this._ui.info.style.display = 'block';
      
      // Enable pointer events for controls
      this._ui.controls.style.pointerEvents = 'auto';
      
      // Set up mouse move handler
      this._mouseMoveHandler = this._handleMouseMove.bind(this);
      this._clickHandler = this._handleClick.bind(this);
      
      document.addEventListener('mousemove', this._mouseMoveHandler);
      document.addEventListener('click', this._clickHandler);
      
      this._active = true;
      return this;
    },
    
    // Stop the element selection process
    stop: function() {
      if (!this._active) return;
      
      window.AICRO._debug && console.log('[AI CRO] Stopping element selection');
      
      // Hide UI components
      if (this._ui) {
        this._ui.overlay.style.display = 'none';
        this._ui.highlight.style.display = 'none';
        this._ui.controls.style.display = 'none';
        this._ui.info.style.display = 'none';
      }
      
      // Remove event handlers
      document.removeEventListener('mousemove', this._mouseMoveHandler);
      document.removeEventListener('click', this._clickHandler);
      
      this._active = false;
      this._currentElement = null;
      return this;
    },
    
    // Handle mouse move event to highlight elements
    _handleMouseMove: function(event) {
      // Ignore events on our UI elements
      if (event.target.closest('.aicro-selector-controls') || 
          event.target.closest('.aicro-selector-info')) {
        return;
      }
      
      // Update currently highlighted element
      this._currentElement = event.target;
      
      // Update highlight position
      this._updateHighlight(event.target);
      
      // Update info text
      this._updateInfo(event.target);
    },
    
    // Handle click event to select elements
    _handleClick: function(event) {
      // Ignore events on our UI elements
      if (event.target.closest('.aicro-selector-controls') || 
          event.target.closest('.aicro-selector-info')) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      // Select the clicked element
      this.selectElement(event.target);
    },
    
    // Update highlight position and size
    _updateHighlight: function(element) {
      if (!element || !this._ui) return;
      
      const rect = element.getBoundingClientRect();
      
      this._ui.highlight.style.left = rect.left + 'px';
      this._ui.highlight.style.top = rect.top + 'px';
      this._ui.highlight.style.width = rect.width + 'px';
      this._ui.highlight.style.height = rect.height + 'px';
    },
    
    // Update info text with element details
    _updateInfo: function(element) {
      if (!element || !this._ui) return;
      
      let selector = this._generateSelector(element);
      let tagName = element.tagName.toLowerCase();
      let classes = element.className ? '.' + element.className.replace(/ /g, '.') : '';
      
      this._ui.info.textContent = \`\${tagName}\${classes} [\${selector}]\`;
    },
    
    // Select an element and process it
    selectElement: function(element) {
      if (!element) return;
      
      const selector = this._generateSelector(element);
      const elementDetails = {
        selector: selector,
        tagName: element.tagName.toLowerCase(),
        text: element.textContent.trim().substring(0, 100),
        innerHtml: element.innerHTML.trim().substring(0, 300),
        url: window.location.href
      };
      
      window.AICRO._debug && console.log('[AI CRO] Element selected:', elementDetails);
      
      // Trigger the onSelect callback if it exists
      if (typeof window.AICRO.onElementSelected === 'function') {
        window.AICRO.onElementSelected(elementDetails);
      }
      
      // Store the selected element data to local storage
      try {
        const selectionData = {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          element: elementDetails
        };
        
        localStorage.setItem('aicro_selection_data', JSON.stringify(selectionData));
        
        // Redirect to the multi-select page
        const redirectUrl = \`\${window.AICRO._host}/multi-select\`;
        window.AICRO._debug && console.log('[AI CRO] Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('[AI CRO] Failed to save selection data:', error);
      }
      
      // Stop the selector
      this.stop();
    },
    
    // Generate a unique CSS selector for an element
    _generateSelector: function(element) {
      if (!element) return '';
      
      // Try ID selector first (most specific)
      if (element.id) {
        return '#' + element.id;
      }
      
      // Try a class-based selector
      if (element.className) {
        const classSelector = '.' + element.className.trim().replace(/\\s+/g, '.');
        
        // Check uniqueness
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
      
      // Generate a more complex selector
      let selector = element.tagName.toLowerCase();
      let current = element;
      
      while (current.parentElement) {
        let parentSelector = current.parentElement.tagName.toLowerCase();
        
        // Add parent ID if available
        if (current.parentElement.id) {
          parentSelector = '#' + current.parentElement.id;
          selector = parentSelector + ' > ' + selector;
          break;
        }
        
        // Add nth-child if needed
        const siblings = Array.from(current.parentElement.children);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector = parentSelector + ' > ' + selector + ':nth-child(' + index + ')';
        } else {
          selector = parentSelector + ' > ' + selector;
        }
        
        current = current.parentElement;
        
        // Limit selector depth for readability
        if (selector.split('>').length > 3) {
          break;
        }
      }
      
      return selector;
    }
  };
  
  // Add convenience method to main AICRO object
  window.AICRO.startSelector = function() {
    if (!this.Selector) {
      console.error('[AI CRO] Selector module not loaded');
      return this;
    }
    
    this.Selector.start();
    return this;
  };
  
  // Log completion if in debug mode
  window.AICRO._debug && console.log('[AI CRO] Selector module ready');
  
})(window, document);
  `;
  
  // Return the JavaScript with proper headers
  return new Response(jsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}