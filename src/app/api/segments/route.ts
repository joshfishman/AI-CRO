import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateSegmentConfig, SegmentConfig } from '@/lib/edge-config';

export async function GET() {
  try {
    // Use dummy implementation for demo
    const mockSegments = {
      "segment1": {
        id: "segment1",
        name: "New Visitors",
        description: "First-time visitors to the site",
        rules: [{ type: "url", condition: "contains", value: "utm_source=new" }],
        users: []
      },
      "segment2": {
        id: "segment2",
        name: "Returning Customers",
        description: "Users who have purchased before",
        rules: [{ type: "custom", condition: "equals", value: "returning_customer" }],
        users: []
      }
    };
    
    return NextResponse.json(Object.values(mockSegments));
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, rules } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Create a new segment ID
    const id = crypto.randomUUID();
    
    // Create the new segment
    const newSegment: SegmentConfig = {
      id,
      name,
      description,
      rules: rules || [],
      users: []
    };
    
    // For demo, we'll just return the new segment
    // In production, this would use updateSegmentConfig(id, newSegment)
    
    return NextResponse.json(newSegment);
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
  }
} 