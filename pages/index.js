import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
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
        <title>AI CRO - Website Personalization Tool</title>
        <meta name="description" content="AI-powered website personalization and conversion rate optimization tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="title">AI CRO</h1>
        <p className="description">
          AI-powered website personalization and conversion rate optimization tool
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Bookmarklet Generator</h2>
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
                  className="input"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your website domain to generate a bookmarklet
                </p>
              </div>
              <button
                onClick={generateBookmarklet}
                className="btn"
              >
                Generate Bookmarklet
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Installation Steps</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Generate your bookmarklet using the form</li>
              <li>Drag the generated bookmarklet to your bookmarks bar</li>
              <li>Visit your website and click the bookmarklet</li>
              <li>Select elements to personalize</li>
              <li>Configure your personalization rules</li>
            </ol>
          </div>
        </div>

        {bookmarklet && (
          <div className="mt-8 max-w-6xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Your Bookmarklet</h2>
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
              <p className="mt-2 text-sm text-gray-500">
                Drag this link to your bookmarks bar: <a href={bookmarklet} className="text-primary hover:underline">AI CRO Selector</a>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>AI CRO - Making website personalization easy</p>
        </div>
      </footer>
    </div>
  );
} 