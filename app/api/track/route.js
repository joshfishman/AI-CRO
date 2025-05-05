export async function POST(request) {
  // Set CORS headers to allow requests from any domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const data = await request.json();
    const { testId, variantId, event, userId, metadata = {} } = data;
    
    // In a production environment, this would write to a database
    // For demo, we'll log to console
    console.log('Event tracked:', {
      timestamp: new Date().toISOString(),
      testId,
      variantId,
      event,
      userId,
      metadata
    });
    
    // In a real implementation, we would:
    // 1. Write to a database or analytics service
    // 2. Update conversion metrics for the test
    // 3. Check if the test has reached statistical significance
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Event tracked successfully'
    }), { headers });
  } catch (error) {
    console.error('Error in track API:', error);
    return new Response(JSON.stringify({ error: 'Failed to track event' }), { 
      status: 500, 
      headers 
    });
  }
} 