'use client';

import React, { useState, useEffect } from "react";
import { FiMail, FiBell } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import Sidebar from "@/component/Sidebar";
import Calendar from "@/component/Calendar";

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Format date as MM / DD / YYYY
  const formatDate = (date) => {
    return `${String(date.getMonth() + 1).padStart(2, '0')} / ${String(date.getDate()).padStart(2, '0')} / ${date.getFullYear()}`;
  };

  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    // Update date and time immediately
    const now = new Date();
    setCurrentDate(formatDate(now));
    setCurrentTime(formatTime(now));

    // Set up interval to update time every second
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentDate(formatDate(now));
      setCurrentTime(formatTime(now));
    }, 1000); // Update every second

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-base text-text grid grid-cols-[auto_1fr]">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <FiMail className="text-2xl cursor-pointer hover:text-[#0D8A3F] transition-colors" />
            <FiBell className="text-2xl cursor-pointer hover:text-[#0D8A3F] transition-colors" />
            <CgProfile className="text-2xl cursor-pointer hover:text-[#0D8A3F] transition-colors" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Today</h3>
            <p className="text-3xl font-light">{currentDate}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Time</h3>
            <p className="text-3xl font-light">{currentTime}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Attendance Preview</h3>
            <p className="text-3xl font-light">--</p>
          </div>

          {/* CALENDAR */}
          <div className="col-span-3 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-sm font-medium block mb-3">Calendar</span>
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;