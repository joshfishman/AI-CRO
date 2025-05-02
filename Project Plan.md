# 🧠 Cursor-AI Personalizer  
*(Edge-native, zero hard-coding)*  

## 0 — Required Vercel Environment Variables

|  Key  | Value / Where to get it | Scope |
|-------|------------------------|-------|
| `OPENAI_API_KEY`          | from OpenAI dashboard                | Server |
| `HUBSPOT_PRIVATE_KEY`     | HubSpot Private App token            | Server |
| `CURSOR_EDITOR_KEY`       | `openssl rand -hex 16` (bookmarklet) | Server + Client |
| `EDGE_CONFIG`             | **Edge Config ID** (auto-set after `vercel edge-config link`) | Server |
| `NEXT_PUBLIC_CURSOR_API_BASE` | `https://ai-cro-eight.vercel.app` | Client |
| `NEXT_PUBLIC_CURSOR_CDN`  | `https://ai-cro-eight.vercel.app`    | Client |

> **Note** `EDGE_CONFIG` is injected automatically by `vercel edge-config link`; you do **not** set URL/token manually.

---

## 1 — Edge Config Layout

| Key Pattern | Purpose |
|-------------|---------|
| `page:${workspaceId}:${urlPath}` | JSON `{ url, selectors[] }` |
| `stats:${workspaceId}:${urlPath}`| Running CTR counters & winner flag |

Use the Edge-Config JS client inside API routes:

```js
import { get, set, incr } from '@vercel/edge-config';
await set(`page:${wid}:${path}`, { url: path, selectors });
const cfg = await get(`page:${wid}:${path}`);

2 — API Routes  (/api/*.js)
ROUTE / DESCRIPTION
get-user-type
HubSpot → returns { userType }
save-config
POST (header x-api-key: CURSOR_EDITOR_KEY) → edge-config.set(...)
get-config
GET → edge-config.get(...)
personalize
OpenAI proxy; returns { variants[] }
record-event
Increments edge-config CTR counts; if stat-sig → writes winner

All Server Routes resolved via
const API = process.env.NEXT_PUBLIC_CURSOR_API_BASE;

3 — Bookmarklet

Change only the host name: (make this a user setting)

javascript:(function(){
  var s=document.createElement('script');
  s.src='https://ai-cro-eight.vercel.app/selector-bookmarklet.js';
  document.body.appendChild(s);
})();

The bookmarklet JS already pulls:
const apiBase = window.NEXT_PUBLIC_CURSOR_API_BASE || 'https://ai-cro-eight.vercel.app';

and posts to /api/save-config with header
x-api-key: CURSOR_EDITOR_KEY.

4 — Loader Snippet for Webflow / HubSpot / Shopify
-Where do we get the workspace ID?
<!-- paste before </body> -->
<script src="https://ai-cro-eight.vercel.app/personalization-loader.js"
        data-cursor-workspace="YOUR_WORKSPACE_ID"></script>

<!-- optional: fade-in CSS -->
<style>
.personalize-target{visibility:hidden;opacity:0;transition:opacity .3s}
.personalized-loaded .personalize-target{visibility:visible;opacity:1}
</style>

6 — After Deploy
	1.	Add bookmarklet → select page elements → push config
	2.	Loader auto-pulls config from Edge Config, runs OpenAI via proxy
	3.	Events (abTestAssigned, personalizationLoaded, ctaClick) hit GTM
	4.	Edge-function stats engine logs CTR; when significant → sets winner key
	5.	Loader biases traffic 80/20 toward winner; dashboard can “Apply Winner” final

