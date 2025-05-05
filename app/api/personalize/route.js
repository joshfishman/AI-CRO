export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function POST(request) {
  // Set CORS headers to allow requests from any domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const data = await request.json();
    const { 
      url, 
      selector, 
      userId, 
      originalContent, 
      elementType, 
      userAttributes = {} 
    } = data;
    
    // Extract page-level audience and intent information
    const pageAudience = userAttributes.pageAudience || '';
    const pageIntent = userAttributes.pageIntent || '';
    
    console.log('Personalizing with audience:', pageAudience);
    console.log('Personalizing with intent:', pageIntent);
    
    // In a real implementation, this would query a database of tests
    // For now, we'll check if we have a matching test for this selector and URL
    const testData = await getMatchingTest(url, selector, elementType, originalContent, pageAudience, pageIntent);
    
    if (!testData) {
      // No test found for this element
      return new Response(JSON.stringify({ personalized: false }), { headers });
    }
    
    // Get the appropriate variant for this user
    const variant = selectVariant(testData, userId, userAttributes);
    
    // Return the personalized content
    return new Response(JSON.stringify({
      personalized: true,
      testId: testData.id,
      variantId: variant.id,
      content: variant.content
    }), { headers });
  } catch (error) {
    console.error('Error in personalize API:', error);
    return new Response(JSON.stringify({ error: 'Failed to personalize content' }), { 
      status: 500,
      headers
    });
  }
}

// Function to find a matching test for the element
async function getMatchingTest(url, selector, elementType, originalContent, pageAudience, pageIntent) {
  // In a production environment, this would query a database
  // For demo purposes, we'll use some hardcoded tests
  
  // Create a simple fingerprint of the original content to identify the element type
  const contentFingerprint = getContentFingerprint(originalContent, elementType);
  
  // Check if we have tests for this URL pattern
  // URL pattern matching (very simple for demo)
  const isHomepage = url.endsWith('/') || url.endsWith('/index.html');
  const isProductPage = url.includes('/product/') || url.includes('/products/');
  const isCheckoutPage = url.includes('/checkout') || url.includes('/cart');
  
  // Use audience and intent information to influence content
  const hasAudience = pageAudience && pageAudience.trim().length > 0;
  const hasIntent = pageIntent && pageIntent.trim().length > 0;
  
  // Define some sample tests
  let tests = [
    // Heading tests
    {
      id: 'heading-test-1',
      selector: 'h1, h2',
      elementType: 'h1',
      urlPattern: '*',
      contentType: 'heading',
      variants: [
        { id: 'control', content: originalContent },
        { id: 'variant-1', content: originalContent ? transformHeading(originalContent, pageAudience, pageIntent) : 'Experience Our Revolutionary Product' },
        { id: 'variant-2', content: 'Transform Your Experience Today!' }
      ]
    },
    
    // Button tests
    {
      id: 'button-test-1',
      selector: 'button, a.btn, .cta',
      elementType: 'button',
      urlPattern: '*',
      contentType: 'cta',
      variants: [
        { id: 'control', content: originalContent },
        { id: 'variant-1', content: getButtonText(pageIntent) || 'Start Now!' },
        { id: 'variant-2', content: 'Get Started Today' }
      ]
    },
    
    // Product description tests
    {
      id: 'desc-test-1',
      selector: '.product-description, p.description',
      elementType: 'p',
      urlPattern: '*product*',
      contentType: 'product-description',
      variants: [
        { id: 'control', content: originalContent },
        { id: 'variant-1', content: originalContent ? makeDescriptionMoreCompelling(originalContent, pageAudience, pageIntent) : 'This amazing product will transform the way you work, saving you hours of time and reducing stress.' },
        { id: 'variant-2', content: 'Loved by thousands of customers worldwide, this premium product delivers exceptional results every time.' }
      ]
    },
    
    // Banner tests
    {
      id: 'banner-test-1',
      selector: '.banner, .hero, .jumbotron',
      elementType: 'div',
      urlPattern: '/',
      contentType: 'banner',
      variants: [
        { id: 'control', content: originalContent },
        { id: 'variant-1', content: '<h2>Special Offer Inside!</h2><p>Discover our exclusive deals today.</p>' },
        { id: 'variant-2', content: '<h2>Limited Time Offer</h2><p>Get 20% off your first purchase when you sign up!</p>' }
      ]
    }
  ];
  
  // Find matching tests
  let matchingTests = [];
  
  // First, try to match based on selector
  matchingTests = tests.filter(test => {
    const selectorMatches = elementMatchesSelector(selector, test.selector);
    const elementTypeMatches = elementType === test.elementType;
    const urlMatches = test.urlPattern === '*' || url.includes(test.urlPattern.replace('*', ''));
    
    return selectorMatches && urlMatches;
  });
  
  // If no direct selector matches, try content type matching
  if (matchingTests.length === 0) {
    const contentType = determineContentType(elementType, originalContent);
    
    matchingTests = tests.filter(test => {
      return test.contentType === contentType && 
             (test.urlPattern === '*' || url.includes(test.urlPattern.replace('*', '')));
    });
  }
  
  // Return the first matching test, or null if none found
  return matchingTests.length > 0 ? matchingTests[0] : null;
}

// Select a variant for a specific user
function selectVariant(testData, userId, userAttributes) {
  // In a production environment, this would use sophisticated rules
  // For demo, we'll use deterministic selection based on userId
  
  // If no userId, randomly select a variant
  if (!userId) {
    const randomIndex = Math.floor(Math.random() * testData.variants.length);
    return testData.variants[randomIndex];
  }
  
  // Use userId to deterministically select a variant (for consistency)
  const userIdNum = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const variantIndex = userIdNum % testData.variants.length;
  return testData.variants[variantIndex];
}

// Helper function to determine if a selector matches against a test selector pattern
function elementMatchesSelector(elementSelector, testSelectorPattern) {
  // For simple cases, direct match
  if (elementSelector === testSelectorPattern) return true;
  
  // Split patterns by comma to handle multiple selectors
  const patterns = testSelectorPattern.split(',').map(s => s.trim());
  
  // Check if any pattern matches
  return patterns.some(pattern => {
    // Handle class selectors
    if (pattern.includes('.') && elementSelector.includes('.')) {
      const patternClass = pattern.split('.')[1];
      return elementSelector.includes(patternClass);
    }
    
    // Handle tag selectors
    if (!pattern.includes('.') && !pattern.includes('#') && !pattern.includes('[')) {
      const elementTag = elementSelector.split('.')[0].split('#')[0].split('[')[0];
      return elementTag === pattern;
    }
    
    // Simple partial match as fallback
    return elementSelector.includes(pattern) || pattern.includes(elementSelector);
  });
}

// Determine the content type of an element
function determineContentType(elementType, content) {
  if (!content) return 'unknown';
  
  const lowerContent = content.toLowerCase();
  
  // Check for headings
  if (elementType === 'h1' || elementType === 'h2' || elementType === 'h3') {
    return 'heading';
  }
  
  // Check for call-to-action
  if (elementType === 'button' || elementType === 'a') {
    const ctaWords = ['sign up', 'register', 'submit', 'subscribe', 'buy', 'purchase', 'order', 'get', 'download', 'try', 'start', 'learn more', 'contact'];
    if (ctaWords.some(word => lowerContent.includes(word))) {
      return 'cta';
    }
  }
  
  // Check for product descriptions
  if (elementType === 'p' && content.length > 50) {
    const productWords = ['product', 'feature', 'benefit', 'quality', 'premium', 'experience', 'best', 'leading', 'advanced'];
    if (productWords.some(word => lowerContent.includes(word))) {
      return 'product-description';
    }
  }
  
  // Check for banners
  if (elementType === 'div' && content.includes('<h')) {
    return 'banner';
  }
  
  return 'unknown';
}

// Generate a content fingerprint to identify the element
function getContentFingerprint(content, elementType) {
  if (!content) return `empty-${elementType}`;
  
  // For longer content, take first and last few words
  if (content.length > 100) {
    const firstWords = content.substring(0, 50).replace(/\s+/g, ' ').trim();
    const lastWords = content.substring(content.length - 50).replace(/\s+/g, ' ').trim();
    return `${elementType}-${firstWords}...${lastWords}`;
  }
  
  return `${elementType}-${content.replace(/\s+/g, ' ').trim()}`;
}

// Get appropriate button text based on page intent
function getButtonText(intent) {
  if (!intent) return null;
  
  const intentLower = intent.toLowerCase();
  
  if (intentLower.includes('sale') || intentLower.includes('discount') || intentLower.includes('offer')) {
    return 'Claim Your Discount';
  }
  
  if (intentLower.includes('subscribe') || intentLower.includes('newsletter')) {
    return 'Subscribe Now';
  }
  
  if (intentLower.includes('learn') || intentLower.includes('inform')) {
    return 'Learn More';
  }
  
  if (intentLower.includes('buy') || intentLower.includes('purchase')) {
    return 'Buy Now';
  }
  
  if (intentLower.includes('register') || intentLower.includes('sign up')) {
    return 'Register Now';
  }
  
  return null;
}

// Transform a heading to make it more compelling
function transformHeading(originalHeading, audience, intent) {
  let heading = originalHeading;
  
  // Apply audience-specific adaptations
  if (audience) {
    const audienceLower = audience.toLowerCase();
    
    if (audienceLower.includes('professional') || audienceLower.includes('business')) {
      heading = heading.replace(/your/i, 'Your Professional');
    } else if (audienceLower.includes('parent') || audienceLower.includes('family')) {
      heading = heading.replace(/your/i, 'Your Family\'s');
    } else if (audienceLower.includes('student') || audienceLower.includes('academic')) {
      heading = heading.replace(/your/i, 'Your Academic');
    }
  }
  
  // Apply intent-specific adaptations
  if (intent) {
    const intentLower = intent.toLowerCase();
    
    // Remove HTML tags for text processing
    const plainText = heading.replace(/<[^>]*>/g, '');
    
    // Add action words based on intent
    if (intentLower.includes('sale') || intentLower.includes('discount')) {
      return `Special Offer: ${plainText}`;
    }
    
    if (intentLower.includes('inform') || intentLower.includes('educate')) {
      return `Discover ${plainText}`;
    }
    
    if (intentLower.includes('convert') || intentLower.includes('signup')) {
      return `Experience the Benefits: ${plainText}`;
    }
  }
  
  // If no specific adaptations applied, use general improvements
  if (heading.toLowerCase().includes('you') || heading.toLowerCase().includes('your')) {
    return heading.replace(/your/i, 'Your Personalized');
  }
  
  // Add action words to headings
  const actionVerbs = ['Discover', 'Experience', 'Unleash', 'Transform', 'Elevate'];
  const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  
  // If heading is short, transform it completely
  if (heading.length < 30) {
    return `${randomVerb} ${heading}`;
  }
  
  // For longer headings, keep structure but add impact words
  const impactWords = ['Revolutionary', 'Exclusive', 'Premium', 'Extraordinary', 'Essential'];
  const randomImpact = impactWords[Math.floor(Math.random() * impactWords.length)];
  
  // Inject impact word
  return heading.replace(/(\w+)/, `${randomImpact} $1`);
}

// Make a product description more compelling
function makeDescriptionMoreCompelling(originalDescription, audience, intent) {
  let description = originalDescription;
  
  // Add audience-specific content
  if (audience) {
    const audienceLower = audience.toLowerCase();
    
    if (audienceLower.includes('professional') || audienceLower.includes('business')) {
      description += ' Perfect for professionals who value efficiency and reliability.';
    } else if (audienceLower.includes('parent') || audienceLower.includes('family')) {
      description += ' Designed with families in mind, ensuring safety and ease of use.';
    } else if (audienceLower.includes('tech-savvy') || audienceLower.includes('developer')) {
      description += ' Built with cutting-edge technology for those who appreciate innovation.';
    }
  }
  
  // Add intent-specific content
  if (intent) {
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('sale') || intentLower.includes('discount')) {
      description += ' Limited-time offer available now!';
    }
    
    if (intentLower.includes('inform') || intentLower.includes('educate')) {
      description += ' Learn more about how this works in our detailed guide.';
    }
    
    if (intentLower.includes('trust') || intentLower.includes('credibility')) {
      description += ' Trusted by thousands of satisfied customers.';
    }
  }
  
  // If no specific adaptations applied, use general improvements
  if (description.length > 150) {
    return enhanceDescription(description);
  }
  
  // For shorter descriptions, expand with benefits
  const benefitPhrases = [
    'Our customers love how this',
    'You\'ll be amazed at how this',
    'Discover why this has become',
    'Experience the difference with this'
  ];
  
  const randomBenefit = benefitPhrases[Math.floor(Math.random() * benefitPhrases.length)];
  
  return `${description} ${randomBenefit} essential product for thousands of satisfied customers.`;
}

// Enhance a product description
function enhanceDescription(description) {
  // Add credibility markers
  const credibilityMarkers = [
    'Trusted by thousands.',
    'Top-rated by our customers.',
    'Award-winning quality.',
    'Industry-leading performance.'
  ];
  
  const randomMarker = credibilityMarkers[Math.floor(Math.random() * credibilityMarkers.length)];
  
  return `${description} ${randomMarker}`;
} 