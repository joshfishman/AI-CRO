# AI CRO Webflow Integration Guide

This guide will help you integrate AI CRO with your Webflow website, allowing you to optimize your content dynamically using AI.

## Quick Start Integration

Follow these steps to quickly integrate AI CRO with your Webflow site:

### 1. Add the AI CRO Script to Your Webflow Site

Add the following script to your Webflow site's **Custom Code** section in the `<head>` tag area:

```html
<script async src="https://ai-cro-three.vercel.app/api/aicro-script"></script>
```

### 2. Initialize AI CRO

Add the following code to initialize AI CRO, either in a custom code block or by creating a new script element:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.AICRO && typeof window.AICRO.init === 'function') {
      // Initialize with debug mode enabled (remove in production)
      AICRO.debug(true).init();
    } else {
      console.error("AICRO object not found. Make sure the script loaded correctly.");
      
      // Try to reload the script if it failed
      var script = document.createElement('script');
      script.src = "https://ai-cro-three.vercel.app/api/aicro-script";
      document.head.appendChild(script);
    }
  });
</script>
```

### 3. Use the AI CRO Bookmarklet

To create and test variations for your Webflow site, use our bookmarklet tool:

1. Visit this URL to get the bookmarklet:
   [https://ai-cro-three.vercel.app/api/aicro-script?bookmarklet=true](https://ai-cro-three.vercel.app/api/aicro-script?bookmarklet=true)

2. Drag the "AI CRO Selector" button to your bookmarks bar
3. Navigate to your Webflow site
4. Click the bookmarklet to activate the AI CRO element selector
5. Select elements on your page and create AI-powered variations

## Troubleshooting Common Issues

### "AICRO.init is not a function" Error

This error occurs when the script fails to load properly or the AICRO object is not correctly initialized.

**Solutions:**

1. **Check the loading order**: Make sure the script is loaded before you try to initialize it.
   
2. **Use a load event listener**:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
     if (window.AICRO) {
       AICRO.debug(true).init();
     } else {
       console.error("AICRO not loaded");
     }
   });
   ```

3. **Try direct loading**:
   ```html
   <script async src="https://ai-cro-three.vercel.app/api/aicro-script"></script>
   ```

### Script Loading Errors

If you see errors related to loading the script:

**Solutions:**

1. **Check for typos in the URL**: Make sure you're using the correct URL:
   - Correct: `https://ai-cro-three.vercel.app/api/aicro-script`
   - Not: `https://ai-cro-three.vercel.app/api/aicro-scrip` (missing 't')
   - Not: `https://ai-cro-three.vercel.app/api/client-script` (old endpoint)

2. **Check for CORS errors**: If your browser is blocking the script due to CORS:
   - Our aicro-script handles CORS properly
   - Try adding your domain to the allowed origins list (contact support)

3. **Check for content blockers**: Some ad blockers or privacy extensions might block our scripts. Try temporarily disabling them.

### Bookmarklet Not Working

If the bookmarklet doesn't activate when clicked:

**Solutions:**

1. **Manual script injection**:
   ```javascript
   var script = document.createElement('script');
   script.src = 'https://ai-cro-three.vercel.app/api/selector-module/simple';
   document.head.appendChild(script);
   ```

2. **Check for browser restrictions**: Some websites restrict what bookmarklets can do. Try using the direct URL approach instead.

3. **Try the debug version of the bookmarklet**: Our bookmarklet includes better error logging.

## Advanced Integration

For advanced integration options with Webflow, you can:

1. **GTM Integration**: Use Google Tag Manager to control when and where AI CRO runs
2. **Custom Selectors**: Target specific elements by ID, class, or other selectors
3. **A/B Testing**: Run controlled tests with variation groups

See our [Advanced Documentation](https://ai-cro-three.vercel.app/docs) for more details.

## Example Implementation

Here's a complete example of how to integrate AI CRO in Webflow:

```html
<!-- In your site's head section -->
<script async src="https://ai-cro-three.vercel.app/api/aicro-script"></script>
<script>
  // Wait for document to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check if AICRO was loaded successfully
    if (window.AICRO && typeof window.AICRO.init === 'function') {
      // Initialize AICRO with debug mode and audience targeting
      AICRO.debug(true)
        .init({
          pageAudience: 'marketing professionals',
          pageIntent: 'increase demo signups',
          autoDetection: {
            enabled: true,
            headings: true,
            buttons: true
          }
        });
        
      console.log('AI CRO initialized successfully');
    } else {
      console.error('AICRO not loaded correctly. Check the script URL and for any console errors.');
    }
  });
</script>
```

## Getting Help

If you continue to experience issues with integration:

1. Check browser console for specific error messages
2. Ensure all scripts are correctly loaded
3. Contact our support team at [support@aicro.com](mailto:support@aicro.com)
4. Visit our documentation site at [https://ai-cro-three.vercel.app/docs](https://ai-cro-three.vercel.app/docs) 