// This API route serves a minimal personalization loader
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

  // Serve the content directly
  const script = `
  /**
   * Cursor AI-CRO Personalization Loader (Minimal Version)
   */
  (function() {
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
        const url = \`\${state.apiBase}/api/combined-ops?op=\${endpoint}\`;
        
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