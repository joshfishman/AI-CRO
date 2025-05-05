import { NextResponse } from 'next/server';
import { getSegmentConfig, updateSegmentConfig } from '@/lib/edge-config';

// GET all segments or a specific segment
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Get a single segment
      const segment = await getSegmentConfig(id);
      if (!segment) {
        return NextResponse.json(
          { error: 'Segment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(segment);
    } else {
      // Get all segments (mock data for now)
      const segments = [
        {
          id: 'segment-1',
          name: 'New Visitors',
          description: 'Users visiting the site for the first time',
          rules: [
            { type: 'custom', condition: 'visitCount', value: '1' }
          ],
          users: []
        },
        {
          id: 'segment-2',
          name: 'Mobile Users',
          description: 'Users on mobile devices',
          rules: [
            { type: 'device', condition: 'deviceType', value: 'mobile' }
          ],
          users: []
        }
      ];
      return NextResponse.json(segments);
    }
  } catch (error) {
    console.error('Error getting segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}

// POST create a new segment
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.rules) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rules' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID for the segment
    const segmentId = `segment-${Date.now()}`;
    
    // Prepare segment config
    const newSegment = {
      id: segmentId,
      name: data.name,
      description: data.description || '',
      rules: data.rules || [],
      users: data.users || []
    };
    
    // Save the new segment
    await updateSegmentConfig(segmentId, newSegment);
    
    return NextResponse.json({
      success: true,
      ...newSegment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    );
  }
}

// PUT update an existing segment
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }
    
    // Check if segment exists
    const existingSegment = await getSegmentConfig(id);
    if (!existingSegment) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    
    // Prepare updated segment data
    const { id: _, ...dataWithoutId } = data;
    
    // Update the segment
    await updateSegmentConfig(id, {
      ...existingSegment,
      ...dataWithoutId,
    });
    
    const updatedSegment = await getSegmentConfig(id);
    
    return NextResponse.json(updatedSegment);
  } catch (error) {
    console.error('Error updating segment:', error);
    return NextResponse.json(
      { error: 'Failed to update segment' },
      { status: 500 }
    );
  }
}

// DELETE a segment
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }
    
    // Check if segment exists
    const existingSegment = await getSegmentConfig(id);
    if (!existingSegment) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, we would delete from the database
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: `Segment ${id} has been deleted`
    });
  } catch (error) {
    console.error('Error deleting segment:', error);
    return NextResponse.json(
      { error: 'Failed to delete segment' },
      { status: 500 }
    );
  }
} 