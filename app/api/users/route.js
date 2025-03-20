import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET endpoint to fetch all users
 * Returns user data needed for the attendance table
 */
export async function GET() {
  try {
    // Fetch all users, excluding sensitive data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        strand: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc' // Sort by name alphabetically
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Error fetching users: ' + error.message },
      { status: 500 }
    );
  }
}