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
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'max-age=3600'
  };

  // Use absolute URL for production or fallback to localhost for development
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-cro-three.vercel.app';

  // Create a completely self-contained bookmarklet
  const bookmarkletScript = `
    (function() {
      // Prevent multiple initializations
      if (window.AICRO_SELECTOR_ACTIVE) {
        console.log('AI CRO selector is already active');
        return;
      }
      window.AICRO_SELECTOR_ACTIVE = true;
      
      // Create notification
      var notice = document.createElement('div');
      notice.style.position = 'fixed';
      notice.style.bottom = '20px';
      notice.style.right = '20px';
      notice.style.background = '#4CAF50';
      notice.style.color = 'white';
      notice.style.padding = '8px 16px';
      notice.style.borderRadius = '4px';
      notice.style.zIndex = '9999';
      notice.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      notice.textContent = 'AI CRO Selector activated';
      document.body.appendChild(notice);
      
      // Setup UI variables
      var selectedElements = [];
      var selectorUI = null;
      var selectorStyle = null;
      
      // Initialize a simple standalone selector namespace
      // This is NOT connected to the main AICRO client script
      window.AICRO_SELECTOR = {
        active: true,
        apiHost: '${host}'
      };
      
      // Add styles
      addStyles();
      
      // Create UI
      createUI();
      
      // Setup handlers
      setupEventHandlers();
      
      // Remove notice after 3 seconds
      setTimeout(function() {
        notice.style.opacity = '0';
        notice.style.transition = 'opacity 0.5s';
        setTimeout(function() {
          if (notice.parentNode) {
            document.body.removeChild(notice);
          }
        }, 500);
      }, 3000);
      
      // Add styles function
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
      
      // Create UI function
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
            <button id="aicro-generate-btn" class="aicro-btn aicro-btn-primary">Generate</button>
          </div>
        \`;
        document.body.appendChild(selectorUI);
      }
      
      // Set up event handlers
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
          document.querySelectorAll('button, a.btn, a.button, .cta, input[type="submit"], input[type="button"]').forEach(element => {
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
        
        // Generate button
        document.getElementById('aicro-generate-btn').addEventListener('click', () => {
          if (selectedElements.length === 0) {
            alert('Please select at least one element to continue.');
            return;
          }
          
          // Get audience and intent values
          const audience = document.getElementById('aicro-audience').value;
          const intent = document.getElementById('aicro-intent').value;
          
          // Show text options for first selected element as demo
          showTextOptionsDialog(selectedElements[0], 0, audience, intent);
        });
        
        // Exit on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            cleanup();
          }
        });
      }
      
      // Show text options dialog
      function showTextOptionsDialog(item, index, audience, intent) {
        // Create modal for text options
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:8px;width:500px;max-width:90%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.2);';
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = 'padding:16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;';
        header.innerHTML = \`
          <h3 style="margin:0;font-size:16px;font-weight:600;">Text Variations</h3>
          <button class="aicro-modal-close" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;">×</button>
        \`;
        
        // Content
        const content = document.createElement('div');
        content.style.cssText = 'padding:16px;overflow-y:auto;flex:1;';
        
        // Original text section
        content.innerHTML = \`
          <div style="margin-bottom:16px;">
            <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;">Selected Element</label>
            <div style="padding:12px;border:1px solid #e5e7eb;border-radius:4px;background:#f9fafb;margin-bottom:16px;">
              <div style="font-weight:600;">\${item.type}</div>
              <div style="white-space:pre-wrap;">\${item.text}</div>
            </div>
          </div>
          
          <div style="margin-bottom:16px;">
            <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;">Text Variations</label>
            
            <div class="aicro-text-option" style="padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;cursor:pointer;">
              <div style="display:flex;align-items:flex-start;">
                <div style="margin-right:8px;">
                  <input type="radio" name="text-option" id="option-1" style="margin-top:3px;" checked>
                </div>
                <div>
                  <label for="option-1" style="cursor:pointer;">More concise version that focuses on benefits</label>
                </div>
              </div>
            </div>
            
            <div class="aicro-text-option" style="padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;cursor:pointer;">
              <div style="display:flex;align-items:flex-start;">
                <div style="margin-right:8px;">
                  <input type="radio" name="text-option" id="option-2" style="margin-top:3px;">
                </div>
                <div>
                  <label for="option-2" style="cursor:pointer;">Version with stronger call-to-action language</label>
                </div>
              </div>
            </div>
            
            <div class="aicro-text-option" style="padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;cursor:pointer;">
              <div style="display:flex;align-items:flex-start;">
                <div style="margin-right:8px;">
                  <input type="radio" name="text-option" id="option-3" style="margin-top:3px;">
                </div>
                <div>
                  <label for="option-3" style="cursor:pointer;">Version targeting \${audience || 'your specific audience'}</label>
                </div>
              </div>
            </div>
            
            <div class="aicro-text-option" style="padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;cursor:pointer;">
              <div style="display:flex;align-items:flex-start;">
                <div style="margin-right:8px;">
                  <input type="radio" name="text-option" id="option-4" style="margin-top:3px;">
                </div>
                <div>
                  <label for="option-4" style="cursor:pointer;">Version emphasizing \${intent || 'your main goal'}</label>
                </div>
              </div>
            </div>
            
            <div class="aicro-text-option" style="padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;">
              <div style="display:flex;align-items:flex-start;">
                <div style="margin-right:8px;">
                  <input type="radio" name="text-option" id="option-custom" style="margin-top:3px;">
                </div>
                <div style="flex-grow:1;">
                  <label for="option-custom" style="display:block;margin-bottom:4px;cursor:pointer;">Custom Option</label>
                  <textarea id="aicro-custom-option" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:4px;resize:vertical;min-height:60px;" placeholder="Write your own alternative..."></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom:16px;">
            <p style="margin-top:0;color:#6b7280;font-style:italic;">
              Note: This is a demo of the interface. In the full version, these variations would be generated by AI based on your specific content, audience, and intent.
            </p>
          </div>
        \`;
        
        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = 'padding:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;';
        footer.innerHTML = \`
          <button class="aicro-modal-cancel aicro-btn aicro-btn-secondary" style="margin-right:8px;">Cancel</button>
          <button class="aicro-modal-save aicro-btn aicro-btn-primary">Save for A/B Testing</button>
        \`;
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        // Event listeners
        document.querySelector('.aicro-modal-close').addEventListener('click', () => {
          document.body.removeChild(modalOverlay);
        });
        
        document.querySelector('.aicro-modal-cancel').addEventListener('click', () => {
          document.body.removeChild(modalOverlay);
        });
        
        document.querySelector('.aicro-modal-save').addEventListener('click', () => {
          // Find the selected option
          let selectedOption = '';
          
          document.querySelectorAll('.aicro-text-option input[type="radio"]').forEach((radio, i) => {
            if (radio.checked) {
              if (radio.id === 'option-custom') {
                selectedOption = document.getElementById('aicro-custom-option').value;
              } else {
                // For demo purposes, we're just using placeholder text
                // In a real implementation, these would be actual generated variations
                const variationTexts = [
                  "More concise version focused on benefits",
                  "Stronger call-to-action language version",
                  \`Version targeting ${audience || 'specific audience'}`,
                  \`Version emphasizing ${intent || 'main goal'}`
                ];
                selectedOption = variationTexts[i];
              }
            }
          });
          
          if (!selectedOption) {
            alert('Please select a variation or write a custom one.');
            return;
          }
          
          // Save the variation to the server
          saveVariation(item, selectedOption, audience, intent);
          
          document.body.removeChild(modalOverlay);
        });
        
        // Add click handlers for options
        document.querySelectorAll('.aicro-text-option').forEach(option => {
          option.addEventListener('click', () => {
            // Deselect all options
            document.querySelectorAll('.aicro-text-option').forEach(el => {
              el.style.borderColor = '#d1d5db';
              el.style.background = 'white';
              el.querySelector('input').checked = false;
            });
            
            // Select this option
            option.style.borderColor = '#3b82f6';
            option.style.background = '#f0f7ff';
            option.querySelector('input').checked = true;
          });
        });
        
        // Select the first option by default
        const firstOption = document.querySelector('.aicro-text-option');
        if (firstOption) {
          firstOption.style.borderColor = '#3b82f6';
          firstOption.style.background = '#f0f7ff';
        }
      }
      
      // Save variation to the server
      function saveVariation(item, selectedContent, audience, intent) {
        try {
          // Create a dialog to show saving progress
          const savingDialog = document.createElement('div');
          savingDialog.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:8px 16px;border-radius:4px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
          savingDialog.textContent = 'Saving variation...';
          document.body.appendChild(savingDialog);
          
          // Prepare test data
          const testData = {
            url: window.location.href,
            selector: item.selector,
            originalContent: item.text,
            variantContent: selectedContent,
            elementType: item.type,
            audience: audience || '',
            intent: intent || '',
            createdAt: new Date().toISOString()
          };
          
          // Send to server
          fetch(\`\${window.AICRO_SELECTOR.apiHost}/api/save-test\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify(testData)
          })
          .then(response => response.json())
          .then(data => {
            // Update dialog to show success
            savingDialog.style.background = '#4CAF50';
            savingDialog.textContent = 'Test saved successfully!';
            
            // Display setup instructions
            setTimeout(() => {
              const instructionsDialog = document.createElement('div');
              instructionsDialog.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:24px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:999999;max-width:90%;width:500px;';
              instructionsDialog.innerHTML = \`
                <h3 style="margin-top:0;font-size:18px;margin-bottom:16px;">A/B Test Created!</h3>
                <p style="margin-bottom:16px;">Your test has been saved. To display this test on your website:</p>
                <ol style="margin-bottom:16px;padding-left:24px;">
                  <li style="margin-bottom:8px;">Add the AI CRO client script to your website:</li>
                  <pre style="background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto;margin-bottom:16px;"><code>&lt;script async src="${window.AICRO_SELECTOR.apiHost}/api/client-script"&gt;&lt;/script&gt;</code></pre>
                  <li style="margin-bottom:8px;">Initialize it with your user ID:</li>
                  <pre style="background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto;margin-bottom:16px;"><code>&lt;script&gt;
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.debug(true) // Enable debug mode (remove in production)
      .init();
  });
&lt;/script&gt;</code></pre>
                </ol>
                <p style="margin-bottom:16px;">The client script will automatically load and display the personalized content you've created.</p>
                <div style="text-align:right;">
                  <button id="aicro-close-instructions" style="background:#3b82f6;color:white;padding:8px 16px;border-radius:4px;border:none;cursor:pointer;">Got it!</button>
                </div>
              \`;
              document.body.appendChild(instructionsDialog);
              
              // Remove saving dialog
              document.body.removeChild(savingDialog);
              
              // Add close button handler
              document.getElementById('aicro-close-instructions').addEventListener('click', () => {
                document.body.removeChild(instructionsDialog);
              });
            }, 2000);
          })
          .catch(error => {
            console.error('[AI CRO] Error saving test:', error);
            savingDialog.style.background = '#f44336';
            savingDialog.textContent = 'Error saving test. Please try again.';
            setTimeout(() => {
              if (savingDialog.parentNode) {
                document.body.removeChild(savingDialog);
              }
            }, 3000);
          });
        } catch (e) {
          console.error('[AI CRO] Error in saveVariation:', e);
          alert('Error saving variation. Please try again.');
        }
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
      
      // Check if element is targetable
      function isTargetableElement(element) {
        try {
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
          let classNames = '';
          if (element.className) {
            if (typeof element.className === 'string') {
              classNames = element.className.toLowerCase();
            }
          }
          
          if (classNames.includes('btn') || 
              classNames.includes('button') || 
              classNames.includes('cta') || 
              classNames.includes('hero') || 
              classNames.includes('heading') || 
              classNames.includes('banner')) {
            return true;
          }
          
          return false;
        } catch (e) {
          console.error('[AI CRO] Error in isTargetableElement:', e);
          return false;
        }
      }
      
      // Toggle element selection
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
          
          // Store element data
          selectedElements.push({
            element: element,
            selector: generateSelector(element),
            originalContent: element.innerHTML,
            type: element.tagName.toLowerCase(),
            text: element.innerText || element.textContent
          });
        }
        
        updateElementList();
      }
      
      // Generate selector for element
      function generateSelector(element) {
        try {
          if (element.id) {
            return '#' + element.id;
          }
          
          if (element.className && typeof element.className === 'string') {
            const classes = element.className.split(' ')
              .filter(c => c && !c.includes('aicro-'))
              .join('.');
            
            if (classes) {
              return element.tagName.toLowerCase() + '.' + classes;
            }
          }
          
          // Try with tag and position
          if (element.parentNode) {
            const siblings = Array.from(element.parentNode.children)
              .filter(child => child.tagName === element.tagName);
            
            if (siblings.length > 1) {
              const index = siblings.indexOf(element);
              return element.tagName.toLowerCase() + ':nth-child(' + (index + 1) + ')';
            }
          }
          
          return element.tagName.toLowerCase();
        } catch (e) {
          console.error('[AI CRO] Error generating selector:', e);
          return element.tagName.toLowerCase();
        }
      }
      
      // Update the element list in UI
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
        window.AICRO_SELECTOR_ACTIVE = false;
        if (window.AICRO_SELECTOR) {
          window.AICRO_SELECTOR.active = false;
        }
      }
    })();
  `;

  // Encode the script as a javascript URL (this is the bookmarklet format)
  const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;

  return new Response(JSON.stringify({
    code: bookmarkletCode
  }), { headers });
} 