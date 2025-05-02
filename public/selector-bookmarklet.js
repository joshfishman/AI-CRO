/**
 * Cursor AI-CRO Selector Bookmarklet
 * This script allows users to select elements on a webpage and configure personalization
 * with multivariate testing support for different user types and content formats.
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
  
  // Available user types for targeting
  const USER_TYPES = [
    { id: 'all', name: 'All Users' },
    { id: 'new-visitor', name: 'New Visitors' },
    { id: 'returning', name: 'Returning Visitors' },
    { id: 'customer', name: 'Customers' },
    { id: 'prospect', name: 'Prospects' },
    { id: 'lead', name: 'Leads' },
    { id: 'opportunity', name: 'Opportunities' }
  ];
  
  // Content type options
  const CONTENT_TYPES = [
    { id: 'text', name: 'Text Content' },
    { id: 'link', name: 'Link URL' },
    { id: 'image', name: 'Image' },
    { id: 'bg-image', name: 'Background Image' }
  ];

  // Maximum number of variants allowed per element
  const MAX_VARIANTS = 4;
  
  // Create the UI for the selector tool
  const createSelectorUI = () => {
    // Create main container
    const container = document.createElement('div');
    container.id = 'cursor-selector-ui';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 15px;
      color: #333;
      max-height: 90vh;
      overflow-y: auto;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; font-size: 16px;">Cursor AI-CRO Selector</h3>
        <button id="cursor-selector-close" style="border: none; background: none; cursor: pointer; font-size: 16px;">✕</button>
      </div>
      <p style="margin: 0 0 15px; font-size: 14px;">Click on elements to select them for personalization. Add up to 4 variants for multivariate testing.</p>
    `;
    
    // Create selected elements list
    const selectedList = document.createElement('div');
    selectedList.id = 'cursor-selector-list';
    selectedList.style.cssText = `
      max-height: 60vh;
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
    
    // Determine content type based on element
    let contentType = determineContentType(event.target);
    
    // Get element default content based on type
    const defaultContent = getElementContent(event.target, contentType);
    
    // Create a configuration object for this element
    const elementConfig = {
      selector,
      element: event.target,
      contentType,
      prompt: '',
      default: defaultContent,
      // Initialize with first variant as the default
      variants: [
        { content: defaultContent, userType: 'all', isDefault: true, name: 'Default' }
      ]
    };
    
    // Add to selected elements
    selectedElements.push(elementConfig);
    
    // Highlight the selected element
    event.target.style.outline = '2px solid #0070f3';
    event.target.style.outlineOffset = '2px';
    
    // Add to the UI list
    addElementToList(elementConfig);
  };
  
  // Determine content type based on the element
  const determineContentType = (element) => {
    if (element.tagName === 'A') {
      return 'link';
    } else if (element.tagName === 'IMG') {
      return 'image';
    } else {
      // Check if element has background image
      const style = window.getComputedStyle(element);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        return 'bg-image';
      }
    }
    return 'text';
  };
  
  // Get element content based on content type
  const getElementContent = (element, contentType) => {
    switch (contentType) {
      case 'link':
        return element.href || '';
      case 'image':
        return element.src || '';
      case 'bg-image':
        const style = window.getComputedStyle(element);
        return style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
      case 'text':
      default:
        return element.textContent.trim();
    }
  };
  
  // Add selected element to the UI list
  const addElementToList = (config) => {
    const list = document.getElementById('cursor-selector-list');
    const index = selectedElements.length - 1;
    
    const item = document.createElement('div');
    item.dataset.index = index;
    item.classList.add('cursor-element-item');
    item.style.cssText = `
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      font-size: 14px;
      border-left: 3px solid #0070f3;
    `;
    
    // Element header with selector and content type selector
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    header.innerHTML = `
      <strong style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">
        ${truncateString(config.selector, 30)}
      </strong>
      <select class="cursor-content-type" data-index="${index}" style="padding: 4px; border-radius: 4px; border: 1px solid #ddd;">
        ${CONTENT_TYPES.map(type => `
          <option value="${type.id}" ${config.contentType === type.id ? 'selected' : ''}>
            ${type.name}
          </option>
        `).join('')}
      </select>
    `;
    
    // Original content display
    const originalContent = document.createElement('div');
    originalContent.style.cssText = `
      margin-bottom: 12px;
      padding: 8px;
      background: #eee;
      border-radius: 4px;
      font-size: 12px;
      word-break: break-word;
    `;
    
    // Display content based on type
    originalContent.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">Original:</div>
      <div>${displayContentPreview(config.default, config.contentType)}</div>
    `;
    
    // Variants section
    const variantsSection = document.createElement('div');
    variantsSection.classList.add('cursor-variants-section');
    variantsSection.dataset.index = index;
    
    // AI prompt for text variants
    const promptSection = document.createElement('div');
    promptSection.style.cssText = `
      margin-bottom: 12px;
      ${config.contentType !== 'text' ? 'display: none;' : ''}
    `;
    promptSection.classList.add('cursor-prompt-section');
    promptSection.innerHTML = `
      <label style="display: block; margin-bottom: 4px;"><strong>AI Generation Prompt:</strong></label>
      <textarea 
        data-index="${index}" 
        class="cursor-prompt-input" 
        style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ddd; margin-bottom: 8px;"
        placeholder="Enter prompt for AI personalization..."
      >${config.prompt}</textarea>
      <button 
        data-index="${index}" 
        class="cursor-generate-btn" 
        style="background: #4CAF50; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;"
      >
        Generate Variants with AI
      </button>
    `;
    
    // Variants list
    const variantsList = document.createElement('div');
    variantsList.classList.add('cursor-variants-list');
    variantsList.dataset.index = index;
    
    // Add initial variants (just the default for now)
    variantsList.appendChild(createVariantItem(config.variants[0], 0, index));
    
    // Add variant button
    const addVariantBtn = document.createElement('button');
    addVariantBtn.dataset.index = index;
    addVariantBtn.classList.add('cursor-add-variant-btn');
    addVariantBtn.style.cssText = `
      background: #0070f3;
      color: white;
      border: none;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-top: 8px;
      ${config.variants.length >= MAX_VARIANTS ? 'display: none;' : ''}
    `;
    addVariantBtn.textContent = 'Add Variant';
    addVariantBtn.addEventListener('click', () => addVariant(index));
    
    // Remove element button
    const removeBtn = document.createElement('button');
    removeBtn.dataset.index = index;
    removeBtn.classList.add('cursor-remove-btn');
    removeBtn.style.cssText = `
      background: #f44336;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-top: 15px;
      width: 100%;
    `;
    removeBtn.textContent = 'Remove Element';
    removeBtn.addEventListener('click', () => removeSelectedElement(index));
    
    // Assemble all parts
    variantsSection.appendChild(promptSection);
    variantsSection.appendChild(variantsList);
    variantsSection.appendChild(addVariantBtn);
    
    item.appendChild(header);
    item.appendChild(originalContent);
    item.appendChild(variantsSection);
    item.appendChild(removeBtn);
    
    list.appendChild(item);
    
    // Add event listeners for content type change
    const contentTypeSelect = item.querySelector('.cursor-content-type');
    contentTypeSelect.addEventListener('change', (e) => {
      const newContentType = e.target.value;
      const index = parseInt(e.target.dataset.index);
      changeContentType(index, newContentType);
    });
    
    // Add event listener for prompt
    const promptInput = item.querySelector('.cursor-prompt-input');
    if (promptInput) {
      promptInput.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        selectedElements[index].prompt = e.target.value;
      });
    }
    
    // Add event listener for generate button
    const generateBtn = item.querySelector('.cursor-generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        generateVariants(index);
      });
    }
  };
  
  // Create HTML for a variant item
  const createVariantItem = (variant, variantIndex, elementIndex) => {
    const item = document.createElement('div');
    item.classList.add('cursor-variant-item');
    item.dataset.elementIndex = elementIndex;
    item.dataset.variantIndex = variantIndex;
    item.style.cssText = `
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    `;
    
    // Get the content type for this element
    const contentType = selectedElements[elementIndex].contentType;
    
    // Create header with user type dropdown
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `;
    
    // Build the variant name/number display
    const variantName = variant.name || `Variant ${variantIndex + 1}`;
    const isDefault = variant.isDefault;
    
    header.innerHTML = `
      <div style="display: flex; align-items: center;">
        <strong style="margin-right: 8px;">${variantName}</strong>
        ${isDefault ? '<span style="background: #e3f2fd; color: #0d47a1; padding: 2px 4px; border-radius: 3px; font-size: 10px;">Default</span>' : ''}
      </div>
      <select class="cursor-variant-user-type" style="padding: 2px; border-radius: 3px; border: 1px solid #ddd; font-size: 12px;">
        ${USER_TYPES.map(type => `
          <option value="${type.id}" ${variant.userType === type.id ? 'selected' : ''}>
            ${type.name}
          </option>
        `).join('')}
      </select>
    `;
    
    // Create content field based on content type
    const contentField = document.createElement('div');
    contentField.classList.add('cursor-variant-content');
    
    // For text or link, use a textarea
    if (contentType === 'text' || contentType === 'link') {
      contentField.innerHTML = `
        <textarea class="cursor-variant-text" style="width: 100%; height: 60px; padding: 6px; border-radius: 4px; border: 1px solid #ddd; margin-bottom: 8px; font-size: 12px;">${variant.content || ''}</textarea>
      `;
    } 
    // For images, provide URL input field and upload option
    else if (contentType === 'image' || contentType === 'bg-image') {
      contentField.innerHTML = `
        <div style="margin-bottom: 8px;">
          <input type="text" class="cursor-variant-image-url" placeholder="Image URL" value="${variant.content || ''}" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px;">
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <button class="cursor-variant-image-upload" style="background: #f5f5f5; border: 1px solid #ddd; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Upload Image</button>
          <input type="file" class="cursor-variant-image-file" accept="image/*" style="display: none;">
          <div class="cursor-variant-image-preview" style="width: 60px; height: 40px; background-size: cover; background-position: center; border: 1px solid #ddd; ${variant.content ? `background-image: url('${variant.content}');` : ''}"></div>
        </div>
      `;
    }
    
    // Variant actions
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    `;
    
    // Only show remove button for non-default variants
    if (!variant.isDefault) {
      actions.innerHTML = `
        <button class="cursor-variant-remove" style="background: #f44336; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">Remove</button>
      `;
    } else {
      actions.innerHTML = `<div></div>`;
    }
    
    // Set as default variant button (only for non-default variants)
    if (!variant.isDefault) {
      const defaultBtn = document.createElement('button');
      defaultBtn.classList.add('cursor-variant-set-default');
      defaultBtn.textContent = 'Set as Default';
      defaultBtn.style.cssText = `
        background: #f5f5f5;
        border: 1px solid #ddd;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
      `;
      actions.appendChild(defaultBtn);
    }
    
    // Assemble the variant item
    item.appendChild(header);
    item.appendChild(contentField);
    item.appendChild(actions);
    
    // Add event listeners
    // User type change
    const userTypeSelect = item.querySelector('.cursor-variant-user-type');
    if (userTypeSelect) {
      userTypeSelect.addEventListener('change', (e) => {
        const elementIndex = parseInt(item.dataset.elementIndex);
        const variantIndex = parseInt(item.dataset.variantIndex);
        selectedElements[elementIndex].variants[variantIndex].userType = e.target.value;
      });
    }
    
    // Text/link content change
    const textArea = item.querySelector('.cursor-variant-text');
    if (textArea) {
      textArea.addEventListener('input', (e) => {
        const elementIndex = parseInt(item.dataset.elementIndex);
        const variantIndex = parseInt(item.dataset.variantIndex);
        selectedElements[elementIndex].variants[variantIndex].content = e.target.value;
      });
    }
    
    // Image URL change
    const imageUrl = item.querySelector('.cursor-variant-image-url');
    if (imageUrl) {
      imageUrl.addEventListener('input', (e) => {
        const elementIndex = parseInt(item.dataset.elementIndex);
        const variantIndex = parseInt(item.dataset.variantIndex);
        selectedElements[elementIndex].variants[variantIndex].content = e.target.value;
        
        // Update preview
        const preview = item.querySelector('.cursor-variant-image-preview');
        if (preview) {
          preview.style.backgroundImage = `url('${e.target.value}')`;
        }
      });
    }
    
    // Image upload
    const uploadBtn = item.querySelector('.cursor-variant-image-upload');
    const fileInput = item.querySelector('.cursor-variant-image-file');
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });
      
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target.result;
          
          // Update the preview
          const preview = item.querySelector('.cursor-variant-image-preview');
          if (preview) {
            preview.style.backgroundImage = `url('${base64}')`;
          }
          
          // TODO: Add code to upload image to cloud storage
          // For now, we'll just use the base64 string directly
          const elementIndex = parseInt(item.dataset.elementIndex);
          const variantIndex = parseInt(item.dataset.variantIndex);
          selectedElements[elementIndex].variants[variantIndex].content = base64;
          
          // Update URL field
          const imageUrl = item.querySelector('.cursor-variant-image-url');
          if (imageUrl) {
            imageUrl.value = base64;
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Remove variant button
    const removeBtn = item.querySelector('.cursor-variant-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const elementIndex = parseInt(item.dataset.elementIndex);
        const variantIndex = parseInt(item.dataset.variantIndex);
        removeVariant(elementIndex, variantIndex);
      });
    }
    
    // Set as default button
    const defaultBtn = item.querySelector('.cursor-variant-set-default');
    if (defaultBtn) {
      defaultBtn.addEventListener('click', () => {
        const elementIndex = parseInt(item.dataset.elementIndex);
        const variantIndex = parseInt(item.dataset.variantIndex);
        setAsDefaultVariant(elementIndex, variantIndex);
      });
    }
    
    return item;
  };
  
  // Add a new variant to an element
  const addVariant = (elementIndex) => {
    const element = selectedElements[elementIndex];
    
    // Check if already at max variants
    if (element.variants.length >= MAX_VARIANTS) {
      alert(`Maximum ${MAX_VARIANTS} variants allowed per element`);
      return;
    }
    
    // Create a new variant based on the default
    const newVariant = {
      content: element.default,
      userType: 'all',
      isDefault: false,
      name: `Variant ${element.variants.length + 1}`
    };
    
    // Add to the element's variants
    element.variants.push(newVariant);
    
    // Add to the UI
    const variantsList = document.querySelector(`.cursor-variants-list[data-index="${elementIndex}"]`);
    if (variantsList) {
      variantsList.appendChild(createVariantItem(newVariant, element.variants.length - 1, elementIndex));
    }
    
    // Hide add button if at max
    if (element.variants.length >= MAX_VARIANTS) {
      const addBtn = document.querySelector(`.cursor-add-variant-btn[data-index="${elementIndex}"]`);
      if (addBtn) {
        addBtn.style.display = 'none';
      }
    }
  };
  
  // Remove a variant
  const removeVariant = (elementIndex, variantIndex) => {
    const element = selectedElements[elementIndex];
    
    // Cannot remove the default variant
    if (element.variants[variantIndex].isDefault) {
      return;
    }
    
    // Remove from the array
    element.variants.splice(variantIndex, 1);
    
    // Update the UI - recreate all variants to ensure indexes are correct
    refreshVariantsList(elementIndex);
    
    // Show add button if below max
    if (element.variants.length < MAX_VARIANTS) {
      const addBtn = document.querySelector(`.cursor-add-variant-btn[data-index="${elementIndex}"]`);
      if (addBtn) {
        addBtn.style.display = 'block';
      }
    }
  };
  
  // Set a variant as the default
  const setAsDefaultVariant = (elementIndex, variantIndex) => {
    const element = selectedElements[elementIndex];
    
    // Update the isDefault flag on all variants
    element.variants.forEach((variant, idx) => {
      variant.isDefault = (idx === variantIndex);
    });
    
    // Also update the default content
    element.default = element.variants[variantIndex].content;
    
    // Refresh the UI
    refreshVariantsList(elementIndex);
  };
  
  // Refresh the variants list UI
  const refreshVariantsList = (elementIndex) => {
    const variantsList = document.querySelector(`.cursor-variants-list[data-index="${elementIndex}"]`);
    if (!variantsList) return;
    
    // Clear existing variants
    variantsList.innerHTML = '';
    
    // Add all variants
    const element = selectedElements[elementIndex];
    element.variants.forEach((variant, idx) => {
      variantsList.appendChild(createVariantItem(variant, idx, elementIndex));
    });
  };
  
  // Change content type for an element
  const changeContentType = (elementIndex, newContentType) => {
    const element = selectedElements[elementIndex];
    
    // Update the content type
    element.contentType = newContentType;
    
    // Show/hide the prompt section based on content type
    const promptSection = document.querySelector(`.cursor-element-item[data-index="${elementIndex}"] .cursor-prompt-section`);
    if (promptSection) {
      promptSection.style.display = newContentType === 'text' ? 'block' : 'none';
    }
    
    // Refresh variants with appropriate input types
    refreshVariantsList(elementIndex);
  };
  
  // Generate variants using the OpenAI API
  const generateVariants = async (elementIndex) => {
    const element = selectedElements[elementIndex];
    const prompt = element.prompt;
    
    if (!prompt) {
      alert('Please enter a prompt for AI generation');
      return;
    }
    
    try {
      // Update UI to show generating state
      const generateBtn = document.querySelector(`.cursor-generate-btn[data-index="${elementIndex}"]`);
      if (generateBtn) {
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
      }
      
      // Call the API to generate variants
      const response = await fetch(`${apiBase}/api/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': editorKey
        },
        body: JSON.stringify({
          selectors: [{
            selector: element.selector,
            prompt: element.prompt,
            default: element.default
          }],
          userType: 'all',
          generateVariants: true,
          variantCount: MAX_VARIANTS - 1 // Generate additional variants (one is already the default)
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If no variants were returned
      if (!data.variants || !data.variants.length) {
        throw new Error('No variants generated');
      }
      
      // Keep the default variant
      const defaultVariant = element.variants.find(v => v.isDefault);
      
      // Create new variants from API response
      element.variants = [defaultVariant];
      
      // Add the generated variants
      data.variants.forEach((content, idx) => {
        if (idx < MAX_VARIANTS - 1) { // Ensure we don't exceed max variants
          element.variants.push({
            content,
            userType: 'all',
            isDefault: false,
            name: `Variant ${idx + 2}` // +2 because idx is 0-based and we already have the default variant
          });
        }
      });
      
      // Refresh the UI
      refreshVariantsList(elementIndex);
      
      // Check if we need to hide the add button
      if (element.variants.length >= MAX_VARIANTS) {
        const addBtn = document.querySelector(`.cursor-add-variant-btn[data-index="${elementIndex}"]`);
        if (addBtn) {
          addBtn.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error generating variants:', error);
      alert(`Failed to generate variants: ${error.message}`);
    } finally {
      // Reset UI
      const generateBtn = document.querySelector(`.cursor-generate-btn[data-index="${elementIndex}"]`);
      if (generateBtn) {
        generateBtn.textContent = 'Generate Variants with AI';
        generateBtn.disabled = false;
      }
    }
  };
  
  // Helper function to display content preview
  const displayContentPreview = (content, contentType) => {
    if (!content) return '<em>Empty</em>';
    
    switch (contentType) {
      case 'link':
        return `<a href="${content}" target="_blank" style="word-break: break-all;">${truncateString(content, 30)}</a>`;
      case 'image':
      case 'bg-image':
        return `<div style="display: flex; align-items: center;">
          <div style="width: 40px; height: 30px; background-image: url('${content}'); background-size: cover; background-position: center; border: 1px solid #ddd; margin-right: 5px;"></div>
          <span style="word-break: break-all;">${truncateString(content, 25)}</span>
        </div>`;
      case 'text':
      default:
        return `<span style="word-break: break-word;">${truncateString(content, 50)}</span>`;
    }
  };
  
  // Remove a selected element
  const removeSelectedElement = (index) => {
    // Remove the highlight from the page element
    const element = selectedElements[index].element;
    if (element) {
      element.style.outline = '';
    }
    
    // Remove from the array
    selectedElements.splice(index, 1);
    
    // Remove from the UI
    const item = document.querySelector(`.cursor-element-item[data-index="${index}"]`);
    if (item) {
      item.remove();
    }
    
    // Update the indexes of the remaining elements in the UI
    document.querySelectorAll('.cursor-element-item').forEach((item, i) => {
      item.dataset.index = i;
      
      // Update all child elements that have a data-index attribute
      item.querySelectorAll('[data-index]').forEach(child => {
        child.dataset.index = i;
      });
      
      // Update variant items
      item.querySelectorAll('.cursor-variant-item').forEach(variant => {
        variant.dataset.elementIndex = i;
      });
    });
  };
  
  // Create a CSS selector for an element
  const generateSelector = (element) => {
    // Use ID if available
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Try with classes
    if (element.className) {
      const classes = element.className.trim().split(/\s+/).join('.');
      if (classes) {
        return `${element.tagName.toLowerCase()}.${classes}`;
      }
    }
    
    // Fall back to tag name and position
    const parent = element.parentNode;
    const children = parent.children;
    let nthChild = 1;
    
    for (let i = 0; i < children.length; i++) {
      if (children[i] === element) {
        break;
      }
      if (children[i].tagName === element.tagName) {
        nthChild++;
      }
    }
    
    return `${element.tagName.toLowerCase()}:nth-of-type(${nthChild})`;
  };
  
  // Save the configuration to the API
  const saveConfiguration = async () => {
    if (!selectedElements.length) {
      alert('Please select at least one element to personalize');
      return;
    }
    
    try {
      // Prepare the selectors data
      const selectors = selectedElements.map(element => {
        // Simplified object ready for storage
        return {
          selector: element.selector,
          contentType: element.contentType,
          prompt: element.prompt,
          default: element.default,
          variants: element.variants.map(v => ({
            content: v.content,
            userType: v.userType,
            isDefault: v.isDefault,
            name: v.name
          }))
        };
      });
      
      // Save to API
      const response = await fetch(`${apiBase}/api/save-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': editorKey
        },
        body: JSON.stringify({
          url: window.location.pathname,
          selectors,
          workspaceId: 'default' // TODO: Allow customizing the workspace
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      alert('Configuration saved successfully!');
      cleanupSelectorTool();
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Failed to save configuration: ${error.message}`);
    }
  };
  
  // Clean up the selector tool
  const cleanupSelectorTool = () => {
    // Remove highlights from all selected elements
    selectedElements.forEach(config => {
      if (config.element) {
        config.element.style.outline = '';
      }
    });
    
    // Remove event listener
    document.removeEventListener('click', handleElementClick, true);
    
    // Remove the UI
    const container = document.getElementById('cursor-selector-ui');
    if (container) {
      container.remove();
    }
    
    // Reset the flag
    window.__cursorSelectorActive = false;
  };
  
  // Helper function to truncate long strings
  const truncateString = (str, maxLength) => {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };
  
  // Initialize the selector tool
  const initializeSelectorTool = () => {
    // Create the UI
    createSelectorUI();
    
    // Add click event listener to select elements
    document.addEventListener('click', handleElementClick, true);
  };
  
  // Start the selector tool
  initializeSelectorTool();
})(); 