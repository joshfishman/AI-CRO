import Link from 'next/link';

export default function Bookmarklet() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Bookmarklet</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Install Bookmarklet</h2>
          <p className="text-gray-600 mb-4">
            Drag this button to your bookmarks bar to install the selector bookmarklet:
          </p>
          <a
            href="javascript:(function(){var s=document.createElement('script');s.src='https://your-domain.com/bookmarklet.js';document.body.appendChild(s);})();"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            AI CRO Selector
          </a>
        </div>
      </main>
    </div>
  );
} 