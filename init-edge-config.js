import { createClient } from '@vercel/edge-config';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function initializeEdgeConfig() {
  try {
    console.log('Initializing Edge Config with test data...');
    console.log('Edge Config URL:', process.env.EDGE_CONFIG);
    
    // Using Edge Config requires the Vercel Dashboard to set up
    // This script will help initialize Edge Config through the Vercel Dashboard
    
    console.log('\nTo initialize Edge Config:');
    console.log('1. Go to https://vercel.com/joshfishmans-projects/ai-cro');
    console.log('2. Navigate to Storage > Edge Config');
    console.log('3. Select your Edge Config store');
    console.log('4. Click "Add Item"');
    console.log('5. Enter key: page:/test');
    console.log('6. Enter value (in JSON format):');
    console.log(`{
  "url": "/test",
  "selectors": [
    {
      "selector": "h1",
      "prompt": "Write a catchy headline for a landing page",
      "default": "Welcome to our service"
    },
    {
      "selector": ".cta-button",
      "prompt": "Write a compelling call to action",
      "default": "Get Started"
    }
  ]
}`);
    console.log('\nAlternatively, you can use the Vercel CLI:');
    console.log('vercel edge-config add page:/test \'{"url":"/test","selectors":[{"selector":"h1","prompt":"Write a catchy headline for a landing page","default":"Welcome to our service"},{"selector":".cta-button","prompt":"Write a compelling call to action","default":"Get Started"}]}\'');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

initializeEdgeConfig(); 