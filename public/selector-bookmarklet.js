/**
 * Cursor AI-CRO Selector Bookmarklet
 * This script allows users to select elements on a webpage and configure personalization
 * for those elements by setting up prompts and default values.
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
  
  // Create the UI for the selector tool
  const createSelectorUI = () => {
    // Create main container
    const container = document.createElement('div');
    container.id = 'cursor-selector-ui';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 15px;
      color: #333;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; font-size: 16px;">Cursor AI-CRO Selector</h3>
        <button id="cursor-selector-close" style="border: none; background: none; cursor: pointer; font-size: 16px;">✕</button>
      </div>
      <p style="margin: 0 0 15px; font-size: 14px;">Click on elements to select them for personalization.</p>
    `;
    
    // Create selected elements list
    const selectedList = document.createElement('div');
    selectedList.id = 'cursor-selector-list';
    selectedList.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 15px;
      border-top: 1px solid #eee;
      padding-top: 10px;
    `;
    
    // Create action buttons
    const actions = document.createElement('div');
    actions.innerHTML = `
      <button id="cursor-selector-save" style="background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Save Config</button>
      <button id="cursor-selector-cancel" style="background: #f5f5f5; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
    `;
    
    // Assemble UI components
    container.appendChild(header);
    container.appendChild(selectedList);
    container.appendChild(actions);
    document.body.appendChild(container);
    
    // Add event listeners
    document.getElementById('cursor-selector-close').addEventListener('click', cleanupSelectorTool);
    document.getElementById('cursor-selector-cancel').addEventListener('click', cleanupSelectorTool);
    document.getElementById('cursor-selector-save').addEventListener('click', saveConfiguration);
  };
  
  // Global state to track selected elements
  const selectedElements = [];
  
  // Function to handle clicking on page elements
  const handleElementClick = (event) => {
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Don't select elements from our own UI
    if (event.target.closest('#cursor-selector-ui')) {
      return;
    }
    
    // Generate a unique selector for the clicked element
    const selector = generateSelector(event.target);
    
    // Get element text content as default
    const defaultContent = event.target.textContent.trim();
    
    // Create a configuration object for this element
    const elementConfig = {
      selector,
      element: event.target,
      prompt: '',
      default: defaultContent
    };
    
    // Add to selected elements
    selectedElements.push(elementConfig);
    
    // Highlight the selected element
    event.target.style.outline = '2px solid #0070f3';
    event.target.style.outlineOffset = '2px';
    
    // Add to the UI list
    addElementToList(elementConfig);
  };
  
  // Add selected element to the UI list
  const addElementToList = (config) => {
    const list = document.getElementById('cursor-selector-list');
    const index = selectedElements.length - 1;
    
    const item = document.createElement('div');
    item.style.cssText = `
      margin-bottom: 15px;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
      font-size: 14px;
    `;
    
    item.innerHTML = `
      <div style="margin-bottom: 8px;">
        <strong>Element:</strong> ${truncateString(config.selector, 30)}
      </div>
      <div style="margin-bottom: 8px;">
        <strong>Default:</strong> ${truncateString(config.default, 30)}
      </div>
      <div style="margin-bottom: 8px;">
        <label style="display: block; margin-bottom: 4px;"><strong>Prompt:</strong></label>
        <textarea 
          data-index="${index}" 
          class="cursor-prompt-input" 
          style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ddd;"
          placeholder="Enter prompt for AI personalization..."
        ></textarea>
      </div>
      <button 
        data-index="${index}" 
        class="cursor-remove-btn" 
        style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;"
      >
        Remove
      </button>
    `;
    
    list.appendChild(item);
    
    // Add event listeners
    const promptInput = item.querySelector('.cursor-prompt-input');
    promptInput.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      selectedElements[index].prompt = e.target.value;
    });
    
    const removeBtn = item.querySelector('.cursor-remove-btn');
    removeBtn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeSelectedElement(index);
    });
  };
  
  // Remove a selected element
  const removeSelectedElement = (index) => {
    // Remove highlight from the element
    const config = selectedElements[index];
    if (config.element) {
      config.element.style.outline = '';
      config.element.style.outlineOffset = '';
    }
    
    // Remove from the array
    selectedElements.splice(index, 1);
    
    // Rebuild the UI list (simpler than trying to update indices)
    rebuildElementList();
  };
  
  // Rebuild the element list UI
  const rebuildElementList = () => {
    const list = document.getElementById('cursor-selector-list');
    list.innerHTML = '';
    
    selectedElements.forEach((config, index) => {
      // Update index in the config
      config.index = index;
      addElementToList(config);
    });
  };
  
  // Generate a CSS selector for the clicked element
  const generateSelector = (element) => {
    // If element has an ID, use that
    if (element.id) {
      return `#${element.id}`;
    }
    
    // If element has a unique class combination, use that
    if (element.classList.length > 0) {
      const classSelector = `.${Array.from(element.classList).join('.')}`;
      if (document.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }
    
    // Otherwise use the tag name with nth-child
    let selector = element.tagName.toLowerCase();
    let current = element;
    
    // Add classes if they exist
    if (element.classList.length > 0) {
      selector += `.${Array.from(element.classList).join('.')}`;
    }
    
    // If parent exists, get the position among siblings
    if (current.parentNode && current.parentNode.children.length > 1) {
      const index = Array.from(current.parentNode.children).indexOf(current) + 1;
      selector += `:nth-child(${index})`;
    }
    
    return selector;
  };
  
  // Save the configuration to the server
  const saveConfiguration = async () => {
    if (selectedElements.length === 0) {
      alert('Please select at least one element first');
      return;
    }
    
    // Check if all prompts are filled
    const emptyPrompts = selectedElements.filter(el => !el.prompt.trim());
    if (emptyPrompts.length > 0) {
      alert('Please fill in all prompts before saving');
      return;
    }
    
    // Prepare data for saving
    const selectors = selectedElements.map(({ selector, prompt, default: defaultText }) => ({
      selector,
      prompt,
      default: defaultText
    }));
    
    try {
      // Get the URL path for the current page
      const urlPath = window.location.pathname;
      
      // Make API request to save the configuration
      const response = await fetch(`${apiBase}/api/save-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': editorKey
        },
        body: JSON.stringify({
          url: urlPath,
          selectors
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.saved) {
        alert('Configuration saved successfully! Add the Cursor AI-CRO loader script to your site to enable personalization.');
        cleanupSelectorTool();
      } else {
        alert(`Error saving configuration: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Error saving configuration: ${error.message}`);
    }
  };
  
  // Helper to truncate long strings
  const truncateString = (str, maxLength) => {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };
  
  // Clean up the selector tool
  const cleanupSelectorTool = () => {
    // Remove UI
    const ui = document.getElementById('cursor-selector-ui');
    if (ui) {
      document.body.removeChild(ui);
    }
    
    // Remove event listener
    document.removeEventListener('click', handleElementClick, true);
    
    // Remove highlights
    selectedElements.forEach(config => {
      if (config.element) {
        config.element.style.outline = '';
        config.element.style.outlineOffset = '';
      }
    });
    
    // Reset global state
    window.__cursorSelectorActive = false;
  };
  
  // Initialize the selector tool
  const initSelectorTool = () => {
    // Create UI
    createSelectorUI();
    
    // Add click handler to the document
    document.addEventListener('click', handleElementClick, true);
    
    // Add info to console
    console.log('Cursor AI-CRO Selector tool initialized. Click on elements to select them for personalization.');
  };
  
  // Start the tool
  initSelectorTool();
})(); 