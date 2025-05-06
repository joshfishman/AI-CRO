'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Bookmarklet() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBookmarklet();
  }, []);

  const fetchBookmarklet = async () => {
    try {
      setLoading(true);
      // Use the standalone bookmarklet endpoint
      const response = await fetch('/api/standalone-bookmarklet');
      if (response.ok) {
        const data = await response.json();
        setBookmarkletCode(data.code);
        console.log("Received bookmarklet code with length:", data.code.length);
        // Verify it's a proper javascript: URL
        if (!data.code.startsWith('javascript:')) {
          console.error('Invalid bookmarklet code format:', data.code.substring(0, 50) + '...');
        }
      } else {
        console.error('Failed to fetch bookmarklet:', response.status);
      }
    } catch (error) {
      console.error('Error fetching bookmarklet:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (bookmarkletCode) {
      navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">AI CRO Selector Bookmarklet</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="mb-4 text-lg font-medium">
            Drag the button below to your bookmarks bar to install the AI CRO selector tool:
          </p>
          
          <div className="flex flex-col items-center mb-6">
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-10 w-48 rounded inline-block"></div>
            ) : (
              <>
                {bookmarkletCode && bookmarkletCode.startsWith('javascript:') ? (
                  <a
                    href={bookmarkletCode}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded inline-block"
                    draggable="true"
                    onDragStart={(e) => {
                      // Ensure proper drag behavior
                      e.dataTransfer.setData('text/plain', 'AI CRO Selector');
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    AI CRO Selector
                  </a>
                ) : (
                  <div className="text-red-500">Error loading bookmarklet. Please refresh the page.</div>
                )}
                <p className="text-gray-500 text-sm mt-2">👆 Drag this button to your bookmarks bar</p>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">About the Bookmarklet</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Benefits:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Works on any domain without CORS issues</li>
              <li>No external script loading (everything is contained in the bookmarklet)</li>
              <li>More robust error handling</li>
              <li>Faster loading since it doesn't rely on external scripts</li>
              <li>Better compatibility with content blockers</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Drag the button above to your bookmarks bar</li>
              <li>Navigate to any webpage you want to test</li>
              <li>Click the bookmarklet to activate the selector</li>
              <li>Select elements on the page to modify</li>
              <li>Enter target audience and intent information</li>
              <li>Click "Generate" to see text alternatives</li>
              <li>Select a variation and save it to create an A/B test</li>
            </ol>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">After Creating Tests:</h3>
            <p className="mb-4">
              After saving a test with the bookmarklet, add the client script to your website to display the personalized content to your visitors:
            </p>
            <div className="bg-gray-50 p-4 rounded border mb-4">
              <code className="text-sm">
                {`<script async src="https://ai-cro-three.vercel.app/api/client-script"></script>`}
              </code>
            </div>
            <p className="text-gray-600 mb-4">
              Initialize the script by adding this code to your website:
            </p>
            <div className="bg-gray-50 p-4 rounded border mb-4">
              <code className="text-sm">
                {`<script>
  document.addEventListener('DOMContentLoaded', function() {
    AICRO.debug(true) // Enable debug mode (remove in production)
      .init();
  });
</script>`}
              </code>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={copyToClipboard}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 mr-2"
            >
              {copied ? 'Copied!' : 'Copy Bookmarklet Code'}
            </button>
            
            <button
              onClick={() => window.alert(`Bookmarklet code length: ${bookmarkletCode.length}\nFirst 100 chars: ${bookmarkletCode.substring(0, 100)}...`)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Debug Code
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 