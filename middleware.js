import { NextResponse } from 'next/server';

// This middleware adds CORS headers to all responses
export function middleware(request) {
  // Get the incoming response
  const response = NextResponse.next();
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, x-api-key');
  
  // Return the modified response
  return response;
}

// Configure for which paths this middleware is active
export const config = {
  matcher: [
    '/api/:path*',
    '/selector-bookmarklet.js',
    '/personalization-loader.js',
  ],
}; 