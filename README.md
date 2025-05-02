# Cursor AI-CRO Personalizer

A powerful edge-native tool for website personalization and multivariate testing using AI, with zero hard-coding required.

**Latest Update:** Fixed API paths and improved cross-origin compatibility.

## Quick Reference URLs

Here are the correct URLs for the main functionality (replace `ai-cro-three.vercel.app` with your own deployment URL):

| Function                | URL Format                                                      |
|-------------------------|----------------------------------------------------------------|
| Personalization script  | `https://ai-cro-three.vercel.app/api?path=personalization-loader.js` |
| Bookmarklet generator   | `https://ai-cro-three.vercel.app/bookmarklet`                  |
| Static bookmarklet page | `https://ai-cro-three.vercel.app/bookmarklet-setup.html`       |
| Admin dashboard         | `https://ai-cro-three.vercel.app/admin`                        |
| Segments manager        | `https://ai-cro-three.vercel.app/segments`                     |

## Getting Started with Cursor AI-CRO

### Step 1: Deploy Your Instance

1. **Create a deployment**
   - Sign in to Vercel
   - Connect your forked repository
   - Click "Deploy"

2. **Link Edge Config**
   - In your Vercel dashboard, navigate to "Settings"
   - Go to "Edge Config" and create a new configuration
   - Link it to your project

3. **Set up environment variables**
   - In Vercel Settings > Environment Variables, add:
     - `OPENAI_API_KEY` - Your OpenAI API key
     - `HUBSPOT_PRIVATE_KEY` - HubSpot private app token (optional)
     - `CURSOR_EDITOR_KEY` - Generate with: openssl rand -hex 16
     - `NEXT_PUBLIC_CURSOR_API_BASE` - Your Vercel deployment URL
     - `NEXT_PUBLIC_CURSOR_CDN` - Your Vercel deployment URL
   
   > Note: You don't need to worry about workspace IDs. The system will use "default" unless you specifically want to create separate workspaces.

### Step 2: Add the Personalizer to Your Website

1. **Add the script tag**
   - Place this right before the closing `</body>` tag on your website:
   ```html
   <script src="https://your-deployment-url.vercel.app/api?path=personalization-loader.js" data-cursor-workspace="default"></script>
   ```
   
   > **Important:** Make sure to use the exact format shown above with `api?path=` in the URL. 
   > Do NOT use `/api/personalization-loader.js` (which will cause 404 errors).
   >
   > For example, if your deployment is at ai-cro-three.vercel.app, use:
   > ```html
   > <script src="https://ai-cro-three.vercel.app/api?path=personalization-loader.js" data-cursor-workspace="default"></script>
   > ```
   > 
   > Note: The `data-cursor-workspace` attribute is optional. Using `"default"` is fine for most users. Only change this if you need to manage multiple separate personalization configurations.

2. **Optional: Add fade-in styling**
   - For a smoother user experience, add this to your CSS:
   ```html
   <style>
   .personalize-target{visibility:hidden;opacity:0;transition:opacity .3s}
   .personalized-loaded .personalize-target{visibility:visible;opacity:1}
   </style>
   ```

### Step 3: Create Your Personalization Bookmarklet

1. **Visit your bookmarklet generator page**
   - Go to `https://your-deployment-url.vercel.app/bookmarklet` 
   - Enter your deployment URL (should auto-populate)
   - Enter your editor key (from the CURSOR_EDITOR_KEY environment variable)
   - The system will use the "default" workspace automatically

2. **Install the bookmarklet**
   - Drag the "Cursor AI-CRO Selector" link to your bookmarks bar
   - Or copy the code and create a new bookmark with it

> **Tip:** If you encounter any issues with the bookmarklet page, you can use the static fallback page at `https://your-deployment-url.vercel.app/bookmarklet-setup.html`
> 
> For example:
> - Main bookmarklet page: `https://ai-cro-three.vercel.app/bookmarklet`
> - Static fallback: `https://ai-cro-three.vercel.app/bookmarklet-setup.html`

> **Note for Vercel Hobby Plan users:** If you're getting a function limit error, the setup automatically uses a minimized version of the selector tool that reduces the number of serverless functions required.

### Step 4: Personalize Your Website

1. **Navigate to the page you want to personalize**
   - Go to any page on your website

2. **Activate the selector tool**
   - Click the "Cursor AI-CRO Selector" bookmark
   - Confirm your editor key if prompted

3. **Select elements to personalize**
   - Click on any element you want to personalize
   - For each element:
     - Choose the content type (text, link, image, background image)
     - Add up to 4 variants for testing
     - Specify target user segments
     - Use AI to generate variant content

4. **Save your configuration**
   - Click "Save Config" when finished

### Step 5: View Results and Manage Segments

1. **Access your admin dashboard**
   - Go to `https://your-deployment-url.vercel.app/admin`
   - Sign in with your editor key
   
   Example: `https://ai-cro-three.vercel.app/admin`

2. **Manage custom segments**
   - Go to `https://your-deployment-url.vercel.app/segments`
   - Create and manage user segments based on specific rules
   
   Example: `https://ai-cro-three.vercel.app/segments`

3. **View test results**
   - See statistics for each variant
   - Review performance by segment
   - Apply winning variants

4. **Quick results view on any page**
   - Press `Ctrl+Shift+D` on any personalized page to see test statistics

## Targeting Options

When creating variants, you can target specific user segments:

- **Visitor Types**: All Users, New Visitors, Returning Visitors, Customers, Prospects, Leads
- **Device Types**: Mobile, Desktop, Tablet
- **Referrer Sources**: Search Engines, Social Media, Email, Direct Traffic
- **Time Periods**: Morning, Afternoon, Evening, Night
- **Engagement Levels**: High, Medium, Low
- **Custom Segments**: Define your own in the segment manager

## Deployment Instructions

### Quick Setup

1. **Deploy to Vercel**
   - Fork this repository
   - Connect to Vercel and deploy
   - Set your deployment URL to ai-cro-three.vercel.app

2. **Environment Variables**
   - OPENAI_API_KEY: Your OpenAI API key
   - CURSOR_EDITOR_KEY: Generate with `openssl rand -hex 16`
   - NEXT_PUBLIC_CURSOR_API_BASE: https://ai-cro-three.vercel.app
   - NEXT_PUBLIC_CURSOR_CDN: https://ai-cro-three.vercel.app

3. **Add to Website**
   ```html
   <script src="https://ai-cro-three.vercel.app/api?path=personalization-loader.js" data-cursor-workspace="default"></script>
   ```

4. **Access Tools**
   - Bookmarklet: https://ai-cro-three.vercel.app/bookmarklet
   - Admin Dashboard: https://ai-cro-three.vercel.app/admin
   - Segments Manager: https://ai-cro-three.vercel.app/segments

## Troubleshooting

- **Bookmarklet not working?** Make sure your deployment URL is correct and the editor key is valid
- **Elements not changing?** Check that the personalization script is properly installed
- **Statistics not showing?** Verify that event tracking is not blocked by ad blockers

## Support and Feedback

For support, please create an issue on the GitHub repository.
