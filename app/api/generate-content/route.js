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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();
    
    const data = await request.json();
    const { 
      elementType, 
      originalContent, 
      audience = '', 
      intent = '',
      customPrompt = '',
      numVariations = 3,
      pageContext = '',
      includeOriginalContent = true
    } = data;
    
    console.log(`[${requestId}] Generating content for element:`, elementType);
    console.log(`[${requestId}] Audience:`, audience);
    console.log(`[${requestId}] Intent:`, intent);
    console.log(`[${requestId}] Custom prompt:`, customPrompt);
    
    // In a production app, this would call an AI API (e.g. OpenAI)
    // For now, we'll mock the response
    const variations = await generateContentVariations(
      requestId,
      elementType, 
      originalContent, 
      audience, 
      intent,
      customPrompt,
      numVariations,
      pageContext,
      includeOriginalContent
    );

    return new Response(JSON.stringify({ 
      variations,
      requestId 
    }), { headers });
  } catch (error) {
    console.error('Error generating content:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content variations',
        requestId
      }), 
      { status: 500, headers }
    );
  }
}

// Generate content variations based on element type and context
async function generateContentVariations(
  requestId,
  elementType, 
  originalContent, 
  audience, 
  intent,
  customPrompt,
  numVariations,
  pageContext,
  includeOriginalContent
) {
  // In production, this would use an AI API
  // For demo purposes, we'll create mock variations
  
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create variations based on element type
  let variations = [];
  
  // Create a structured prompt for AI generation
  const prompt = customPrompt || createStructuredPrompt(
    elementType,
    originalContent,
    audience,
    intent,
    pageContext
  );
  
  console.log(`[${requestId}] Using prompt:`, prompt);
  
  // In production, this would be sent to an AI service like OpenAI
  // For now, we'll generate mock data based on the type and parameters
  
  // Start with original content if requested
  if (includeOriginalContent) {
    variations.push({ id: 'original', content: originalContent });
  }
  
  const audiencePrefix = audience ? `For ${audience}: ` : '';
  const intentSuffix = intent ? ` (${intent})` : '';
  
  // Generate sample variations based on element type
  if (elementType === 'h1' || elementType === 'h2' || elementType === 'h3') {
    const headingVariations = [
      { id: 'v1', content: `${audiencePrefix}${originalContent}` },
      { id: 'v2', content: `Discover ${originalContent}${intentSuffix}` },
      { id: 'v3', content: `Experience Amazing ${originalContent}` },
      { id: 'v4', content: `Transform Your Future with ${originalContent}` },
      { id: 'v5', content: `The Ultimate Guide to ${originalContent}` },
      { id: 'v6', content: `${originalContent}: Reimagined For ${audience || 'You'}` },
      { id: 'v7', content: `Why ${originalContent} Matters${intentSuffix}` },
      { id: 'v8', content: `The Secret to ${originalContent} Success` }
    ];
    
    // Add variations without duplicating the original
    headingVariations.forEach(v => {
      if (v.content !== originalContent) {
        variations.push(v);
      }
    });
  } else if (elementType === 'p') {
    const paragraphVariations = [
      { id: 'v1', content: `${originalContent} Our expert team can help you succeed.` },
      { id: 'v2', content: `Thousands of customers trust our ${originalContent} services.` },
      { id: 'v3', content: `${audiencePrefix}${originalContent} Find out how we can help you today.` },
      { id: 'v4', content: `The revolutionary approach to ${originalContent}. Start your journey now.` },
      { id: 'v5', content: `${originalContent} Designed specifically with ${audience || 'our customers'} in mind.` },
      { id: 'v6', content: `Experience the difference with our approach to ${originalContent}.` },
      { id: 'v7', content: `${originalContent} See why we're the leading choice for ${intent || 'quality and service'}.` },
      { id: 'v8', content: `We understand what ${audience || 'you'} need from ${originalContent}. Let us show you how.` }
    ];
    
    paragraphVariations.forEach(v => {
      if (v.content !== originalContent) {
        variations.push(v);
      }
    });
  } else if (elementType === 'button' || elementType === 'a') {
    // For buttons and CTAs, use intent information
    const actionWord = intent.includes('purchase') || intent.includes('buy') 
      ? 'Buy Now' 
      : intent.includes('learn') || intent.includes('discover')
        ? 'Learn More'
        : 'Get Started';
        
    const buttonVariations = [
      { id: 'v1', content: actionWord },
      { id: 'v2', content: 'Start Now' },
      { id: 'v3', content: 'Try It Free' },
      { id: 'v4', content: intent.includes('signup') ? 'Sign Up Today' : 'Explore Options' },
      { id: 'v5', content: `Yes, I Want This!` },
      { id: 'v6', content: `Claim Your ${intent.includes('trial') ? 'Free Trial' : 'Offer'}` },
      { id: 'v7', content: `${audience ? `Perfect for ${audience}` : 'Perfect for You'}` },
      { id: 'v8', content: `See the Difference` }
    ];
    
    buttonVariations.forEach(v => {
      if (v.content !== originalContent) {
        variations.push(v);
      }
    });
  } else if (elementType === 'img') {
    // For images, we're modifying alt text
    const baseAlt = originalContent || 'Product image';
    const imgVariations = [
      { id: 'v1', content: `${baseAlt} for ${audience || 'customers'}` },
      { id: 'v2', content: `${baseAlt} - perfect for your needs` },
      { id: 'v3', content: `High-quality ${baseAlt}` },
      { id: 'v4', content: `Premium ${baseAlt} solution` },
      { id: 'v5', content: `${baseAlt} designed for ${intent || 'optimal results'}` },
      { id: 'v6', content: `The ultimate ${baseAlt} experience` },
      { id: 'v7', content: `${audience ? `${audience}'s choice:` : 'Top choice:'} ${baseAlt}` },
      { id: 'v8', content: `${baseAlt} that delivers results` }
    ];
    
    imgVariations.forEach(v => {
      if (v.content !== originalContent) {
        variations.push(v);
      }
    });
  } else {
    // Generic variations for other element types
    const genericVariations = [
      { id: 'v1', content: `${audiencePrefix}${originalContent}` },
      { id: 'v2', content: `${originalContent} - enhanced for better results` },
      { id: 'v3', content: `${originalContent} - customized for your needs` },
      { id: 'v4', content: `${originalContent} - premium solution` },
      { id: 'v5', content: `Exclusive: ${originalContent}` },
      { id: 'v6', content: `${originalContent} for ${audience || 'discerning customers'}` },
      { id: 'v7', content: `The ultimate ${originalContent} experience` },
      { id: 'v8', content: `${originalContent} - Reimagined for ${new Date().getFullYear()}` }
    ];
    
    genericVariations.forEach(v => {
      if (v.content !== originalContent) {
        variations.push(v);
      }
    });
  }
  
  // Limit to requested number of variations
  return variations.slice(0, numVariations);
}

// Create a structured prompt for AI content generation
function createStructuredPrompt(elementType, originalContent, audience, intent, pageContext) {
  let prompt = `Generate ${elementType === 'button' || elementType === 'a' ? 'short, compelling' : 'engaging'} content variations for this ${elementType} element`;
  
  // Add original content
  if (originalContent) {
    prompt += `:\n\nOriginal content: "${originalContent.trim()}"`;
  }
  
  // Add audience info if available
  if (audience) {
    prompt += `\n\nTarget audience: ${audience}`;
  }
  
  // Add intent if available
  if (intent) {
    prompt += `\n\nContent goal/intent: ${intent}`;
  }
  
  // Add page context if available
  if (pageContext) {
    prompt += `\n\nPage context: ${pageContext}`;
  }
  
  // Add guidance based on element type
  if (elementType === 'h1' || elementType === 'h2' || elementType === 'h3') {
    prompt += '\n\nCreate compelling, concise, and action-oriented headings that capture attention.';
  } else if (elementType === 'button' || elementType === 'a') {
    prompt += '\n\nCreate clear, compelling, and action-oriented button text. Keep it very concise (1-5 words).';
  } else if (elementType === 'p') {
    prompt += '\n\nMaintain approximately the same length while making the content more engaging, persuasive, and relevant to the target audience.';
  } else if (elementType === 'img') {
    prompt += '\n\nCreate descriptive and SEO-friendly alt text that clearly describes the image while incorporating relevant keywords.';
  }
  
  return prompt;
} 