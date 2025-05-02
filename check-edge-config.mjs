import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

async function checkEdgeConfig() {
  try {
    console.log('Checking Edge Config...');
    
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
    
    // API endpoint for Edge Config
    const apiUrl = `https://edge-config.vercel.com/${configId}/items?teamId=joshfishmans-projects`;
    
    console.log('Checking Edge Config at:', apiUrl);
    
    // Try to get a list of items
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Edge Config items:', JSON.stringify(data, null, 2));
    } else {
      console.error('Failed to access Edge Config:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      // Try another approach - direct API call without teamId
      console.log('\nTrying alternative approach...');
      const altUrl = `https://edge-config.vercel.com/${configId}/items`;
      
      console.log('Checking Edge Config at:', altUrl);
      
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('Edge Config items (alternative):', JSON.stringify(altData, null, 2));
      } else {
        console.error('Failed to access Edge Config (alternative):', altResponse.status);
        const altErrorText = await altResponse.text();
        console.error('Error details:', altErrorText);
      }
    }
    
  } catch (error) {
    console.error('Error checking Edge Config:', error);
  }
}

checkEdgeConfig(); 