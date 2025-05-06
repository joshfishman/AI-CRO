'use client';

import React from 'react';
import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI CRO Documentation</h1>

      <nav className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="font-semibold mb-2">On this page</h2>
        <ul className="space-y-1">
          <li><a href="#installation" className="text-blue-600 hover:underline">Installation</a></li>
          <li><a href="#configuration" className="text-blue-600 hover:underline">Configuration</a></li>
          <li><a href="#automatic" className="text-blue-600 hover:underline">Automatic Personalization</a></li>
          <li><a href="#testing" className="text-blue-600 hover:underline">Creating Tests</a></li>
          <li><a href="#segments" className="text-blue-600 hover:underline">User Segmentation</a></li>
          <li><a href="#tracking" className="text-blue-600 hover:underline">Event Tracking</a></li>
          <li><a href="#analytics" className="text-blue-600 hover:underline">Analytics Integration</a></li>
        </ul>
      </nav>

      <section id="installation" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        
        <div className="mb-8">
          <p className="mb-4">
            Add the AI CRO client script to your website:
          </p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {`<script async src="https://ai-cro-three.vercel.app/api/aicro-script"></script>`}
          </pre>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-bold text-blue-800 mb-2">🚀 New! Improved Webflow Integration</h3>
            <p className="mb-3">We've updated our integration process to resolve CORS issues and improve compatibility with Webflow:</p>
            <ul className="list-disc pl-6 mb-3">
              <li><a href="/docs/webflow" className="text-blue-600 hover:underline">Webflow Integration Guide</a> - Comprehensive instructions</li>
              <li><a href="/api/aicro-script?bookmarklet=true" className="text-blue-600 hover:underline" target="_blank">AI CRO Bookmarklet</a> - Better error handling</li>
              <li><a href="/api/debugger" className="text-blue-600 hover:underline" target="_blank">AI CRO Debugger Tool</a> - Diagnose issues on your site</li>
            </ul>
            <p>For HelloHelpr Webflow site, <a href="/docs/hellohelpr" className="text-blue-600 hover:underline">follow these instructions</a>.</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">2. Initialize the library</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize AI CRO
    AICRO.debug(true) // Enable debug mode (remove in production)
      .setUserId('user-123') // Optional: Set user ID if available
      .init();
  });
</script>`}
            </code>
          </div>
          <p className="text-gray-700">
            This code initializes the AI CRO library when the page is loaded. You can customize the initialization with various options.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">3. Mark elements for personalization (Optional)</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`<h1 data-aicro>Welcome to our website!</h1>
<button data-aicro class="cta-button">Sign Up Now</button>`}
            </code>
          </div>
          <p className="text-gray-700">
            Add the <code>data-aicro</code> attribute to any HTML element you want to explicitly personalize.
            The AI CRO script can also automatically detect important elements without this attribute.
          </p>
        </div>
      </section>

      <section id="configuration" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Configuration Options</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Advanced Initialization</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`AICRO.init({
  debug: true,                // Enable debug mode
  userId: 'user-123',         // User identifier
  userAttributes: {           // Custom user attributes for targeting
    userType: 'returning',
    plan: 'premium',
    visits: 5,
    location: 'US'
  },
  gtm: {                      // Google Tag Manager configuration
    enabled: true,
    dataLayerName: 'dataLayer'
  },
  autoDetection: {            // Automatic element detection
    enabled: true,
    headings: true,
    buttons: true,
    images: false,
    callToAction: true,
    productDescriptions: true,
    banners: true
  }
});`}
            </code>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Manual Element Selection</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`// Initialize first
AICRO.init();

// Then personalize specific elements
AICRO.personalize('.hero-cta-button');
AICRO.personalize('#main-headline');`}
            </code>
          </div>
          <p className="text-gray-700">
            You can manually specify elements to personalize using CSS selectors, instead of or in addition to using the data-aicro attribute.
          </p>
        </div>
      </section>

      <section id="automatic" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Automatic Personalization</h2>
        
        <p className="text-gray-700 mb-4">
          AI CRO can automatically detect and personalize important elements on your website without requiring explicit markup.
        </p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">How It Works</h3>
          <p className="text-gray-700">
            When enabled, the auto-detection system will:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li>Identify important headings (H1, H2)</li>
            <li>Detect call-to-action buttons and links</li>
            <li>Find product descriptions and key paragraphs</li>
            <li>Locate banner and hero sections</li>
            <li>Watch for dynamically added content</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Configuring Auto-Detection</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`// Configure which elements to auto-detect
AICRO.configureAutoDetection({
  enabled: true,
  headings: true,      // H1, H2 elements
  buttons: true,       // Buttons and button-like elements
  images: false,       // Don't auto-detect images for personalization
  callToAction: true,  // CTA elements based on context
  productDescriptions: true,  // Product description paragraphs
  banners: true        // Hero/banner sections
});`}
            </code>
          </div>
          <p className="text-gray-700">
            You can enable or disable specific types of auto-detection to suit your needs.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Custom Personalization Rules</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`// Add a custom rule to find elements to personalize
AICRO.addPersonalizationRule(function() {
  // Return an array of DOM elements to personalize
  return Array.from(document.querySelectorAll('.special-offer'));
});

// More complex example with targeting
AICRO.addPersonalizationRule(function() {
  // Find all price elements and personalize those above $100
  return Array.from(document.querySelectorAll('.price'))
    .filter(el => {
      const price = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
      return price > 100;
    });
});`}
            </code>
          </div>
          <p className="text-gray-700">
            Custom rules allow you to define your own logic for finding elements to personalize based on your specific website structure.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Handling Dynamic Content</h3>
          <p className="text-gray-700">
            AI CRO automatically watches for dynamically added content using a MutationObserver. This means that elements added to the page
            after initial load (like from AJAX requests or React updates) will still be personalized according to your rules.
          </p>
        </div>
      </section>

      <section id="testing" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Creating Tests</h2>
        
        <p className="text-gray-700 mb-4">
          Use the <Link href="/admin" className="text-blue-600 hover:underline">Admin Dashboard</Link> to create and manage your A/B tests.
        </p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Test Configuration</h3>
          <p className="text-gray-700">
            When creating a test, you'll need to specify:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li>Test name and description</li>
            <li>Element selector (CSS selector for the element to personalize)</li>
            <li>Variants (different content versions to test)</li>
            <li>Targeting rules (who should see this test)</li>
            <li>Success metrics (what counts as a conversion)</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Using the Bookmarklet</h3>
          <p className="text-gray-700 mb-4">
            Our standalone bookmarklet helps you select elements and generate tests without CORS issues or external dependencies.
          </p>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Bookmarklet</h4>
            <p className="text-gray-700 mb-2">
              Available at <Link href="/bookmarklet" className="text-blue-600 hover:underline">Bookmarklet</Link>
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
              <li>No external script dependencies</li>
              <li>Works on any domain without CORS issues</li>
              <li>Best for cross-origin testing</li>
              <li>Includes UI for element selection and text generation</li>
              <li>Allows saving test configurations directly to the server</li>
            </ul>
            
            <h5 className="font-medium text-blue-800 mt-4 mb-2">How to Use:</h5>
            <ol className="list-decimal list-inside ml-4 text-gray-700 space-y-1">
              <li>Install the bookmarklet by dragging it to your bookmarks bar</li>
              <li>Navigate to the website you want to test</li>
              <li>Click the bookmarklet to activate the selector tool</li>
              <li>Click on elements you want to personalize or use the quick select buttons</li>
              <li>Enter target audience and intent information</li>
              <li>Click "Generate" to see text alternatives</li>
              <li>Select a variation and save it to create an A/B test</li>
            </ol>
          </div>
          
          <p className="text-gray-700 mt-4">
            After saving a test with the bookmarklet, add the client script to your website to display the personalized content to your visitors.
          </p>
        </div>
      </section>

      <section id="segments" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">User Segmentation</h2>
        
        <p className="text-gray-700 mb-4">
          User segments allow you to target specific groups of users with different personalized experiences.
        </p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Creating Segments</h3>
          <p className="text-gray-700">
            Use the <Link href="/segments" className="text-blue-600 hover:underline">Segments Dashboard</Link> to create user segments based on:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
            <li>URL patterns</li>
            <li>Device types</li>
            <li>Geographic location</li>
            <li>Custom user attributes</li>
            <li>Behavioral data</li>
          </ul>
        </div>
      </section>

      <section id="tracking" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Event Tracking</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Tracking Conversions</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`// Track a conversion for a specific element
document.querySelector('#signup-button').addEventListener('click', function() {
  AICRO.trackConversion('.hero-cta-button', {
    action: 'signup',
    value: 10
  });
});`}
            </code>
          </div>
          <p className="text-gray-700">
            Call <code>trackConversion</code> whenever a user completes a conversion action related to a personalized element.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Custom Events</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`// Track any custom event
AICRO.trackEvent('form_started', '.signup-form', {
  formType: 'newsletter'
});`}
            </code>
          </div>
        </div>
      </section>

      <section id="analytics" className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Analytics Integration</h2>
        
        <p className="text-gray-700 mb-4">
          AI CRO integrates with Google Tag Manager for analytics. See our 
          <Link href="/docs/gtm" className="text-blue-600 hover:underline ml-1">GTM Integration Guide</Link>
          for detailed instructions.
        </p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">E-commerce Tracking</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
{`// Track product view
AICRO.ecommerce.viewProduct({
  id: 'PROD-123',
  name: 'Product Name',
  price: 49.99,
  category: 'Category'
}, '.product-cta');

// Track add to cart
AICRO.ecommerce.addToCart({
  id: 'PROD-123',
  name: 'Product Name',
  price: 49.99,
  quantity: 1
}, '.product-cta');

// Track purchase
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
});`}
            </code>
          </div>
        </div>
      </section>

      <div className="text-center pb-8">
        <p className="text-gray-600 mb-2">Need more help?</p>
        <Link href="https://github.com/joshfishman/AI-CRO/issues" className="text-blue-600 hover:underline font-medium">
          Open an issue on GitHub
        </Link>
      </div>
    </div>
  );
} 