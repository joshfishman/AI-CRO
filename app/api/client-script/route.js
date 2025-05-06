export async function OPTIONS(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function GET(request) {
  // Get the host URL (for redirecting)
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://ai-cro-three.vercel.app';
  
  // Get the URL of the request
  const url = new URL(request.url);
  
  // If the request is for the bookmarklet, redirect to the fixed-cors version
  if (url.searchParams.get('bookmarklet') === 'true') {
    return Response.redirect(`${host}/api/client-script/fixed-cors?bookmarklet=true`, 302);
  }
  
  // For all other requests, redirect to the fixed-cors version
  // but maintain any query parameters
  const queryString = Array.from(url.searchParams.entries())
    .filter(([key]) => key !== 'redirected') // Prevent redirect loops
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  const redirectUrl = `${host}/api/client-script/fixed-cors${queryString ? '?' + queryString : ''}`;
  
  // For debugging: if the redirected parameter is present, don't redirect again
  if (url.searchParams.get('redirected') === 'true') {
    return new Response(`
      // Redirect Detection Script
      console.error('[AI CRO] You are using the old client-script endpoint. Please update to use /api/client-script/fixed-cors instead.');
      window.location.href = "${redirectUrl}";
    `, {
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
  
  return Response.redirect(redirectUrl, 302);
} 