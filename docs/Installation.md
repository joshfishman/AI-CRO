# AI CRO Installation Guide

This guide will help you install and configure AI CRO on your website.

## Quick Start

### 1. Add the Script Tag

Add this script tag to the `<head>` section of your website:

```html
<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>
```

### 2. Initialize the Library

Add the initialization code after the script tag or in a separate JavaScript file:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize AI CRO
    AICRO.debug(true) // Enable debug mode (remove in production)
      .setUserId('user-123') // Set user ID if available
      .init();
  });
</script>
```

### 3. Mark Elements for Personalization

Add the `data-aicro` attribute to elements you want to personalize:

```html
<div class="hero-section">
  <h1 data-aicro>Welcome to our website!</h1>
  <button data-aicro class="cta-button">Sign Up Now</button>
</div>
```

### 4. Create Tests in the Admin Dashboard

Log in to the AI CRO dashboard to create tests for the elements you've marked.

## Advanced Configuration

### Manual Element Selection

If you prefer to select elements manually instead of using the `data-aicro` attribute:

```javascript
// Initialize first
AICRO.init();

// Then personalize specific elements
AICRO.personalize('.hero-cta-button');
AICRO.personalize('#main-headline');
```

### Custom User Identification

Set a user ID and attributes for better targeting:

```javascript
AICRO.setUserId('user-123')
  .init({
    userAttributes: {
      userType: 'returning',
      plan: 'premium',
      visits: 5,
      location: 'US'
    }
  });
```

### Track Conversions

Track conversions when users perform important actions:

```javascript
// Add event listener to a button
document.querySelector('#signup-button').addEventListener('click', function() {
  // Track the conversion
  AICRO.trackConversion('.hero-cta-button', {
    action: 'signup',
    value: 10
  });
});
```

### Custom Events

Track custom events beyond impressions and conversions:

```javascript
AICRO.trackEvent('form_started', '.signup-form', {
  formType: 'newsletter'
});
```

### Google Tag Manager Integration

Enable and configure GTM integration:

```javascript
AICRO.configureGTM({
  enabled: true,
  dataLayerName: 'dataLayer' // Default
}).init();
```

See [GTM Integration Guide](GTM-Integration.md) for more details.

## E-commerce Implementation

For e-commerce websites, you can track product interactions:

```javascript
// Track product view
AICRO.ecommerce.viewProduct({
  id: 'PROD-123',
  name: 'Product Name',
  price: 49.99,
  category: 'Category'
}, '.product-cta');

// Track add to cart
document.querySelector('#add-to-cart').addEventListener('click', function() {
  AICRO.ecommerce.addToCart({
    id: 'PROD-123',
    name: 'Product Name',
    price: 49.99,
    quantity: 1
  }, '.product-cta');
});

// Track purchase (on order confirmation page)
AICRO.ecommerce.purchase({
  transaction_id: 'ORDER-123',
  value: 49.99,
  currency: 'USD',
  items: [{
    id: 'PROD-123',
    name: 'Product Name',
    price: 49.99,
    quantity: 1
  }]
});
```

## Integration with Popular Platforms

### WordPress

Add the script to your theme's header.php file:

```php
<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.init();
  });
</script>
```

### Shopify

Add the script in the theme.liquid file:

```liquid
{% raw %}
<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.init({
      userAttributes: {
        {% if customer %}
        userType: 'customer',
        customerTags: {{ customer.tags | json }},
        orderCount: {{ customer.orders_count }}
        {% else %}
        userType: 'visitor'
        {% endif %}
      }
    });
    
    {% if template == 'product' %}
    AICRO.ecommerce.viewProduct({
      id: {{ product.id | json }},
      name: {{ product.title | json }},
      price: {{ product.price | money_without_currency | json }},
      category: {{ product.type | json }}
    }, '.product-form__submit');
    {% endif %}
  });
</script>
{% endraw %}
```

### Webflow

To integrate AI CRO with Webflow, add these scripts to your site settings:

**Head Code:**
```html
<script>
  // Create AICRO object to prevent "not a function" errors
  window.AICRO = window.AICRO || {};
</script>
<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>
```

**Footer Code:**
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
        }
      }, 100);
      
      // Stop checking after 5 seconds
      setTimeout(function() { clearInterval(checkAICRO); }, 5000);
    }
  });
</script>
```

For detailed Webflow-specific instructions, troubleshooting, and advanced usage, see the [Webflow Integration Guide](Webflow-Integration.md).

## Troubleshooting

If you're experiencing issues with the integration:

1. Enable debug mode: `AICRO.debug(true)`
2. Check the browser console for error messages
3. Verify network requests to the API endpoints
4. Ensure the script is loaded before initialization

For more help, contact support at support@ai-cro.com 