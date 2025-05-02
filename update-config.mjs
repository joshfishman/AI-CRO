import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

async function updateEdgeConfig() {
  try {
    console.log('Updating Edge Config...');
    
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
    
    // First, get the current config to verify it exists
    const getUrl = `https://edge-config.vercel.com/${configId}/items`;
    console.log('Getting current config from:', getUrl);
    
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (getResponse.ok) {
      const currentConfig = await getResponse.json();
      console.log('Current config:', JSON.stringify(currentConfig, null, 2));
      
      // Now, try to update the "greeting" item that we already know exists
      const updateUrl = `https://edge-config.vercel.com/${configId}/items`;
      console.log('Updating config at:', updateUrl);
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',  // Try PATCH instead of PUT
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'update',
              key: 'greeting',
              value: 'hello updated world'
            }
          ]
        })
      });
      
      if (updateResponse.ok) {
        console.log('Successfully updated Edge Config!');
        
        // Verify the update
        const verifyResponse = await fetch(getUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (verifyResponse.ok) {
          const updatedConfig = await verifyResponse.json();
          console.log('Updated config:', JSON.stringify(updatedConfig, null, 2));
        }
      } else {
        console.error('Failed to update Edge Config:', updateResponse.status);
        const errorText = await updateResponse.text();
        console.error('Error details:', errorText);
      }
    } else {
      console.error('Failed to get current Edge Config:', getResponse.status);
      const errorText = await getResponse.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('Error updating Edge Config:', error);
  }
}

updateEdgeConfig(); 