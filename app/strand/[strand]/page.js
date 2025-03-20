"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from "@/component/Sidebar";
import AttendanceTable from "@/component/AttendanceTable";
import { motion } from 'framer-motion';

const StrandPage = () => {
  const params = useParams();
  const strandName = params.strand?.toUpperCase();
  const [strandStats, setStrandStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch strand statistics
    const fetchStrandStats = async () => {
      try {
        const response = await fetch(`/api/attendance/${strandName}`);
        if (response.ok) {
          const data = await response.json();
          setStrandStats({
            present: data.presentCount || 0,
            late: data.lateCount || 0,
            absent: data.absentCount || 0,
            total: data.totalStudents || 0
          });
        }
      } catch (error) {
        console.error("Error fetching strand stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (strandName) {
      fetchStrandStats();
    }
  }, [strandName]);

  // Strand colors mapping
  const strandColors = {
    'STEM': 'bg-blue-100',
    'ABM': 'bg-amber-100',
    'HUMSS': 'bg-purple-100',
    'HE': 'bg-pink-100',
    'ICT': 'bg-cyan-100',
    'SMAW': 'bg-orange-100'
  };

  // Default to green if strand not in mapping
  const bgColor = strandColors[strandName] || 'bg-green-100';

  return (
    <div className="min-h-screen bg-base text-text grid grid-cols-[auto_1fr]">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {strandName} Strand Attendance
          </motion.h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border border-gray-200 p-5 rounded-lg shadow-sm">
          <motion.div 
            className={`${bgColor} p-6 rounded-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-medium mb-2">Present</h3>
            <p className="text-3xl font-light">{loading ? '...' : strandStats.present}</p>
          </motion.div>

          <motion.div 
            className={`${bgColor} p-6 rounded-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-medium mb-2">Late</h3>
            <p className="text-3xl font-light">{loading ? '...' : strandStats.late}</p>
          </motion.div>

          <motion.div 
            className={`${bgColor} p-6 rounded-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-sm font-medium mb-2">Total Students</h3>
            <p className="text-3xl font-light">{loading ? '...' : strandStats.total}</p>
          </motion.div>
          
          {/* Strand-specific Attendance Table */}
          <div className="col-span-3 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-sm font-medium block mb-3">{strandName} Attendance Tracker</span>
            <StrandAttendanceTable strand={strandName} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a strand-specific attendance table
const StrandAttendanceTable = ({ strand }) => {
  return <AttendanceTable filter={{ strand }} />;
};

export default StrandPage;