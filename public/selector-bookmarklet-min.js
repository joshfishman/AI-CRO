/**
 * Cursor AI-CRO Selector Bookmarklet (Minimized Version)
 * This version uses the combined API endpoint to reduce serverless function count
 */
(function() {
  // Configuration
  const apiBase = window.NEXT_PUBLIC_CURSOR_API_BASE || 'https://ai-cro-eight.vercel.app';
  const editorKey = window.CURSOR_EDITOR_KEY || prompt('Enter your Cursor Editor Key:');
  
  if (!editorKey) {
    alert('Editor key is required to use the selector tool');
    return;
  }
  
  // Make sure we don't initialize twice
  if (window.__cursorSelectorActive) {
    alert('Selector tool is already active. Refresh the page to start over.');
    return;
  }
  
  window.__cursorSelectorActive = true;
  
  // Get workspace from URL or use default
  const urlParams = new URLSearchParams(window.location.search);
  let currentWorkspace = urlParams.get('workspace') || 'default';
  
  // Helper function for API requests
  async function apiRequest(operation, method = 'GET', data = null) {
    const url = `${apiBase}/api/combined-ops?op=${operation}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': editorKey
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
      console.error(`Error in ${operation} request:`, err);
      alert(`Error: ${err.message}`);
      return null;
    }
  }
  
  // Create basic UI for element selection
  const ui = document.createElement('div');
  ui.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  
  ui.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
      <h3 style="margin: 0; font-size: 16px;">Cursor AI-CRO Selector</h3>
      <button id="close-selector" style="border: none; background: none; cursor: pointer; font-size: 16px;">✕</button>
    </div>
    <p style="margin: 0 0 10px;">Click on page elements to select for personalization</p>
    <div id="selected-elements" style="max-height: 300px; overflow-y: auto;"></div>
    <button id="save-config" style="margin-top: 15px; background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Save Config</button>
  `;
  
  document.body.appendChild(ui);
  
  // Track selected elements
  const selectedElements = [];
  
  // Handle clicks on the page
  document.addEventListener('click', function(event) {
    // Ignore clicks on our UI
    if (event.target.closest('div') === ui) return;
    
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Get the clicked element
    const el = event.target;
    
    // Generate a selector
    const selector = el.id ? 
      `#${el.id}` : 
      el.className ? 
        `.${el.className.replace(/\s+/g, '.')}` : 
        el.tagName.toLowerCase();
    
    // Get default content
    const defaultContent = el.innerText || el.textContent || '';
    
    // Add to our selected elements
    selectedElements.push({
      selector,
      prompt: "Personalize this content",
      default: defaultContent
    });
    
    // Highlight the element
    el.style.outline = '2px solid #0070f3';
    
    // Update the UI
    updateSelectedElementsList();
  }, true);
  
  // Update the list of selected elements in the UI
  function updateSelectedElementsList() {
    const list = document.getElementById('selected-elements');
    list.innerHTML = '';
    
    if (selectedElements.length === 0) {
      list.innerHTML = '<p>No elements selected yet</p>';
      return;
    }
    
    selectedElements.forEach((element, index) => {
      const item = document.createElement('div');
      item.style.cssText = 'margin-bottom: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px;';
      
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between;">
          <strong>${element.selector}</strong>
          <button class="remove-element" data-index="${index}" style="border: none; background: none; cursor: pointer; color: red;">✕</button>
        </div>
        <input type="text" class="prompt-input" data-index="${index}" value="${element.prompt}" style="width: 100%; margin-top: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
      `;
      
      list.appendChild(item);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-element').forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        selectedElements.splice(index, 1);
        updateSelectedElementsList();
      });
    });
    
    // Add event listeners to prompt inputs
    document.querySelectorAll('.prompt-input').forEach(input => {
      input.addEventListener('input', function() {
        const index = parseInt(this.dataset.index);
        selectedElements[index].prompt = this.value;
      });
    });
  }
  
  // Handle save button click
  document.getElementById('save-config').addEventListener('click', async function() {
    if (selectedElements.length === 0) {
      alert('Please select at least one element first');
      return;
    }
    
    // Save the configuration
    const result = await apiRequest('save-config', 'POST', {
      url: window.location.pathname,
      selectors: selectedElements,
      workspace: currentWorkspace
    });
    
    if (result) {
      alert('Configuration saved successfully!');
      // Clean up
      selectedElements.forEach(el => {
        const elements = document.querySelectorAll(el.selector);
        elements.forEach(element => {
          element.style.outline = '';
        });
      });
      cleanup();
    }
  });
  
  // Handle close button click
  document.getElementById('close-selector').addEventListener('click', cleanup);
  
  // Cleanup function
  function cleanup() {
    document.body.removeChild(ui);
    window.__cursorSelectorActive = false;
  }
  
  // Initialize
  updateSelectedElementsList();
})(); 