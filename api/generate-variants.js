import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check API key auth
  if (req.headers['x-api-key'] !== process.env.CURSOR_EDITOR_KEY) {
    console.error('Invalid API key provided');
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  
  try {
    const { prompt, originalContent, count = 3 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'A prompt is required to generate variants' 
      });
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Generate variants using the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates multiple variations of text for A/B testing and personalization.' },
        { role: 'user', content: `Original content: "${originalContent || 'No original content provided'}"\n\nGenerate ${count} distinct variants based on the following prompt: ${prompt}\n\nReturn ONLY the variants, one per line, without any numbering, explanation, or additional text.` }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    });
    
    // Process the response to extract variants
    let variantText = response.choices[0].message.content.trim();
    
    // Split by newlines and clean up
    const variants = variantText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, count); // Ensure we only return the requested number
    
    return res.status(200).json({ 
      variants,
      prompt,
      originalContent
    });
  } catch (error) {
    console.error('Error generating variants:', error);
    return res.status(500).json({ 
      error: 'Failed to generate variants',
      message: error.message 
    });
  }
} 