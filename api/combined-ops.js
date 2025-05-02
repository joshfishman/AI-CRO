/**
 * Combined API handler for multiple operations to reduce serverless function count
 * Uses the "op" query parameter to determine which operation to perform
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Determine which operation to perform
    const op = req.query.op || '';
    
    // Route to the appropriate handler based on the operation
    switch (op) {
      case 'get-config':
        return await handleGetConfig(req, res);
      case 'save-config':
        return await handleSaveConfig(req, res);
      case 'get-user-type':
        return await handleGetUserType(req, res);
      case 'get-variants':
        return await handleGetVariants(req, res);
      case 'generate-variants':
        return await handleGenerateVariants(req, res);
      case 'record-event':
        return await handleRecordEvent(req, res);
      case 'cache-variants':
        return await handleCacheVariants(req, res);
      case 'get-cached-variants':
        return await handleGetCachedVariants(req, res);
      case 'get-test-results':
        return await handleGetTestResults(req, res);
      default:
        return res.status(400).json({ error: 'Unknown operation. Use the "op" query parameter to specify an operation.' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
}

// Import handlers from existing API files
import { default as handleGetConfig } from './get-config';
import { default as handleSaveConfig } from './save-config';
import { default as handleGetUserType } from './get-user-type';
import { default as handleGenerateVariants } from './generate-variants';
import { default as handleRecordEvent } from './record-event';
import { default as handleCacheVariants } from './cache-variants';
import { default as handleGetCachedVariants } from './get-cached-variants';
import { default as handleGetTestResults } from './get-test-results';

// Define the get-variants handler that was missing
async function handleGetVariants(req, res) {
  // Simple proxy to get-cached-variants for compatibility
  return await handleGetCachedVariants(req, res);
} 