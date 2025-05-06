'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ElementGroupManager from '../components/ElementGroupManager';

export default function MultiSelectPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectionData, setSelectionData] = useState(null);
  
  useEffect(() => {
    // Check for data in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('aicro_selection_data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setSelectionData(parsedData);
          
          // Clear localStorage to prevent stale data on refresh
          localStorage.removeItem('aicro_selection_data');
        }
      } catch (error) {
        console.error('Error loading selection data:', error);
      }
    }
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-blue-600">AI CRO</h2>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Beta
            </span>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bookmarklet" className="text-gray-600 hover:text-gray-900">
                  Bookmarklet
                </Link>
              </li>
              <li>
                <Link href="/multi-select" className="text-blue-600 font-medium">
                  Multi-Select
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                  Documentation
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Multi-Element Selection</h1>
            <p className="text-gray-600 mt-1">
              Select and personalize multiple elements simultaneously
            </p>
            
            {selectionData && (
              <div className="mt-2 text-sm text-blue-600">
                Loaded data from: {selectionData.url}
              </div>
            )}
          </div>
          <div>
            <Link 
              href="/bookmarklet"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Get Selector Tool
            </Link>
          </div>
        </div>
        
        {isLoaded ? (
          <ElementGroupManager initialData={selectionData} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-28 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">How to Use Multi-Select</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Install the <Link href="/bookmarklet" className="text-blue-600 hover:underline">Element Selector Bookmarklet</Link></li>
            <li>Visit your website and click on the bookmarklet</li>
            <li>Select multiple elements on your page using the selector tool</li>
            <li>Configure page-level audience and intent targeting</li>
            <li>Generate personalized content variations for all selected elements</li>
            <li>Preview and choose the best variations</li>
            <li>Apply changes to create your test</li>
          </ol>
        </div>
      </main>
    </div>
  );
} 