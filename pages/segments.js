import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/segments');
      const data = await response.json();
      setSegments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load segments');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(segments),
      });
      if (!response.ok) throw new Error('Failed to save segments');
      setError(null);
    } catch (err) {
      setError('Failed to save segments');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading segments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI CRO - Segment Management</title>
        <meta name="description" content="Manage user segments for personalization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Segment Management</h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Create and manage user segments for personalization
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {segments.map((segment, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Segment {index + 1}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      const newSegments = segments.filter((_, i) => i !== index);
                      setSegments(newSegments);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segment Name
                    </label>
                    <input
                      type="text"
                      value={segment.name}
                      onChange={(e) => {
                        const newSegments = [...segments];
                        newSegments[index] = { ...segment, name: e.target.value };
                        setSegments(newSegments);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Segment Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segment Rules
                    </label>
                    <textarea
                      value={segment.rules}
                      onChange={(e) => {
                        const newSegments = [...segments];
                        newSegments[index] = { ...segment, rules: e.target.value };
                        setSegments(newSegments);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows="4"
                      placeholder="Segment Rules (JSON)"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setSegments([...segments, { name: '', rules: '' }])}
                className="px-4 py-2 bg-gray-500 text-white rounded-md font-bold hover:bg-gray-600"
              >
                Add Segment
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md font-bold hover:bg-opacity-90"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Segments'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>AI CRO - Segment Management</p>
        </div>
      </footer>
    </div>
  );
} 