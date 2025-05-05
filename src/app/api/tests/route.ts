import { NextResponse } from 'next/server';
import { updateTestConfig, getTestConfig } from '@/lib/edge-config';

// GET all tests
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Get a single test
      const test = await getTestConfig(id);
      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(test);
    } else {
      // Get all tests
      // In a real implementation, this would fetch from a database with pagination
      // For now, using mock data
      const tests = [
        {
          id: 'test-1',
          name: 'Homepage CTA Test',
          status: 'running',
          selector: '.hero-cta',
          variants: [
            { id: 'control', content: '<button>Sign Up Now</button>', weight: 50 },
            { id: 'variant-1', content: '<button>Get Started Free</button>', weight: 50 }
          ],
          targeting: {
            urls: ['*'],
            segments: []
          },
          metrics: {
            impressions: 1000,
            conversions: 120,
            startDate: '2023-06-01'
          }
        }
      ];
      return NextResponse.json(tests);
    }
  } catch (error) {
    console.error('Error getting tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

// POST create a new test
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.selector || !data.variants || data.variants.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, selector, variants' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the test
    const testId = `test-${Date.now()}`;
    
    // Prepare test config
    const newTest = {
      id: testId,
      name: data.name,
      status: data.status || 'draft',
      selector: data.selector,
      variants: data.variants.map((variant: any, index: number) => ({
        id: variant.id || `variant-${index}`,
        name: variant.name || `Variant ${index + 1}`,
        content: variant.content,
        weight: variant.weight || 100 / data.variants.length
      })),
      targeting: data.targeting || {
        urls: ['*'],
        segments: []
      },
      metrics: {
        impressions: 0,
        conversions: 0,
        startDate: new Date().toISOString().split('T')[0]
      }
    };
    
    // Save the new test
    await updateTestConfig(testId, newTest);
    
    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

// PUT update an existing test
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }
    
    // Check if test exists
    const existingTest = await getTestConfig(id);
    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Prepare updated test data
    const { id: _, ...dataWithoutId } = data;
    
    // Update the test
    await updateTestConfig(id, {
      ...existingTest,
      ...dataWithoutId,
    });
    
    const updatedTest = await getTestConfig(id);
    
    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

// DELETE a test
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }
    
    // Check if test exists
    const existingTest = await getTestConfig(id);
    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, we would delete from the database
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: `Test ${id} has been deleted`
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
} 