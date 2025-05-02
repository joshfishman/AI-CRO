# Edge Config Setup

The AI CRO app uses Vercel Edge Config to store personalization configurations. This guide explains how to set up Edge Config for development and production.

## Current Status

- ✅ The Edge Config connection is properly configured in the app
- ✅ The environment variables are set up correctly
- ✅ Basic read operations are working (verified via `check-edge-config.mjs`)
- ❌ Write operations via direct API are not working, require Vercel Dashboard

## Setting Up Test Configuration

### Option 1: Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/joshfishmans-projects/ai-cro](https://vercel.com/joshfishmans-projects/ai-cro)
2. Navigate to Storage > Edge Config
3. Select your Edge Config store
4. Click "Add Item"
5. Enter key: `page:/test`
6. Enter value (in JSON format):

```json
{
  "url": "/test",
  "selectors": [
    {
      "selector": "h1",
      "prompt": "Write a catchy headline for a landing page",
      "default": "Welcome to our service"
    },
    {
      "selector": ".cta-button",
      "prompt": "Write a compelling call to action",
      "default": "Get Started"
    }
  ]
}
```

### Option 2: Vercel CLI

If the Vercel CLI works for Edge Config operations, you can run this command:

```bash
vercel edge-config add page:/test '{"url":"/test","selectors":[{"selector":"h1","prompt":"Write a catchy headline for a landing page","default":"Welcome to our service"},{"selector":".cta-button","prompt":"Write a compelling call to action","default":"Get Started"}]}'
```

## Testing Edge Config 

1. After setting up the test configuration via the Vercel Dashboard, you can verify it's working by running:

   ```bash
   node check-edge-config.mjs
   ```

2. You can also deploy the app and test the API endpoint:

   ```
   GET /api/test-edge-config
   ```

## Edge Config Schema

The Edge Config uses the following key patterns:

| Key Pattern | Purpose |
|-------------|---------|
| `page:${workspaceId}:${urlPath}` | JSON `{ url, selectors[] }` |
| `stats:${workspaceId}:${urlPath}`| Running CTR counters & winner flag |

## Next Steps

1. Make sure the test configuration is added to Edge Config via Vercel Dashboard
2. Verify the `/api/test-edge-config` endpoint works correctly
3. Implement the remaining API routes for personalization
4. Create the bookmarklet and personalization loader 