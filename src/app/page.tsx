import React from "react";
import ClientProvider from "@/components/ClientProvider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">AI CRO Dashboard</h1>
        <p className="text-center text-gray-600 mb-12">AI-powered Conversion Rate Optimization platform</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
            <p className="text-gray-600 mb-4">Manage your AI CRO settings and configurations</p>
            <a href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">Open Admin Panel →</a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Segments</h2>
            <p className="text-gray-600 mb-4">Create and manage user segments for targeted experiments</p>
            <a href="/segments" className="text-blue-600 hover:text-blue-800 font-medium">Manage Segments →</a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Bookmarklet</h2>
            <p className="text-gray-600 mb-4">Install the selector bookmarklet to easily target elements on your site</p>
            <a href="/bookmarklet" className="text-blue-600 hover:text-blue-800 font-medium">Get Bookmarklet →</a>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li className="ml-4">
              <span className="font-medium">Install the Bookmarklet:</span> Visit the <a href="/bookmarklet" className="text-blue-600 hover:text-blue-800">Bookmarklet page</a> and follow the instructions to add it to your browser.
            </li>
            <li className="ml-4">
              <span className="font-medium">Create Segments:</span> Define your target audience using the <a href="/segments" className="text-blue-600 hover:text-blue-800">Segments page</a>.
            </li>
            <li className="ml-4">
              <span className="font-medium">Configure Tests:</span> Set up A/B tests and personalization rules in the <a href="/admin" className="text-blue-600 hover:text-blue-800">Admin Panel</a>.
            </li>
            <li className="ml-4">
              <span className="font-medium">Monitor Results:</span> Track performance of your tests in real-time.
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
