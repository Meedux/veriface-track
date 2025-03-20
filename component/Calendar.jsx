'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = ({ userId }) => {
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch attendance data when component mounts
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Determine URL based on if userId is provided
        const url = userId 
          ? `/api/attendance/user?userId=${userId}` 
          : '/api/attendance';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        
        // Check if data is in the expected format
        let attendanceRecords = [];
        
        if (Array.isArray(data)) {
          // If API returns an array directly
          attendanceRecords = data;
        } else if (data.records && Array.isArray(data.records)) {
          // If API returns an object with a records property
          attendanceRecords = data.records;
        } else if (data.data && Array.isArray(data.data)) {
          // If API returns an object with a data property
          attendanceRecords = data.data;
        } else {
          console.log('API response format:', data);
          throw new Error('Unexpected data format from API');
        }
        
        // Convert attendance records to calendar events
        const events = attendanceRecords.map(record => {
          // Extract date from the record
          const date = new Date(record.date);
          const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          
          // Determine color based on attendance status
          let backgroundColor, borderColor, title, textColor;
          
          switch(record.status) {
            case 'present':
              backgroundColor = '#4ade80'; // Green
              borderColor = '#22c55e';
              title = '✓ Present';
              textColor = '#fff';
              break;
            case 'late':
              backgroundColor = '#fbbf24'; // Yellow
              borderColor = '#f59e0b';
              title = '⏱ Late';
              textColor = '#000';
              break;
            case 'absent':
              backgroundColor = '#f87171'; // Red
              borderColor = '#ef4444';
              title = '✗ Absent';
              textColor = '#fff';
              break;
            default:
              backgroundColor = '#e5e7eb'; // Grey
              borderColor = '#d1d5db';
              title = '? Unknown';
              textColor = '#000';
          }
          
          return {
            title: `${title} (${record.time})`,
            date: formattedDate,
            backgroundColor,
            borderColor,
            textColor,
            extendedProps: {
              status: record.status,
              time: record.time
            }
          };
        });
        
        setAttendanceEvents(events);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        // Set empty events array on error
        setAttendanceEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [userId]);

  return (
    <div className="calendar-container">
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D8A3F]"></div>
        </div>
      ) : (
        <>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={attendanceEvents}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            height="auto"
            editable={false}
            selectable={false}
            dayMaxEvents={true}
            eventContent={(eventInfo) => {
              return (
                <div className="p-1 text-xs font-medium overflow-hidden text-ellipsis">
                  {eventInfo.event.title}
                </div>
              );
            }}
          />
          
          {/* Attendance legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 mr-2 bg-[#4ade80] rounded-sm"></span>
              <span>Present</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 mr-2 bg-[#fbbf24] rounded-sm"></span>
              <span>Late</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 mr-2 bg-[#f87171] rounded-sm"></span>
              <span>Absent</span>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .fc .fc-button-primary {
          background-color: #0D8A3F;
          border-color: #0D8A3F;
        }
        .fc .fc-button-primary:hover {
          background-color: #096e32;
          border-color: #096e32;
        }
        .fc .fc-button-primary:disabled {
          background-color: #82c6a0;
          border-color: #82c6a0;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(13, 138, 63, 0.1);
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #e2e8f0;
        }
        .fc-theme-standard .fc-scrollgrid {
          border-color: #e2e8f0;
        }
        .fc-col-header-cell {
          background-color: #E8F5E9;
          padding: 8px 0;
        }
        .fc-event {
          cursor: default;
          border-radius: 4px;
        }
        .fc-event-title {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default Calendar;