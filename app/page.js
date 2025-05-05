'use client';

import React from "react";
import Link from "next/link";
import { MdCode, MdInsights, MdPeople, MdBookmark, MdOutlineHub } from "react-icons/md";

export default function Home() {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">AI-Powered Website Personalization</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Optimize your website's conversion rate with AI-driven content personalization.
          Create, test, and deploy personalized experiences without coding.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdCode className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">Easy Integration</h2>
          </div>
          <p className="text-gray-600 mb-4">Add a simple script to your website to start personalizing content instantly.</p>
          <Link href="/docs" className="text-blue-600 hover:text-blue-800 font-medium">View Installation Guide →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdPeople className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">User Segmentation</h2>
          </div>
          <p className="text-gray-600 mb-4">Target visitors based on behavior, location, device, and custom attributes.</p>
          <Link href="/segments" className="text-blue-600 hover:text-blue-800 font-medium">Manage Segments →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdInsights className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">A/B Testing</h2>
          </div>
          <p className="text-gray-600 mb-4">Test different content variations and automatically promote winners.</p>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">Manage Tests →</Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-6">Installation Instructions</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">1. Add the script to your website</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
              {`<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>`}
            </code>
          </div>
          <p className="text-gray-600 text-sm">Add this script to the <code>&lt;head&gt;</code> section of your website.</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">2. Initialize the library</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
              {`<script>
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.init();
  });
</script>`}
            </code>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">3. Mark elements for personalization</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
              {`<h1 data-aicro>Welcome to our website!</h1>
<button data-aicro class="cta-button">Sign Up Now</button>`}
            </code>
          </div>
          <p className="text-gray-600 text-sm">Add the <code>data-aicro</code> attribute to elements you want to personalize.</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">4. Create tests in the admin dashboard</h3>
          <p className="text-gray-600 mb-4">Use the admin dashboard to create tests for your marked elements.</p>
          <Link href="/admin" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li className="ml-4">
            <span className="font-medium">Install the Bookmarklet:</span> Visit the <Link href="/bookmarklet" className="text-blue-600 hover:text-blue-800">Bookmarklet page</Link> to add the element selector to your browser.
          </li>
          <li className="ml-4">
            <span className="font-medium">Create Segments:</span> Define your audience using the <Link href="/segments" className="text-blue-600 hover:text-blue-800">Segments page</Link>.
          </li>
          <li className="ml-4">
            <span className="font-medium">Configure Tests:</span> Set up A/B tests in the <Link href="/admin" className="text-blue-600 hover:text-blue-800">Admin Panel</Link>.
          </li>
          <li className="ml-4">
            <span className="font-medium">Monitor Results:</span> Track test performance in real-time.
          </li>
        </ol>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-gray-600">Need help? Check out our documentation</p>
            <Link href="/docs" className="text-blue-600 hover:text-blue-800 font-medium">View Documentation →</Link>
          </div>
          
          <Link 
            href="https://github.com/joshfishman/AI-CRO" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-gray-700 hover:text-black"
          >
            <MdOutlineHub className="mr-2" />
            GitHub Repository
          </Link>
        </div>
      </div>
    </>
  );
} 