'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">AI CRO Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
              <p className="text-gray-600">Manage your AI CRO settings</p>
            </div>
          </Link>

          <Link href="/segments" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Segments</h2>
              <p className="text-gray-600">View and manage user segments</p>
            </div>
          </Link>

          <Link href="/bookmarklet" className="block">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Bookmarklet</h2>
              <p className="text-gray-600">Get the selector bookmarklet for your site</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 