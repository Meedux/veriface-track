import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        faceData: { select: { id: true } }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create user data to return (without sensitive info)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      hasFaceRegistered: !!user.faceData
    };
    
    // Create response with user data
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: userData
      },
      { status: 200 }
    );
    
    // Set a secure HTTP-only cookie with user info
    response.cookies.set({
      name: 'user_session',
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Error logging in' },
      { status: 500 }
    );
  }
}