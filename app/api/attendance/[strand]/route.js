import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const strand = searchParams.get('strand');
    
    if (!strand) {
      return NextResponse.json(
        { message: 'Strand parameter is required' },
        { status: 400 }
      );
    }
    
    // Get total users in strand
    const totalStudents = await prisma.user.count({
      where: {
        strand: {
          equals: strand,
          mode: 'insensitive' // Case-insensitive search
        }
      }
    });
    
    // Get the current month's date range
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    // Get users in this strand
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
    
    // Get attendance stats
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        userId: {
          in: userIds
        }
      },
      _count: {
        status: true
      }
    });
    
    // Format results
    const presentCount = attendanceStats.find(stat => stat.status === 'present')?._count?.status || 0;
    const lateCount = attendanceStats.find(stat => stat.status === 'late')?._count?.status || 0;
    const absentCount = attendanceStats.find(stat => stat.status === 'absent')?._count?.status || 0;
    
    return NextResponse.json({
      strand,
      totalStudents,
      presentCount,
      lateCount,
      absentCount,
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: year
    });
  } catch (error) {
    console.error('Error fetching strand stats:', error);
    return NextResponse.json(
      { message: 'Error fetching strand stats: ' + error.message },
      { status: 500 }
    );
  }
}