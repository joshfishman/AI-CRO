export async function POST(request) {
  try {
    const data = await request.json();
    const { url, selector, userId, originalContent, elementType, userAttributes = {} } = data;
    
    // In a real implementation, this would query a database of tests
    // For now, we'll check if we have a matching test for this selector and URL
    const testData = await getMatchingTest(url, selector, elementType, originalContent);
    
    if (!testData) {
      // No test found for this element
      return Response.json({ personalized: false });
    }
    
    // Get the appropriate variant for this user
    const variant = selectVariant(testData, userId, userAttributes);
    
    // Return the personalized content
    return Response.json({
      personalized: true,
      testId: testData.id,
      variantId: variant.id,
      content: variant.content
    });
  } catch (error) {
    console.error('Error in personalize API:', error);
    return Response.json({ error: 'Failed to personalize content' }, { status: 500 });
  }
}

// Function to find a matching test for the element
async function getMatchingTest(url, selector, elementType, originalContent) {
  // In a production environment, this would query a database
  // For demo purposes, we'll use some hardcoded tests
  
  // Create a simple fingerprint of the original content to identify the element type
  const contentFingerprint = getContentFingerprint(originalContent, elementType);
  
  // Check if we have tests for this URL pattern
  // URL pattern matching (very simple for demo)
  const isHomepage = url.endsWith('/') || url.endsWith('/index.html');
  const isProductPage = url.includes('/product/') || url.includes('/products/');
  const isCheckoutPage = url.includes('/checkout') || url.includes('/cart');
  
  // Define some sample tests
  const tests = [
    // Heading tests
    {
      id: 'heading-test-1',
      selector: 'h1, h2',
      elementType: 'h1',
      urlPattern: '*',
      contentType: 'heading',
      variants: [
        { id: 'control', content: originalContent },
        { id: 'variant-1', content: originalContent ? transformHeading(originalContent) : 'Experience Our Revolutionary Product' },
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
        { id: 'variant-1', content: 'Start Now!' },
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
        { id: 'variant-1', content: originalContent ? makeDescriptionMoreCompelling(originalContent) : 'This amazing product will transform the way you work, saving you hours of time and reducing stress.' },
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

// Transform a heading to make it more compelling
function transformHeading(originalHeading) {
  // If heading already has certain attributes, enhance them
  if (originalHeading.toLowerCase().includes('you') || originalHeading.toLowerCase().includes('your')) {
    return originalHeading.replace(/your/i, 'Your Personalized');
  }
  
  // Add action words to headings
  const actionVerbs = ['Discover', 'Experience', 'Unleash', 'Transform', 'Elevate'];
  const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  
  // Remove HTML tags for text processing
  const plainText = originalHeading.replace(/<[^>]*>/g, '');
  
  // If heading is short, transform it completely
  if (plainText.length < 30) {
    return `${randomVerb} ${plainText}`;
  }
  
  // For longer headings, keep structure but add impact words
  const impactWords = ['Revolutionary', 'Exclusive', 'Premium', 'Extraordinary', 'Essential'];
  const randomImpact = impactWords[Math.floor(Math.random() * impactWords.length)];
  
  // Inject impact word
  return originalHeading.replace(/(\w+)/, `${randomImpact} $1`);
}

// Make a product description more compelling
function makeDescriptionMoreCompelling(originalDescription) {
  // If already fairly long, just enhance
  if (originalDescription.length > 150) {
    return enhanceDescription(originalDescription);
  }
  
  // For shorter descriptions, expand with benefits
  const benefitPhrases = [
    'Our customers love how this',
    'You\'ll be amazed at how this',
    'Discover why this has become',
    'Experience the difference with this'
  ];
  
  const randomBenefit = benefitPhrases[Math.floor(Math.random() * benefitPhrases.length)];
  
  return `${originalDescription} ${randomBenefit} essential product for thousands of satisfied customers.`;
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