import { createClient } from '@vercel/edge-config';
import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { selectors, userType, pageUrl, workspaceId, generateVariants, variantCount } = req.body;
    
    if (!selectors || !Array.isArray(selectors) || selectors.length === 0) {
      return res.status(400).json({ error: 'Invalid selectors provided' });
    }
    
    // Log the personalization request
    console.log('Personalization request:', { 
      userType, 
      pageUrl, 
      workspaceId, 
      selectors: selectors.length,
      generateVariants,
      variantCount
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

    // Check if we need to generate multiple variants
    if (generateVariants && selectors.length === 1) {
      // Generate multiple variants for multivariate testing
      try {
        const selector = selectors[0];
        const variants = await generateVariantOptions(
          openai,
          selector.prompt,
          selector.default,
          variantCount || 3
        );
        
        return res.status(200).json({
          variants,
          selector: selector.selector,
          userType,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error generating variants:', error);
        return res.status(500).json({ error: 'Failed to generate variants' });
      }
    }
    
    // Process each selector and generate personalized content based on user type
    const results = await Promise.all(
      selectors.map(async (selector) => {
        try {
          // New format might have variants already defined
          if (selector.variants && Array.isArray(selector.variants) && selector.variants.length > 0) {
            // Find the appropriate variant for this user type
            const matchingVariants = selector.variants.filter(variant => 
              variant.userType === userType || variant.userType === 'all'
            );
            
            // Prioritize exact user type match, then 'all', then default
            const userTypeVariant = matchingVariants.find(v => v.userType === userType);
            const allUsersVariant = matchingVariants.find(v => v.userType === 'all');
            const noUserTypeVariant = selector.variants.find(v => v.userType === 'none' || v.userType === '');
            const defaultVariant = selector.variants.find(v => v.isDefault) || selector.variants[0];
            
            // Use the appropriate variant
            const variantToUse = userTypeVariant || allUsersVariant || (userType === 'unknown' ? noUserTypeVariant : null) || defaultVariant;
            
            return {
              selector: selector.selector,
              contentType: selector.contentType || 'text',
              result: variantToUse.content,
              variant: selector.variants.indexOf(variantToUse),
              variantName: variantToUse.name || 'Variant',
              default: selector.default || variantToUse.content,
              isDefault: variantToUse.isDefault || false
            };
          } else {
            // Legacy format - generate content using OpenAI
            const generatedContent = await generatePersonalizedContent(
              openai, 
              selector.prompt, 
              userType, 
              pageUrl
            );
            
            return {
              selector: selector.selector,
              contentType: selector.contentType || 'text',
              result: generatedContent,
              default: selector.default,
              isDefault: false,
              variantName: 'AI Generated'
            };
          }
        } catch (error) {
          console.error(`Error generating content for selector ${selector.selector}:`, error);
          return {
            selector: selector.selector,
            contentType: selector.contentType || 'text',
            error: 'Failed to generate content',
            default: selector.default,
            result: selector.default, // Fallback to default
            isDefault: true,
            variantName: 'Default (Error)'
          };
        }
      })
    );
    
    // If a specific workspaceId is provided, log this personalization attempt
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
      timestamp: new Date().toISOString(),
      version: 2
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

/**
 * Generate multiple variants for multivariate testing
 */
async function generateVariantOptions(openai, prompt, originalContent, count = 3) {
  try {
    const variantPrompt = `
You are a conversion optimization AI helping to generate multiple variants for A/B testing.

ORIGINAL CONTENT: "${originalContent || 'No original content provided'}"

TASK: ${prompt}

Generate ${count} distinct variants for A/B testing.
Each variant should be tailored for the task while providing different approaches/wording/styles.
Return ONLY the variants, one per line, without any numbering, explanation, or additional text.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates multiple variations of content for A/B testing." },
        { role: "user", content: variantPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    });
    
    const variantText = response.choices[0].message.content.trim();
    
    // Split by newlines and clean up
    const variants = variantText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, count); // Ensure we only return the requested number
    
    return variants;
  } catch (error) {
    console.error('OpenAI API error generating variants:', error);
    throw error;
  }
}