// This API route serves a minimal selector bookmarklet directly
export default function handler(req, res) {
  // Add CORS headers to support cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  res.setHeader('Content-Type', 'application/javascript');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Serve the content directly instead of redirecting
  const script = `
  /**
   * Cursor AI-CRO Selector Bookmarklet (Minimal Version)
   */
  (function() {
    // Configuration
    const apiBase = window.NEXT_PUBLIC_CURSOR_API_BASE || 'https://ai-cro-eight.vercel.app';
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
        const response = await fetch(apiBase + '/api/combined-ops?op=save-config', {
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