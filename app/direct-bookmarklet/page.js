'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DirectBookmarkletPage() {
  const [bookmarkletUrl, setBookmarkletUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchBookmarkletCode() {
      try {
        const response = await fetch('/api/direct-bookmarklet');
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
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-blue-600">AI CRO</h2>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Beta</span>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              </li>
              <li>
                <Link href="/bookmarklet" className="text-gray-600 hover:text-gray-900">Bookmarklet</Link>
              </li>
              <li>
                <Link href="/direct-bookmarklet" className="text-blue-600 font-medium">Direct Bookmarklet</Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900">Documentation</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI CRO Direct Selector Bookmarklet</h1>
          <p className="text-gray-600 mt-1">
            Our improved bookmarklet for directly selecting elements on any website
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
                AI CRO Selector
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
          <h2 className="text-xl font-semibold mb-4">2. Use the bookmarklet on any website</h2>
          
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Visit the website where you want to select elements</li>
            <li>Click the "AI CRO Selector" in your bookmarks bar</li>
            <li>Hover over elements to see highlights</li>
            <li>Click on an element to select it</li>
            <li>You'll be redirected to the AI CRO platform to continue</li>
          </ol>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold mb-2">Why use the Direct Bookmarklet?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Improved cross-domain compatibility</li>
            <li>Better error handling with visual feedback</li>
            <li>Faster loading with optimized request handling</li>
            <li>Avoids template literal issues in cross-origin contexts</li>
            <li>More reliable on websites with strict Content Security Policies</li>
          </ul>
        </div>
      </main>
    </div>
  );
} 