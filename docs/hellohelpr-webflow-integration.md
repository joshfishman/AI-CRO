# HelloHelpr Webflow Integration Guide

This guide provides the exact code you need to fix the syntax error in your Webflow site integration.

## 1. Head Code

Go to your Webflow dashboard → Site Settings → Custom Code → Head Code section and replace the current code with:

```html
<script>
  // Create AICRO object to prevent "not a function" errors
  window.AICRO = window.AICRO || {};
</script>
<script src="https://ai-cro-three.vercel.app/api/client-script"></script>
```

## 2. Footer Code

Go to your Webflow dashboard → Site Settings → Custom Code → Footer Code section and replace the current code with:

```html
<script>
  // Simple initialization function that checks if AICRO is ready
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
        // If still not ready, try a few more times with a delay
        var attempts = 0;
        var checkInterval = setInterval(function() {
          attempts++;
          if (initAICRO()) {
            console.log('[AI CRO] Initialized after ' + attempts + ' attempts');
            clearInterval(checkInterval);
          } else if (attempts >= 50) {
            console.error('[AI CRO] Failed to initialize after 50 attempts');
            clearInterval(checkInterval);
          }
        }, 100);
      }
    });
  }
</script>
```

## Troubleshooting

The "missing } after function body" error was likely caused by a syntax error in the previous code. The new code provided above:

1. Uses a simpler structure that's less prone to syntax errors
2. Properly closes all brackets and functions
3. Uses the correct URL (client-script instead of client-scrip)
4. Doesn't use the "/simple" endpoint that was causing issues

If you continue to have issues after implementing these changes, please:

1. Open your browser's developer console (F12 or Cmd+Opt+I) while on your site
2. Look for any JavaScript errors 
3. Check if there are any network errors when loading the script

For further assistance, contact support@ai-cro.com 