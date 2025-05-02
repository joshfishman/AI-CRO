import fetch from 'node-fetch';
import { createClient } from '@vercel/edge-config';

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
    const { 
      email, 
      ipAddress, 
      deviceType, 
      browser, 
      referrer, 
      location,
      timeOnSite,
      pageViews,
      lastVisit,
      workspaceId 
    } = req.query;
    
    // Log the request info
    console.log('Advanced targeting request:', { 
      email, 
      ipAddress, 
      deviceType, 
      browser,
      referrer,
      location,
      timeOnSite,
      pageViews,
      lastVisit,
      workspaceId 
    });

    // Initialize Edge Config client for segment definitions
    let edgeConfig;
    try {
      edgeConfig = createClient(process.env.EDGE_CONFIG);
    } catch (error) {
      console.error('Error initializing Edge Config:', error);
    }
    
    // Basic user segments
    let segments = [];
    let userType = 'unknown';
    
    // Get HubSpot data if available
    let hubspotContact = null;
    const hubspotApiKey = process.env.HUBSPOT_PRIVATE_KEY;
    
    if (hubspotApiKey && email) {
      hubspotContact = await getHubSpotContactByEmail(email, hubspotApiKey);
    } 
    
    // Determine user type and segments based on available data
    if (hubspotContact) {
      userType = determineUserType(hubspotContact);
      segments.push(userType);
      
      // Add more detailed segments based on HubSpot data
      if (hubspotContact.properties) {
        const props = hubspotContact.properties;
        
        // Add industry segment if available
        if (props.industry) {
          segments.push(`industry:${props.industry.toLowerCase()}`);
        }
        
        // Add company size segment if available
        if (props.company_size) {
          segments.push(`company_size:${props.company_size.toLowerCase()}`);
        }
        
        // Add customer tier if available
        if (props.customer_tier) {
          segments.push(`tier:${props.customer_tier.toLowerCase()}`);
        }
      }
    } else {
      // Use browsing behavior for segmentation
      if (lastVisit) {
        const lastVisitDate = new Date(parseInt(lastVisit));
        const now = new Date();
        const daysSinceLastVisit = Math.floor((now - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastVisit === 0) {
          segments.push('visit:today');
        } else if (daysSinceLastVisit < 7) {
          segments.push('visit:last_week');
          userType = 'returning';
        } else if (daysSinceLastVisit < 30) {
          segments.push('visit:last_month');
          userType = 'returning';
        } else {
          segments.push('visit:inactive');
        }
      } else {
        segments.push('visit:first_time');
        userType = 'new-visitor';
      }
    }
    
    // Add device type segment
    if (deviceType) {
      segments.push(`device:${deviceType.toLowerCase()}`);
    }
    
    // Add browser segment
    if (browser) {
      segments.push(`browser:${browser.toLowerCase()}`);
    }
    
    // Add referrer segment (clean the referrer to get domain or category)
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerDomain = referrerUrl.hostname.replace('www.', '');
        
        segments.push(`referrer:${referrerDomain}`);
        
        // Categorize common referrers
        if (referrerDomain.includes('google')) {
          segments.push('referrer:search');
        } else if (referrerDomain.includes('facebook') || referrerDomain.includes('instagram') || 
                  referrerDomain.includes('twitter') || referrerDomain.includes('linkedin')) {
          segments.push('referrer:social');
        } else if (referrerDomain.includes('mail') || referrerDomain.includes('outlook') || 
                  referrerDomain.includes('gmail')) {
          segments.push('referrer:email');
        }
      } catch (error) {
        console.warn('Invalid referrer URL:', referrer);
      }
    }
    
    // Add location-based segment
    if (location) {
      segments.push(`location:${location.toLowerCase()}`);
      
      // Get time of day in user's timezone if provided
      try {
        const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const timeZone = await getTimeZoneFromCoordinates(latitude, longitude);
          if (timeZone) {
            const localTime = new Date().toLocaleString('en-US', { timeZone });
            const hour = new Date(localTime).getHours();
            
            if (hour >= 5 && hour < 12) {
              segments.push('time:morning');
            } else if (hour >= 12 && hour < 17) {
              segments.push('time:afternoon');
            } else if (hour >= 17 && hour < 22) {
              segments.push('time:evening');
            } else {
              segments.push('time:night');
            }
          }
        }
      } catch (error) {
        console.warn('Error determining time of day from location:', error);
      }
    }
    
    // Add engagement segments
    if (timeOnSite) {
      const timeOnSiteSeconds = parseInt(timeOnSite);
      if (timeOnSiteSeconds < 30) {
        segments.push('engagement:low');
      } else if (timeOnSiteSeconds < 180) {
        segments.push('engagement:medium');
      } else {
        segments.push('engagement:high');
      }
    }
    
    if (pageViews) {
      const pageViewCount = parseInt(pageViews);
      if (pageViewCount <= 1) {
        segments.push('pageviews:single');
      } else if (pageViewCount < 5) {
        segments.push('pageviews:few');
      } else {
        segments.push('pageviews:many');
      }
    }
    
    // Load custom segments from Edge Config, if available
    let customSegments = [];
    if (edgeConfig) {
      try {
        const customSegmentDefinitions = await edgeConfig.get(`segments:${workspaceId}`);
        if (customSegmentDefinitions && Array.isArray(customSegmentDefinitions)) {
          customSegments = evaluateCustomSegments(customSegmentDefinitions, {
            email,
            ipAddress,
            deviceType,
            browser,
            referrer,
            location,
            timeOnSite: timeOnSite ? parseInt(timeOnSite) : null,
            pageViews: pageViews ? parseInt(pageViews) : null,
            lastVisit: lastVisit ? new Date(parseInt(lastVisit)) : null,
            hubspotData: hubspotContact?.properties
          });
        }
      } catch (error) {
        console.warn('Error loading custom segments:', error);
      }
    }
    
    // Combine all segments
    segments = [...segments, ...customSegments];
    
    // Cache the response for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300');
    
    return res.status(200).json({ 
      userType,
      segments,
      visitorData: {
        isKnownVisitor: !!hubspotContact,
        ...hubspotContact?.properties ? {
          firstName: hubspotContact.properties.firstname,
          lastName: hubspotContact.properties.lastname,
          company: hubspotContact.properties.company
        } : {}
      }
    });
  } catch (error) {
    console.error('Error in advanced-targeting:', error);
    return res.status(500).json({ error: 'Failed to determine user segments', message: error.message });
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
          'company',
          'industry',
          'company_size', 
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

/**
 * Get timezone from latitude and longitude
 */
async function getTimeZoneFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Google Timezone API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.timeZoneId;
  } catch (error) {
    console.error('Error getting timezone:', error);
    return null;
  }
}

/**
 * Evaluate custom segment rules against visitor data
 */
function evaluateCustomSegments(segmentDefinitions, visitorData) {
  const matchedSegments = [];
  
  segmentDefinitions.forEach(segment => {
    if (!segment.id || !segment.rules || !Array.isArray(segment.rules)) {
      return;
    }
    
    // Evaluate all rules for this segment
    const allRulesPassed = segment.rules.every(rule => {
      const { field, operator, value } = rule;
      
      // Extract the value to compare from visitor data
      let fieldValue;
      if (field.startsWith('hubspot.')) {
        const hubspotField = field.replace('hubspot.', '');
        fieldValue = visitorData.hubspotData?.[hubspotField];
      } else {
        fieldValue = visitorData[field];
      }
      
      // Skip rule if field value is undefined
      if (fieldValue === undefined) {
        return false;
      }
      
      // Evaluate based on operator
      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'notEquals':
          return fieldValue !== value;
        case 'contains':
          return String(fieldValue).includes(value);
        case 'notContains':
          return !String(fieldValue).includes(value);
        case 'greaterThan':
          return Number(fieldValue) > Number(value);
        case 'lessThan':
          return Number(fieldValue) < Number(value);
        case 'before':
          return new Date(fieldValue) < new Date(value);
        case 'after':
          return new Date(fieldValue) > new Date(value);
        default:
          return false;
      }
    });
    
    // If all rules pass, add this segment to matched segments
    if (allRulesPassed) {
      matchedSegments.push(segment.id);
    }
  });
  
  return matchedSegments;
} 