# Cursor AI-CRO Personalizer

A powerful edge-native tool for website personalization and multivariate testing using AI, with zero hard-coding required.

## Features

- **Advanced User Targeting**
  - Device-based targeting (mobile, desktop, tablet)
  - Browser-based targeting
  - Time of day targeting
  - Referrer source targeting
  - User engagement-based targeting
  - Custom segments with rule-based targeting
  
- **Enhanced Multivariate Testing**
  - Support for up to 4 variants per element
  - Different content types (text, links, images, background images)
  - Statistical tracking by segment
  - Winner detection with confidence levels
  
- **Personalization Capabilities**
  - HubSpot integration for user type detection
  - AI-generated content variants
  - Simple integration with existing websites
  - Edge-native for optimal performance

- **Admin Dashboard**
  - Test results visualization
  - Segment management
  - Workspace organization
  - Winner application

## Setup

1. Deploy to Vercel
   ```
   vercel
   ```

2. Link Edge Config
   ```
   vercel link
   vercel edge-config link
   ```

3. Set up environment variables in Vercel
   ```
   OPENAI_API_KEY=sk-...              # OpenAI API key for content generation
   HUBSPOT_PRIVATE_KEY=pat-...        # HubSpot private app token (optional)
   CURSOR_EDITOR_KEY=...              # Generate with: openssl rand -hex 16
   NEXT_PUBLIC_CURSOR_API_BASE=...    # Your Vercel deployment URL
   NEXT_PUBLIC_CURSOR_CDN=...         # Your Vercel deployment URL
   ```

4. Add the personalization loader to your website
   ```html
   <!-- Add before </body> -->
   <script src="https://your-vercel-url.app/personalization-loader.js"
           data-cursor-workspace="YOUR_WORKSPACE_ID"></script>

   <!-- Optional fade-in CSS -->
   <style>
   .personalize-target{visibility:hidden;opacity:0;transition:opacity .3s}
   .personalized-loaded .personalize-target{visibility:visible;opacity:1}
   </style>
   ```

## Using the Bookmarklet

The bookmarklet allows you to select elements on your website and configure personalization without writing any code.

### Setting Up the Bookmarklet

1. Create a new bookmark in your browser
2. Name it "Cursor AI-CRO"
3. Paste the following code as the URL:
   ```javascript
   javascript:(function(){
     var s=document.createElement('script');
     s.src='https://your-vercel-url.app/selector-bookmarklet.js';
     document.body.appendChild(s);
   })();
   ```
   (Replace 'your-vercel-url.app' with your actual Vercel deployment URL)

### Using the Bookmarklet

1. Navigate to the page you want to personalize
2. Click the "Cursor AI-CRO" bookmarklet in your browser bookmarks
3. When prompted, enter your editor API key (same as CURSOR_EDITOR_KEY)
4. Click on elements you want to personalize
5. For each element:
   - Choose the content type (text, link, image, background image)
   - Add up to 4 variants for testing
   - Specify user types or segments for targeting
   - Use AI to generate variant content or enter custom content
6. Click "Save Config" when finished

### Targeting Options

When creating variants, you can target specific user segments:

- **Basic Types**: All Users, New Visitors, Returning Visitors, Customers, Prospects, Leads
- **Device Types**: Mobile Users, Desktop Users, Tablet Users
- **Referrer Types**: Search Engines, Social Media, Email, Direct Traffic
- **Time-based**: Morning Visitors, Afternoon Visitors, Evening Visitors, Night Visitors
- **Engagement**: High, Medium, Low Engagement
- **Custom Segments**: Create custom segments in the admin dashboard based on specific rules

## Admin Dashboard

Access the admin dashboard at your-vercel-url.app/admin to:

1. View test results and statistics
2. Manage custom segments (your-vercel-url.app/segments)
3. Apply winning variants
4. Organize tests by workspace

## API Endpoints

- `/api/advanced-targeting.js` - Advanced user segmentation
- `/api/manage-segments.js` - Custom segment management
- `/api/save-config.js` - Save website personalization configuration
- `/api/get-config.js` - Retrieve website personalization configuration
- `/api/personalize.js` - Apply personalization to a webpage
- `/api/get-user-type.js` - Determine user type for personalization
- `/api/record-event.js` - Track events and calculate test statistics
- `/api/generate-variants.js` - Generate AI-powered content variants

## Quick Workflow

1. Deploy → Set up environment variables → Add loader to website
2. Use bookmarklet to select elements and create variants
3. System automatically runs tests and collects data
4. View results in admin dashboard
5. Apply winning variants

## Keyboard Shortcuts

- `Ctrl+Shift+D` - Toggle test results dashboard on any page
