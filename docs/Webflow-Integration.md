# Webflow Integration Guide for AI CRO

This guide provides detailed instructions for integrating AI CRO with Webflow sites, including solutions for common issues.

## Standard Installation

### 1. Add the Script to Your Webflow Site

1. Log in to your Webflow dashboard
2. Navigate to your project settings
3. Click on **Custom Code** in the sidebar
4. In the **Head Code** section, add the following script:

```html
<script>
  // Create AICRO object to prevent "not a function" errors
  window.AICRO = window.AICRO || {};
</script>
<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>
```

### 2. Add the Initialization Code

In the **Footer Code** section of your Webflow project settings, add the following:

```html
<script>
  // Initialize AI CRO when the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check if AICRO is ready
    if (window.AICRO && typeof window.AICRO.init === 'function') {
      // Initialize with debugging enabled
      window.AICRO.debug(true).init();
    } else {
      // If not ready yet, wait for it
      var checkAICRO = setInterval(function() {
        if (window.AICRO && typeof window.AICRO.init === 'function') {
          window.AICRO.debug(true).init();
          clearInterval(checkAICRO);
          console.log('[AI CRO] Initialized after delay');
        }
      }, 100);
      
      // Set a timeout to stop checking after 5 seconds
      setTimeout(function() {
        clearInterval(checkAICRO);
        console.error('[AI CRO] Failed to initialize after 5 seconds');
      }, 5000);
    }
  });
</script>
```

## Marking Elements for Personalization

You can use Webflow's custom attributes to mark elements for personalization:

1. Select an element in the Webflow Designer
2. In the Settings panel, click on the "+" icon in the Custom Attributes section
3. Add a custom attribute:
   - Name: `data-aicro`
   - Value: Leave blank or add a descriptive name (e.g., `headline` or `cta-button`)

## Using the Element Selector

### Method 1: Bookmarklet

1. Visit your published Webflow site
2. Click the AI CRO bookmarklet in your browser's bookmarks bar
3. If you don't have the bookmarklet, create one by:
   - Opening this URL in your browser: `https://ai-cro-three.vercel.app/api/client-script?bookmarklet=true`
   - Dragging the "AI CRO Selector" button to your bookmarks bar

### Method 2: URL Parameter

1. Add `?aicro_selector=true` to the end of your Webflow site's URL
2. Example: `https://your-webflow-site.com/?aicro_selector=true`

## Troubleshooting

### "AICRO.init is not a function" Error

This error occurs when the initialization code runs before the AI CRO script has fully loaded. The installation code above includes a solution that:

1. Creates an empty AICRO object before loading the script
2. Checks if the init function exists before calling it
3. Retries initialization if the function isn't available yet

### "missing } after function body" Error

If you see this error in your console, it's likely due to a syntax error in the initialization code. Make sure:

1. All opening brackets `{` have corresponding closing brackets `}`
2. All functions have proper closing brackets
3. No semicolons are missing at the end of statements

The code provided in this guide has been verified to be syntactically correct, so make sure you copy it exactly as shown.

### URL and Path Issues

Make sure you're using the correct URL path:
- Correct: `https://ai-cro-three.vercel.app/api/client-script`
- Not: `https://ai-cro-three.vercel.app/api/client-scrip`
- Not: `https://ai-cro-three.vercel.app/api/client-script/simple`

### Ultra-Simple Integration

If you're still having issues, try this ultra-simplified version:

**Head Code:**
```html
<script>
  // Global AICRO object
  window.AICRO = window.AICRO || {};
</script>
<script src="https://ai-cro-three.vercel.app/api/client-script"></script>
```

**Footer Code:**
```html
<script>
  function initAICRO() {
    if (window.AICRO && typeof window.AICRO.init === 'function') {
      window.AICRO.debug(true).init();
      return true;
    }
    return false;
  }

  // Try to initialize immediately
  if (!initAICRO()) {
    // If not ready, try again when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      if (!initAICRO()) {
        // If still not ready, try a few more times
        var attempts = 0;
        var checkInterval = setInterval(function() {
          attempts++;
          if (initAICRO() || attempts >= 50) {
            clearInterval(checkInterval);
          }
        }, 100);
      }
    });
  }
</script>
```

### Testing the Integration

After installation:

1. Open your browser's developer console (F12 or Cmd+Opt+I)
2. Look for messages starting with `[AI CRO]` to confirm successful initialization
3. Use `AICRO.testConnection()` in the console to verify API connectivity

### Selector Not Working

If the selector isn't working:

1. Ensure your Webflow site is published
2. Check that the script is loading (look for network requests to ai-cro-three.vercel.app)
3. Try using the URL parameter method instead of the bookmarklet
4. Make sure you're using the correct URL: `https://ai-cro-three.vercel.app/api/client-script` (not client-scrip)

## Advanced Usage

### Setting Page Audience and Intent

You can set audience and intent values for the current page:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for AICRO to be ready
    var checkAICRO = setInterval(function() {
      if (window.AICRO && typeof window.AICRO.init === 'function') {
        // Initialize
        window.AICRO.debug(true).init();
        
        // Set audience and intent
        window.AICRO.setPageAudience('new-visitors');
        window.AICRO.setPageIntent('learn-more');
        
        clearInterval(checkAICRO);
      }
    }, 100);
    
    setTimeout(function() { clearInterval(checkAICRO); }, 5000);
  });
</script>
```

### Activating the Selector Through Code

You can add a button to your Webflow site that activates the selector:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Create a button
    var selectorBtn = document.createElement('button');
    selectorBtn.innerText = 'Open AI CRO Selector';
    selectorBtn.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;background:#2563eb;color:white;border:none;padding:10px 16px;border-radius:4px;cursor:pointer;';
    
    // Add click handler
    selectorBtn.addEventListener('click', function() {
      if (window.AICRO && typeof window.AICRO.openSelector === 'function') {
        window.AICRO.openSelector();
      } else {
        alert('AI CRO selector not available. Please check the console for errors.');
      }
    });
    
    // Add button to page
    document.body.appendChild(selectorBtn);
  });
</script>
```

For more help, contact support at support@ai-cro.com 