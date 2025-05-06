'use client';

import React from 'react';
import Link from 'next/link';

export default function GTMDocumentation() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/docs" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Documentation
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Google Tag Manager Integration</h1>
      
      <div className="prose prose-blue max-w-none">
        <p className="lead text-lg mb-6">
          AI CRO integrates with Google Tag Manager to provide detailed analytics and tracking for your personalization tests. 
          This guide will help you set up and make the most of this integration.
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Setup</h2>
          
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Load the AI CRO client script</strong> on your website:
              <pre className="bg-gray-50 p-4 rounded border my-3 overflow-x-auto">
                <code>{`<script async src="https://ai-cro-three.vercel.app/api/client-script/fixed-cors"></script>`}</code>
              </pre>
            </li>
            
            <li>
              <strong>Initialize with GTM configuration</strong> (optional):
              <pre className="bg-gray-50 p-4 rounded border my-3 overflow-x-auto">
                <code>{`AICRO.configureGTM({
  enabled: true,              // Enable/disable GTM integration
  dataLayerName: 'dataLayer'  // Use custom dataLayer name if needed
}).init();`}</code>
              </pre>
            </li>
            
            <li>
              <strong>Set up GTM variables</strong> to capture AI CRO events.
            </li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">GTM Variables</h2>
          
          <p className="mb-4">Set up these Data Layer variables in your GTM container:</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Variable Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Data Layer Variable Path</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AICRO - Test ID</td>
                  <td className="border border-gray-300 px-4 py-2">aicro.testId</td>
                  <td className="border border-gray-300 px-4 py-2">The ID of the running test</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AICRO - Variant ID</td>
                  <td className="border border-gray-300 px-4 py-2">aicro.variantId</td>
                  <td className="border border-gray-300 px-4 py-2">The ID of the shown variant</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AICRO - Selector</td>
                  <td className="border border-gray-300 px-4 py-2">aicro.selector</td>
                  <td className="border border-gray-300 px-4 py-2">CSS selector for the personalized element</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AICRO - User ID</td>
                  <td className="border border-gray-300 px-4 py-2">aicro.userId</td>
                  <td className="border border-gray-300 px-4 py-2">User identifier (if available)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AICRO - Event</td>
                  <td className="border border-gray-300 px-4 py-2">aicro.event</td>
                  <td className="border border-gray-300 px-4 py-2">Type of event (impression, conversion, etc.)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">AICRO - Timestamp</td>
                  <td className="border border-gray-300 px-4 py-2">aicro.timestamp</td>
                  <td className="border border-gray-300 px-4 py-2">ISO timestamp when event occurred</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">GTM Triggers</h2>
          
          <p className="mb-4">Create these triggers to capture AI CRO events:</p>
          
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Impression Trigger</strong>:
              <ul className="list-disc pl-6 mt-1">
                <li>Trigger Type: Custom Event</li>
                <li>Event Name: aicro_impression</li>
              </ul>
            </li>
            
            <li>
              <strong>Conversion Trigger</strong>:
              <ul className="list-disc pl-6 mt-1">
                <li>Trigger Type: Custom Event</li>
                <li>Event Name: aicro_conversion</li>
              </ul>
            </li>
            
            <li>
              <strong>Custom Event Trigger</strong>:
              <ul className="list-disc pl-6 mt-1">
                <li>Trigger Type: Custom Event</li>
                <li>Event Name: aicro_event</li>
              </ul>
            </li>
            
            <li>
              <strong>E-commerce Triggers</strong>:
              <ul className="list-disc pl-6 mt-1">
                <li>Trigger Type: Custom Event</li>
                <li>Event Names: aicro_product_view, aicro_add_to_cart, aicro_purchase</li>
              </ul>
            </li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">GTM Tags</h2>
          
          <p className="mb-4">Create tags to send AI CRO events to your analytics platform:</p>
          
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Google Analytics 4 Example:</h3>
            <pre className="bg-gray-50 p-4 rounded border my-3 overflow-x-auto">
              <code>{`Tag Type: Google Analytics: GA4 Event
Event Name: aicro_impression
Parameters:
- test_id: {{AICRO - Test ID}}
- variant_id: {{AICRO - Variant ID}}
- selector: {{AICRO - Selector}}
Trigger: Impression Trigger`}</code>
            </pre>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Event Reference</h2>
          
          <p className="mb-4">AI CRO pushes the following events to the data layer:</p>
          
          <h3 className="text-xl font-bold mb-2">Core Events</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Event Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Key Data Points</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_initialized</td>
                  <td className="border border-gray-300 px-4 py-2">Fired when AI CRO is initialized</td>
                  <td className="border border-gray-300 px-4 py-2">userId, pageUrl</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_impression</td>
                  <td className="border border-gray-300 px-4 py-2">Fired when a variant is shown</td>
                  <td className="border border-gray-300 px-4 py-2">testId, variantId, selector</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_conversion</td>
                  <td className="border border-gray-300 px-4 py-2">Fired when a conversion occurs</td>
                  <td className="border border-gray-300 px-4 py-2">testId, variantId, selector, metadata</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_event</td>
                  <td className="border border-gray-300 px-4 py-2">Fired for custom events</td>
                  <td className="border border-gray-300 px-4 py-2">testId, variantId, selector, event, metadata</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="text-xl font-bold mb-2">E-commerce Events</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Event Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Key Data Points</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_product_view</td>
                  <td className="border border-gray-300 px-4 py-2">Product detail view</td>
                  <td className="border border-gray-300 px-4 py-2">product, testId, variantId</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_add_to_cart</td>
                  <td className="border border-gray-300 px-4 py-2">Product added to cart</td>
                  <td className="border border-gray-300 px-4 py-2">product, testId, variantId</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">aicro_purchase</td>
                  <td className="border border-gray-300 px-4 py-2">Order completed</td>
                  <td className="border border-gray-300 px-4 py-2">order, activeTests</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Enable debug mode with <code>AICRO.debug(true)</code> to see GTM events in the console</li>
            <li>Use Google Tag Assistant to verify events are being sent correctly</li>
            <li>Check that your GTM container is properly installed on your website</li>
            <li>Verify that the dataLayer variable exists in your page before AI CRO initialization</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 