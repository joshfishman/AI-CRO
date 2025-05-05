'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Bookmarklet() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarklet();
  }, []);

  const fetchBookmarklet = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-bookmarklet');
      if (response.ok) {
        const data = await response.json();
        setBookmarkletCode(data.code);
      } else {
        console.error('Failed to fetch bookmarklet:', response.status);
      }
    } catch (error) {
      console.error('Error fetching bookmarklet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">AI CRO Bookmarklet</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 mb-6">
            <li><strong>Drag</strong> the button below to your bookmarks bar</li>
            <li>Navigate to <strong>any website</strong> where you want to enable personalization</li>
            <li><strong>Click</strong> the bookmarklet in your bookmarks bar</li>
            <li>The AI CRO script will automatically detect and personalize important elements</li>
          </ol>

          <div className="mb-6 text-center">
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-10 w-48 rounded inline-block"></div>
            ) : (
              <a
                href={bookmarkletCode}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded inline-block"
                draggable="true"
                onDragStart={(e) => {
                  // Ensure proper drag behavior
                  e.dataTransfer.setData('text/plain', 'AI CRO');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                ⚡ AI CRO Personalizer
              </a>
            )}
            <p className="text-gray-500 text-sm mt-2">👆 Drag this button to your bookmarks bar</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">What this does:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Automatically detects important elements on any page</li>
              <li>Personalizes content based on visitor behavior</li>
              <li>Tracks interactions for optimization</li>
              <li>Works on any website without modifying code</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 