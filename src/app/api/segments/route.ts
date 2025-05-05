import { NextResponse } from 'next/server';
import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG);

export async function GET() {
  try {
    const segments = await edgeConfig.get('segments') || {};
    return NextResponse.json(Object.values(segments));
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
    
    const segments = await edgeConfig.get('segments') || {};
    const id = crypto.randomUUID();
    
    segments[id] = {
      id,
      name,
      description,
      rules: rules || [],
      users: []
    };
    
    await edgeConfig.set('segments', segments);
    
    return NextResponse.json({ id, name, description, rules });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
  }
} 