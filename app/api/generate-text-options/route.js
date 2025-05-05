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
    // Parse request body
    const requestData = await request.json();
    
    // Extract fields
    const { originalText, prompt, elementType, audience, intent, url } = requestData;
    
    if (!originalText) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing originalText parameter'
      }), { status: 400, headers });
    }
    
    // Generate text options based on the element type and other context
    const options = await generateTextOptions(originalText, prompt, elementType, audience, intent, url);
    
    return new Response(JSON.stringify({
      success: true,
      options
    }), { headers });
    
  } catch (error) {
    console.error('Error generating text options:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate text options'
    }), { status: 500, headers });
  }
}

// Function to generate text options based on element type and context
async function generateTextOptions(originalText, prompt, elementType, audience, intent, url) {
  // This would typically call an LLM API like OpenAI or Claude
  // For now, we'll generate mock options based on element type
  
  let options = [];
  
  // Generate different options based on element type
  switch (elementType.toLowerCase()) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      // Heading options
      options = [
        `${originalText} - New and Improved!`,
        `Discover ${originalText.replace(/\.$/, '')} Today`,
        `${originalText.replace(/\.$/, '')} - The Ultimate Solution`
      ];
      break;
      
    case 'button':
    case 'a':
      // Button/link options
      options = [
        "Get Started Now",
        "Try It Free",
        "See Results Today",
        "Learn More"
      ];
      break;
      
    case 'p':
      // Paragraph options - shorten, make more persuasive
      if (originalText.length > 100) {
        const shorterText = originalText.split('.').slice(0, 2).join('.') + '.';
        options = [
          shorterText,
          `${shorterText} Try it today and see the difference.`,
          `Our customers love it! ${shorterText}`
        ];
      } else {
        options = [
          `${originalText} Don't miss this opportunity.`,
          `Act now: ${originalText}`,
          `${originalText} Join thousands of satisfied customers.`
        ];
      }
      break;
      
    default:
      // Generic options
      options = [
        originalText.replace(/\.$/, '!'),
        `${originalText} (Limited Time Offer)`,
        `New: ${originalText}`
      ];
  }
  
  // If audience is provided, add a targeted option
  if (audience && audience.trim() !== '') {
    options.push(`Perfect for ${audience}: ${originalText}`);
  }
  
  // If intent is provided, add an intent-focused option
  if (intent && intent.trim() !== '') {
    options.push(`${originalText} - Ideal for ${intent}`);
  }
  
  // Return unique options only
  return Array.from(new Set(options));
} 