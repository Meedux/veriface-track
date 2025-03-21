import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, email, password, strand } = await request.json();
    
    // Validation
    if (!name || !email ) {
      return NextResponse.json(
        { success: false, message: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
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
    
    // Hash password - with try/catch for bcrypt errors
    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (bcryptError) {
      console.error('Password hashing error:', bcryptError);
      return NextResponse.json(
        { success: false, message: 'Error processing password' },
        { status: 500 }
      );
    }
    
    // Create user - with more detailed error handling
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          strand: strand || null
        }
      });
    } catch (prismaError) {
      console.error('Prisma create user error:', prismaError);
      return NextResponse.json(
        { success: false, message: `Database error: ${prismaError.message}` },
        { status: 500 }
      );
    }
    
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
      { success: false, message: `Error creating user: ${error.message}` },
      { status: 500 }
    );
  }
}