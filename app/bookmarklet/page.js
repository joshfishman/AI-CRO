'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Bookmarklet() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');

  useEffect(() => {
    fetchBookmarklet();
  }, []);

  const fetchBookmarklet = async () => {
    try {
      const response = await fetch('/api/get-bookmarklet');
      if (response.ok) {
        const data = await response.json();
        setBookmarkletCode(data.code);
      }
    } catch (error) {
      console.error('Error fetching bookmarklet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Selector Bookmarklet</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 mb-6">
            <li>Drag the button below to your bookmarks bar</li>
            <li>Navigate to any website where you want to select elements</li>
            <li>Click the bookmarklet in your bookmarks bar</li>
            <li>Click on any element you want to select</li>
            <li>Copy the selector and use it in your configuration</li>
          </ol>

          <div className="mb-6">
            <a
              href={bookmarkletCode}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
            >
              AI CRO Selector
            </a>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Bookmarklet Code</h3>
            <pre className="text-sm overflow-x-auto">
              <code>{bookmarkletCode}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
} 