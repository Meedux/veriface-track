import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const userId = searchParams.get('userId');
    const strand = searchParams.get('strand');
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : null;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : null;
    
    // Base where clause
    let whereClause = {};
    
    // Add date range filter if month/year are provided
    if (month !== null && year !== null) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    // Add user filter if userId is provided
    if (userId) {
      whereClause.userId = userId;
    }
    
    // Add strand filter if strand is provided
    if (strand) {
      // Get all users in this strand
      const usersInStrand = await prisma.user.findMany({
        where: {
          strand: {
            equals: strand,
            mode: 'insensitive'
          }
        },
        select: {
          id: true
        }
      });
      
      const userIds = usersInStrand.map(user => user.id);
      
      whereClause.userId = {
        in: userIds
      };
    }
    
    // Fetch the actual attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            // Removed username as it doesn't exist in the schema
            strand: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Transform the records for the calendar
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      date: record.date,
      time: record.time || '',
      status: record.status,
      userName: record.user?.name || 'Unknown User'
    }));
    
    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { message: 'Error fetching attendance records: ' + error.message },
      { status: 500 }
    );
  }
}