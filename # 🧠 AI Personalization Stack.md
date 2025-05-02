# 🧠 AI Personalization Stack

Personalize any Webflow (or other static) website using OpenAI, HubSpot segmentation, and a visual bookmarklet selector. This project includes:

- A Vercel-based API backend
- A client-side loader script
- A visual bookmarklet tool to define personalization targets
- OpenAI-powered dynamic copy updates

---

## 🚀 Features

- Visual UI to select and assign prompts to DOM elements
- Automatic `user_type` segmentation via HubSpot
- Live copy rewriting via OpenAI API
- Zero flash: pre-hides elements and gracefully fades them in
- Configurable A/B testing and GTM analytics

---

## 📁 Project Structure

```
├── api/
│   ├── get-user-type.js          # Retrieves `user_type` from HubSpot
│   └── save-config.js            # Saves JSON config files from selector tool
│
├── public/
│   ├── configs/                  # JSON configs for each personalized page
│   ├── selector-bookmarklet.js  # Visual element picker and push tool
│   └── personalization-loader.js# Script injected on Webflow to run personalization
```

---

## 🔧 Setup

### 1. Deploy to Vercel

1. Import this project into Vercel
2. Set environment variables:
   - `HUBSPOT_API_KEY`: Your private HubSpot API key
   - `EDITOR_API_KEY`: Your secret API key for selector tool pushes

### 2. Add Webflow Script

Paste this into Webflow's **Before </body>** Custom Code section:

```html
<script src="https://your-vercel-app.vercel.app/personalization-loader.js"></script>
```

---

## 🧠 Using the Selector Tool

1. Host `selector-bookmarklet.js` from Vercel:
   ```
   https://your-vercel-app.vercel.app/selector-bookmarklet.js
   ```

2. Create a bookmark with this code:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://your-vercel-app.vercel.app/selector-bookmarklet.js';document.body.appendChild(s);})();
```

3. Visit your site → click the bookmark
4. Click elements, write prompts, and push to Vercel

> Creates JSON config like this:
```json
{
  "url": "/landing",
  "selectors": [
    {
      "selector": "#headline",
      "prompt": "Rewrite this headline for enterprise buyers.",
      "default": "Grow faster with our platform"
    }
  ]
}
```

---

## 🧩 How It Works

- Loader script checks the current URL path
- Loads corresponding config from `/public/configs/{url}.json`
- Pulls `user_type` from HubSpot API
- Sends OpenAI prompt and default to GPT
- Replaces matching elements with personalized copy

---

## 📊 GTM/Analytics Events

Pushes to `dataLayer`:
- `abTestAssigned` — includes `abTestGroup`
- `personalizationLoaded` — includes `userType` and `variant`
- `ctaClick` — includes CTA copy and variant

---

## 🛡 Security

- Only users with `EDITOR_API_KEY` can push configs
- All content generation is client-side via OpenAI API key

---

## ✅ To-Do

- [ ] Add live preview in selector tool
- [ ] Optional authentication for config editing
- [ ] PostHog or GA4 integration for deeper analysis

---

## 📬 Contact
Built with ❤️ using OpenAI, Vercel, and Webflow.