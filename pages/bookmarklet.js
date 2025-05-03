import Head from 'next/head';
import { useState } from 'react';

export default function Bookmarklet() {
  const [domain, setDomain] = useState('');
  const [bookmarklet, setBookmarklet] = useState('');

  const generateBookmarklet = () => {
    const encodedDomain = encodeURIComponent(domain);
    const bookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='https://ai-cro-three.vercel.app/api/selector-bookmarklet?domain=${encodedDomain}';document.body.appendChild(s);})();`;
    setBookmarklet(bookmarkletCode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI CRO - Element Selector Bookmarklet</title>
        <meta name="description" content="Generate a bookmarklet to select elements for personalization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Element Selector Bookmarklet</h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Generate a bookmarklet to select elements on your website for personalization
        </p>

        <div className="max-w-2xl mx-auto">
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-6">Generate Bookmarklet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Website Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your website domain to generate a bookmarklet
                </p>
              </div>
              <button
                onClick={generateBookmarklet}
                className="w-full px-4 py-2 bg-primary text-white rounded-md font-bold hover:bg-opacity-90"
              >
                Generate Bookmarklet
              </button>
            </div>
          </div>

          {bookmarklet && (
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mt-8">
              <h2 className="text-2xl font-bold mb-6">Your Bookmarklet</h2>
              <div className="space-y-4">
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{bookmarklet}</code>
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(bookmarklet)}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Drag this link to your bookmarks bar: <a href={bookmarklet} className="text-primary hover:underline">AI CRO Selector</a>
                </p>
              </div>
            </div>
          )}

          <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mt-8">
            <h2 className="text-2xl font-bold mb-6">How to Use</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Generate your bookmarklet using the form above</li>
              <li>Drag the generated bookmarklet to your bookmarks bar</li>
              <li>Visit your website and click the bookmarklet</li>
              <li>Click on elements you want to personalize</li>
              <li>Configure personalization rules for each element</li>
              <li>Save your configuration</li>
            </ol>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>AI CRO - Element Selector Bookmarklet</p>
        </div>
      </footer>
    </div>
  );
} 