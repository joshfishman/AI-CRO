import { createClient } from '@vercel/edge-config';
import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { selectors, userType, pageUrl, workspaceId } = req.body;
    
    if (!selectors || !Array.isArray(selectors) || selectors.length === 0) {
      return res.status(400).json({ error: 'Invalid selectors provided' });
    }
    
    // Log the personalization request
    console.log('Personalization request:', { 
      userType, 
      pageUrl, 
      workspaceId, 
      selectors: selectors.length 
    });
    
    // Get OpenAI API key from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey
    });
    
    // Process each selector and generate personalized content
    const results = await Promise.all(
      selectors.map(async (selector) => {
        try {
          return {
            selector: selector.selector,
            result: await generatePersonalizedContent(
              openai, 
              selector.prompt, 
              userType, 
              pageUrl
            ),
            default: selector.default
          };
        } catch (error) {
          console.error(`Error generating content for selector ${selector.selector}:`, error);
          return {
            selector: selector.selector,
            error: 'Failed to generate content',
            default: selector.default,
            result: selector.default // Fallback to default
          };
        }
      })
    );
    
    // If a specific workspaceId is provided, we log this personalization attempt
    if (workspaceId && pageUrl) {
      try {
        const edgeConfig = createClient(process.env.EDGE_CONFIG);
        const statsKey = `stats:${workspaceId}:${pageUrl}`;
        
        // Create or increment stats counters for AB testing
        // This will be handled more completely in the record-event endpoint
        console.log(`Logging personalization event to stats:${workspaceId}:${pageUrl}`);
      } catch (error) {
        console.error('Failed to log stats:', error);
        // Non-critical, we continue even if this fails
      }
    }
    
    // Cache the response for a short time (30 seconds)
    res.setHeader('Cache-Control', 's-maxage=30');
    
    return res.status(200).json({ 
      results,
      userType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in personalize:', error);
    return res.status(500).json({ error: 'Failed to generate personalized content' });
  }
}

/**
 * Generate personalized content using OpenAI
 */
async function generatePersonalizedContent(openai, prompt, userType, pageUrl) {
  try {
    // Construct a context-aware prompt that includes user type and page URL
    const contextualPrompt = `
You are a conversion optimization AI helping to personalize web content.

USER TYPE: ${userType || 'unknown'}
PAGE URL: ${pageUrl || 'unknown'}

TASK: ${prompt}

The content should be tailored for the specific user type mentioned above.
Keep your response concise and focused only on the content requested.
Do not include explanations or additional notes - just return the personalized content.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates concise, personalized web content." },
        { role: "user", content: contextualPrompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    
    const generatedContent = response.choices[0].message.content.trim();
    return generatedContent;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}