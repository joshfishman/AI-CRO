import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request) {
  // Handle CORS preflight requests
  const origin = request.headers.get('origin') || '*';
  
  // Log the origin for debugging
  console.log('[CORS] Handling OPTIONS request from origin:', origin);
  
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(request) {
  try {
    // Generate a unique request ID for tracking
    const requestId = Math.random().toString(36).substring(2, 10);
    console.log(`[${requestId}] Processing generate-variations request`);
    
    // Get the origin for CORS
    const origin = request.headers.get('origin') || '*';
    console.log(`[${requestId}] Request from origin:`, origin);
    
    // Set response headers for CORS
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Parse the request body
    const data = await request.json();
    const { 
      element, 
      prompt, 
      audience, 
      intent,
      page
    } = data;
    
    console.log(`[${requestId}] Generating variations for element:`, element);
    console.log(`[${requestId}] Prompt:`, prompt);
    console.log(`[${requestId}] Audience:`, audience);
    console.log(`[${requestId}] Intent:`, intent);
    console.log(`[${requestId}] Page:`, page?.url);
    
    // Generate variations using AI or mocked data
    const variations = await generateVariations(
      requestId,
      element.content,
      prompt,
      audience,
      intent
    );
    
    console.log(`[${requestId}] Generated variations:`, variations);
    
    // Return the generated variations
    return new Response(
      JSON.stringify({ 
        variations,
        success: true,
        requestId,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Error generating variations:', error);
    
    // Return an error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate variations',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}

// Function to generate variations using OpenAI or fallback to mock data
async function generateVariations(requestId, content, prompt, audience, intent) {
  try {
    // Check if we have an OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      console.log(`[${requestId}] Using OpenAI to generate variations`);
      
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // Enhanced expert copywriter system prompt
      const systemPrompt = `You are an expert conversion copywriter and SEO strategist. You specialize in writing high-performing website content that improves click-through rates, user engagement, and search engine visibility. Your job is to write concise, persuasive, and benefit-focused copy for website headlines, subheadlines, calls-to-action, and product descriptions.

Every output should:
- Match the brand's tone and speak directly to its ideal audience
- Clearly communicate value and differentiation
- Be optimized for both human readers and search engines (SEO)
- Follow web best practices (e.g., front-load value, avoid jargon, keep CTAs action-oriented)
- Create significantly different variations that test different approaches
- Be ready to use without further editing

You'll be generating variations of existing website text to test for better performance. The variations should be distinctive but maintain the core messaging and purpose.`;
      
      // Enhanced user prompt with context and clear instructions
      let userPrompt = `Generate 3 distinctive, high-converting variations of the following website content: "${content}"`;
      
      if (prompt) {
        userPrompt += `\n\nSpecific instructions: ${prompt}`;
      }
      
      if (audience) {
        userPrompt += `\n\nTarget audience: ${audience}`;
      }
      
      if (intent) {
        userPrompt += `\n\nPage goal/conversion intent: ${intent}`;
      }
      
      userPrompt += `\n\nEach variation should take a completely different angle or approach to effectively test which messaging resonates best with the audience.

Return your response in this exact JSON format:
{
  "variations": [
    { "id": 1, "content": "First variation text here" },
    { "id": 2, "content": "Second variation text here" },
    { "id": 3, "content": "Third variation text here" }
  ]
}

Do not include any explanation or additional text outside of this JSON structure.`;
      
      console.log(`[${requestId}] Sending prompt to OpenAI:`, userPrompt);
      
      // Make the API call with improved parameters
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use the latest model for best quality
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // Slightly higher temperature for more creative variations
        max_tokens: 1500, // Increased for more comprehensive responses
        top_p: 0.9,
        presence_penalty: 0.2, // Encourage varied outputs
        frequency_penalty: 0.5 // Discourage repetition
      });
      
      // Parse the response
      const responseText = response.choices[0].message.content.trim();
      console.log(`[${requestId}] OpenAI response:`, responseText);
      
      try {
        const jsonResponse = JSON.parse(responseText);
        
        // Return the variations
        if (Array.isArray(jsonResponse.variations) && jsonResponse.variations.length > 0) {
          console.log(`[${requestId}] Successfully parsed ${jsonResponse.variations.length} variations from OpenAI`);
          
          // Validate each variation
          const validVariations = jsonResponse.variations.map((variation, index) => {
            if (!variation.content || typeof variation.content !== 'string' || variation.content.trim() === '') {
              console.log(`[${requestId}] Empty or invalid variation at index ${index}, replacing with content`);
              return { id: index + 1, content: `Enhanced version ${index + 1}: ${content}` };
            }
            return { id: variation.id || index + 1, content: variation.content.trim() };
          });
          
          return validVariations;
        }
        
        console.log(`[${requestId}] Response did not contain valid variations array, trying to extract from:`, jsonResponse);
        
        // Try to extract variations from any structure
        if (jsonResponse && typeof jsonResponse === 'object') {
          // Look for any array in the response that might contain the variations
          for (const key in jsonResponse) {
            if (Array.isArray(jsonResponse[key]) && jsonResponse[key].length > 0) {
              console.log(`[${requestId}] Found array in response at key: ${key}`);
              const items = jsonResponse[key];
              
              // Check if the items look like variations
              if (items[0] && (items[0].content || items[0].text || typeof items[0] === 'string')) {
                console.log(`[${requestId}] Converting array to proper variation format`);
                
                // Convert to proper format
                return items.map((item, index) => {
                  if (typeof item === 'string') {
                    return { id: index + 1, content: item };
                  } else if (item.content) {
                    return { id: index + 1, content: item.content };
                  } else if (item.text) {
                    return { id: index + 1, content: item.text };
                  } else {
                    return { id: index + 1, content: JSON.stringify(item) };
                  }
                });
              }
            }
          }
        }
        
        // If no array found, try to extract any strings from the object
        const extractedStrings = [];
        function extractStrings(obj, path = '') {
          if (typeof obj === 'string' && obj.length > 10) {
            extractedStrings.push(obj);
          } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
              extractStrings(obj[key], path ? `${path}.${key}` : key);
            }
          }
        }
        
        extractStrings(jsonResponse);
        
        if (extractedStrings.length >= 3) {
          console.log(`[${requestId}] Extracted ${extractedStrings.length} strings from response`);
          return extractedStrings.slice(0, 3).map((str, index) => ({
            id: index + 1,
            content: str
          }));
        }
        
        // If we still can't find variations, try one more API call with a simpler prompt
        console.log(`[${requestId}] Trying fallback API call with simpler prompt`);
        
        const fallbackResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // Fallback to faster model
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates variations of text.' },
            { role: 'user', content: `Generate 3 different variations of this text: "${content}". Reply with only the variations, numbered 1, 2, and 3.` }
          ],
          temperature: 0.7,
          max_tokens: 800
        });
        
        const fallbackText = fallbackResponse.choices[0].message.content.trim();
        console.log(`[${requestId}] Fallback API response:`, fallbackText);
        
        // Extract variations from the numbered list
        const lines = fallbackText.split('\n');
        const extractedVariations = [];
        
        for (const line of lines) {
          const match = line.match(/^(\d+)[.):]\s*(.+)$/);
          if (match && match[2]) {
            extractedVariations.push({
              id: parseInt(match[1]),
              content: match[2].trim()
            });
          }
        }
        
        if (extractedVariations.length > 0) {
          console.log(`[${requestId}] Extracted ${extractedVariations.length} variations from fallback response`);
          return extractedVariations;
        }
        
        // Last resort: create basic variations based on the original content
        console.log(`[${requestId}] Creating basic variations from original content`);
        return [
          { id: 1, content: `${content} (Updated for clarity)` },
          { id: 2, content: `${content} (Enhanced for engagement)` },
          { id: 3, content: `${content} (Optimized for conversion)` }
        ];
      } catch (parseError) {
        console.error(`[${requestId}] Error parsing OpenAI response:`, parseError);
        
        // Try to extract raw text variations from the response
        const textLines = responseText.split('\n').filter(line => line.trim().length > 0);
        if (textLines.length >= 3) {
          console.log(`[${requestId}] Extracted ${textLines.length} lines from raw response`);
          return textLines.slice(0, 3).map((line, index) => ({
            id: index + 1,
            content: line.replace(/^\d+[\.\)]\s*/, '').trim()
          }));
        }
        
        return createMockVariations(requestId, content, true);
      }
    } else {
      console.log(`[${requestId}] No OpenAI API key found, using mock data`);
      return createMockVariations(requestId, content, false);
    }
  } catch (error) {
    console.error(`[${requestId}] Error generating variations with OpenAI:`, error);
    
    // Fallback to mock data if OpenAI fails
    return createMockVariations(requestId, content, true);
  }
}

// Function to create mock variations for testing
function createMockVariations(requestId, content, isError) {
  console.log(`[${requestId}] Creating enhanced mock variations`);
  
  // Create more realistic mock variations
  if (isError) {
    return [
      { 
        id: 1, 
        content: `${content} (API Error: Using fallback variation. Please check API configuration.)` 
      },
      { 
        id: 2, 
        content: `${content} (API Error: Using fallback variation. Please retry or contact support.)` 
      },
      { 
        id: 3, 
        content: `${content} (API Error: Using fallback variation. This is placeholder content only.)` 
      }
    ];
  }
  
  // More realistic mock variations when no API key is present
  return [
    { 
      id: 1, 
      content: `${content} (Enhanced version: Try adding an API key for real AI-generated variations)` 
    },
    { 
      id: 2, 
      content: `${content} (Improved version: Configure OpenAI API for better results)` 
    },
    { 
      id: 3, 
      content: `${content} (Optimized version: Add OPENAI_API_KEY to environment variables)` 
    }
  ];
} 