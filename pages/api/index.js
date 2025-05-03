/**
 * Main API handler for all operations
 * Routes requests based on the path parameter to reduce serverless function count
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the route from the path or query parameter
  const path = req.query.path || '';
  
  try {
    switch (path) {
      case 'personalization-loader.js':
        return servePersonalizationLoader(req, res);
      case 'selector-bookmarklet.js':
        return serveSelectorBookmarklet(req, res);
      case 'get-config':
        return handleGetConfig(req, res);
      case 'save-config':
        return handleSaveConfig(req, res);
      case 'get-user-type':
        return handleGetUserType(req, res);
      case 'get-variants':
      case 'get-cached-variants':
        return handleGetVariants(req, res);
      case 'generate-variants':
        return handleGenerateVariants(req, res);
      case 'record-event':
        return handleRecordEvent(req, res);
      case 'cache-variants':
        return handleCacheVariants(req, res);
      case 'get-test-results':
        return handleGetTestResults(req, res);
      case 'get-bookmarklet':
        return handleGetBookmarklet(req, res);
      default:
        // If no path specified, handle as combined-ops with "op" parameter
        if (req.query.op) {
          // Use the op value as the path and try again
          return handler({
            ...req,
            query: {
              ...req.query, 
              path: req.query.op
            }
          }, res);
        }
        
        return res.status(400).json({ error: 'Unknown operation. Use the "path" parameter to specify an operation.' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
}

// Serve the personalization loader script
function servePersonalizationLoader(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  
  const script = `
  /**
   * Cursor AI-CRO Personalization Loader (Minimal Version)
   */
  (function() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if already initialized
    if (window.__cursorPersonalizationLoaded) return;
    window.__cursorPersonalizationLoaded = true;
    
    // Basic state
    const state = {
      config: null,
      userType: 'unknown',
      apiBase: null,
      workspaceId: null,
      pageUrl: window.location.pathname
    };
    
    // Get script tag and configuration
    const scriptTag = document.currentScript || 
      document.querySelector('script[src*="personalization-loader.js"]');
    
    if (!scriptTag) {
      console.error('Could not find Cursor AI-CRO script tag');
      return;
    }

    // Get API base from script src
    const scriptSrc = scriptTag.src || '';
    const srcUrl = new URL(scriptSrc);
    state.apiBase = \`\${srcUrl.protocol}//\${srcUrl.host}\`;
    
    // Get workspace ID from data attribute or URL
    const urlParams = new URLSearchParams(window.location.search);
    state.workspaceId = scriptTag.getAttribute('data-cursor-workspace') || 
                      urlParams.get('workspace') || 
                      'default';
    
    console.log(\`Cursor AI-CRO: Initializing personalization (workspace: \${state.workspaceId})\`);
    
    // Get user type
    getUserType()
      .then(getConfig)
      .then(applyPersonalization)
      .catch(error => {
        console.error('Cursor AI-CRO: Error:', error);
      });
    
    // API request helper
    async function apiRequest(endpoint, method = 'GET', data = null) {
      try {
        const url = \`\${state.apiBase}/api?path=\${endpoint}\`;
        
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        if (data) {
          options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(\`API error: \${response.status}\`);
        }
        return await response.json();
      } catch (err) {
        console.error(\`Error in \${endpoint} request:\`, err);
        return null;
      }
    }
    
    // Get user type
    async function getUserType() {
      const result = await apiRequest('get-user-type', 'POST', {
        cookies: document.cookie,
        url: state.pageUrl,
        workspace: state.workspaceId
      });
      
      if (result && result.type) {
        state.userType = result.type;
        return result.type;
      }
      
      return 'unknown';
    }
    
    // Get config
    async function getConfig() {
      const result = await apiRequest('get-config', 'POST', {
        url: state.pageUrl,
        workspace: state.workspaceId
      });
      
      if (result && result.selectors) {
        state.config = result;
        return result;
      }
      
      return null;
    }
    
    // Apply personalization
    async function applyPersonalization() {
      if (!state.config || !state.config.selectors || state.config.selectors.length === 0) {
        console.log('No personalization config found');
        return;
      }
      
      try {
        const variants = await apiRequest('get-variants', 'POST', {
          userType: state.userType,
          workspace: state.workspaceId,
          selectors: state.config.selectors
        });
        
        if (!variants) return;
        
        // Apply variants
        for (const selector in variants) {
          try {
            const variant = variants[selector];
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 0) continue;
            
            elements.forEach(el => {
              // Apply content based on type
              if (variant.contentType === 'image' && el.tagName === 'IMG') {
                el.src = variant.content;
              } else if (variant.contentType === 'link' && el.tagName === 'A') {
                el.href = variant.content;
              } else if (variant.contentType === 'bg-image') {
                el.style.backgroundImage = \`url('\${variant.content}')\`;
              } else {
                el.innerHTML = variant.content;
              }
              
              el.setAttribute('data-personalized', 'true');
            });
          } catch (err) {
            console.error(\`Error applying variant for \${selector}:\`, err);
          }
        }
        
        // Record impression
        apiRequest('record-event', 'POST', {
          event: 'impression',
          userType: state.userType,
          url: state.pageUrl,
          workspace: state.workspaceId
        });
        
        console.log('Personalization applied');
      } catch (err) {
        console.error('Error applying personalization:', err);
      }
    }
  })();`;
  
  return res.status(200).send(script);
}

// Serve the selector bookmarklet script
function serveSelectorBookmarklet(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  
  // Return script as a string - don't execute on server
  const script = `
  /**
   * Cursor AI-CRO Selector Bookmarklet (Minimal Version)
   */
  (function() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Configuration
    const apiBase = window.NEXT_PUBLIC_CURSOR_API_BASE || 'https://ai-cro-three.vercel.app';
    const editorKey = window.CURSOR_EDITOR_KEY || prompt('Enter your Cursor Editor Key:');
    
    if (!editorKey) {
      alert('Editor key is required to use the selector tool');
      return;
    }
    
    if (window.__cursorSelectorActive) {
      alert('Selector tool is already active. Refresh the page to start over.');
      return;
    }
    
    window.__cursorSelectorActive = true;
    
    // Get workspace from URL or use default
    const urlParams = new URLSearchParams(window.location.search);
    let workspace = urlParams.get('workspace') || 'default';
    
    // Create UI
    const ui = document.createElement('div');
    ui.style.cssText = 'position:fixed;top:20px;right:20px;width:300px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.2);z-index:999999;font-family:sans-serif;padding:15px;';
    ui.innerHTML = '<h2 style="margin-top:0">AI Personalization</h2><p>Click on elements to select them</p><div id="selected-elements"></div><button id="save-button" style="background:#0070f3;color:#fff;border:none;padding:8px 16px;border-radius:4px;margin-top:10px;cursor:pointer;">Save Config</button><button id="close-button" style="margin-left:10px;background:#eee;border:none;padding:8px 16px;border-radius:4px;margin-top:10px;cursor:pointer;">Cancel</button>';
    document.body.appendChild(ui);
    
    const selectedElements = [];
    
    // Handle element selection
    document.addEventListener('click', function(event) {
      if (event.target.closest('div') === ui) return;
      event.preventDefault();
      event.stopPropagation();
      
      const el = event.target;
      const selector = el.id ? '#' + el.id : el.tagName.toLowerCase();
      const content = el.textContent.trim();
      
      selectedElements.push({
        selector,
        prompt: 'Personalize this content',
        default: content
      });
      
      el.style.outline = '2px solid #0070f3';
      updateUI();
    }, true);
    
    function updateUI() {
      const list = document.getElementById('selected-elements');
      list.innerHTML = '';
      
      selectedElements.forEach((el, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'margin-bottom:10px;padding:8px;background:#f5f5f5;border-radius:4px;';
        item.innerHTML = '<div style="font-weight:bold">' + el.selector + '</div><input type="text" value="' + el.prompt + '" style="width:100%;margin-top:5px;padding:5px;" data-index="' + i + '">';
        list.appendChild(item);
      });
    }
    
    // Save button
    document.getElementById('save-button').addEventListener('click', async function() {
      if (selectedElements.length === 0) {
        alert('Please select at least one element');
        return;
      }
      
      try {
        const response = await fetch(apiBase + '/api?path=save-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': editorKey
          },
          body: JSON.stringify({
            url: window.location.pathname,
            selectors: selectedElements,
            workspace: workspace
          })
        });
        
        if (response.ok) {
          alert('Configuration saved!');
          cleanup();
        } else {
          throw new Error('Failed to save: ' + response.status);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
    
    // Close button
    document.getElementById('close-button').addEventListener('click', cleanup);
    
    function cleanup() {
      document.body.removeChild(ui);
      selectedElements.forEach(el => {
        const elements = document.querySelectorAll(el.selector);
        elements.forEach(e => e.style.outline = '');
      });
      window.__cursorSelectorActive = false;
    }
  })();`;
  
  return res.status(200).send(script);
}

// Handle get-bookmarklet request
function handleGetBookmarklet(req, res) {
  const baseUrl = req.query.baseUrl || '';
  const editorKey = req.query.editorKey || '';
  
  // Generate bookmarklet code with correct API path format
  const bookmarkletCode = `javascript:(function(){var script=document.createElement('script');script.src='${baseUrl}/api?path=selector-bookmarklet.js';document.body.appendChild(script);})();`;
  
  return res.status(200).send(bookmarkletCode);
}

// Simple placeholder implementation for the function handlers
// In a real implementation, these would contain the actual logic or import from modules
async function handleGetConfig(req, res) {
  // Mock empty response 
  return res.json({ selectors: [] });
}

async function handleSaveConfig(req, res) {
  return res.json({ success: true });
}

async function handleGetUserType(req, res) {
  return res.json({ type: 'unknown', segments: [] });
}

async function handleGetVariants(req, res) {
  return res.json({ variants: {} });
}

async function handleGenerateVariants(req, res) {
  return res.json({ variants: {} });
}

async function handleRecordEvent(req, res) {
  return res.json({ success: true });
}

async function handleCacheVariants(req, res) {
  return res.json({ success: true });
}

async function handleGetTestResults(req, res) {
  return res.json({ 
    totalImpressions: 0, 
    totalCtaClicks: 0,
    results: {}
  });
} 