import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json({ message: 'Authenticated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}



