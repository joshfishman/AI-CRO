const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join('app', 'api', 'standalone-bookmarklet', 'route.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find all instances of JavaScript functions that set HTML content using template literals
const templatePatterns = [
  'selectorStyle.textContent = `',
  'selectorUI.innerHTML = `',
  'header.innerHTML = `',
  'content.innerHTML = `',
  'footer.innerHTML = `',
  'variationEl.innerHTML = `',
  'customVariation.innerHTML = `',
  'instructionsDialog.innerHTML = `',
  'el.innerHTML = `'
];

// Replace each pattern with properly escaped backticks
templatePatterns.forEach(pattern => {
  // Escape the pattern for use in regex
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create a regex to find the pattern and everything until the closing backtick
  const regex = new RegExp(`${escapedPattern}([\\s\\S]*?)(\`);`, 'g');
  
  // Replace with escaped backticks
  content = content.replace(regex, (match, inner) => {
    return `${pattern}${inner}\\`;
  });
});

// Save the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Backticks fixed in', filePath); 