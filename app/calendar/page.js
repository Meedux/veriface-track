import Calendar from "@/component/Calendar";
import Sidebar from "@/component/Sidebar";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { FiBell, FiMail } from "react-icons/fi";

const CalendarPage = () => {
  return (
    <>
      <div className="min-h-screen bg-base text-text grid grid-cols-[auto_1fr]">
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {/* <div className="flex items-center space-x-4">
              <FiMail className="text-2xl cursor-pointer hover:text-[#0D8A3F] transition-colors" />
              <FiBell className="text-2xl cursor-pointer hover:text-[#0D8A3F] transition-colors" />
              <CgProfile className="text-2xl cursor-pointer hover:text-[#0D8A3F] transition-colors" />
            </div> */}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border border-gray-200 p-5 rounded-lg shadow-sm">
            {/* CALENDAR */}
            <div className="col-span-3 bg-white p-4 rounded-lg shadow-sm">
              <span className="text-sm font-medium block mb-3">Calendar</span>
              <Calendar />
            </div>
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Present</h3>
              <p className="text-3xl font-light">00</p>
            </div>

            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Absences</h3>
              <p className="text-3xl font-light">00</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
