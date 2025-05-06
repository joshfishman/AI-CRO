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
      
      // Expert copywriter system prompt
      const systemPrompt = `You are an expert conversion copywriter and SEO strategist. You specialize in writing high-performing website content that improves click-through rates, user engagement, and search engine visibility. Your job is to write concise, persuasive, and benefit-focused copy for website headlines, subheadlines, calls-to-action, and product descriptions.

Every output should:
- Match the brand's tone and speak directly to its ideal audience
- Clearly communicate value and differentiation
- Be optimized for both human readers and search engines (SEO)
- Follow web best practices (e.g., front-load value, avoid jargon, keep CTAs action-oriented)

You'll be generating variations of existing website text to test for better performance. The variations should maintain the core meaning but improve clarity, persuasiveness, and conversion potential.`;
      
      // User prompt with context and instructions
      let userPrompt = `Generate 3 distinct, high-converting variations of the following website content: "${content}"`;
      
      if (prompt) {
        userPrompt += `\n\nFollow these specific instructions: ${prompt}`;
      }
      
      if (audience) {
        userPrompt += `\n\nTarget audience: ${audience}`;
      }
      
      if (intent) {
        userPrompt += `\n\nPage goal/conversion intent: ${intent}`;
      }
      
      userPrompt += `\n\nReturn ONLY the JSON object with a "variations" array containing the 3 variations. Each variation should have an "id" (1, 2, or 3) and "content" field. Do not include explanations or additional text.`;
      
      console.log('Sending prompt to OpenAI:', userPrompt);
      
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
      console.log('OpenAI response:', responseText);
      
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
      content: `✨ ${content} (Conversion-focused variant - generated at ${timestamp})` 
    },
    { 
      id: 2, 
      content: `🚀 ${content} (SEO-optimized variant - generated at ${timestamp})` 
    },
    { 
      id: 3, 
      content: `💯 ${content} (Audience-targeted variant - generated at ${timestamp})` 
    }
  ];
} 