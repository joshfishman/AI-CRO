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

  // Get host dynamically - support both Vercel and local development
  const url = request.nextUrl;
  const host = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  const selectorModule = `
    (function() {
      // Selector Module for AI CRO
      // This module adds element selection capabilities to the AI CRO client
      
      // Initialize selector namespace if it doesn't exist
      window.AICRO = window.AICRO || {};
      window.AICRO.selector = window.AICRO.selector || {};
      window.AICRO.selector.active = false;
      
      // Store selected elements
      const selectedElements = [];
      let selectorUI = null;
      let selectorStyle = null;
      
      // Add styles for the selector UI
      function addStyles() {
        selectorStyle = document.createElement('style');
        selectorStyle.textContent = \`
          .aicro-highlight {
            outline: 2px dashed #3b82f6 !important;
            cursor: pointer !important;
            position: relative;
          }
          .aicro-selected {
            outline: 2px solid #10b981 !important;
            position: relative;
          }
          .aicro-selector-ui {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            color: #333;
            overflow: hidden;
          }
          .aicro-selector-header {
            padding: 12px 16px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .aicro-selector-content {
            padding: 16px;
          }
          .aicro-selector-footer {
            padding: 12px 16px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
          }
          .aicro-btn {
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            border: 0;
          }
          .aicro-btn-primary {
            background: #3b82f6;
            color: white;
          }
          .aicro-btn-primary:hover {
            background: #2563eb;
          }
          .aicro-btn-secondary {
            background: #e5e7eb;
            color: #4b5563;
          }
          .aicro-btn-secondary:hover {
            background: #d1d5db;
          }
          .aicro-selector-label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            color: #4b5563;
          }
          .aicro-selector-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            margin-bottom: 12px;
          }
          .aicro-element-list {
            max-height: 150px;
            overflow-y: auto;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            margin-bottom: 12px;
          }
          .aicro-element-item {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .aicro-element-item:last-child {
            border-bottom: none;
          }
          .aicro-tools {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }
        \`;
        document.head.appendChild(selectorStyle);
      }
      
      // Create and add the UI to the page
      function createUI() {
        selectorUI = document.createElement('div');
        selectorUI.className = 'aicro-selector-ui';
        selectorUI.innerHTML = \`
          <div class="aicro-selector-header">
            <h3 style="margin:0;font-size:16px;font-weight:600;">AI CRO Selector</h3>
            <button id="aicro-close-btn" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;">×</button>
          </div>
          
          <div class="aicro-selector-content">
            <p style="margin-top:0;margin-bottom:12px;color:#6b7280;">
              Click on elements to select them for personalization.
            </p>
            
            <div class="aicro-tools">
              <button id="aicro-select-headings" class="aicro-btn aicro-btn-secondary" style="font-size:12px;padding:4px 8px;">
                Select Headings
              </button>
              <button id="aicro-select-buttons" class="aicro-btn aicro-btn-secondary" style="font-size:12px;padding:4px 8px;">
                Select Buttons
              </button>
              <button id="aicro-select-paragraphs" class="aicro-btn aicro-btn-secondary" style="font-size:12px;padding:4px 8px;">
                Select Text
              </button>
            </div>
            
            <label class="aicro-selector-label">
              Selected Elements (<span id="aicro-element-count">0</span>)
            </label>
            <div id="aicro-element-list" class="aicro-element-list">
              <div style="padding:20px;text-align:center;color:#9ca3af;">
                No elements selected yet
              </div>
            </div>
            
            <label class="aicro-selector-label">Target Audience</label>
            <input 
              type="text" 
              id="aicro-audience" 
              class="aicro-selector-input" 
              placeholder="Who is your target audience?"
            >
            
            <label class="aicro-selector-label">Page Intent</label>
            <input 
              type="text" 
              id="aicro-intent" 
              class="aicro-selector-input" 
              placeholder="What's your goal? (e.g., drive sales)"
            >
          </div>
          
          <div class="aicro-selector-footer">
            <button id="aicro-clear-btn" class="aicro-btn aicro-btn-secondary">Clear All</button>
            <button id="aicro-personalize-btn" class="aicro-btn aicro-btn-primary">Continue</button>
          </div>
        \`;
        document.body.appendChild(selectorUI);
      }
      
      // Function to generate a unique selector for an element
      function generateUniqueSelector(element) {
        if (element.id) {
          return '#' + element.id;
        }
        
        if (element.classList && element.classList.length) {
          const classes = Array.from(element.classList)
            .filter(c => !c.includes('aicro-'))
            .join('.');
          
          if (classes) {
            return element.tagName.toLowerCase() + '.' + classes;
          }
        }
        
        // Try with tag and position
        const siblings = Array.from(element.parentNode.children)
          .filter(child => child.tagName === element.tagName);
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(element);
          return element.tagName.toLowerCase() + ':nth-child(' + (index + 1) + ')';
        }
        
        return element.tagName.toLowerCase();
      }
      
      // Add hover effect to elements
      function handleMouseOver(e) {
        // Ignore our selector UI
        if (e.target.closest('.aicro-selector-ui')) return;
        
        // Ignore already selected elements
        if (e.target.classList.contains('aicro-selected')) return;
        
        // Highlight targetable elements
        if (isTargetableElement(e.target)) {
          e.target.classList.add('aicro-highlight');
          e.stopPropagation();
        }
      }
      
      // Remove hover effect
      function handleMouseOut(e) {
        if (e.target.classList.contains('aicro-highlight')) {
          e.target.classList.remove('aicro-highlight');
        }
      }
      
      // Handle element selection on click
      function handleClick(e) {
        // Ignore clicks on our selector UI
        if (e.target.closest('.aicro-selector-ui')) return;
        
        // Only select targetable elements
        if (isTargetableElement(e.target)) {
          toggleElementSelection(e.target);
          e.preventDefault();
          e.stopPropagation();
        }
      }
      
      // Check if an element is suitable for targeting
      function isTargetableElement(element) {
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
        
        // Check for common classes
        const classList = Array.from(element.classList || []);
        if (classList.some(cls => 
          ['btn', 'button', 'cta', 'hero', 'title', 'heading', 'banner'].some(keyword => 
            cls.toLowerCase().includes(keyword)
          )
        )) {
          return true;
        }
        
        return false;
      }
      
      // Toggle element selection state
      function toggleElementSelection(element) {
        const index = selectedElements.findIndex(e => e.element === element);
        
        if (index > -1) {
          // Remove selection
          element.classList.remove('aicro-selected');
          selectedElements.splice(index, 1);
        } else {
          // Add selection
          element.classList.add('aicro-selected');
          element.classList.remove('aicro-highlight');
          
          selectedElements.push({
            element: element,
            selector: generateUniqueSelector(element),
            originalContent: element.innerHTML,
            type: element.tagName.toLowerCase(),
            text: element.innerText || element.textContent
          });
        }
        
        updateElementList();
      }
      
      // Update the selected elements list in the UI
      function updateElementList() {
        const listEl = document.getElementById('aicro-element-list');
        const countEl = document.getElementById('aicro-element-count');
        
        if (!listEl || !countEl) return;
        
        countEl.textContent = selectedElements.length;
        
        if (selectedElements.length === 0) {
          listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;">No elements selected yet</div>';
          return;
        }
        
        listEl.innerHTML = '';
        
        selectedElements.forEach((item, i) => {
          const el = document.createElement('div');
          el.className = 'aicro-element-item';
          
          let displayText = item.text ? item.text.trim() : 'No text content';
          if (displayText.length > 30) {
            displayText = displayText.substring(0, 27) + '...';
          }
          
          el.innerHTML = \`
            <div>
              <div style="font-weight:500;">\${item.type}</div>
              <div style="font-size:12px;color:#6b7280;">\${displayText}</div>
            </div>
            <button class="aicro-remove-element" data-index="\${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;">×</button>
          \`;
          
          listEl.appendChild(el);
        });
        
        // Add remove button handlers
        document.querySelectorAll('.aicro-remove-element').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (selectedElements[index]) {
              selectedElements[index].element.classList.remove('aicro-selected');
              selectedElements.splice(index, 1);
              updateElementList();
            }
          });
        });
      }
      
      // Setup button event handlers
      function setupEventHandlers() {
        // Add event listeners for element selection
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);
        
        // Select all headings button
        document.getElementById('aicro-select-headings').addEventListener('click', () => {
          document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(element => {
            if (!selectedElements.some(e => e.element === element)) {
              toggleElementSelection(element);
            }
          });
        });
        
        // Select all buttons button
        document.getElementById('aicro-select-buttons').addEventListener('click', () => {
          document.querySelectorAll('button, a.btn, .cta, input[type="submit"], input[type="button"]').forEach(element => {
            if (!selectedElements.some(e => e.element === element)) {
              toggleElementSelection(element);
            }
          });
        });
        
        // Select all paragraphs button
        document.getElementById('aicro-select-paragraphs').addEventListener('click', () => {
          document.querySelectorAll('p').forEach(element => {
            if (!selectedElements.some(e => e.element === element)) {
              toggleElementSelection(element);
            }
          });
        });
        
        // Clear all button
        document.getElementById('aicro-clear-btn').addEventListener('click', () => {
          selectedElements.forEach(item => {
            item.element.classList.remove('aicro-selected');
          });
          selectedElements.length = 0;
          updateElementList();
        });
        
        // Close button
        document.getElementById('aicro-close-btn').addEventListener('click', cleanup);
        
        // Continue button
        document.getElementById('aicro-personalize-btn').addEventListener('click', () => {
          if (selectedElements.length === 0) {
            alert('Please select at least one element to continue.');
            return;
          }
          
          // Get audience and intent values
          const audience = document.getElementById('aicro-audience').value;
          const intent = document.getElementById('aicro-intent').value;
          
          // Save the data to localStorage
          const selectionData = {
            url: window.location.href,
            audience: audience,
            intent: intent,
            elements: selectedElements.map(item => ({
              selector: item.selector,
              type: item.type,
              text: item.text,
              originalContent: item.originalContent
            }))
          };
          
          localStorage.setItem('aicro_selection_data', JSON.stringify(selectionData));
          
          // Use the callback if provided, otherwise open the multi-select page
          if (typeof window.AICRO.selector.onSelectionComplete === 'function') {
            window.AICRO.selector.onSelectionComplete(selectionData);
          } else {
            // Redirect to the multi-select page on our app
            window.open('${host}/multi-select', '_blank');
          }
          
          // Cleanup
          cleanup();
        });
        
        // Exit on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            cleanup();
          }
        });
      }
      
      // Cleanup function
      function cleanup() {
        // Remove event listeners
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('mouseout', handleMouseOut, true);
        document.removeEventListener('click', handleClick, true);
        
        // Remove classes from elements
        selectedElements.forEach(item => {
          item.element.classList.remove('aicro-selected');
        });
        document.querySelectorAll('.aicro-highlight').forEach(el => {
          el.classList.remove('aicro-highlight');
        });
        
        // Remove UI
        if (selectorUI && selectorUI.parentNode) {
          selectorUI.parentNode.removeChild(selectorUI);
        }
        
        if (selectorStyle && selectorStyle.parentNode) {
          selectorStyle.parentNode.removeChild(selectorStyle);
        }
        
        // Reset state
        window.AICRO.selector.active = false;
      }
      
      // Start the selector UI
      window.AICRO.selector.start = function(options = {}) {
        // Prevent double initialization
        if (window.AICRO.selector.active) {
          console.warn('AI CRO selector is already active');
          return;
        }
        
        // Store options
        if (options.onSelectionComplete) {
          window.AICRO.selector.onSelectionComplete = options.onSelectionComplete;
        }
        
        // Set active state
        window.AICRO.selector.active = true;
        
        // Initialize the UI
        addStyles();
        createUI();
        setupEventHandlers();
        
        return window.AICRO.selector;
      };
      
      // Stop the selector
      window.AICRO.selector.stop = function() {
        if (window.AICRO.selector.active) {
          cleanup();
        }
        return window.AICRO.selector;
      };
      
      // Set callback for when selection is complete
      window.AICRO.selector.onComplete = function(callback) {
        if (typeof callback === 'function') {
          window.AICRO.selector.onSelectionComplete = callback;
        }
        return window.AICRO.selector;
      };
      
      // Return the current selection
      window.AICRO.selector.getSelection = function() {
        return selectedElements.map(item => ({
          selector: item.selector,
          type: item.type,
          text: item.text,
          originalContent: item.originalContent
        }));
      };
      
      // Export the selector module
      return window.AICRO.selector;
    })();
  `;

  return new Response(selectorModule, { headers });
} 