import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const strand = searchParams.get('strand');
    
    // Build the where clause
    const whereClause = {};
    
    if (strand) {
      whereClause.strand = {
        equals: strand,
        mode: 'insensitive' // Case-insensitive search
      };
    }
    
    // Fetch all users, excluding sensitive data
    const users = await prisma.user.findMany({
      where: whereClause,
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