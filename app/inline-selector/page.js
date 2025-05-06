'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InlineSelectorPage() {
  const [bookmarkletUrl, setBookmarkletUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchBookmarkletCode() {
      try {
        const response = await fetch('/api/inline-selector');
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarklet code');
        }
        
        const code = await response.text();
        setBookmarkletUrl(code);
      } catch (error) {
        console.error('Error fetching bookmarklet:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookmarkletCode();
  }, []);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI CRO Inline Selector</h1>
          <p className="text-gray-600 mt-1">
            This self-contained selector works on any website, with no cross-origin requests
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Add the bookmarklet to your browser</h2>
          
          {loading ? (
            <div className="animate-pulse h-12 bg-gray-200 rounded-md mb-4"></div>
          ) : (
            <div className="border border-blue-200 bg-blue-50 p-4 rounded-md mb-4 flex items-center justify-between">
              <a 
                href={bookmarkletUrl}
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-center"
                onClick={(e) => e.preventDefault()}
                draggable="true"
              >
                AI CRO Inline Selector
              </a>
              
              <button
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-800"
              >
                {copied ? 'Copied!' : 'Copy code'}
              </button>
            </div>
          )}
          
          <div className="text-gray-600 mb-6">
            <p className="mb-2">
              <b>To install:</b> Drag the button above to your bookmarks bar.
            </p>
            <p>
              <b>Note:</b> If your bookmarks bar is hidden, press <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Shift+B</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-gray-100 rounded">Cmd+Shift+B</kbd> (Mac) to show it.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Use on any website</h2>
          
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Visit the website where you want to select elements</li>
            <li>Click the "AI CRO Inline Selector" in your bookmarks bar</li>
            <li>Hover over elements to see highlights</li>
            <li>Click on an element to select it</li>
            <li>You'll be redirected to the AI CRO platform to continue</li>
          </ol>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold mb-2">Why use the Inline Selector?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Works on <strong>any website</strong> - even with strict security policies</li>
            <li>Zero network requests - avoids all CORS/CSP issues</li>
            <li>No external dependencies - works even offline</li>
            <li>Reliable performance across all browsers</li>
            <li>Self-contained JavaScript - no server communication until selection is complete</li>
          </ul>
        </div>
      </main>
    </div>
  );
}