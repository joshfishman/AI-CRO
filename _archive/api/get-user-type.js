import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, ipAddress, userAgent, workspaceId } = req.query;
    
    if (!email && !ipAddress) {
      return res.status(400).json({ 
        error: 'Missing parameters', 
        message: 'Either email or ipAddress is required' 
      });
    }
    
    // Log the request info
    console.log('User type request:', { email, ipAddress, workspaceId });
    
    // Get HubSpot API key from environment variables
    const hubspotApiKey = process.env.HUBSPOT_PRIVATE_KEY;
    if (!hubspotApiKey) {
      console.error('HUBSPOT_PRIVATE_KEY not configured');
      return res.status(500).json({ error: 'HubSpot API key not configured' });
    }
    
    let userType = 'unknown';
    let hubspotContact = null;
    
    // If email is provided, search HubSpot by email
    if (email) {
      hubspotContact = await getHubSpotContactByEmail(email, hubspotApiKey);
    } 
    // Otherwise, use IP address for lookup
    else if (ipAddress) {
      // Implement IP-based lookup (could be using HubSpot API or other source)
      hubspotContact = await getHubSpotContactByIP(ipAddress, hubspotApiKey);
    }
    
    // Determine user type based on HubSpot contact properties
    if (hubspotContact) {
      userType = determineUserType(hubspotContact);
    }
    
    // Cache the response for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    
    return res.status(200).json({ userType });
  } catch (error) {
    console.error('Error in get-user-type:', error);
    return res.status(500).json({ error: 'Failed to determine user type' });
  }
}

/**
 * Get HubSpot contact by email
 */
async function getHubSpotContactByEmail(email, apiKey) {
  try {
    const searchUrl = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email
              }
            ]
          }
        ],
        properties: [
          'email', 
          'firstname', 
          'lastname', 
          'lifecyclestage', 
          'hs_lead_status',
          'customer_tier',
          'last_conversion_date',
          'recent_conversion_date',
          'total_revenue'
        ],
        limit: 1
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('HubSpot API error:', error);
      return null;
    }
    
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.error('Error fetching HubSpot contact by email:', error);
    return null;
  }
}

/**
 * Get HubSpot contact by IP address
 * Note: This is a placeholder implementation as HubSpot doesn't directly support IP lookup
 */
async function getHubSpotContactByIP(ipAddress, apiKey) {
  // In a real implementation, you might:
  // 1. Check your analytics/tracking system that maps IPs to known visitors
  // 2. Use a third-party IP intelligence service
  // 3. Match against recent site visitors in HubSpot
  
  console.log('IP-based lookup not fully implemented. Using fallback logic.');
  return null;
}

/**
 * Determine user type based on HubSpot contact properties
 */
function determineUserType(contact) {
  if (!contact || !contact.properties) {
    return 'new-visitor';
  }
  
  const props = contact.properties;
  
  // Example segmentation logic (customize based on your needs)
  if (props.lifecyclestage === 'customer') {
    return 'customer';
  } else if (props.lifecyclestage === 'opportunity') {
    return 'opportunity';
  } else if (props.lifecyclestage === 'lead') {
    return 'lead';
  } else if (props.recent_conversion_date) {
    return 'lead';
  } else {
    return 'prospect';
  }
}