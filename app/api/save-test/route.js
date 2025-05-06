export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function POST(request) {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    const data = await request.json();
    const { url, selector, originalContent, variantContent, elementType, audience, intent } = data;
    
    if (!selector || !url) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: selector, url'
      }), { status: 400, headers });
    }
    
    // Generate testId and variantId
    const testId = `test-${Date.now()}`;
    const variantId = 'variant-1';
    
    // Create test configuration
    const testConfig = {
      id: testId,
      url,
      selector,
      originalContent,
      variants: [
        {
          id: 'control',
          content: originalContent,
          weight: 50
        },
        {
          id: variantId,
          content: variantContent,
          weight: 50
        }
      ],
      elementType,
      audience,
      intent,
      status: 'active',
      metrics: {
        impressions: 0,
        conversions: 0,
        startDate: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    
    // In a production environment, this would be stored in a database or edge config
    console.log('Saving test configuration:', testConfig);
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      testId,
      variantId,
      message: 'Test configuration saved successfully'
    }), { headers });
    
  } catch (error) {
    console.error('Error saving test configuration:', error);
    return new Response(JSON.stringify({
      error: 'Failed to save test configuration'
    }), { status: 500, headers });
  }
} 