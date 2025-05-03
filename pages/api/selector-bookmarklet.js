export default function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const script = `
    (function() {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '9999';
      overlay.style.cursor = 'crosshair';
      document.body.appendChild(overlay);

      // Create selection indicator
      const indicator = document.createElement('div');
      indicator.style.position = 'fixed';
      indicator.style.border = '2px solid #0070f3';
      indicator.style.backgroundColor = 'rgba(0, 112, 243, 0.1)';
      indicator.style.pointerEvents = 'none';
      indicator.style.zIndex = '10000';
      document.body.appendChild(indicator);

      // Create control panel
      const panel = document.createElement('div');
      panel.style.position = 'fixed';
      panel.style.top = '20px';
      panel.style.right = '20px';
      panel.style.backgroundColor = 'white';
      panel.style.padding = '10px';
      panel.style.borderRadius = '4px';
      panel.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      panel.style.zIndex = '10001';
      document.body.appendChild(panel);

      // Add buttons to panel
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save Selection';
      saveButton.style.marginRight = '10px';
      saveButton.style.padding = '5px 10px';
      saveButton.style.backgroundColor = '#0070f3';
      saveButton.style.color = 'white';
      saveButton.style.border = 'none';
      saveButton.style.borderRadius = '4px';
      saveButton.style.cursor = 'pointer';
      panel.appendChild(saveButton);

      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.style.padding = '5px 10px';
      cancelButton.style.backgroundColor = '#dc2626';
      cancelButton.style.color = 'white';
      cancelButton.style.border = 'none';
      cancelButton.style.borderRadius = '4px';
      cancelButton.style.cursor = 'pointer';
      panel.appendChild(cancelButton);

      let selectedElement = null;

      // Handle mouse movement
      overlay.addEventListener('mousemove', (e) => {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element !== overlay && element !== indicator && element !== panel) {
          const rect = element.getBoundingClientRect();
          indicator.style.top = rect.top + 'px';
          indicator.style.left = rect.left + 'px';
          indicator.style.width = rect.width + 'px';
          indicator.style.height = rect.height + 'px';
          selectedElement = element;
        }
      });

      // Handle click
      overlay.addEventListener('click', (e) => {
        if (selectedElement) {
          const path = getElementPath(selectedElement);
          const data = {
            domain: '${domain}',
            element: {
              path: path,
              tag: selectedElement.tagName.toLowerCase(),
              text: selectedElement.textContent.trim(),
              attributes: getElementAttributes(selectedElement)
            }
          };

          // Send data to server
          fetch('https://ai-cro-three.vercel.app/api/save-selection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then(response => response.json())
          .then(result => {
            alert('Element saved successfully!');
            cleanup();
          })
          .catch(error => {
            alert('Failed to save element: ' + error.message);
            cleanup();
          });
        }
      });

      // Handle cancel
      cancelButton.addEventListener('click', cleanup);

      // Cleanup function
      function cleanup() {
        document.body.removeChild(overlay);
        document.body.removeChild(indicator);
        document.body.removeChild(panel);
      }

      // Helper function to get element path
      function getElementPath(element) {
        const path = [];
        while (element && element !== document.body) {
          let selector = element.tagName.toLowerCase();
          if (element.id) {
            selector += '#' + element.id;
          } else if (element.className) {
            selector += '.' + element.className.split(' ').join('.');
          }
          path.unshift(selector);
          element = element.parentElement;
        }
        return path.join(' > ');
      }

      // Helper function to get element attributes
      function getElementAttributes(element) {
        const attributes = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          attributes[attr.name] = attr.value;
        }
        return attributes;
      }
    })();
  `;

  res.setHeader('Content-Type', 'application/javascript');
  res.send(script);
} 