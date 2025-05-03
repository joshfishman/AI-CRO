import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Admin() {
  const [config, setConfig] = useState({
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 150,
    userTypes: [],
    segments: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load configuration');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to save configuration');
      setError(null);
    } catch (err) {
      setError('Failed to save configuration');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI CRO - Admin Dashboard</title>
        <meta name="description" content="Admin dashboard for AI CRO configuration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Configure your AI CRO settings
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold mb-6">API Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="sk-..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    min="1"
                    max="2048"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold mb-6">User Types</h2>
              <div className="space-y-4">
                {config.userTypes.map((type, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => {
                        const newTypes = [...config.userTypes];
                        newTypes[index] = e.target.value;
                        setConfig({ ...config, userTypes: newTypes });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="User Type"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTypes = config.userTypes.filter((_, i) => i !== index);
                        setConfig({ ...config, userTypes: newTypes });
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, userTypes: [...config.userTypes, ''] })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md font-bold hover:bg-gray-600"
                >
                  Add User Type
                </button>
              </div>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold mb-6">Segments</h2>
              <div className="space-y-4">
                {config.segments.map((segment, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={segment.name}
                        onChange={(e) => {
                          const newSegments = [...config.segments];
                          newSegments[index] = { ...segment, name: e.target.value };
                          setConfig({ ...config, segments: newSegments });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Segment Name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSegments = config.segments.filter((_, i) => i !== index);
                          setConfig({ ...config, segments: newSegments });
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={segment.rules}
                      onChange={(e) => {
                        const newSegments = [...config.segments];
                        newSegments[index] = { ...segment, rules: e.target.value };
                        setConfig({ ...config, segments: newSegments });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows="3"
                      placeholder="Segment Rules (JSON)"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, segments: [...config.segments, { name: '', rules: '' }] })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md font-bold hover:bg-gray-600"
                >
                  Add Segment
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md font-bold hover:bg-opacity-90"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>AI CRO - Admin Dashboard</p>
        </div>
      </footer>
    </div>
  );
} 