import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Create a bookmarklet with a completely self-contained selector
  // This avoids all CORS issues by not making any additional requests
  const bookmarkletCode = `(function() {
    // Show loading indicator
    var loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '20px';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translateX(-50%)';
    loadingDiv.style.background = 'white';
    loadingDiv.style.padding = '10px 20px';
    loadingDiv.style.borderRadius = '8px';
    loadingDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    loadingDiv.style.zIndex = '1000001';
    loadingDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    loadingDiv.style.fontSize = '14px';
    loadingDiv.textContent = 'AI CRO Selector Ready';
    document.body.appendChild(loadingDiv);
    
    // Store current page info
    var pageInfo = {
      url: window.location.href,
      title: document.title,
      origin: window.location.origin
    };
    
    // Create global namespace
    window.AICRO = {
      _debug: true,
      selectedElement: null,
      pageInfo: pageInfo,
      
      debug: function(msg) {
        console.log('[AI CRO]', msg);
      }
    };
    
    // Create the selector UI components
    function createStyles() {
      var style = document.createElement('style');
      style.textContent = [
        ".aicro-selector-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.3); z-index: 999999; pointer-events: none; }",
        ".aicro-element-highlight { position: absolute; border: 2px solid #2196F3; background: rgba(33, 150, 243, 0.1); z-index: 1000000; pointer-events: none; box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.15); }",
        ".aicro-selector-controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 12px 20px; z-index: 1000001; display: flex; align-items: center; gap: 12px; }",
        ".aicro-selector-controls button { background: #2196F3; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; }",
        ".aicro-selector-controls button.cancel { background: transparent; color: #666; }",
        ".aicro-selector-info { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 12px 20px; z-index: 1000001; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #333; }"
      ].join("\\n");
      document.head.appendChild(style);
    }
    
    // Create UI components
    function createUI() {
      var overlay = document.createElement('div');
      overlay.className = 'aicro-selector-overlay';
      
      var highlight = document.createElement('div');
      highlight.className = 'aicro-element-highlight';
      highlight.style.display = 'none';
      
      var controls = document.createElement('div');
      controls.className = 'aicro-selector-controls';
      controls.innerHTML = '<button class="select">Select Element</button><button class="cancel">Cancel</button>';
      
      var info = document.createElement('div');
      info.className = 'aicro-selector-info';
      info.textContent = 'Hover over an element and click to select it';
      
      document.body.appendChild(overlay);
      document.body.appendChild(highlight);
      document.body.appendChild(controls);
      document.body.appendChild(info);
      
      return { overlay, highlight, controls, info };
    }
    
    // Generate a unique CSS selector for an element
    function generateSelector(element) {
      if (!element) return '';
      
      // Try ID selector first (most specific)
      if (element.id) {
        return '#' + element.id;
      }
      
      // Try a class-based selector
      if (element.className && typeof element.className === 'string') {
        var classSelector = '.' + element.className.trim().replace(/\\s+/g, '.');
        
        // Check uniqueness
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
      
      // Generate a more complex selector
      var selector = element.tagName.toLowerCase();
      var current = element;
      
      while (current.parentElement) {
        var parentSelector = current.parentElement.tagName.toLowerCase();
        
        // Add parent ID if available
        if (current.parentElement.id) {
          parentSelector = '#' + current.parentElement.id;
          selector = parentSelector + ' > ' + selector;
          break;
        }
        
        // Add nth-child if needed
        var siblings = Array.from(current.parentElement.children);
        if (siblings.length > 1) {
          var index = siblings.indexOf(current) + 1;
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
    
    // Initialize the selector
    createStyles();
    var ui = createUI();
    var currentElement = null;
    var isActive = true;
    
    // Handle mouse movement
    function handleMouseMove(event) {
      // Ignore events on our UI elements
      if (event.target.closest('.aicro-selector-controls') || 
          event.target.closest('.aicro-selector-info') ||
          event.target === loadingDiv) {
        ui.highlight.style.display = 'none';
        return;
      }
      
      // Update currently highlighted element
      currentElement = event.target;
      
      // Update highlight position
      var rect = event.target.getBoundingClientRect();
      
      ui.highlight.style.display = 'block';
      ui.highlight.style.left = rect.left + 'px';
      ui.highlight.style.top = rect.top + 'px';
      ui.highlight.style.width = rect.width + 'px';
      ui.highlight.style.height = rect.height + 'px';
      
      // Update info text
      var selector = generateSelector(event.target);
      var tagName = event.target.tagName.toLowerCase();
      var classes = (event.target.className && typeof event.target.className === 'string') ? 
                    '.' + event.target.className.replace(/ /g, '.') : '';
      
      ui.info.textContent = tagName + classes + ' [' + selector + ']';
    }
    
    // Handle clicks
    function handleClick(event) {
      // Ignore events on our UI elements
      if (event.target.closest('.aicro-selector-controls') || 
          event.target.closest('.aicro-selector-info') ||
          event.target === loadingDiv) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      // Select the clicked element
      selectElement(event.target);
    }
    
    // Select an element and process it
    function selectElement(element) {
      if (!element) return;
      
      var selector = generateSelector(element);
      var elementDetails = {
        selector: selector,
        tagName: element.tagName.toLowerCase(),
        text: element.textContent.trim().substring(0, 100),
        innerHtml: element.innerHTML.trim().substring(0, 300),
        url: window.location.href
      };
      
      console.log('[AI CRO] Element selected:', elementDetails);
      
      // Store the selected element data to local storage
      try {
        var selectionData = {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          element: elementDetails
        };
        
        localStorage.setItem('aicro_selection_data', JSON.stringify(selectionData));
        
        // Show success message
        loadingDiv.textContent = 'Element selected! Redirecting...';
        loadingDiv.style.background = '#4CAF50';
        loadingDiv.style.color = 'white';
        
        // Redirect to AI CRO platform
        setTimeout(function() {
          window.location.href = 'https://ai-cro-three.vercel.app/multi-select';
        }, 1500);
      } catch (error) {
        console.error('[AI CRO] Failed to save selection data:', error);
        loadingDiv.textContent = 'Error: Failed to save selection';
        loadingDiv.style.color = 'red';
      }
      
      // Stop the selector
      stopSelector();
    }
    
    // Stop the selector
    function stopSelector() {
      // Hide UI components
      ui.overlay.style.display = 'none';
      ui.highlight.style.display = 'none';
      ui.controls.style.display = 'none';
      ui.info.style.display = 'none';
      
      // Remove event handlers
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      
      isActive = false;
    }
    
    // Set up event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    
    // Set up control button event listeners
    ui.controls.querySelector('.select').addEventListener('click', function() {
      if (currentElement) {
        selectElement(currentElement);
      }
    });
    
    ui.controls.querySelector('.cancel').addEventListener('click', function() {
      stopSelector();
      // Remove loading indicator
      if (document.body.contains(loadingDiv)) {
        document.body.removeChild(loadingDiv);
      }
    });
    
    // Update loading indicator
    loadingDiv.textContent = 'Hover over elements to select';
    setTimeout(function() {
      if (document.body.contains(loadingDiv)) {
        document.body.removeChild(loadingDiv);
      }
    }, 3000);
    
    console.log('[AI CRO] Selector initialized successfully');
  })();`;
  
  // URL encode the bookmarklet code (important for cross-browser compatibility)
  const encodedBookmarklet = `javascript:${encodeURIComponent(bookmarkletCode)}`;
  
  return new Response(encodedBookmarklet, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}