// app/api/logout/route.js
import { NextResponse } from 'next/server';


export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: -1 });
  return response;
}
