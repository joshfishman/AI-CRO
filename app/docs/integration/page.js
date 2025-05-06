'use client';

import React from 'react';
import Link from 'next/link';
import DocsLayout from '../DocsLayout';

export default function IntegrationGuidesPage() {
  return (
    <DocsLayout>
      <h1 className="text-3xl font-bold mb-6">Integration Guides</h1>
      
      <p className="text-lg mb-8">
        AI CRO can be integrated with various platforms and CMSes. Choose the integration guide that matches your setup:
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">
            <Link href="/docs/webflow" className="text-blue-600 hover:underline">
              Webflow Integration
            </Link>
          </h2>
          <p className="text-gray-600 mb-4">
            Comprehensive guide for integrating AI CRO with Webflow sites. Includes CORS handling, initialization, and troubleshooting.
          </p>
          <Link href="/docs/webflow" className="text-blue-600 font-medium hover:underline">
            Read Guide &rarr;
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">
            <Link href="/docs/hellohelpr" className="text-blue-600 hover:underline">
              HelloHelpr Guide
            </Link>
          </h2>
          <p className="text-gray-600 mb-4">
            Specific instructions for integrating AI CRO with the HelloHelpr Webflow site. Includes custom settings and troubleshooting.
          </p>
          <Link href="/docs/hellohelpr" className="text-blue-600 font-medium hover:underline">
            Read Guide &rarr;
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">
            <Link href="/docs/gtm" className="text-blue-600 hover:underline">
              Google Tag Manager Integration
            </Link>
          </h2>
          <p className="text-gray-600 mb-4">
            Learn how to integrate AI CRO with Google Tag Manager for analytics tracking and event management.
          </p>
          <Link href="/docs/gtm" className="text-blue-600 font-medium hover:underline">
            Read Guide &rarr;
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Using the AI CRO Script</h3>
        <p className="mb-4">
          For all integrations, you'll need to add our script to your website:
        </p>
        <pre className="bg-white p-4 rounded-md overflow-x-auto border border-blue-100">
          {`<script async src="https://ai-cro-three.vercel.app/api/aicro-script"></script>`}
        </pre>
      </div>
      
      <div className="flex justify-center mt-12">
        <Link href="/api/aicro-script?bookmarklet=true" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          target="_blank">
          Get AI CRO Bookmarklet
        </Link>
      </div>
    </DocsLayout>
  );
} 