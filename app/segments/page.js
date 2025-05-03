'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/segments');
      if (response.ok) {
        const data = await response.json();
        setSegments(data);
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">User Segments</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p>Loading segments...</p>
          ) : segments.length > 0 ? (
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.id} className="border p-4 rounded">
                  <h3 className="text-xl font-semibold">{segment.name}</h3>
                  <p className="text-gray-600">{segment.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No segments found.</p>
          )}
        </div>
      </main>
    </div>
  );
} 