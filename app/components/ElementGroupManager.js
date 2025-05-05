'use client';

import { useState, useEffect } from 'react';

export default function ElementGroupManager({ initialData = null }) {
  const [selectedElements, setSelectedElements] = useState([]);
  const [audienceInfo, setAudienceInfo] = useState('');
  const [intentInfo, setIntentInfo] = useState('');
  const [pageContext, setPageContext] = useState('');
  const [activeElementIndex, setActiveElementIndex] = useState(0);
  const [contentVariations, setContentVariations] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [requestIds, setRequestIds] = useState({});
  const [includeOriginal, setIncludeOriginal] = useState(true);

  // Initialize with data from bookmarklet if available
  useEffect(() => {
    if (initialData) {
      // Set audience and intent info
      if (initialData.audience) setAudienceInfo(initialData.audience);
      if (initialData.intent) setIntentInfo(initialData.intent);
      if (initialData.pageContext) setPageContext(initialData.pageContext);
      
      // Set selected elements
      if (initialData.elements && initialData.elements.length > 0) {
        setSelectedElements(initialData.elements);
      }
    }
  }, [initialData]);

  // Group elements by type for easier management
  const groupedElements = selectedElements.reduce((acc, el, index) => {
    const type = el.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push({ ...el, index });
    return acc;
  }, {});

  const handleElementSelect = (element) => {
    // Add element to selection if not already selected
    if (!selectedElements.some(el => el.selector === element.selector)) {
      setSelectedElements([...selectedElements, element]);
    }
  };

  const handleElementRemove = (index) => {
    const newElements = [...selectedElements];
    newElements.splice(index, 1);
    setSelectedElements(newElements);
    
    // Remove variations for this element
    const newVariations = { ...contentVariations };
    delete newVariations[index];
    setContentVariations(newVariations);
    
    // Remove request ID for this element
    const newRequestIds = { ...requestIds };
    delete newRequestIds[index];
    setRequestIds(newRequestIds);
    
    // Update active index if needed
    if (activeElementIndex >= newElements.length) {
      setActiveElementIndex(Math.max(0, newElements.length - 1));
    }
  };

  const selectElementGroup = (type) => {
    // Select all elements of the same type
    const elementsOfType = document.querySelectorAll(type);
    const newElements = [...selectedElements];
    
    elementsOfType.forEach(element => {
      // Generate a unique selector for this element
      const selector = generateUniqueSelector(element);
      
      // Check if this element is already selected
      if (!newElements.some(el => el.selector === selector)) {
        newElements.push({
          selector,
          originalContent: element.innerHTML,
          type: element.tagName.toLowerCase(),
          text: element.innerText || element.textContent
        });
      }
    });
    
    setSelectedElements(newElements);
  };

  const generateUniqueSelector = (element) => {
    // Simple implementation - in a real app this would be more robust
    if (element.id) return `#${element.id}`;
    
    // Try using classes
    if (element.classList && element.classList.length) {
      const classes = Array.from(element.classList).join('.');
      return `${element.tagName.toLowerCase()}.${classes}`;
    }
    
    // Fallback to tag name and position
    const siblings = Array.from(element.parentNode.children)
      .filter(node => node.tagName === element.tagName);
    
    if (siblings.length > 1) {
      const index = siblings.indexOf(element);
      return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
    }
    
    return element.tagName.toLowerCase();
  };

  const generateContentOptions = async (elementIndex) => {
    if (isGenerating) return;
    
    const element = selectedElements[elementIndex];
    if (!element) return;
    
    setIsGenerating(true);
    
    try {
      // Generate default prompt if none provided
      const elementPrompt = customPrompt || generateDefaultPrompt(element);
      
      // Call the content generation API
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          elementType: element.type,
          originalContent: element.text || '',
          audience: audienceInfo,
          intent: intentInfo,
          pageContext: pageContext,
          customPrompt: elementPrompt,
          numVariations: 6,
          includeOriginalContent: includeOriginal
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content variations');
      }
      
      const data = await response.json();
      
      // Store the request ID for tracking
      setRequestIds(prev => ({
        ...prev,
        [elementIndex]: data.requestId
      }));
      
      // Store the variations
      setContentVariations({
        ...contentVariations,
        [elementIndex]: data.variations
      });
    } catch (error) {
      console.error('Error generating content options:', error);
      // Fallback to mock data in case of error
      const mockVariations = await simulateContentGeneration(element);
      setContentVariations({
        ...contentVariations,
        [elementIndex]: mockVariations
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDefaultPrompt = (element) => {
    const elementType = element.type;
    const originalText = element.text || '';
    
    let prompt = `Generate 6 alternative versions for this ${elementType} element`;
    
    // Add original text
    if (originalText) {
      prompt += `:\n\n"${originalText.trim()}"`;
    }
    
    // Add audience if available
    if (audienceInfo) {
      prompt += `\n\nTarget audience: ${audienceInfo}`;
    }
    
    // Add intent if available
    if (intentInfo) {
      prompt += `\n\nContent goal: ${intentInfo}`;
    }
    
    // Add page context if available
    if (pageContext) {
      prompt += `\n\nPage context: ${pageContext}`;
    }
    
    // Add guidance based on element type
    if (elementType.includes('h1') || elementType.includes('h2') || elementType.includes('h3')) {
      prompt += '\n\nMake the headings compelling, concise, and action-oriented.';
    } else if (elementType === 'button' || elementType === 'a') {
      prompt += '\n\nMake the text clear, compelling, and action-oriented. Keep it concise.';
    } else if (elementType === 'p') {
      prompt += '\n\nMaintain approximately the same length while making the content more engaging and persuasive.';
    }
    
    return prompt;
  };

  // Fallback function for simulating content generation
  const simulateContentGeneration = async (element) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock variations based on element type
    const type = element.type;
    const originalText = element.text || '';
    
    let variations = [];
    
    if (includeOriginal) {
      variations.push({ id: 'original', content: originalText });
    }
    
    if (type === 'h1' || type === 'h2' || type === 'h3') {
      variations = variations.concat([
        { id: 'v1', content: `Discover ${originalText}` },
        { id: 'v2', content: `Experience Amazing ${originalText}` },
        { id: 'v3', content: `Transform Your Business with ${originalText}` },
      ]);
    } else if (type === 'p') {
      variations = variations.concat([
        { id: 'v1', content: `${originalText} Learn how our solutions can help you succeed.` },
        { id: 'v2', content: `Thousands of customers trust our ${originalText} services.` },
        { id: 'v3', content: `The future of ${originalText} is here. Are you ready?` },
      ]);
    } else if (type === 'button' || type === 'a') {
      variations = variations.concat([
        { id: 'v1', content: 'Start Now' },
        { id: 'v2', content: 'Get Started' },
        { id: 'v3', content: 'Try It Free' },
      ]);
    } else {
      variations = variations.concat([
        { id: 'v1', content: `${originalText} - Option 1` },
        { id: 'v2', content: `${originalText} - Option 2` },
        { id: 'v3', content: `${originalText} - Option 3` },
      ]);
    }
    
    return variations;
  };

  const applyContentVariation = (elementIndex, variationId) => {
    // In a real implementation, this would update the actual element and save the change
    console.log(`Applying variation ${variationId} to element ${elementIndex}`);
    
    // Track which request ID was used for the selected variation
    const requestId = requestIds[elementIndex];
    if (requestId) {
      console.log(`Using request ID: ${requestId}`);
    }
    
    // Add some visual feedback that the variation was selected
    const element = document.querySelector(`.variation-item-${variationId}`);
    if (element) {
      element.classList.add('bg-green-50', 'border-green-200');
      setTimeout(() => {
        element.classList.remove('bg-green-50', 'border-green-200');
      }, 1000);
    }
  };

  const handleGenerateAll = async () => {
    // Generate variations for all selected elements
    for (let i = 0; i < selectedElements.length; i++) {
      await generateContentOptions(i);
    }
  };

  // Set custom prompt when element selection changes
  useEffect(() => {
    if (selectedElements[activeElementIndex]) {
      setCustomPrompt(generateDefaultPrompt(selectedElements[activeElementIndex]));
    }
  }, [activeElementIndex, selectedElements, audienceInfo, intentInfo, pageContext]);

  // Auto-generate content for the first element when data is loaded from bookmarklet
  useEffect(() => {
    if (initialData && selectedElements.length > 0 && Object.keys(contentVariations).length === 0) {
      // Wait a moment to ensure UI is fully rendered
      const timer = setTimeout(() => {
        generateContentOptions(0);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [initialData, selectedElements]);

  const saveChanges = () => {
    // In a real implementation, this would save the changes to the database
    alert('Changes saved successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Page-Level Targeting</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Who is your target audience? (e.g., business professionals, parents, tech enthusiasts)"
              value={audienceInfo}
              onChange={(e) => setAudienceInfo(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Intent
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="What's your goal? (e.g., drive sales, educate visitors, increase sign-ups)"
              value={intentInfo}
              onChange={(e) => setIntentInfo(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Context
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Provide context about this page (e.g., product page for premium headphones, landing page for software)"
              value={pageContext}
              onChange={(e) => setPageContext(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Selected Elements ({selectedElements.length})</h2>
          <div className="space-x-2">
            <button 
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => selectElementGroup('h1, h2, h3')}
            >
              Select Headings
            </button>
            <button 
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => selectElementGroup('button, a.btn, .cta')}
            >
              Select Buttons
            </button>
            <button 
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => selectElementGroup('p')}
            >
              Select Paragraphs
            </button>
          </div>
        </div>
        
        {selectedElements.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">No elements selected. Use the selector tool to choose elements.</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-100 text-sm font-medium p-2">
              <div>Element</div>
              <div className="col-span-2">Content</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {selectedElements.map((element, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-4 p-2 items-center ${index === activeElementIndex ? 'bg-blue-50' : ''}`}
                >
                  <div className="text-sm font-medium">{element.type}</div>
                  <div className="col-span-2 text-sm truncate">{element.text || 'No text content'}</div>
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => setActiveElementIndex(index)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800 text-sm"
                      onClick={() => handleElementRemove(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedElements.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Content Variations</h2>
            <div className="space-x-2">
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={includeOriginal}
                  onChange={(e) => setIncludeOriginal(e.target.checked)}
                />
                <span className="ml-2">Include original content</span>
              </label>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                onClick={handleGenerateAll}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate All Variations'}
              </button>
            </div>
          </div>
          
          {selectedElements[activeElementIndex] && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  Editing {selectedElements[activeElementIndex].type} Element
                  {requestIds[activeElementIndex] && (
                    <span className="ml-2 text-xs text-gray-500">
                      Request ID: {requestIds[activeElementIndex]}
                    </span>
                  )}
                </h3>
                <div className="flex space-x-2">
                  {Array.from({ length: selectedElements.length }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-8 h-8 rounded-full ${idx === activeElementIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveElementIndex(idx)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Content
                </label>
                <div className="border rounded-md p-3 bg-gray-50">
                  {selectedElements[activeElementIndex].text || 'No text content'}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generation Prompt
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Content Variations
                  </label>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => generateContentOptions(activeElementIndex)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate New Variations'}
                  </button>
                </div>
                
                {contentVariations[activeElementIndex] ? (
                  <div className="space-y-3">
                    {contentVariations[activeElementIndex].map(variation => (
                      <div 
                        key={variation.id} 
                        className={`variation-item-${variation.id} border rounded-md p-3 hover:bg-gray-50 transition-colors
                          ${variation.id === 'original' ? 'border-blue-200 bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            {variation.id === 'original' && (
                              <span className="inline-block mr-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Original
                              </span>
                            )}
                            {variation.content}
                          </div>
                          <button 
                            className="text-sm text-green-600 hover:text-green-800"
                            onClick={() => applyContentVariation(activeElementIndex, variation.id)}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      No variations generated yet. Click "Generate New Variations" to create options.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={saveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
} 