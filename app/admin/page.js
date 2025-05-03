'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Admin() {
  useEffect(() => {
    console.log('Admin page mounted');
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-600">Admin panel content will go here</p>
        </div>
      </main>
    </div>
  );
} 