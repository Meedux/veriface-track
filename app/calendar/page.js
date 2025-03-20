"use client";

import Calendar from "@/component/Calendar";
import Sidebar from "@/component/Sidebar";
import React, { useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { FiBell, FiMail } from "react-icons/fi";

const CalendarPage = () => {
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id);
          return user.id;
        }
        return null;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    };

    // Fetch attendance statistics
    const fetchAttendanceStats = async (id) => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/attendance/stats?userId=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance stats');
        }
        
        const data = await response.json();
        
        setAttendanceStats({
          present: data.presentCount || 0,
          absent: data.absentCount || 0,
          late: data.lateCount || 0
        });
      } catch (error) {
        console.error('Error fetching attendance stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const id = getUserData();
    fetchAttendanceStats(id);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-base text-text grid grid-cols-[auto_1fr]">
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Attendance Calendar</h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border border-gray-200 p-5 rounded-lg shadow-sm">
            {/* CALENDAR */}
            <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm">
              <span className="text-sm font-medium block mb-3">Your Attendance</span>
              {userId && <Calendar userId={userId} />}
              {!userId && <p className="text-center text-gray-500 py-4">Please log in to view your attendance</p>}
            </div>
            
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Present</h3>
              <p className="text-3xl font-light">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded"></span>
                ) : (
                  attendanceStats.present
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {!loading && attendanceStats.late > 0 && (
                  <span>Including {attendanceStats.late} late arrival(s)</span>
                )}
              </p>
            </div>

            <div className="bg-red-100 p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Absences</h3>
              <p className="text-3xl font-light">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded"></span>
                ) : (
                  attendanceStats.absent
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                This month
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;