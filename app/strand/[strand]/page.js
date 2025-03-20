"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from "@/component/Sidebar";
import AttendanceTable from "@/component/AttendanceTable";
import { motion } from 'framer-motion';

// Cache for storing strand data across renders and component instances
const strandDataCache = {};

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
  
  // Reference to track which strands we've already fetched
  const fetchedStrands = useRef(new Set());

  useEffect(() => {
    // Skip if no strand name is available
    if (!strandName) return;
    
    // Function to handle setting stats while avoiding multiple renders
    const setStats = (stats) => {
      setStrandStats(stats);
      setLoading(false);
    };
    
    // If we already have cached data, use it without fetching
    if (strandDataCache[strandName]) {
      setStats(strandDataCache[strandName]);
      return;
    }
    
    // If we've already initiated a fetch for this strand, don't fetch again
    if (fetchedStrands.current.has(strandName)) return;
    
    // Mark this strand as being fetched so we don't fetch it again
    fetchedStrands.current.add(strandName);
    
    // Fetch strand statistics
    const fetchStrandStats = async () => {
      try {
        const response = await fetch(`/api/attendance/stats?strand=${strandName}`);
        if (response.ok) {
          const data = await response.json();
          const statsData = {
            present: data.presentCount || 0,
            late: data.lateCount || 0,
            absent: data.absentCount || 0,
            total: data.totalStudents || 0
          };
          
          // Store in cache for future use
          strandDataCache[strandName] = statsData;
          
          // Update state (only once)
          setStats(statsData);
        } else {
          // Handle error response
          console.error(`Failed to fetch strand stats: ${response.status}`);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching strand stats:", error);
        setLoading(false);
      }
    };

    fetchStrandStats();
  }, [strandName]); // Only re-run if strandName changes

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
            {!loading && <AttendanceTable filter={{ strand: strandName }} />}
            {loading && (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D8A3F]"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrandPage;