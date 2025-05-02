import fs from 'fs';
import path from 'path';

// This API route serves the selector bookmarklet file directly from the public folder
export default function handler(req, res) {
  try {
    // Get the path to the static file
    const filePath = path.join(process.cwd(), 'public', 'selector-bookmarklet.js');
    
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Set correct content type
    res.setHeader('Content-Type', 'application/javascript');
    
    // Send the file content
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error serving selector-bookmarklet.js:', error);
    res.status(500).json({ error: 'Failed to serve the bookmarklet file' });
  }
} 