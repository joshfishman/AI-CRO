import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request) {
  // Handle CORS preflight requests
  const origin = request.headers.get('origin') || '*';
  
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function POST(request) {
  try {
    // Get the origin for CORS
    const origin = request.headers.get('origin') || '*';
    
    // Parse the request body
    const data = await request.json();
    const { 
      element, 
      prompt, 
      audience, 
      intent,
      page
    } = data;
    
    console.log('Generating variations for element:', element);
    console.log('Prompt:', prompt);
    console.log('Audience:', audience);
    console.log('Intent:', intent);
    console.log('Page:', page?.url);
    
    // Generate variations using AI or mocked data
    const variations = await generateVariations(
      element.content,
      prompt,
      audience,
      intent
    );
    
    // Return the generated variations
    return new Response(
      JSON.stringify({ 
        variations,
        success: true
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  } catch (error) {
    console.error('Error generating variations:', error);
    
    // Return an error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate variations',
        message: error.message
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}

// Function to generate variations using OpenAI or fallback to mock data
async function generateVariations(content, prompt, audience, intent) {
  try {
    // Check if we have an OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // Construct a detailed prompt
      const systemPrompt = `You are an expert conversion rate optimization specialist who creates compelling variations of website content.`;
      
      let userPrompt = `Generate 3 distinct variations of the following content: "${content}"`;
      
      if (prompt) {
        userPrompt += `\n\nFollowing this specific instruction: ${prompt}`;
      }
      
      if (audience) {
        userPrompt += `\n\nTarget audience: ${audience}`;
      }
      
      if (intent) {
        userPrompt += `\n\nPage intent/goal: ${intent}`;
      }
      
      userPrompt += `\n\nReturn ONLY the three variations as a JSON array, where each item has an 'id' and 'content' field. Do not include explanations or additional text.`;
      
      // Make the API call
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Parse the response
      const responseText = response.choices[0].message.content.trim();
      const jsonResponse = JSON.parse(responseText);
      
      // Return the variations
      if (Array.isArray(jsonResponse.variations)) {
        return jsonResponse.variations;
      }
      
      // Fallback to mock data if the response format is unexpected
      console.log('Unexpected response format from OpenAI, using mock data instead');
      return createMockVariations(content);
    } else {
      console.log('No OpenAI API key found, using mock data');
      return createMockVariations(content);
    }
  } catch (error) {
    console.error('Error generating variations with OpenAI:', error);
    
    // Fallback to mock data if OpenAI fails
    return createMockVariations(content);
  }
}

// Function to create mock variations for testing
function createMockVariations(content) {
  const timestamp = new Date().toLocaleTimeString();
  
  return [
    { 
      id: 1, 
      content: `✨ ${content} (More engaging version - generated at ${timestamp})` 
    },
    { 
      id: 2, 
      content: `🚀 ${content} (Action-oriented version - generated at ${timestamp})` 
    },
    { 
      id: 3, 
      content: `💯 ${content} (Persuasive version - generated at ${timestamp})` 
    }
  ];
} 