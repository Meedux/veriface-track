'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const [events, setEvents] = useState([
    { 
      title: 'Math Quiz', 
      date: '2024-03-18',
      backgroundColor: '#0D8A3F',
      borderColor: '#0D8A3F'
    },
    { 
      title: 'Science Project Due', 
      date: '2024-03-20',
      backgroundColor: '#0D8A3F',
      borderColor: '#0D8A3F'
    },
    { 
      title: 'English Presentation', 
      date: '2024-03-25',
      backgroundColor: '#0D8A3F',
      borderColor: '#0D8A3F'
    }
  ]);

  const handleDateClick = (arg) => {
    const title = prompt('Enter event title:');
    if (title) {
      setEvents([
        ...events,
        {
          title,
          date: arg.dateStr,
          backgroundColor: '#0D8A3F',
          borderColor: '#0D8A3F'
        }
      ]);
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        height="auto"
        editable={true}
        selectable={true}
        dayMaxEvents={true}
        eventContent={(eventInfo) => {
          return (
            <div className="p-1 text-xs overflow-hidden whitespace-nowrap text-ellipsis">
              {eventInfo.event.title}
            </div>
          );
        }}
      />
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
      `}</style>
    </div>
  );
};

export default Calendar;