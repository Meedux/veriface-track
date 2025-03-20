import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET endpoint to fetch attendance records
 * Supports optional query parameters for filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : new Date().getMonth() + 1;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : new Date().getFullYear();
    const userId = searchParams.get('userId');
    
    // Build the date range for the specified month
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Build query filters
    let whereClause = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    
    // Add user filter if provided
    if (userId) {
      whereClause.userId = userId;
    }
    
    // Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            strand: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { message: 'Error fetching attendance records: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to create an attendance record manually
 * Used for admin or manual attendance tracking
 */
export async function POST(request) {
  try {
    const { userId, date, time, status } = await request.json();
    
    // Validate required fields
    if (!userId || !status) {
      return NextResponse.json(
        { message: 'userId and status are required fields' },
        { status: 400 }
      );
    }
    
    // Create the attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
        time: time || formatTime(new Date()),
        status
      }
    });
    
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json(
      { message: 'Error creating attendance record: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper function to format time in 12-hour format
 */
function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}