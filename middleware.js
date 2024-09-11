import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;

  // If no token exists, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  // Optionally, skip token validation here and handle it in your routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/'], // Protect the home page
};
