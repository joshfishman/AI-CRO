import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

async function initializeEdgeConfig() {
  try {
    console.log('Initializing Edge Config...');
    
    if (!process.env.EDGE_CONFIG) {
      console.error('ERROR: EDGE_CONFIG environment variable is not set');
      console.log('Please run: vercel env pull .env.local');
      return;
    }
    
    // Extract edge config URL and token
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    console.log('Edge Config URL:', edgeConfigUrl);
    
    const parsedUrl = new URL(edgeConfigUrl);
    const configId = parsedUrl.pathname.split('/').pop();
    const token = parsedUrl.searchParams.get('token');
    
    if (!configId || !token) {
      console.error('Invalid Edge Config URL format');
      return;
    }
    
    console.log('Config ID:', configId);
    
    // Read the test configuration
    const configData = JSON.parse(readFileSync('./test-config.json', 'utf8'));
    
    // API endpoint for Edge Config - no teamId parameter based on previous success
    const apiUrl = `https://edge-config.vercel.com/${configId}/items`;
    
    console.log('Sending request to:', apiUrl);
    
    // Set the configuration using fetch
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'page:/test',
            value: configData
          }
        ]
      })
    });
    
    if (response.ok) {
      console.log('Successfully initialized Edge Config!');
      
      // Verify the configuration was set
      const verifyUrl = `https://edge-config.vercel.com/${configId}/items/page:%2Ftest`;
      const verifyResponse = await fetch(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('Verified configuration:', JSON.stringify(verifyData, null, 2));
      } else {
        console.error('Failed to verify configuration:', verifyResponse.status);
        const errorText = await verifyResponse.text();
        console.error('Error details:', errorText);
      }
    } else {
      console.error('Failed to initialize Edge Config:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('Error initializing Edge Config:', error);
  }
}

initializeEdgeConfig(); 