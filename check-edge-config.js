import { createClient } from '@vercel/edge-config';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkEdgeConfig() {
  try {
    console.log('Checking Edge Config connection...');
    console.log('Edge Config URL:', process.env.EDGE_CONFIG);
    
    if (!process.env.EDGE_CONFIG) {
      console.error('ERROR: EDGE_CONFIG environment variable is not set');
      console.log('Please run: vercel env pull .env.local');
      return;
    }
    
    const client = createClient(process.env.EDGE_CONFIG);
    
    try {
      const config = await client.get('page:/test');
      console.log('Successfully retrieved config:', config);
    } catch (error) {
      console.error('Failed to get Edge Config item:', error.message);
      console.log('This might indicate that the item doesn\'t exist yet.');
      console.log('Please add a test item either through the Vercel Dashboard or using the Vercel CLI.');
    }
    
  } catch (error) {
    console.error('Error connecting to Edge Config:', error);
  }
}

checkEdgeConfig(); 