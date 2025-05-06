# HelloHelpr Webflow Integration Guide for AI CRO

This guide provides specific instructions for integrating AI CRO with the HelloHelpr Webflow site.

## What's Not Working

We've identified the following issues with the current integration:

1. The script fails to load with CORS errors
2. The script URL is not accessible from hellohelpr.webflow.io
3. There are syntax errors in the implemented code

## Step-by-Step Fix

### 1. Update the Script Tag

Replace your current script tag with our improved version:

```html
<script src="https://ai-cro-three.vercel.app/api/aicro-script"></script>
```

### 2. Add Proper Initialization

Add this code to your site's custom code (after the script above):

```html
<script>
  // Wait for the document to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Check if AICRO was loaded correctly
    if (window.AICRO && typeof window.AICRO.init === 'function') {
      // Initialize with debug enabled
      AICRO.debug(true).init();
      console.log('AI CRO initialized successfully!');
    } else {
      console.error('AICRO not loaded correctly. Attempting to reload.');
      
      // Try to load the script again
      var script = document.createElement('script');
      script.src = 'https://ai-cro-three.vercel.app/api/aicro-script';
      script.onload = function() {
        if (window.AICRO) {
          AICRO.debug(true).init();
          console.log('AI CRO loaded and initialized on second attempt!');
        }
      };
      document.head.appendChild(script);
    }
  });
</script>
```

### 3. Use the Improved Bookmarklet

Use our enhanced bookmarklet with better error handling:

1. Open this URL: [https://ai-cro-three.vercel.app/api/aicro-script?bookmarklet=true](https://ai-cro-three.vercel.app/api/aicro-script?bookmarklet=true)
2. Drag the "AI CRO Selector" button to your bookmarks bar
3. Navigate to your HelloHelpr site
4. Click the bookmarklet to activate the element selector
5. A debug panel will appear showing the loading process and any errors

### 4. Check for Common Webflow Issues

The most common issues with Webflow sites are:

1. **Script placement**: Make sure the scripts are added in the correct order in the Custom Code section
2. **Editor mode**: Test in published mode, not the Webflow editor
3. **URL correctness**: Double-check for typos in the URLs (aicro-script not aicro-scrip)
4. **Third-party blockers**: Ad blockers or security tools might be blocking the scripts

### 5. HelloHelpr-Specific Settings

For the HelloHelpr site, we recommend the following settings:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.AICRO) {
      AICRO.debug(true).init({
        // Specific settings for HelloHelpr
        pageAudience: 'small business owners',
        pageIntent: 'increase service bookings',
        autoDetection: {
          enabled: true,
          headings: true,
          buttons: true,
          callToAction: true
        }
      });
    }
  });
</script>
```

## Testing the Integration

After implementing these changes:

1. Open your browser's Developer Tools (F12 or Ctrl+Shift+I)
2. Go to the Console tab
3. Look for messages starting with "[AI CRO]"
4. You should see "AI CRO script loaded" and "AICRO initialized successfully"
5. If you see errors, check our troubleshooting steps below

## Troubleshooting

### If the Script Still Fails to Load

Try this alternative approach that bypasses CORS restrictions:

```html
<script>
  // Direct fetch and eval approach
  fetch('https://ai-cro-three.vercel.app/api/aicro-script')
    .then(response => response.text())
    .then(scriptText => {
      // Create a new script element with the fetched code
      const script = document.createElement('script');
      script.textContent = scriptText;
      document.head.appendChild(script);
      
      // Initialize after a short delay
      setTimeout(() => {
        if (window.AICRO) {
          AICRO.debug(true).init();
          console.log('AI CRO loaded and initialized via fetch!');
        }
      }, 500);
    })
    .catch(error => {
      console.error('Failed to load AI CRO script:', error);
    });
</script>
```

### For Errors in the Console

If you see specific error messages:

1. **"AICRO is not defined"**: The script didn't load properly. Check for network errors in Developer Tools.
2. **"CORS error"**: The browser is blocking cross-origin requests. Use our improved script or try the fetch approach above.
3. **"Uncaught SyntaxError"**: There might be a syntax issue in your custom initialization code.

## Need Further Help?

If you continue to have issues, please:

1. Take screenshots of any console errors
2. Note the specific URL where you're testing
3. Contact us at support@aicro.com with these details
4. We can schedule a quick session to help you troubleshoot 