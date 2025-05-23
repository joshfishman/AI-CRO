'use client';

import React from "react";
import Link from "next/link";
import { MdCode, MdInsights, MdPeople, MdBookmark, MdOutlineHub, MdAutoAwesome, MdSpeed, MdTune } from "react-icons/md";

export default function Home() {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">AI-Powered Website Personalization</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Optimize your website's conversion rate with AI-driven content personalization.
          Zero markup required - our AI automatically detects and personalizes key elements.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdAutoAwesome className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">Automatic Detection</h2>
          </div>
          <p className="text-gray-600 mb-4">No need to modify your HTML. Our AI automatically identifies and personalizes key elements on your site.</p>
          <Link href="/docs#automatic" className="text-blue-600 hover:text-blue-800 font-medium">Learn About Auto-Detection →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdCode className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">Easy Integration</h2>
          </div>
          <p className="text-gray-600 mb-4">Add a simple script to your website to start personalizing content instantly - no coding required.</p>
          <Link href="/docs" className="text-blue-600 hover:text-blue-800 font-medium">View Installation Guide →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdPeople className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">User Segmentation</h2>
          </div>
          <p className="text-gray-600 mb-4">Target visitors based on behavior, location, device, and custom attributes for personalized experiences.</p>
          <Link href="/segments" className="text-blue-600 hover:text-blue-800 font-medium">Manage Segments →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdInsights className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">A/B Testing</h2>
          </div>
          <p className="text-gray-600 mb-4">Test different content variations and automatically promote winners to maximize conversions.</p>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">Manage Tests →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdSpeed className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">Fast Performance</h2>
          </div>
          <p className="text-gray-600 mb-4">Lightning-fast personalization that doesn't slow down your website or create layout shifts.</p>
          <Link href="/docs#configuration" className="text-blue-600 hover:text-blue-800 font-medium">Performance Options →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <MdTune className="text-blue-500 text-xl mr-2" />
            <h2 className="text-xl font-semibold">Custom Rules</h2>
          </div>
          <p className="text-gray-600 mb-4">Create custom personalization rules to target specific elements based on your unique requirements.</p>
          <Link href="/docs#automatic" className="text-blue-600 hover:text-blue-800 font-medium">Custom Rules Guide →</Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold mb-6">Installation Instructions</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">1. Add the script to your website</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
              {`<script async src="https://ai-cro-three.vercel.app/api/external-script"></script>`}
            </code>
          </div>
          <p className="text-gray-600 text-sm">Add this script to the <code>&lt;head&gt;</code> section of your website. This is our improved script with proper CORS support.</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">2. Initialize the library</h3>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
              {`<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (window.AICRO) {
      window.AICRO.init();
    }
  });
</script>`}
            </code>
          </div>
          <p className="text-gray-600 text-sm">Or use the data attribute for automatic initialization:</p>
          <div className="bg-gray-50 p-4 rounded border mb-2 overflow-x-auto">
            <code className="text-sm">
              {`<script async src="https://ai-cro-three.vercel.app/api/external-script" data-aicro-auto-init></script>`}
            </code>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">3. For websites with strict CSP or CORS issues</h3>
          <p className="text-gray-600">
            If your website has strict Content Security Policies or you're experiencing CORS issues, use our improved solution:
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Link href="/inline-selector" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Get Inline Selector
            </Link>
            <Link href="/direct-bookmarklet" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              Direct Bookmarklet
            </Link>
            <p className="text-gray-600 text-sm mt-2">
              Our inline selector is completely self-contained and works on any website with no external dependencies.
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">4. Create tests in the admin dashboard</h3>
          <p className="text-gray-600 mb-4">Use the admin dashboard to create and manage personalization tests.</p>
          <Link href="/admin" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li className="ml-4">
            <span className="font-medium">Use our improved Inline Selector:</span>
            <div className="ml-6 mt-2">
              <Link href="/inline-selector" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center">
                <MdBookmark className="mr-2" />
                Get Inline Selector
              </Link>
              <p className="text-gray-600 text-sm mt-2">
                Our self-contained selector works on any website, even with strict CSP or CORS restrictions.
              </p>
            </div>
          </li>
          <li className="ml-4">
            <span className="font-medium">Select elements to personalize:</span> Use the selector to choose elements on your site for personalization or A/B testing.
          </li>
          <li className="ml-4">
            <span className="font-medium">Configure Tests:</span> Set up A/B tests in the <Link href="/admin" className="text-blue-600 hover:text-blue-800">Admin Panel</Link>.
          </li>
          <li className="ml-4">
            <span className="font-medium">Monitor Results:</span> Track test performance in real-time.
          </li>
        </ol>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">Need help with integration?</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link href="/docs/integration/webflow" className="text-blue-600 hover:text-blue-800 font-medium">Webflow Guide</Link>
              <Link href="/docs/integration/gtm" className="text-blue-600 hover:text-blue-800 font-medium">GTM Integration</Link>
              <Link href="/docs/integration/hellohelpr" className="text-blue-600 hover:text-blue-800 font-medium">HelloHelpr Guide</Link>
            </div>
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