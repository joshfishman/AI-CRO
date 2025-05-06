const fs = require('fs');
const path = require('path');

// Path to the client script route file
const filePath = path.join('app', 'api', 'client-script', 'route.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the section with the instructions
const oldInstructions = `
        <h2>After creating variations:</h2>
        <p>Add the client script to your website:</p>
        <div class="code">&lt;script src="\${host}/api/client-script"&gt;&lt;/script&gt;</div>
        
        <p>And initialize it:</p>
        <div class="code">&lt;script&gt;
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.debug(true) // Enable debug mode (remove in production)
      .init();
  });
&lt;/script&gt;</div>
`;

// New instructions with header mention and no DOMContentLoaded
const newInstructions = `
        <h2>After creating variations:</h2>
        <p>Add the client script to your website <strong>header</strong>:</p>
        <div class="code">&lt;script src="\${host}/api/client-script"&gt;&lt;/script&gt;</div>
        
        <p>And initialize it right after (no need to wait for DOMContentLoaded):</p>
        <div class="code">&lt;script&gt;
  AICRO.debug(true) // Enable debug mode (remove in production)
    .init();
&lt;/script&gt;</div>
`;

// Replace the instructions
content = content.replace(oldInstructions, newInstructions);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Updated instructions in', filePath); 