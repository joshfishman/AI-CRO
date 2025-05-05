import { NextResponse } from 'next/server';
import { getTestConfig, updateTestConfig } from '@/lib/edge-config';

// Define additional metrics properties
interface ExtendedMetrics {
  impressions: number;
  conversions: number;
  startDate: string;
  endDate?: string;
  variantMetrics?: Record<string, { impressions: number; conversions: number }>;
  customEvents?: Record<string, number>;
  eventData?: Array<{
    timestamp: string;
    event: string;
    variantId: string;
    userId: string;
    metadata: any;
  }>;
}

export async function POST(request: Request) {
  try {
    const { testId, variantId, event, userId, metadata } = await request.json();
    
    if (!testId || !variantId || !event) {
      return NextResponse.json(
        { error: 'Missing required parameters: testId, variantId, and event are required' },
        { status: 400 }
      );
    }
    
    // Get current test data
    const test = await getTestConfig(testId);
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }
    
    // Update metrics based on event type
    const updatedTest = { ...test };
    const metrics = updatedTest.metrics as ExtendedMetrics;
    
    if (event === 'impression') {
      // Increment impressions
      metrics.impressions = (metrics.impressions || 0) + 1;
    } else if (event === 'conversion') {
      // Increment conversions
      metrics.conversions = (metrics.conversions || 0) + 1;
      
      // Track variant-specific metrics if not already present
      if (!metrics.variantMetrics) {
        metrics.variantMetrics = {};
      }
      
      if (!metrics.variantMetrics[variantId]) {
        metrics.variantMetrics[variantId] = {
          impressions: 0,
          conversions: 0
        };
      }
      
      metrics.variantMetrics[variantId].conversions += 1;
    }
    
    // Store custom event data
    if (event !== 'impression' && event !== 'conversion') {
      if (!metrics.customEvents) {
        metrics.customEvents = {};
      }
      
      if (!metrics.customEvents[event]) {
        metrics.customEvents[event] = 0;
      }
      
      metrics.customEvents[event] += 1;
    }
    
    // Store additional metadata if provided
    if (metadata) {
      if (!metrics.eventData) {
        metrics.eventData = [];
      }
      
      metrics.eventData.push({
        timestamp: new Date().toISOString(),
        event,
        variantId,
        userId: userId || 'anonymous',
        metadata
      });
      
      // Limit stored event data to prevent excessive growth
      if (metrics.eventData.length > 1000) {
        metrics.eventData = metrics.eventData.slice(-1000);
      }
    }
    
    // Update the test config
    await updateTestConfig(testId, updatedTest);
    
    return NextResponse.json({
      success: true,
      message: `Event ${event} recorded for test ${testId}, variant ${variantId}`
    });
  } catch (error) {
    console.error('Error recording event:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
} 