import { NextResponse } from 'next/server';
import { getTestConfig, getSegmentConfig } from '@/lib/edge-config';

export async function POST(request: Request) {
  try {
    const { url, selector, userId, userAttributes } = await request.json();
    
    if (!url || !selector) {
      return NextResponse.json(
        { error: 'Missing required parameters: url and selector are required' },
        { status: 400 }
      );
    }

    // Fetch all active tests that apply to this URL and selector
    const allTests = await getAllActiveTests();
    const applicableTests = allTests.filter(test => 
      isTestApplicable(test, url, selector, userId, userAttributes)
    );

    if (applicableTests.length === 0) {
      return NextResponse.json({ 
        personalized: false,
        message: 'No applicable tests found' 
      });
    }

    // Get the highest priority test for this selector
    const test = applicableTests[0];
    
    // Select a variant based on the test configuration
    const variant = selectVariant(test);

    return NextResponse.json({
      personalized: true,
      testId: test.id,
      variantId: variant.id,
      content: variant.content,
    });
  } catch (error) {
    console.error('Error in personalization API:', error);
    return NextResponse.json(
      { error: 'Failed to generate personalized content' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getAllActiveTests() {
  try {
    // In a real implementation, this would fetch from a database
    // For now, using mock data
    return [
      {
        id: 'test-1',
        status: 'running',
        selector: '.hero-cta',
        variants: [
          { id: 'control', content: '<button>Sign Up Now</button>', weight: 50 },
          { id: 'variant-1', content: '<button>Get Started Free</button>', weight: 50 }
        ],
        targeting: {
          urls: ['*'],
          segments: []
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching active tests:', error);
    return [];
  }
}

function isTestApplicable(
  test: any, 
  url: string, 
  selector: string, 
  userId?: string, 
  userAttributes?: Record<string, any>
) {
  // Check if the test is for this selector
  if (test.selector !== selector) return false;
  
  // Check URL targeting
  if (test.targeting.urls && test.targeting.urls.length > 0) {
    const urlMatches = test.targeting.urls.some((pattern: string) => {
      if (pattern === '*') return true;
      return url.includes(pattern);
    });
    
    if (!urlMatches) return false;
  }
  
  // Check segment targeting
  if (test.targeting.segments && test.targeting.segments.length > 0 && userId) {
    // This would need to check if the user belongs to any of the targeted segments
    // Simplified version for now
    return true;
  }
  
  return true;
}

function selectVariant(test: any) {
  // Simple A/B selection using weights
  const variants = test.variants;
  
  // If only one variant, return it
  if (variants.length === 1) return variants[0];
  
  // Randomly select variant based on weights
  const totalWeight = variants.reduce((sum: number, v: any) => sum + (v.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const variant of variants) {
    random -= (variant.weight || 1);
    if (random <= 0) return variant;
  }
  
  // Fallback to first variant
  return variants[0];
} 