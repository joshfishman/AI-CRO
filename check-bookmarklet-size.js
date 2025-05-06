const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join('app', 'api', 'standalone-bookmarklet', 'route.js');

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Find bookmarklet script
const scriptStartMarker = 'const bookmarkletScript = `';
const scriptEndMarker = '`;';

const scriptStart = content.indexOf(scriptStartMarker);
const scriptEnd = content.indexOf(scriptEndMarker, scriptStart + scriptStartMarker.length);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Could not find bookmarklet script in the file');
  process.exit(1);
}

// Extract the script content
const scriptContent = content.substring(
  scriptStart + scriptStartMarker.length,
  scriptEnd
);

// Create a mock of the final bookmarklet code
const bookmarkletCode = `javascript:${encodeURIComponent(scriptContent)}`;

console.log('Original script length:', scriptContent.length, 'characters');
console.log('Encoded bookmarklet length:', bookmarkletCode.length, 'characters');

// Chrome's bookmark URL limit is around 65,536 characters
// Many browsers have much lower limits (~2,000 characters is common)
if (bookmarkletCode.length > 2000) {
  console.log('WARNING: Bookmarklet is too large for most browsers');
  
  if (bookmarkletCode.length > 10000) {
    console.log('SEVERE WARNING: Bookmarklet is extremely large and will likely fail in all browsers');
  }
}

// Write a sample shorter version to a file for testing
fs.writeFileSync('shorter-bookmarklet.js', `
// Create a simplified version of the bookmarklet that loads the full script from the server
javascript:(function(){
  const script = document.createElement('script');
  script.src = "${process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-cro-three.vercel.app'}/api/selector-module";
  script.onload = () => console.log('AI CRO selector module loaded');
  script.onerror = (e) => console.error('Error loading AI CRO selector module', e);
  document.head.appendChild(script);
})();
`, 'utf8');

console.log('Wrote shortened version to shorter-bookmarklet.js'); 