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
  const url = new URL(request.url);
  const hostOverride = url.searchParams.get('host');
  const host = hostOverride || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    process.env.NEXT_PUBLIC_SITE_URL || url.origin);

  const selectorModule = `
    (function() {
      // Simple Selector Module for AI CRO with no external dependencies
      console.log('[AI CRO] Selector module loaded');
      
      // Prevent multiple initializations
      if (window.AICRO_SELECTOR_ACTIVE) {
        console.log('[AI CRO] Selector already active');
        alert('AI CRO Selector is already active on this page');
        return;
      }
      
      // Mark as active
      window.AICRO_SELECTOR_ACTIVE = true;
      
      // Initialize AICRO if not already done
      window.AICRO = window.AICRO || {};
      
      // Show loading notice
      const notice = document.createElement('div');
      notice.style.position = 'fixed';
      notice.style.bottom = '20px';
      notice.style.right = '20px';
      notice.style.background = '#4CAF50';
      notice.style.color = 'white';
      notice.style.padding = '12px 24px';
      notice.style.borderRadius = '4px';
      notice.style.zIndex = '99999';
      notice.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      notice.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      notice.textContent = 'AI CRO Selector activated - click on elements to select them';
      document.body.appendChild(notice);
      
      // Add basic styles
      const style = document.createElement('style');
      style.textContent = \`
        .aicro-highlight {
          outline: 2px dashed #3b82f6 !important;
          cursor: pointer !important;
        }
        .aicro-selected {
          outline: 2px solid #10b981 !important;
        }
        .aicro-selector-ui {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          font-family: system-ui, -apple-system, sans-serif;
          z-index: 999999;
        }
        .aicro-header {
          padding: 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
        }
        .aicro-content {
          padding: 16px;
        }
        .aicro-footer {
          padding: 12px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
        }
        .aicro-button {
          padding: 8px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .aicro-cancel {
          background: #e5e7eb;
          color: #374151;
          margin-right: 8px;
        }
        .aicro-item {
          padding: 8px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
        }
        .aicro-item-tag {
          color: #4b5563;
        }
        .aicro-remove {
          color: #ef4444;
          cursor: pointer;
          background: none;
          border: none;
        }
        .aicro-field {
          width: 100%;
          padding: 8px;
          margin-bottom: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .aicro-label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .aicro-items {
          border: 1px solid #eee;
          border-radius: 4px;
          max-height: 150px;
          overflow-y: auto;
          margin-bottom: 16px;
        }
      \`;
      document.head.appendChild(style);
      
      // Create UI
      const ui = document.createElement('div');
      ui.className = 'aicro-selector-ui';
      ui.innerHTML = \`
        <div class="aicro-header">
          <h3 style="margin:0;font-size:16px;">AI CRO Selector</h3>
          <button id="aicro-close" style="background:none;border:none;font-size:18px;cursor:pointer;">×</button>
        </div>
        <div class="aicro-content">
          <p style="margin-top:0;">Click on elements to select them for personalization.</p>
          
          <label class="aicro-label">Selected elements (<span id="aicro-count">0</span>)</label>
          <div id="aicro-items" class="aicro-items">
            <div style="padding:16px;text-align:center;color:#9ca3af;">No elements selected</div>
          </div>
          
          <label class="aicro-label">Target Audience</label>
          <input type="text" id="aicro-audience" class="aicro-field" placeholder="Who is this content for?">
          
          <label class="aicro-label">Page Intent</label>
          <input type="text" id="aicro-intent" class="aicro-field" placeholder="What's the goal of this page?">
        </div>
        <div class="aicro-footer">
          <button id="aicro-cancel" class="aicro-button aicro-cancel">Cancel</button>
          <button id="aicro-done" class="aicro-button">Done</button>
        </div>
      \`;
      
      // Add UI after a short delay to make sure the page is ready
      setTimeout(() => {
        document.body.appendChild(ui);
        setupEventListeners();
      }, 500);
      
      // Selected elements tracking
      const selectedElements = [];
      
      // Setup all event listeners
      function setupEventListeners() {
        // Close button
        document.getElementById('aicro-close').addEventListener('click', cleanup);
        
        // Cancel button
        document.getElementById('aicro-cancel').addEventListener('click', cleanup);
        
        // Done button
        document.getElementById('aicro-done').addEventListener('click', () => {
          const audience = document.getElementById('aicro-audience').value;
          const intent = document.getElementById('aicro-intent').value;
          
          // Save page settings if AICRO client is available
          if (window.AICRO && typeof window.AICRO.savePageSettings === 'function') {
            window.AICRO.savePageSettings({
              audience,
              intent
            });
            console.log('[AI CRO] Saved page settings:', { audience, intent });
          }
          
          alert('Selection completed. Settings saved.');
          cleanup();
        });
        
        // Document click for element selection
        document.addEventListener('click', handleDocumentClick, true);
        
        // Mouse over for highlighting
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
      }
      
      // Handle clicks on the document
      function handleDocumentClick(e) {
        // Ignore clicks on our UI
        if (isOurElement(e.target)) {
          return;
        }
        
        // Prevent default for regular elements
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle selection of the element
        toggleSelection(e.target);
        
        return false;
      }
      
      // Handle mouse over for highlighting
      function handleMouseOver(e) {
        if (!isOurElement(e.target) && !isSelected(e.target)) {
          e.target.classList.add('aicro-highlight');
        }
      }
      
      // Handle mouse out for removing highlight
      function handleMouseOut(e) {
        e.target.classList.remove('aicro-highlight');
      }
      
      // Check if an element is part of our UI
      function isOurElement(el) {
        return el.closest('.aicro-selector-ui') !== null || 
               el.classList.contains('aicro-selected');
      }
      
      // Check if element is already selected
      function isSelected(el) {
        return el.classList.contains('aicro-selected');
      }
      
      // Toggle selection of an element
      function toggleSelection(el) {
        // If already selected, remove it
        if (isSelected(el)) {
          el.classList.remove('aicro-selected');
          const index = selectedElements.findIndex(item => item.element === el);
          if (index !== -1) {
            selectedElements.splice(index, 1);
          }
        } else {
          // Otherwise add it
          el.classList.add('aicro-selected');
          el.classList.remove('aicro-highlight');
          
          // Generate a selector string
          const selector = generateSelector(el);
          
          // Add to our selected elements
          selectedElements.push({
            element: el,
            selector: selector,
            tagName: el.tagName.toLowerCase()
          });
        }
        
        // Update the UI
        updateSelectedElementsUI();
      }
      
      // Generate a CSS selector for an element
      function generateSelector(el) {
        // If it has an ID, use that
        if (el.id) {
          return '#' + el.id;
        }
        
        // If it has classes, use the first one
        if (el.classList.length > 0) {
          const classes = Array.from(el.classList)
            .filter(c => !c.startsWith('aicro-'));
          
          if (classes.length > 0) {
            return el.tagName.toLowerCase() + '.' + classes[0];
          }
        }
        
        // If it has a data attribute, use that
        for (const attr of el.attributes) {
          if (attr.name.startsWith('data-') && attr.name !== 'data-aicro') {
            return el.tagName.toLowerCase() + '[' + attr.name + '="' + attr.value + '"]';
          }
        }
        
        // Last resort: use tag name and position
        const parent = el.parentNode;
        if (parent) {
          const children = Array.from(parent.children);
          const index = children.indexOf(el);
          return el.tagName.toLowerCase() + ':nth-child(' + (index + 1) + ')';
        }
        
        // Fallback
        return el.tagName.toLowerCase();
      }
      
      // Update the UI with selected elements
      function updateSelectedElementsUI() {
        const countEl = document.getElementById('aicro-count');
        const itemsEl = document.getElementById('aicro-items');
        
        // Update count
        countEl.textContent = selectedElements.length;
        
        // Update items
        if (selectedElements.length === 0) {
          itemsEl.innerHTML = '<div style="padding:16px;text-align:center;color:#9ca3af;">No elements selected</div>';
        } else {
          itemsEl.innerHTML = selectedElements.map((item, index) => {
            const truncatedSelector = item.selector.length > 25 
              ? item.selector.substring(0, 22) + '...' 
              : item.selector;
              
            return \`
              <div class="aicro-item" data-index="\${index}">
                <span class="aicro-item-tag">\${item.tagName}</span>
                <span title="\${item.selector}">\${truncatedSelector}</span>
                <button class="aicro-remove" data-index="\${index}">✕</button>
              </div>
            \`;
          }).join('');
          
          // Add remove event listeners
          const removeButtons = itemsEl.querySelectorAll('.aicro-remove');
          removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const index = parseInt(e.target.getAttribute('data-index'));
              const itemToRemove = selectedElements[index];
              
              if (itemToRemove && itemToRemove.element) {
                itemToRemove.element.classList.remove('aicro-selected');
              }
              
              selectedElements.splice(index, 1);
              updateSelectedElementsUI();
            });
          });
        }
      }
      
      // Clean up when done
      function cleanup() {
        // Remove UI elements
        if (ui && ui.parentNode) {
          ui.parentNode.removeChild(ui);
        }
        
        if (notice && notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
        
        // Remove event listeners
        document.removeEventListener('click', handleDocumentClick, true);
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        
        // Remove classes from selected elements
        selectedElements.forEach(item => {
          if (item.element) {
            item.element.classList.remove('aicro-selected');
            item.element.classList.remove('aicro-highlight');
          }
        });
        
        // Mark as inactive
        window.AICRO_SELECTOR_ACTIVE = false;
        
        console.log('[AI CRO] Selector deactivated');
      }
    })();
  `;

  return new Response(selectorModule, { headers });
} 