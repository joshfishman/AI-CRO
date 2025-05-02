import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verify editor API key
  const apiKey = req.headers['x-api-key'];
  const editorKey = process.env.CURSOR_EDITOR_KEY;
  
  if (!apiKey || apiKey !== editorKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Initialize Edge Config client
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    const { workspaceId } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Missing workspace ID' });
    }
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        // Get all segments for workspace
        const segments = await edgeConfig.get(`segments:${workspaceId}`) || [];
        return res.status(200).json({ segments });
        
      case 'POST':
        // Create or update segment
        const segmentData = req.body;
        
        if (!segmentData || !segmentData.id) {
          return res.status(400).json({ error: 'Invalid segment data' });
        }
        
        // Validate segment data
        if (!validateSegmentData(segmentData)) {
          return res.status(400).json({ error: 'Invalid segment structure' });
        }
        
        // Get existing segments
        let existingSegments = await edgeConfig.get(`segments:${workspaceId}`) || [];
        
        // Check if segment already exists
        const existingIndex = existingSegments.findIndex(s => s.id === segmentData.id);
        
        if (existingIndex >= 0) {
          // Update existing segment
          existingSegments[existingIndex] = segmentData;
        } else {
          // Add new segment
          existingSegments.push(segmentData);
        }
        
        // Save updated segments
        await edgeConfig.set(`segments:${workspaceId}`, existingSegments);
        
        return res.status(200).json({ 
          success: true, 
          message: `Segment ${segmentData.id} saved successfully` 
        });
        
      case 'DELETE':
        // Delete segment by ID
        const { segmentId } = req.query;
        
        if (!segmentId) {
          return res.status(400).json({ error: 'Missing segment ID' });
        }
        
        // Get existing segments
        let currentSegments = await edgeConfig.get(`segments:${workspaceId}`) || [];
        
        // Filter out the segment to delete
        const updatedSegments = currentSegments.filter(s => s.id !== segmentId);
        
        // Check if segment was found and removed
        if (updatedSegments.length === currentSegments.length) {
          return res.status(404).json({ error: `Segment ${segmentId} not found` });
        }
        
        // Save updated segments
        await edgeConfig.set(`segments:${workspaceId}`, updatedSegments);
        
        return res.status(200).json({ 
          success: true, 
          message: `Segment ${segmentId} deleted successfully` 
        });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in manage-segments:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}

/**
 * Validate segment data structure
 */
function validateSegmentData(segment) {
  // Check required fields
  if (!segment.id || !segment.name) {
    return false;
  }
  
  // Check rules array
  if (!segment.rules || !Array.isArray(segment.rules) || segment.rules.length === 0) {
    return false;
  }
  
  // Validate each rule
  for (const rule of segment.rules) {
    if (!rule.field || !rule.operator || rule.value === undefined) {
      return false;
    }
    
    // Check if operator is valid
    const validOperators = [
      'equals', 
      'notEquals', 
      'contains', 
      'notContains', 
      'greaterThan', 
      'lessThan', 
      'before', 
      'after'
    ];
    
    if (!validOperators.includes(rule.operator)) {
      return false;
    }
  }
  
  return true;
} 