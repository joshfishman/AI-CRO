import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG);

export async function middleware(request: NextRequest) {
  // Initialize Edge Config if needed
  try {
    const settings = await edgeConfig.get('settings');
    if (!settings) {
      // Initialize with default settings if not exists
      await edgeConfig.set('settings', {
        defaultTheme: 'light',
        apiKeys: {},
        features: {
          advancedTargeting: true,
          analytics: true,
          bookmarklet: true
        }
      });
    }
  } catch (error) {
    console.error('Edge Config initialization error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 