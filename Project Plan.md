# AI CRO Platform Project Plan

## 1 ‒ Architecture & Stack
| Layer | Tech / Service | Notes |
|-------|---------------|-------|
| Edge Data | Vercel Edge Config (KV) | Stores test configurations, user segments, and metrics at edge latency. |
| Compute | Next.js App Router & Vercel Functions | `/api/personalize`, `/api/tests`, `/api/track`, `/api/segments`, `/api/client-script`. |
| UI Framework | React with Tailwind CSS | Component library for clean, responsive design. |
| State Management | tRPC & React Query | Type-safe API calls and client-side caching. |
| Selector UI | Bookmarklet → injected UI | Enhanced visual element selector with audience targeting. |
| Client Integration | JavaScript library | Small JS loader for any website to integrate AI CRO features. |
| Analytics | Google Tag Manager + first-party events | Dual tracking approach with custom event API. |

## 2 ‒ Detailed Epics & Tasks

### 2.1 Core API Layer
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Provision Edge Config store | DevOps | ✅ | Separate dev/prod datasets |
| POST `/api/tests` | Backend | ✅ | Create, update, delete test configurations |
| GET `/api/tests` | Backend | ✅ | Retrieve tests by ID or all tests |
| POST `/api/personalize` | Backend | ✅ | Receives selector & URL, returns personalized content |
| POST `/api/track` | Backend | ✅ | Records impressions, conversions, and custom events |
| POST `/api/segments` | Backend | ✅ | Manage user segments for targeting |
| GET `/api/client-script` | Backend | ✅ | Client-side integration script |

### 2.2 Selector SDK
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Bookmarklet loader | Frontend | ✅ | Injects element selector tool |
| Element selection | Frontend | ✅ | Auto-generates unique selectors |
| Selector preview | Frontend | ✅ | Shows targeted elements with visual indicators |
| Configuration panel | Frontend | ✅ | Interface for creating tests and variants |
| Save configuration | Frontend | ⏳ | Push to `/api/tests` with auth |
| Auto-selection | Frontend | ✅ | Smart detection of important elements |
| Page-level targeting | Frontend | ✅ | Audience and intent configuration for all elements |
| Multi-select | Frontend | 🆕 | Select multiple elements at once |
| Selection groups | Frontend | 🆕 | Group related elements for consistent personalization |
| Selection templates | Frontend | 🆕 | Reusable selection patterns for common page elements |
| Advanced targeting UI | Frontend | 🆕 | Enhanced interface for audience segmentation |

### 2.3 Runtime Loader
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Client script | Frontend | ✅ | Initializes personalization engine |
| Personalize method | Frontend | ✅ | Apply variants to selected elements |
| Auto-detection | Frontend | ✅ | Find elements with `data-aicro` attributes |
| Event tracking | Frontend | ✅ | Track impressions and conversions |
| Timeout handling | Frontend | ⏳ | Prevent layout shifts with dynamic timeouts |
| User identification | Frontend | ✅ | Support for custom user IDs and attributes |
| Mutation observer | Frontend | ✅ | Monitor DOM changes for dynamic content |

### 2.4 Analytics & Testing
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Impression tracking | Backend | ✅ | Count views of each variant |
| Conversion tracking | Backend | ✅ | Record conversion events per variant |
| Custom event support | Backend | ✅ | Track arbitrary events with metadata |
| Google Tag Manager integration | Frontend | ⏳ | Push personalization events to GTM |
| Statistical significance | Backend | ⏳ | Determine test winners (p<0.05) |
| Winner application | Backend | ⏳ | Automatically promote winning variants |

### 2.5 Administration Dashboard
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Test management UI | Frontend | ⏳ | Create, edit, delete tests |
| Segment management | Frontend | ⏳ | Define user segments for targeting |
| Results & analytics | Frontend | ⏳ | Visualization of test performance |
| User management | Frontend | ⏳ | Role-based access control |
| Bookmarklet generator | Frontend | ✅ | Create and manage bookmarklets |
| Variant management | Frontend | 🆕 | Interface for managing content variations |
| Template library | Frontend | 🆕 | Reusable audience and intent templates |

### 2.6 Google Tag Manager Integration
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| GTM event model | Frontend | ⏳ | Define event structure for experiments |
| Impression events | Frontend | ⏳ | Push `aicro_impression` events with test/variant data |
| Conversion events | Frontend | ⏳ | Push `aicro_conversion` events with test/variant data |
| Custom data layer | Frontend | ⏳ | Maintain experiment state in dataLayer |
| Integration guide | Documentation | ⏳ | Documentation for setting up GTM variables and triggers |
| Enhanced ecommerce | Frontend | ⏳ | Support for product & conversion tracking |

### 2.7 CMS & Platform Integration

#### Generic Website
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Script tag installation | Documentation | ⏳ | Guide for adding client script to any website |
| CSS selector guide | Documentation | ⏳ | Best practices for robust element selection |
| Custom events guide | Documentation | ⏳ | How to track custom events and conversions |
| Selection guide | Documentation | 🆕 | Instructions for using the enhanced selector |

#### eCommerce Platforms
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Shopify integration | Frontend | ⏳ | App or script tag for Shopify stores |
| WooCommerce plugin | Frontend | ⏳ | WordPress plugin for WooCommerce |
| Standard checkout events | Frontend | ⏳ | Track add-to-cart, checkout, purchase |
| Platform element presets | Frontend | 🆕 | Pre-configured selections for platform-specific elements |

## 3 ‒ Project Timeline

### Phase 1: Core API & Selector (Completed)
- Complete core API endpoints
- Finish bookmarklet implementation
- Develop client-side script
- Create basic admin interface

### Phase 2: Enhanced Selection & Testing (Current)
- Improve element selection experience
- Add multi-select and grouping capabilities
- Enhance audience targeting UI
- Implement statistical analysis
- Add Google Tag Manager integration
- Develop results visualization
- Build test management UI

### Phase 3: Platform Integrations
- Create platform-specific integrations
- Develop advanced targeting capabilities
- Implement AI-powered variant generation
- Add multi-user collaboration features
- Create platform-specific element presets