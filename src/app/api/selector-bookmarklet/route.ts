import { NextResponse } from 'next/server';

export async function GET() {
  const bookmarkletScript = `
    (function() {
      // Add styles to highlight elements
      const style = document.createElement('style');
      style.textContent = \`
        .ai-cro-highlight {
          outline: 2px dashed red !important;
          cursor: pointer !important;
        }
        .ai-cro-selector-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 20px;
          z-index: 999999;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          max-width: 400px;
          font-family: sans-serif;
        }
        .ai-cro-selector-panel h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }
        .ai-cro-selector-panel pre {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          overflow: auto;
          max-height: 100px;
        }
        .ai-cro-selector-panel button {
          background: #4285f4;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }
        .ai-cro-selector-panel .close {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          font-size: 18px;
        }
      \`;
      document.head.appendChild(style);

      // Create selector panel
      const panel = document.createElement('div');
      panel.className = 'ai-cro-selector-panel';
      panel.innerHTML = \`
        <span class="close">&times;</span>
        <h3>Element Selector</h3>
        <p>Hover over elements and click to select</p>
        <div>
          <h4>CSS Selector:</h4>
          <pre id="ai-cro-css-selector"></pre>
          <button id="ai-cro-copy-button">Copy Selector</button>
        </div>
      \`;
      document.body.appendChild(panel);

      // Setup close button
      panel.querySelector('.close').addEventListener('click', function() {
        cleanupAndExit();
      });

      // Setup copy button
      panel.querySelector('#ai-cro-copy-button').addEventListener('click', function() {
        const selectorText = document.getElementById('ai-cro-css-selector').textContent;
        navigator.clipboard.writeText(selectorText).then(function() {
          alert('Selector copied to clipboard!');
        });
      });

      // Variables to track current element
      let currentElement = null;

      // Function to generate unique selector
      function generateSelector(el) {
        if (!el) return '';
        if (el.id) return '#' + el.id;
        
        // Try to create a selector with classes
        if (el.className) {
          const classes = el.className.split(' ').filter(c => c && !c.includes('ai-cro-'));
          if (classes.length > 0) {
            // Get tag name and first class
            return el.tagName.toLowerCase() + '.' + classes[0];
          }
        }
        
        // Try with tag and position among siblings
        const siblings = Array.from(el.parentNode.children).filter(child => 
          child.tagName === el.tagName
        );
        
        if (siblings.length > 1) {
          const index = siblings.indexOf(el);
          return el.tagName.toLowerCase() + ':nth-of-type(' + (index + 1) + ')';
        }
        
        return el.tagName.toLowerCase();
      }

      // Function to get full CSS path
      function getCssPath(el) {
        let path = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
          let selector = generateSelector(el);
          path.unshift(selector);
          el = el.parentNode;
          
          // Stop at body
          if (el === document.body) {
            path.unshift('body');
            break;
          }
        }
        
        return path.join(' > ');
      }

      // Mouseover handler
      function handleMouseOver(e) {
        // Ignore our own UI elements
        if (e.target.closest('.ai-cro-selector-panel')) return;
        
        // Clear previous highlight
        if (currentElement) {
          currentElement.classList.remove('ai-cro-highlight');
        }
        
        // Highlight current element
        currentElement = e.target;
        currentElement.classList.add('ai-cro-highlight');
        
        e.stopPropagation();
      }

      // Click handler
      function handleClick(e) {
        // Ignore our own UI elements
        if (e.target.closest('.ai-cro-selector-panel')) return;
        
        const selector = getCssPath(e.target);
        document.getElementById('ai-cro-css-selector').textContent = selector;
        
        e.preventDefault();
        e.stopPropagation();
      }

      // Function to clean up
      function cleanupAndExit() {
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('click', handleClick, true);
        
        if (currentElement) {
          currentElement.classList.remove('ai-cro-highlight');
        }
        
        panel.remove();
        style.remove();
      }

      // Add event listeners
      document.addEventListener('mouseover', handleMouseOver, true);
      document.addEventListener('click', handleClick, true);
      
      // Exit on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          cleanupAndExit();
        }
      });
    })();
  `;

  return new NextResponse(bookmarkletScript, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
} 