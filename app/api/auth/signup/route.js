import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, email, password, strand } = await request.json();
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });
    
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'Email is already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        strand: strand || null
      }
    });
    
    // Don't return password
    const { password: _, ...userWithoutPassword } = user;
    
    // Create response with user data
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating user' },
      { status: 500 }
    );
  }
}