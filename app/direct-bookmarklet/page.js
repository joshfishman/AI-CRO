'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DirectBookmarklet() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBookmarklet();
  }, []);

  const fetchBookmarklet = async () => {
    try {
      const response = await fetch('/api/bookmarklet-direct');
      if (response.ok) {
        const data = await response.json();
        setBookmarkletCode(data.code);
      }
    } catch (error) {
      console.error('Error fetching bookmarklet:', error);
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
          <h1 className="text-4xl font-bold">Direct Selector Bookmarklet</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="mb-4 text-lg">
            Drag the button below to your bookmarks bar to install the AI CRO selector tool:
          </p>
          
          <div className="flex flex-col items-center mb-6">
            {bookmarkletCode ? (
              <a 
                href={bookmarkletCode}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 mb-4"
                draggable="true"
              >
                AI CRO Selector
              </a>
            ) : (
              <div className="h-12 w-48 bg-blue-200 animate-pulse rounded-md mb-4"></div>
            )}
            
            <p className="text-sm text-gray-600">
              Drag this button to your bookmarks bar
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">How to use:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Drag the button above to your bookmarks bar</li>
              <li>Navigate to any webpage you want to test</li>
              <li>Click the bookmarklet to activate the selector</li>
              <li>Select elements on the page to modify</li>
              <li>Configure test options and continue</li>
            </ol>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Note:</h2>
            <p>
              This bookmarklet directly loads the selector module without loading the full client script first,
              which can resolve some issues with cross-origin domains and template literals.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={copyToClipboard}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              {copied ? 'Copied!' : 'Copy Bookmarklet Code'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 