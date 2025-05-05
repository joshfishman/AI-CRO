# Google Tag Manager Integration

AI CRO integrates with Google Tag Manager to provide detailed analytics and tracking for your personalization tests. This guide will help you set up and make the most of this integration.

## Setup

1. **Load the AI CRO client script** on your website:

```html
<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>
```

2. **Initialize with GTM configuration** (optional):

```javascript
AICRO.configureGTM({
  enabled: true,              // Enable/disable GTM integration
  dataLayerName: 'dataLayer'  // Use custom dataLayer name if needed
}).init();
```

3. **Set up GTM variables** to capture AI CRO events:

## GTM Variables

Set up these Data Layer variables in your GTM container:

| Variable Name | Data Layer Variable Path | Description |
|---------------|--------------------------|-------------|
| AICRO - Test ID | aicro.testId | The ID of the running test |
| AICRO - Variant ID | aicro.variantId | The ID of the shown variant |
| AICRO - Selector | aicro.selector | CSS selector for the personalized element |
| AICRO - User ID | aicro.userId | User identifier (if available) |
| AICRO - Event | aicro.event | Type of event (impression, conversion, etc.) |
| AICRO - Timestamp | aicro.timestamp | ISO timestamp when event occurred |

## GTM Triggers

Create these triggers to capture AI CRO events:

1. **Impression Trigger**:
   - Trigger Type: Custom Event
   - Event Name: aicro_impression

2. **Conversion Trigger**:
   - Trigger Type: Custom Event
   - Event Name: aicro_conversion

3. **Custom Event Trigger**:
   - Trigger Type: Custom Event
   - Event Name: aicro_event

4. **E-commerce Triggers**:
   - Trigger Type: Custom Event
   - Event Names: aicro_product_view, aicro_add_to_cart, aicro_purchase

## GTM Tags

Create tags to send AI CRO events to your analytics platform:

### Google Analytics 4 Example:

```
Tag Type: Google Analytics: GA4 Event
Event Name: aicro_impression
Parameters:
- test_id: {{AICRO - Test ID}}
- variant_id: {{AICRO - Variant ID}}
- selector: {{AICRO - Selector}}
Trigger: Impression Trigger
```

## Event Reference

AI CRO pushes the following events to the data layer:

### Core Events

| Event Name | Description | Key Data Points |
|------------|-------------|-----------------|
| aicro_initialized | Fired when AI CRO is initialized | userId, pageUrl |
| aicro_impression | Fired when a variant is shown | testId, variantId, selector |
| aicro_conversion | Fired when a conversion occurs | testId, variantId, selector, metadata |
| aicro_event | Fired for custom events | testId, variantId, selector, event, metadata |

### E-commerce Events

| Event Name | Description | Key Data Points |
|------------|-------------|-----------------|
| aicro_product_view | Product detail view | product, testId, variantId |
| aicro_add_to_cart | Product added to cart | product, testId, variantId |
| aicro_purchase | Order completed | order, activeTests |

## Advanced Usage

### Tracking Custom Events

```javascript
// Track a custom event linked to a personalized element
AICRO.trackEvent('form_submit', '#signup-form', {
  formData: {
    plan: 'premium',
    source: 'homepage'
  }
});
```

### E-commerce Tracking

```javascript
// Track product view
AICRO.ecommerce.viewProduct({
  id: 'SKU-123',
  name: 'Premium Widget',
  price: 99.99,
  category: 'Widgets'
}, '#product-cta');

// Track add to cart
AICRO.ecommerce.addToCart({
  id: 'SKU-123',
  name: 'Premium Widget',
  price: 99.99,
  quantity: 1
}, '#add-to-cart-button');

// Track purchase
AICRO.ecommerce.purchase({
  transaction_id: 'T-12345',
  value: 99.99,
  currency: 'USD',
  items: [{
    id: 'SKU-123',
    name: 'Premium Widget',
    price: 99.99,
    quantity: 1
  }]
});
```

## Example: Creating a GA4 Experiment

You can use AI CRO events to create A/B tests in Google Analytics 4:

1. Create a custom dimension in GA4 for "Test ID" and "Variant ID"
2. Create an event tag that sends these values to GA4
3. Create an experiment in GA4 using these dimensions
4. Set your objectives based on conversions or other metrics

## Troubleshooting

- Enable debug mode with `AICRO.debug(true)` to see GTM events in the console
- Use Google Tag Assistant to verify events are being sent correctly
- Check that your GTM container is properly installed on your website 