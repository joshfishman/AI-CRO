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
              Click on elements to select them for testing.
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
      
      // Function to check if element is part of the UI or should be ignored
      function isAppUIElement(element) {
        if (!element) return true;
        
        // Check for common app UI classes
        const appUIClasses = ['aicro-', 'modal', 'dialog', 'popup', 'overlay', 'drawer', 'sidebar', 'toast'];
        
        // Get element classes safely
        let classNames = '';
        try {
          if (element.className) {
            if (typeof element.className === 'string') {
              classNames = element.className;
            } else if (element.className.baseVal !== undefined) {
              // SVG elements
              classNames = element.className.baseVal;
            } else {
              // Fallback
              const classAttr = element.getAttribute && element.getAttribute('class');
              if (classAttr) {
                classNames = classAttr;
              }
            }
          }
        } catch (e) {
          console.error('Error getting className:', e);
          return true; // Default to ignore on error
        }
        
        // Check for app UI classes
        for (const uiClass of appUIClasses) {
          if (classNames && classNames.includes(uiClass)) {
            return true;
          }
        }
        
        // Check if element is inside UI container
        if (element.closest && (
            element.closest('.aicro-selector-ui') || 
            element.closest('[id^="aicro-"]') || 
            element.closest('[class^="aicro-"]') ||
            element.closest('.modal') ||
            element.closest('[role="dialog"]')
          )) {
          return true;
        }
        
        // Check if element has fixed position or very high z-index
        try {
          const style = window.getComputedStyle(element);
          if (style.position === 'fixed' && parseInt(style.zIndex) > 1000) {
            return true;
          }
        } catch (e) {
          // Ignore style errors
        }
        
        return false;
      }
      
      // Add hover effect to elements
      function handleMouseOver(e) {
        // Ignore our selector UI and app UI elements
        if (isAppUIElement(e.target)) return;
        
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
        // Ignore our selector UI and app UI elements
        if (isAppUIElement(e.target)) return;
        
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
          
          // Don't modify content, just track the original content
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
            <div style="display:flex;align-items:center;">
              <button class="aicro-generate-options" data-index="\${i}" style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:12px;margin-right:8px;">Options</button>
              <button class="aicro-remove-element" data-index="\${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;">×</button>
            </div>
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
        
        // Add generate options button handlers
        document.querySelectorAll('.aicro-generate-options').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (selectedElements[index]) {
              showTextOptionsDialog(selectedElements[index], index);
            }
          });
        });
      }
      
      // Show text options dialog for an element
      function showTextOptionsDialog(item, index) {
        // Create modal dialog for text options
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:8px;width:500px;max-width:90%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.2);';
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = 'padding:16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;';
        header.innerHTML = \`
          <h3 style="margin:0;font-size:16px;font-weight:600;">Generate Text Options</h3>
          <button class="aicro-modal-close" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;">×</button>
        \`;
        
        // Content
        const content = document.createElement('div');
        content.style.cssText = 'padding:16px;overflow-y:auto;flex:1;';
        
        // Original text
        const originalTextSection = document.createElement('div');
        originalTextSection.style.cssText = 'margin-bottom:16px;';
        originalTextSection.innerHTML = \`
          <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;">Original Text</label>
          <div style="padding:12px;border:1px solid #e5e7eb;border-radius:4px;background:#f9fafb;margin-bottom:16px;white-space:pre-wrap;font-family:inherit;">\${item.text}</div>
          
          <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;">Generation Prompt</label>
          <div class="aicro-text-gen-content">
            <textarea 
              id="aicro-prompt" 
              class="aicro-selector-input" 
              style="min-height:100px;resize:vertical;margin-bottom:16px;" 
              placeholder="Describe how you want to modify this text...">Generate 3 alternative versions of this text that are more persuasive and action-oriented.</textarea>
            
            <div style="text-align:center;margin-bottom:16px;">
              <button id="aicro-generate-text-btn" class="aicro-btn aicro-btn-primary" style="min-width:150px;">Generate</button>
            </div>
          </div>
          
          <div id="aicro-generation-status" style="text-align:center;margin-bottom:16px;color:#6b7280;display:none;">
            Generating options...
          </div>
          
          <div id="aicro-generated-options" style="display:none;">
            <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;">Generated Options</label>
            <div id="aicro-options-container"></div>
          </div>
        \`;
        
        content.appendChild(originalTextSection);
        
        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = 'padding:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;';
        footer.innerHTML = \`
          <button class="aicro-modal-cancel aicro-btn aicro-btn-secondary" style="margin-right:8px;">Cancel</button>
          <button id="aicro-save-option-btn" class="aicro-btn aicro-btn-primary" disabled>Save Selection</button>
        \`;
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        // Selected option
        let selectedOption = null;
        
        // Add event listeners
        document.querySelector('.aicro-modal-close').addEventListener('click', () => {
          document.body.removeChild(modalOverlay);
        });
        
        document.querySelector('.aicro-modal-cancel').addEventListener('click', () => {
          document.body.removeChild(modalOverlay);
        });
        
        document.getElementById('aicro-generate-text-btn').addEventListener('click', () => {
          generateTextOptions(item, index);
        });
        
        document.getElementById('aicro-save-option-btn').addEventListener('click', () => {
          if (selectedOption) {
            // Add the option to the item data
            if (!item.alternativeOptions) {
              item.alternativeOptions = [];
            }
            
            // Only add if not already present
            if (!item.alternativeOptions.includes(selectedOption)) {
              item.alternativeOptions.push(selectedOption);
            }
            
            // Set as selected option
            item.selectedOption = selectedOption;
            
            document.body.removeChild(modalOverlay);
          }
        });
        
        // Function to generate text options
        function generateTextOptions(item, index) {
          const prompt = document.getElementById('aicro-prompt').value;
          const statusEl = document.getElementById('aicro-generation-status');
          const optionsContainer = document.getElementById('aicro-options-container');
          const generatedOptionsSection = document.getElementById('aicro-generated-options');
          
          // Show loading status
          statusEl.style.display = 'block';
          generatedOptionsSection.style.display = 'none';
          
          // Get audience and intent values for context
          const audience = document.getElementById('aicro-audience').value;
          const intent = document.getElementById('aicro-intent').value;
          
          // Prepare API request data
          const requestData = {
            originalText: item.text,
            prompt: prompt,
            elementType: item.type,
            audience: audience,
            intent: intent,
            url: window.location.href
          };
          
          // Call the API to generate text options
          fetch('${host}/api/generate-text-options', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          })
          .then(response => response.json())
          .then(data => {
            // Hide loading status
            statusEl.style.display = 'none';
            generatedOptionsSection.style.display = 'block';
            
            if (data.success && data.options && data.options.length > 0) {
              // Add options to container
              optionsContainer.innerHTML = '';
              data.options.forEach((option, i) => {
                const optionEl = document.createElement('div');
                optionEl.className = 'aicro-text-option';
                optionEl.style.cssText = 'padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;cursor:pointer;';
                optionEl.dataset.option = option;
                optionEl.innerHTML = \`
                  <div style="display:flex;align-items:flex-start;">
                    <div style="margin-right:8px;">
                      <input type="radio" name="text-option" id="option-\${i}" style="margin-top:3px;">
                    </div>
                    <div>
                      <label for="option-\${i}" style="cursor:pointer;">\${option}</label>
                    </div>
                  </div>
                \`;
                
                optionsContainer.appendChild(optionEl);
                
                // Add click handler
                optionEl.addEventListener('click', () => {
                  // Deselect all options
                  document.querySelectorAll('.aicro-text-option').forEach(el => {
                    el.style.borderColor = '#d1d5db';
                    el.style.background = 'white';
                    el.querySelector('input').checked = false;
                  });
                  
                  // Select this option
                  optionEl.style.borderColor = '#3b82f6';
                  optionEl.style.background = '#f0f7ff';
                  optionEl.querySelector('input').checked = true;
                  
                  // Update selected option
                  selectedOption = option;
                  
                  // Enable save button
                  document.getElementById('aicro-save-option-btn').disabled = false;
                });
              });
            } else {
              // Show error message
              optionsContainer.innerHTML = '<div style="color:#ef4444;text-align:center;padding:12px;">Failed to generate options. Please try again.</div>';
            }
            
            // Add custom option input
            const customOption = document.createElement('div');
            customOption.className = 'aicro-text-option';
            customOption.style.cssText = 'padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;';
            customOption.innerHTML = \`
              <div style="display:flex;align-items:flex-start;">
                <div style="margin-right:8px;">
                  <input type="radio" name="text-option" id="option-custom" style="margin-top:3px;">
                </div>
                <div style="flex-grow:1;">
                  <label for="option-custom" style="display:block;margin-bottom:4px;cursor:pointer;">Custom Option</label>
                  <textarea id="aicro-custom-option" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:4px;resize:vertical;min-height:60px;" placeholder="Write your own alternative..."></textarea>
                </div>
              </div>
            \`;
            
            optionsContainer.appendChild(customOption);
            
            // Add event listener for custom option
            customOption.addEventListener('click', () => {
              // Deselect all options
              document.querySelectorAll('.aicro-text-option').forEach(el => {
                el.style.borderColor = '#d1d5db';
                el.style.background = 'white';
                el.querySelector('input').checked = false;
              });
              
              // Select custom option
              customOption.style.borderColor = '#3b82f6';
              customOption.style.background = '#f0f7ff';
              customOption.querySelector('input').checked = true;
              
              // Focus textarea
              document.getElementById('aicro-custom-option').focus();
            });
            
            // Update selected option when custom text changes
            document.getElementById('aicro-custom-option').addEventListener('input', (e) => {
              selectedOption = e.target.value;
              
              // Enable save button if there's text
              document.getElementById('aicro-save-option-btn').disabled = !selectedOption || selectedOption.trim() === '';
              
              // Ensure radio is selected
              customOption.querySelector('input').checked = true;
              customOption.style.borderColor = '#3b82f6';
              customOption.style.background = '#f0f7ff';
            });
          })
          .catch(error => {
            console.error('Error generating text options:', error);
            statusEl.style.display = 'none';
            generatedOptionsSection.style.display = 'block';
            optionsContainer.innerHTML = '<div style="color:#ef4444;text-align:center;padding:12px;">An error occurred. Please try again.</div>';
          });
        }
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
              originalContent: item.originalContent,
              alternativeOptions: item.alternativeOptions || [],
              selectedOption: item.selectedOption || null
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