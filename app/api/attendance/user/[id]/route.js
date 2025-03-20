import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET endpoint to fetch attendance records for a specific user
 */
export async function GET(request, { params }) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : new Date().getMonth() + 1;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : new Date().getFullYear();
    
    // Build the date range for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Fetch user's attendance records
    const attendance = await prisma.attendance.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        strand: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate attendance statistics
    const totalDays = endDate.getDate();
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const recordedDays = presentDays + lateDays + absentDays;
    const unrecordedDays = totalDays - recordedDays;
    
    // Create response with user, attendance records and statistics
    const response = {
      user,
      records: attendance,
      stats: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        unrecordedDays,
        presentPercentage: Math.round((presentDays / totalDays) * 100),
        latePercentage: Math.round((lateDays / totalDays) * 100),
        absentPercentage: Math.round((absentDays / totalDays) * 100)
      },
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: year
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    return NextResponse.json(
      { message: 'Error fetching user attendance: ' + error.message },
      { status: 500 }
    );
  }
}