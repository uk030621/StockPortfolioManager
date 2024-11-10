// app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function POST(_req) {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Clear the token cookie by setting it to expire immediately
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0, // Expires immediately
  });

  return response;
}
