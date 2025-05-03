import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI CRO - Home</title>
        <meta name="description" content="AI-powered conversion rate optimization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">AI CRO</h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          AI-powered conversion rate optimization for your website
        </p>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/admin" className="block">
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
              <p className="text-gray-600">
                Configure your AI CRO settings and manage personalization rules
              </p>
            </div>
          </Link>

          <Link href="/segments" className="block">
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold mb-4">Segment Management</h2>
              <p className="text-gray-600">
                Create and manage user segments for targeted personalization
              </p>
            </div>
          </Link>

          <Link href="/bookmarklet" className="block">
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold mb-4">Element Selector</h2>
              <p className="text-gray-600">
                Generate a bookmarklet to select elements for personalization
              </p>
            </div>
          </Link>

          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Documentation</h2>
            <p className="text-gray-600">
              Learn how to use AI CRO to optimize your website's conversion rate
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>AI CRO - AI-powered conversion rate optimization</p>
        </div>
      </footer>
    </div>
  );
} 