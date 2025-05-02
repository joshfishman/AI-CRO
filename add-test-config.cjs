const { createClient } = require('@vercel/edge-config');
const dotenv = require('dotenv');
const fs = require('fs');
const https = require('https');
const url = require('url');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function addTestConfig() {
  try {
    console.log('Adding test configuration to Edge Config...');
    
    if (!process.env.EDGE_CONFIG) {
      console.error('ERROR: EDGE_CONFIG environment variable is not set');
      console.log('Please run: vercel env pull .env.local');
      return;
    }
    
    // Read the test configuration from file
    const configData = JSON.parse(fs.readFileSync('./test-config.json', 'utf8'));
    
    // Parse the Edge Config URL
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    const parsedUrl = new URL(edgeConfigUrl);
    const configId = parsedUrl.pathname.split('/').pop();
    const token = parsedUrl.searchParams.get('token');
    
    console.log(`Config ID: ${configId}`);
    
    // Make a direct API call to set the config
    const data = JSON.stringify({
      items: [
        {
          operation: 'upsert',
          key: 'page:/test',
          value: configData
        }
      ]
    });
    
    const options = {
      hostname: 'edge-config.vercel.com',
      path: `/${configId}/items`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Successfully added test configuration to Edge Config!');
          
          // Now verify it was added
          const getOptions = {
            hostname: 'edge-config.vercel.com',
            path: `/${configId}/items/page:%2Ftest`,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          
          const verifyReq = https.request(getOptions, (verifyRes) => {
            let verifyData = '';
            
            verifyRes.on('data', (chunk) => {
              verifyData += chunk;
            });
            
            verifyRes.on('end', () => {
              if (verifyRes.statusCode === 200) {
                console.log('Verified configuration:', JSON.parse(verifyData));
              } else {
                console.error('Failed to verify configuration:', verifyRes.statusCode, verifyData);
              }
            });
          });
          
          verifyReq.on('error', (error) => {
            console.error('Error verifying configuration:', error);
          });
          
          verifyReq.end();
        } else {
          console.error('Failed to add configuration:', res.statusCode, responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request:', error);
    });
    
    req.write(data);
    req.end();
  } catch (error) {
    console.error('Error adding test configuration:', error);
  }
}

addTestConfig(); 