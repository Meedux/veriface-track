'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AttendanceTable = () => {
  const [currentMonth, setCurrentMonth] = useState('');
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Set current month name and year
    setCurrentMonth(`${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)} ${year}`);
    
    // Calculate days in month
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    setDaysInMonth(daysArray);
    
    // Fetch actual attendance data
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('/api/attendance');
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        
        // Transform the data into the format expected by the component
        const formattedData = {};
        data.forEach(record => {
          const userId = record.userId;
          const date = new Date(record.date);
          const day = date.getDate();
          
          if (!formattedData[userId]) {
            formattedData[userId] = {};
          }
          
          formattedData[userId][day] = {
            status: record.status,
            time: record.time
          };
        });
        
        setAttendanceData(formattedData);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    // Execute the fetch functions
    fetchAttendanceData();
    fetchUsers();
    
    // Set loaded after a small delay for animation purposes
    setTimeout(() => setIsLoaded(true), 500);
  }, []);
  
  // Get status class for attendance cell
  const getStatusClass = (status) => {
    switch(status) {
      case 'present': return 'bg-green-400 hover:bg-green-500';
      case 'absent': return 'bg-red-400 hover:bg-red-500';
      case 'late': return 'bg-yellow-400 hover:bg-yellow-500';
      default: return 'bg-gray-100 hover:bg-gray-200';
    }
  };
  
  return (
    <div>
      <motion.h2 
        className="text-lg font-medium mb-4 text-[#0D8A3F]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {currentMonth}
      </motion.h2>
      
      {/* Custom scrollable table container */}
      <div 
        className="rounded-lg shadow-lg border border-gray-200 relative"
        style={{
          background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0)) 0 0, radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0)) 0 100%',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 40px, 100% 40px, 100% 15px, 100% 15px',
          backgroundAttachment: 'local, local, scroll, scroll'
        }}
      >
        <div 
          className="overflow-auto max-h-[400px] scrollbar-custom" 
          style={{ scrollBehavior: 'smooth' }}
        >
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <motion.tr 
                className="bg-[#E8F5E9]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <th className="py-3 px-4 text-left font-medium border border-gray-200 sticky left-0 bg-[#E8F5E9] z-30 shadow-sm">
                  <div className="flex flex-col">
                    <span>Name</span>
                    <span className="text-xs font-normal text-gray-500">Strand</span>
                  </div>
                </th>
                {daysInMonth.map(day => (
                  <th key={day} className="py-3 px-2 text-center font-medium border border-gray-200 min-w-14 transition-all">
                    {String(day).padStart(2, '0')}
                  </th>
                ))}
              </motion.tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="py-3 px-4 border border-gray-200 sticky left-0 bg-white z-10 font-medium hover:bg-gray-50 shadow-sm">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-gray-500">{user.strand}</span>
                    </div>
                  </td>
                  {daysInMonth.map(day => {
                    const record = attendanceData[user.id]?.[day];
                    const status = record?.status || '';
                    
                    return (
                      <motion.td 
                        key={`${user.id}-${day}`} 
                        className={`py-2 px-2 text-center border border-gray-200 transition-all ${getStatusClass(status)}`}
                        title={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'No record'}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {status === 'present' && (
                          <span className="text-xs font-medium">{record.time}</span>
                        )}
                        {status === 'absent' && (
                          <span className="text-lg font-bold">✗</span>
                        )}
                        {status === 'late' && (
                          <span className="text-xs font-medium">{record.time}</span>
                        )}
                      </motion.td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <motion.div 
        className="flex gap-6 mt-6 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 bg-green-400 rounded-sm shadow-sm"></span>
          <span className="text-sm">Present</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 bg-red-400 rounded-sm shadow-sm"></span>
          <span className="text-sm">Absent</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 bg-yellow-400 rounded-sm shadow-sm"></span>
          <span className="text-sm">Late</span>
        </div>
      </motion.div>

      {/* Add custom scrollbar styling */}
      <style jsx global>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #0D8A3F;
        }
        
        .scrollbar-custom::-webkit-scrollbar-corner {
          background: #f1f1f1;
        }
        
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
      `}</style>
    </div>
  );
};

export default AttendanceTable;