import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get parameters from URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const strand = searchParams.get('strand');
    
    // Get current month date range
    const now = new Date();
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : now.getFullYear();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) - 1 : now.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    // Prepare where clause for filtering
    const whereClause = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    
    // If userId is provided, filter by user
    if (userId) {
      whereClause.userId = userId;
    }
    
    // If strand is provided, we need to get users in that strand first
    let userIds = [];
    if (strand && !userId) {
      const usersInStrand = await prisma.user.findMany({
        where: {
          strand: strand.toUpperCase()
        },
        select: {
          id: true
        }
      });
      
      userIds = usersInStrand.map(user => user.id);
      
      if (userIds.length > 0) {
        whereClause.userId = {
          in: userIds
        };
      }
    }
    
    // Get attendance stats
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    });
    
    // Count total users (for strand statistics)
    let totalStudents = 0;
    if (strand) {
      totalStudents = userIds.length;
    } else if (userId) {
      totalStudents = 1;
    }
    
    // Format results
    const presentCount = attendanceStats.find(stat => stat.status === 'present')?._count?.status || 0;
    const lateCount = attendanceStats.find(stat => stat.status === 'late')?._count?.status || 0;
    const absentCount = attendanceStats.find(stat => stat.status === 'absent')?._count?.status || 0;
    
    return NextResponse.json({
      userId,
      strand,
      totalStudents,
      presentCount,
      lateCount,
      absentCount,
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: year
    });
    
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json(
      { message: 'Error fetching attendance stats: ' + error.message },
      { status: 500 }
    );
  }
}