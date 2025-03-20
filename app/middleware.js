import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/veriface',
  '/api/auth/veriface/register',
  '/verification',
];

// File paths that should be publicly accessible
const staticFileRegex = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|otf|mp4|webm|ogg|mp3|wav|pdf|json|wasm|map)$/i;

// Face-api model files need to be publicly accessible
const faceApiModelsRegex = /^\/models\//i;

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow access to static files and models without authentication
  if (staticFileRegex.test(pathname) || faceApiModelsRegex.test(pathname)) {
    return NextResponse.next();
  }
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For API routes, check auth token
  if (pathname.startsWith('/api/')) {
    // Add CORS headers for API routes
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    
    // For authentication-specific API routes, let them pass through
    if (pathname.startsWith('/api/auth/')) {
      return response;
    }
    
    // For other API routes, verify authentication
    const token = await getToken({ req: request });
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    return response;
  }

  // Check authentication for non-API routes
  const token = await getToken({ req: request });
  
  // If the user is not authenticated, redirect to the login page
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /favicon.ico, /sitemap.xml etc.
     * 2. /_next (Next.js internals)
     * 3. /models (face-api models directory)
     * 4. All static files (images, fonts, etc.)
     */
    '/((?!_next|models|favicon.ico|robots.txt).*)',
  ],
};