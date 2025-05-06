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
      notice.textContent = 'AI CRO Element Selector activated - click on elements to select them';
      document.body.appendChild(notice);
      
      // Add global event handler to prevent selection when modals are open
      document.addEventListener('click', function(e) {
        // Check if modals are open and event target isn't part of the modal
        if (window.AICRO_SELECTOR.selectingEnabled === false && 
            !e.target.closest('.aicro-modal-overlay') && 
            !e.target.closest('.aicro-modal-content') &&
            !e.target.closest('.aicro-selector-ui')) {
          // Stop propagation to prevent selection
          e.stopPropagation();
          e.preventDefault();
          return false;
        }
      }, true); // Capture phase
      
      // Setup UI variables
      var selectedElements = [];
      var selectorUI = null;
      var selectorStyle = null;
      
      // Initialize a simple standalone selector namespace
      // This is NOT connected to the main AICRO client script
      window.AICRO_SELECTOR = {
        active: true,
        apiHost: '${host}',
        pageSettings: {},
        selectingEnabled: true
      };
      
      // Try to load saved page settings from localStorage
      try {
        const savedPageSettings = localStorage.getItem('AICRO_PAGE_SETTINGS_' + window.location.pathname);
        if (savedPageSettings) {
          window.AICRO_SELECTOR.pageSettings = JSON.parse(savedPageSettings);
        }
      } catch (e) {
        console.error('[AI CRO] Error loading saved page settings:', e);
      }
      
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
            <div class="aicro-page-settings" style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:4px;border:1px solid #e5e7eb;">
              <h4 style="margin:0 0 8px 0;font-size:14px;font-weight:600;">Page Settings</h4>
              
              <label class="aicro-selector-label">Target Audience</label>
              <input 
                type="text" 
                id="aicro-audience" 
                class="aicro-selector-input" 
                placeholder="Who is your target audience?"
                value="${window.AICRO_SELECTOR.pageSettings.audience || ''}"
              >
              
              <label class="aicro-selector-label">Page Goal</label>
              <input 
                type="text" 
                id="aicro-goal" 
                class="aicro-selector-input" 
                placeholder="What's your goal? (e.g., drive sales)"
                value="${window.AICRO_SELECTOR.pageSettings.goal || ''}"
              >
              
              <button id="aicro-save-page-settings" class="aicro-btn aicro-btn-secondary" style="width:100%;">
                Save Page Settings
              </button>
            </div>
            
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
            
            <div id="aicro-active-variations" style="margin-top:12px;">
              <label class="aicro-selector-label">
                Active Variations
              </label>
              <div id="aicro-variations-list" class="aicro-element-list">
                <div style="padding:20px;text-align:center;color:#9ca3af;">
                  No variations created yet
                </div>
              </div>
            </div>
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
          const intent = document.getElementById('aicro-goal').value;
          
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
        // Completely disable element selection while dialog is open
        window.AICRO_SELECTOR.selectingEnabled = false;
        document.body.style.pointerEvents = 'none'; // Disable all pointer events on body
        
        // Create modal for text options
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'aicro-modal-overlay';
        modalOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;pointer-events:auto;'; // Enable pointer events on modal
        
        const modal = document.createElement('div');
        modal.className = 'aicro-modal-content';
        modal.style.cssText = 'background:white;border-radius:8px;width:500px;max-width:90%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 4px 20px rgba(0,0,0,0.2);pointer-events:auto;'; // Enable pointer events on modal
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = 'padding:16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;';
        header.innerHTML = \`
          <h3 style="margin:0;font-size:16px;font-weight:600;">Generate Content Options</h3>
          <button class="aicro-modal-close" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;">×</button>
        \`;
        
        // Content
        const content = document.createElement('div');
        content.className = 'aicro-modal-content';
        content.style.cssText = 'padding:16px;overflow-y:auto;flex:1;pointer-events:auto;';
        
        // Original text section
        content.innerHTML = \`
          <div style="margin-bottom:16px;pointer-events:auto;">
            <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;pointer-events:auto;">Selected Element</label>
            <div style="padding:12px;border:1px solid #e5e7eb;border-radius:4px;background:#f9fafb;margin-bottom:16px;pointer-events:auto;">
              <div style="font-weight:600;pointer-events:auto;">\${item.type}</div>
              <div style="white-space:pre-wrap;pointer-events:auto;">\${item.text}</div>
            </div>
          </div>
          
          <div style="margin-bottom:16px;pointer-events:auto;">
            <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;pointer-events:auto;">Text Options</label>
            
            <textarea id="aicro-text-options" style="width:100%;padding:12px;border:1px solid #d1d5db;border-radius:4px;resize:vertical;min-height:120px;margin-bottom:12px;pointer-events:auto;">1. More concise version that focuses on benefits
2. Version with stronger call-to-action language
3. Version targeting your specific audience
4. Version emphasizing your main goal</textarea>
            
            <div style="text-align:center;margin-bottom:16px;pointer-events:auto;">
              <button id="aicro-generate-variations-btn" class="aicro-btn aicro-btn-primary" style="min-width:150px;pointer-events:auto;">Generate</button>
            </div>
            
            <div id="aicro-generation-status" style="text-align:center;margin-bottom:16px;color:#6b7280;display:none;pointer-events:auto;">
              Generating variations...
            </div>
            
            <div id="aicro-generated-variations" style="display:none;pointer-events:auto;">
              <label style="display:block;margin-bottom:4px;font-weight:500;color:#4b5563;pointer-events:auto;">Generated Variations</label>
              <div id="aicro-variations-container" style="pointer-events:auto;"></div>
            </div>
          </div>
        \`;
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'aicro-modal-footer';
        footer.style.cssText = 'padding:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;pointer-events:auto;';
        footer.innerHTML = \`
          <button class="aicro-modal-cancel aicro-btn aicro-btn-secondary" style="margin-right:8px;pointer-events:auto;">Cancel</button>
          <button id="aicro-save-variation-btn" class="aicro-btn aicro-btn-primary" disabled style="pointer-events:auto;">Generate</button>
        \`;
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(footer);
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        // Selected variation
        let selectedVariation = null;
        
        // Event listeners
        document.querySelector('.aicro-modal-close').addEventListener('click', () => {
          removeModal(modalOverlay);
        });
        
        document.querySelector('.aicro-modal-cancel').addEventListener('click', () => {
          removeModal(modalOverlay);
        });
        
        // Generate button event handler
        document.getElementById('aicro-generate-variations-btn').addEventListener('click', () => {
          // Show status
          const statusEl = document.getElementById('aicro-generation-status');
          statusEl.style.display = 'block';
          
          // Make sure text areas and buttons are focusable
          setTimeout(() => {
            document.querySelectorAll('.aicro-modal-content button, .aicro-modal-content textarea').forEach(el => {
              el.style.pointerEvents = 'auto';
            });
            
            // Force modal overlay to have pointer events
            const overlay = document.querySelector('.aicro-modal-overlay');
            if (overlay) overlay.style.pointerEvents = 'auto';
          }, 10);
          
          // Get the options from textarea
          const optionsText = document.getElementById('aicro-text-options').value;
          
          // Mock generation delay - in a real implementation this would call the API
          setTimeout(() => {
            generateVariations(optionsText, item, audience, intent);
          }, 1500);
        });
        
        document.getElementById('aicro-save-variation-btn').addEventListener('click', () => {
          if (!selectedVariation) {
            alert('Please select a variation first.');
            return;
          }
          
          // Save the variation to the server
          saveVariation(item, selectedVariation, audience, intent);
          
          removeModal(modalOverlay);
        });
        
        // Generate variations function
        function generateVariations(optionsText, item, audience, intent) {
          const statusEl = document.getElementById('aicro-generation-status');
          const variationsContainer = document.getElementById('aicro-variations-container');
          const generatedSection = document.getElementById('aicro-generated-variations');
          
          // Parse the options text into an array
          const options = optionsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
              // Remove any numbering (like "1. ")
              return line.replace(/^\d+[\.\)]\s*/, '');
            });
          
          // Hide status and show generated section
          statusEl.style.display = 'none';
          generatedSection.style.display = 'block';
          
          // Clear container
          variationsContainer.innerHTML = '';
          
          // Make sure element selection is still disabled
          window.AICRO_SELECTOR.selectingEnabled = false;
          document.body.style.pointerEvents = 'none'; // Ensure pointer events stay disabled on body
          
          // Find the modal overlay and ensure it has pointer-events enabled
          const modalOverlay = document.querySelector('.aicro-modal-overlay');
          if (modalOverlay) {
            modalOverlay.style.pointerEvents = 'auto';
          }
          
          // Find all modal content elements and ensure they have pointer-events enabled
          document.querySelectorAll('.aicro-modal-content, .aicro-text-variation, button, textarea, input').forEach(el => {
            if (el) el.style.pointerEvents = 'auto';
          });
          
          // Add options to container
          if (options.length > 0) {
            options.forEach((option, i) => {
              const variationEl = document.createElement('div');
              variationEl.className = 'aicro-text-variation';
              variationEl.style.cssText = 'padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;cursor:pointer;pointer-events:auto;'; // Ensure it gets pointer events
              variationEl.dataset.variation = option;
              
              variationEl.innerHTML = \`
                <div style="white-space:pre-wrap;">
                  \${option}
                </div>
              \`;
              
              variationsContainer.appendChild(variationEl);
              
              // Add click handler
              variationEl.addEventListener('click', () => {
                // Deselect all variations
                document.querySelectorAll('.aicro-text-variation').forEach(el => {
                  el.style.borderColor = '#d1d5db';
                  el.style.background = 'white';
                });
                
                // Select this variation
                variationEl.style.borderColor = '#3b82f6';
                variationEl.style.background = '#f0f7ff';
                
                // Update selected variation
                selectedVariation = option;
                
                // Enable save button
                document.getElementById('aicro-save-variation-btn').disabled = false;
              });
            });
          } else {
            variationsContainer.innerHTML = '<div style="color:#ef4444;text-align:center;padding:12px;">No options to generate from. Please add some text options.</div>';
          }
          
          // Add custom variation input
          const customVariation = document.createElement('div');
          customVariation.className = 'aicro-text-variation';
          customVariation.style.cssText = 'padding:12px;border:1px solid #d1d5db;border-radius:4px;margin-bottom:8px;pointer-events:auto;'; // Ensure it gets pointer events
          
          customVariation.innerHTML = \`
            <div style="margin-bottom:8px;font-weight:500;">Custom Variation</div>
            <textarea id="aicro-custom-variation" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:4px;resize:vertical;min-height:60px;pointer-events:auto;" placeholder="Write your own variation..."></textarea>
            <button id="aicro-use-custom-btn" class="aicro-btn aicro-btn-secondary" style="width:100%;margin-top:8px;pointer-events:auto;">Use This Variation</button>
          \`;
          
          variationsContainer.appendChild(customVariation);
          
          // Make sure the new elements have pointer-events
          setTimeout(() => {
            document.querySelectorAll('.aicro-text-variation, textarea, button').forEach(el => {
              el.style.pointerEvents = 'auto';
            });
          }, 50);
          
          // Add event listener for custom variation button
          document.getElementById('aicro-use-custom-btn').addEventListener('click', () => {
            const customText = document.getElementById('aicro-custom-variation').value.trim();
            
            if (!customText) {
              alert('Please enter some text for your custom variation.');
              return;
            }
            
            // Update selected variation
            selectedVariation = customText;
            
            // Enable save button
            document.getElementById('aicro-save-variation-btn').disabled = false;
            
            // Visual feedback
            document.querySelectorAll('.aicro-text-variation').forEach(el => {
              el.style.borderColor = '#d1d5db';
              el.style.background = 'white';
            });
            
            customVariation.style.borderColor = '#3b82f6';
            customVariation.style.background = '#f0f7ff';
          });
        }
      }
      
      // Helper function to remove modal and re-enable selection
      function removeModal(modalOverlay) {
        document.body.removeChild(modalOverlay);
        // Re-enable element selection and restore pointer events
        window.AICRO_SELECTOR.selectingEnabled = true;
        document.body.style.pointerEvents = '';
      }
      
      // Disable element selection
      function disableElementSelection() {
        // Remove event listeners for element selection
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('mouseout', handleMouseOut, true);
        document.removeEventListener('click', handleClick, true);
        
        // Remove highlight effects from any currently highlighted elements
        document.querySelectorAll('.aicro-highlight').forEach(el => {
          el.classList.remove('aicro-highlight');
        });
      }
      
      // Enable element selection
      function enableElementSelection() {
        // Add event listeners for element selection
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);
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
          fetch(window.AICRO_SELECTOR.apiHost + '/api/save-test', {
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
                  <pre style="background:#f5f5f5;padding:12px;border-radius:4px;overflow-x:auto;margin-bottom:16px;"><code>&lt;script async src="' + window.AICRO_SELECTOR.apiHost + '/api/client-script"&gt;&lt;/script&gt;</code></pre>
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
        // Don't do anything if selection is disabled
        if (window.AICRO_SELECTOR && window.AICRO_SELECTOR.selectingEnabled === false) {
          return;
        }
      
        // Ignore our selector UI
        if (e.target.closest('.aicro-selector-ui') || e.target.closest('.aicro-modal-overlay')) return;
        
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
        // Don't do anything if selection is disabled
        if (window.AICRO_SELECTOR && window.AICRO_SELECTOR.selectingEnabled === false) {
          return;
        }
      
        if (e.target.classList.contains('aicro-highlight')) {
          e.target.classList.remove('aicro-highlight');
        }
      }
      
      // Handle element selection on click
      function handleClick(e) {
        // Don't do anything if selection is disabled
        if (window.AICRO_SELECTOR && window.AICRO_SELECTOR.selectingEnabled === false) {
          return;
        }
      
        // Ignore clicks on our selector UI
        if (e.target.closest('.aicro-selector-ui') || e.target.closest('.aicro-modal-overlay')) return;
        
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
        // If we have a selected element, deselect it first
        if (selectedElements.length > 0) {
          selectedElements.forEach(item => {
            item.element.classList.remove('aicro-selected');
          });
          selectedElements = [];
        }
        
        // Now select the new element
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