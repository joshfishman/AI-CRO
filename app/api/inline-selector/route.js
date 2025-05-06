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
        ".aicro-selector-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.3); z-index: 999990; pointer-events: none; }",
        ".aicro-element-highlight { position: absolute; border: 2px solid #2196F3; background: rgba(33, 150, 243, 0.1); z-index: 1000000; pointer-events: none; box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.15); }",
        ".aicro-selector-controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 12px 20px; z-index: 1000001; display: flex; align-items: center; gap: 12px; }",
        ".aicro-selector-controls button { background: #2196F3; color: white; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; }",
        ".aicro-selector-controls button.cancel { background: transparent; color: #666; }",
        ".aicro-selector-info { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); padding: 12px 20px; z-index: 1000001; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #333; }",
        // Bottom bar styles
        ".aicro-bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #1e293b; color: white; padding: 12px 24px; z-index: 999992; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif; }",
        ".aicro-bottom-bar-fields { display: flex; flex: 1; gap: 16px; }",
        ".aicro-field-group { display: flex; flex-direction: column; flex: 1; }",
        ".aicro-field-label { font-size: 12px; margin-bottom: 4px; color: #94a3b8; }",
        ".aicro-field-input { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 6px 10px; color: white; width: 100%; font-size: 14px; }",
        ".aicro-bottom-bar-actions { display: flex; gap: 8px; }",
        // Element config panel
        ".aicro-element-panel { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 600px; width: 90%; max-height: 80vh; overflow: auto; z-index: 1000002; font-family: system-ui, -apple-system, sans-serif; display: none; }",
        ".aicro-panel-header { padding: 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }",
        ".aicro-panel-title { font-size: 18px; font-weight: 600; margin: 0; }",
        ".aicro-panel-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6b7280; }",
        ".aicro-panel-body { padding: 16px; }",
        ".aicro-panel-section { margin-bottom: 20px; }",
        ".aicro-panel-label { font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151; }",
        ".aicro-panel-textarea { width: 100%; min-height: 100px; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-family: inherit; font-size: 14px; resize: vertical; }",
        ".aicro-panel-footer { padding: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }",
        ".aicro-btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border: none; }",
        ".aicro-btn-primary { background: #3b82f6; color: white; }",
        ".aicro-btn-secondary { background: #f3f4f6; color: #374151; }",
        // Results list
        ".aicro-results-container { margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }",
        ".aicro-result-item { padding: 16px; border-bottom: 1px solid #e5e7eb; cursor: pointer; }",
        ".aicro-result-item:last-child { border-bottom: none; }",
        ".aicro-result-item:hover { background: #f9fafb; }",
        ".aicro-result-item.selected { background: #eff6ff; border-left: 3px solid #3b82f6; }",
        // Add pointer cursor when hovering over elements
        ".aicro-hover-able { cursor: pointer !important; }"
      ].join("\\n");
      document.head.appendChild(style);
    }
    
    // Create UI components
    function createUI() {
      // Main components
      var overlay = document.createElement('div');
      overlay.className = 'aicro-selector-overlay';
      
      var highlight = document.createElement('div');
      highlight.className = 'aicro-element-highlight';
      highlight.style.display = 'none';
      
      var info = document.createElement('div');
      info.className = 'aicro-selector-info';
      info.textContent = 'Hover over an element and click to select it';
      
      // Bottom bar with audience and page intent
      var bottomBar = document.createElement('div');
      bottomBar.className = 'aicro-bottom-bar';
      bottomBar.innerHTML = \`
        <div class="aicro-bottom-bar-fields">
          <div class="aicro-field-group">
            <label class="aicro-field-label">Target Audience</label>
            <input id="aicro-audience" class="aicro-field-input" placeholder="Who are you targeting? (e.g., 'new visitors', 'mobile users')">
          </div>
          <div class="aicro-field-group">
            <label class="aicro-field-label">Page Intent</label>
            <input id="aicro-page-intent" class="aicro-field-input" placeholder="What's the page goal? (e.g., 'increase signups', 'boost sales')">
          </div>
        </div>
        <div class="aicro-bottom-bar-actions">
          <button id="aicro-save-settings" class="aicro-btn aicro-btn-primary">Save Settings</button>
          <button id="aicro-exit-selector" class="aicro-btn aicro-btn-secondary">Exit Selector</button>
        </div>
      \`;
      
      // Element configuration panel
      var elementPanel = document.createElement('div');
      elementPanel.className = 'aicro-element-panel';
      elementPanel.id = 'aicro-element-panel';
      elementPanel.innerHTML = \`
        <div class="aicro-panel-header">
          <h3 class="aicro-panel-title">Element Configuration</h3>
          <button class="aicro-panel-close" id="aicro-panel-close">&times;</button>
        </div>
        <div class="aicro-panel-body">
          <div class="aicro-panel-section">
            <div class="aicro-panel-label">Selected Element</div>
            <div id="aicro-selected-element-info" style="padding: 8px; background: #f9fafb; border-radius: 4px; font-family: monospace; font-size: 12px;"></div>
          </div>
          
          <div class="aicro-panel-section">
            <div class="aicro-panel-label">Element Type</div>
            <select id="aicro-element-type" class="aicro-field-input" style="background: white; color: #333;">
              <option value="text">General Text</option>
              <option value="headline">Headline/Title</option>
              <option value="subheadline">Subheadline</option>
              <option value="paragraph">Paragraph</option>
              <option value="cta">Call to Action/Button</option>
              <option value="link">Link</option>
              <option value="product">Product Description</option>
              <option value="feature">Feature Description</option>
              <option value="benefit">Benefit Statement</option>
              <option value="testimonial">Testimonial/Review</option>
              <option value="price">Price/Offer</option>
            </select>
          </div>
          
          <div class="aicro-panel-section">
            <div class="aicro-panel-label">Generation Prompt</div>
            <textarea id="aicro-generation-prompt" class="aicro-panel-textarea" placeholder="Describe what variations you want to generate...">Generate 3 variations of this content that would appeal to the target audience and better achieve the page intent.</textarea>
          </div>
          
          <div class="aicro-panel-section" id="aicro-results-section" style="display: none;">
            <div class="aicro-panel-label">Generated Variations</div>
            <div id="aicro-results-list" class="aicro-results-container">
              <!-- Results will be populated here -->
            </div>
          </div>
        </div>
        <div class="aicro-panel-footer">
          <button id="aicro-cancel-panel" class="aicro-btn aicro-btn-secondary">Cancel</button>
          <button id="aicro-generate" class="aicro-btn aicro-btn-primary">Generate Variations</button>
        </div>
      \`;
      
      // Add all UI elements to document
      document.body.appendChild(overlay);
      document.body.appendChild(highlight);
      document.body.appendChild(info);
      document.body.appendChild(bottomBar);
      document.body.appendChild(elementPanel);
      
      return { 
        overlay, 
        highlight, 
        info, 
        bottomBar,
        elementPanel
      };
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
    var selectedElements = [];
    var pageSettings = {
      audience: '',
      intent: ''
    };
    
    // Function to generate variations using the AI CRO API
    function generateVariationsWithAPI(element, prompt) {
      return new Promise(function(resolve, reject) {
        // Get the element content
        var elementContent = element.textContent.trim();
        var selector = generateSelector(element);
        var elementType = document.getElementById('aicro-element-type').value || 'text';
        
        // Prepare the request data
        var requestData = {
          element: {
            content: elementContent,
            selector: selector,
            tagName: element.tagName.toLowerCase(),
            type: elementType,
            attributes: {
              className: element.className || '',
              id: element.id || '',
              href: element.href || '',
              src: element.src || ''
            }
          },
          prompt: prompt,
          audience: pageSettings.audience || null,
          intent: pageSettings.intent || null,
          page: {
            url: window.location.href,
            title: document.title,
            path: window.location.pathname
          }
        };
        
        console.log('[AI CRO] Sending request to generate variations:', requestData);
        
        // Add a timestamp to the URL to bypass caching
        var timestamp = new Date().getTime();
        var apiUrl = 'https://ai-cro-three.vercel.app/api/generate-variations?t=' + timestamp;
        
        // Make the API request to generate variations
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify(requestData)
        })
        .then(function(response) {
          console.log('[AI CRO] API response status:', response.status);
          if (!response.ok) {
            throw new Error('API request failed with status ' + response.status);
          }
          return response.json();
        })
        .then(function(data) {
          console.log('[AI CRO] API response data:', data);
          
          if (data && data.variations) {
            console.log('[AI CRO] Successfully received variations from API');
            resolve(data.variations);
          } else {
            // Fallback if API response format is unexpected
            console.error('[AI CRO] Unexpected API response format:', data);
            
            // Generate fallback variations
            var fallbackVariations = [
              { id: 1, content: "✨ " + elementContent + " (Fallback variation 1 - API format error)" },
              { id: 2, content: "🚀 " + elementContent + " (Fallback variation 2 - API format error)" },
              { id: 3, content: "💯 " + elementContent + " (Fallback variation 3 - API format error)" }
            ];
            resolve(fallbackVariations);
          }
        })
        .catch(function(error) {
          console.error('[AI CRO] Error calling generate-variations API:', error);
          
          // Generate fallback variations in case of API failure
          var fallbackVariations = [
            { id: 1, content: "✨ " + elementContent + " (Fallback after API error: " + error.message + ")" },
            { id: 2, content: "🚀 " + elementContent + " (Fallback after API error: " + error.message + ")" },
            { id: 3, content: "💯 " + elementContent + " (Fallback after API error: " + error.message + ")" }
          ];
          resolve(fallbackVariations);
        });
      });
    }
    
    // Display the element configuration panel
    function showElementPanel(element) {
      // Save the selected element reference
      window.AICRO.selectedElement = element;
      
      // Update the selected element info
      var selector = generateSelector(element);
      var tagName = element.tagName.toLowerCase();
      var elementText = element.textContent.trim().substring(0, 100);
      if (elementText.length === 100) elementText += '...';
      
      var elementInfoHtml = \`
        <div>Element: <strong>\${tagName}</strong></div>
        <div>Selector: <code>\${selector}</code></div>
        <div>Text: "\${elementText}"</div>
      \`;
      
      document.getElementById('aicro-selected-element-info').innerHTML = elementInfoHtml;
      
      // Auto-select appropriate element type based on tag and attributes
      var elementTypeSelect = document.getElementById('aicro-element-type');
      
      // Set default based on element
      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
        elementTypeSelect.value = 'headline';
      } else if (tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
        elementTypeSelect.value = 'subheadline';
      } else if (tagName === 'p') {
        elementTypeSelect.value = 'paragraph';
      } else if (tagName === 'button' || 
                (tagName === 'a' && (element.className.includes('btn') || element.className.includes('button')))) {
        elementTypeSelect.value = 'cta';
      } else if (tagName === 'a') {
        elementTypeSelect.value = 'link';
      } else {
        elementTypeSelect.value = 'text';
      }
      
      // Set default prompt with audience and intent if available
      var promptTemplate = "Generate 3 variations of this ";
      promptTemplate += elementTypeSelect.value + " content";
      
      if (pageSettings.audience) {
        promptTemplate += " for " + pageSettings.audience;
      }
      if (pageSettings.intent) {
        promptTemplate += " that will better " + pageSettings.intent;
      }
      promptTemplate += ".";
      
      document.getElementById('aicro-generation-prompt').value = promptTemplate;
      
      // Hide results section initially
      document.getElementById('aicro-results-section').style.display = 'none';
      
      // Show the panel
      ui.elementPanel.style.display = 'block';
      
      // Set up event listeners for the panel
      document.getElementById('aicro-panel-close').onclick = hideElementPanel;
      document.getElementById('aicro-cancel-panel').onclick = hideElementPanel;
      document.getElementById('aicro-generate').onclick = function() {
        generateVariations(element);
      };
      
      // Add listener for element type change to update prompt
      document.getElementById('aicro-element-type').onchange = function() {
        var currentPrompt = document.getElementById('aicro-generation-prompt').value;
        var selectedType = document.getElementById('aicro-element-type').value;
        
        // Replace the element type in the prompt
        var updatedPrompt = currentPrompt.replace(
          /Generate 3 variations of this (.*?) content/,
          'Generate 3 variations of this ' + selectedType + ' content'
        );
        
        document.getElementById('aicro-generation-prompt').value = updatedPrompt;
      };
    }
    
    // Hide the element configuration panel
    function hideElementPanel() {
      ui.elementPanel.style.display = 'none';
    }
    
    // Generate variations for the selected element
    function generateVariations(element) {
      // Get the prompt from the textarea
      var prompt = document.getElementById('aicro-generation-prompt').value;
      
      // Show loading indicator
      document.getElementById('aicro-generate').textContent = 'Generating...';
      document.getElementById('aicro-generate').disabled = true;
      
      // Call the API to generate variations
      generateVariationsWithAPI(element, prompt)
        .then(function(variations) {
          // Reset button
          document.getElementById('aicro-generate').textContent = 'Generate Variations';
          document.getElementById('aicro-generate').disabled = false;
          
          // Populate results
          var resultsListHtml = '';
          variations.forEach(function(variation) {
            resultsListHtml += \`
              <div class="aicro-result-item" data-id="\${variation.id}">
                \${variation.content}
              </div>
            \`;
          });
          
          document.getElementById('aicro-results-list').innerHTML = resultsListHtml;
          document.getElementById('aicro-results-section').style.display = 'block';
          
          // Add click handlers to result items
          var resultItems = document.querySelectorAll('.aicro-result-item');
          resultItems.forEach(function(item) {
            item.addEventListener('click', function() {
              // Toggle selected class
              resultItems.forEach(function(i) { i.classList.remove('selected'); });
              item.classList.add('selected');
              
              // Update apply button to show selected
              document.getElementById('aicro-generate').textContent = 'Apply Selected Variation';
              document.getElementById('aicro-generate').onclick = function() {
                var selectedVariation = item.textContent.trim();
                applyVariation(element, selectedVariation);
              };
            });
          });
        })
        .catch(function(error) {
          console.error('Failed to generate variations:', error);
          document.getElementById('aicro-generate').textContent = 'Generate Variations';
          document.getElementById('aicro-generate').disabled = false;
          document.getElementById('aicro-results-list').innerHTML = '<div style="padding: 16px; color: #ef4444;">Error generating variations. Please try again.</div>';
          document.getElementById('aicro-results-section').style.display = 'block';
        });
    }
    
    // Apply a selected variation to the element
    function applyVariation(element, variation) {
      // In a real implementation, this would call an API to save the selection
      element.textContent = variation;
      
      // Store test configuration
      var testConfig = {
        element: generateSelector(element),
        originalContent: element.innerHTML,
        selectedVariation: variation,
        audience: pageSettings.audience,
        intent: pageSettings.intent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('aicro_test_config', JSON.stringify(testConfig));
      
      // Show success message
      loadingDiv.textContent = 'Variation applied successfully!';
      loadingDiv.style.display = 'block';
      loadingDiv.style.background = '#4CAF50';
      loadingDiv.style.color = 'white';
      
      // Hide success message after a delay instead of redirecting
      setTimeout(function() {
        loadingDiv.style.display = 'none';
        hideElementPanel();
      }, 2000);
    }
    
    // Handle mouse movement
    function handleMouseMove(event) {
      // Ignore events on our UI elements
      if (event.target.closest('.aicro-selector-controls') || 
          event.target.closest('.aicro-selector-info') ||
          event.target.closest('.aicro-bottom-bar') ||
          event.target.closest('.aicro-element-panel') ||
          event.target === loadingDiv) {
        ui.highlight.style.display = 'none';
        return;
      }
      
      // Update currently highlighted element
      currentElement = event.target;
      
      // Add hover-able class for pointer cursor
      if (currentElement) {
        currentElement.classList.add('aicro-hover-able');
      }
      
      // Update highlight position
      var rect = event.target.getBoundingClientRect();
      
      ui.highlight.style.display = 'block';
      ui.highlight.style.left = rect.left + window.scrollX + 'px';
      ui.highlight.style.top = rect.top + window.scrollY + 'px';
      ui.highlight.style.width = rect.width + 'px';
      ui.highlight.style.height = rect.height + 'px';
      
      // Update info text
      var selector = generateSelector(event.target);
      var tagName = event.target.tagName.toLowerCase();
      var classes = (event.target.className && typeof event.target.className === 'string') ? 
                    '.' + event.target.className.replace(/ /g, '.') : '';
      
      ui.info.textContent = tagName + classes + ' [' + selector + ']';
    }
    
    // Handle mouse out to remove hover class
    function handleMouseOut(event) {
      if (event.target && event.target.classList) {
        event.target.classList.remove('aicro-hover-able');
      }
    }
    
    // Handle clicks
    function handleClick(event) {
      // Ignore events on our UI elements
      if (event.target.closest('.aicro-selector-controls') || 
          event.target.closest('.aicro-selector-info') ||
          event.target.closest('.aicro-bottom-bar') ||
          event.target.closest('.aicro-element-panel') ||
          event.target === loadingDiv) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      // Open the element configuration panel
      showElementPanel(event.target);
    }
    
    // Save page settings
    function savePageSettings() {
      var audience = document.getElementById('aicro-audience').value;
      var intent = document.getElementById('aicro-page-intent').value;
      
      pageSettings.audience = audience;
      pageSettings.intent = intent;
      
      // Show confirmation
      loadingDiv.textContent = 'Page settings saved!';
      loadingDiv.style.display = 'block';
      loadingDiv.style.background = '#4CAF50';
      loadingDiv.style.color = 'white';
      
      setTimeout(function() {
        loadingDiv.style.display = 'none';
      }, 2000);
    }
    
    // Stop the selector
    function stopSelector() {
      // Hide UI components
      ui.overlay.style.display = 'none';
      ui.highlight.style.display = 'none';
      ui.info.style.display = 'none';
      ui.bottomBar.style.display = 'none';
      ui.elementPanel.style.display = 'none';
      
      // Remove event handlers
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut); 
      document.removeEventListener('click', handleClick);
      
      // Remove any added classes from elements
      document.querySelectorAll('.aicro-hover-able').forEach(function(el) {
        el.classList.remove('aicro-hover-able');
      });
      
      isActive = false;
    }
    
    // Set up event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);
    
    // Set up save settings button
    document.getElementById('aicro-save-settings').addEventListener('click', savePageSettings);
    
    // Add event listener for the new exit selector button
    document.getElementById('aicro-exit-selector').addEventListener('click', function() {
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
  
  // Generate the bookmarklet URL by adding javascript: prefix and encoding
  const bookmarkletUrl = `javascript:${encodeURIComponent(bookmarkletCode)}`;
  
  // Return the bookmarklet code
  return new Response(bookmarkletUrl, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}