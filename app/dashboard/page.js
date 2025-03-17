import React from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { FiHome, FiCalendar, FiSettings, FiMail, FiBell  } from "react-icons/fi";
import { TbSchool } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { FaRegCircle } from "react-icons/fa6";

const page = () => {
  return (
  <div className="min-h-screen bg-base text-text grid grid-cols-[auto_1fr]">

    <div className="box-border h-screen w-59 py-[5px] bg-base border-r-1 border-gray-300 sticky top-0 self-start sidebar" id="sidebar">

      <div className="p-4 border-b-1 border-gray-300 text-center">
        <span className="text-base font-extrabold">VeriFace Track</span>
        <FaRegCircle className="ml-16 mt-3 text-7xl"></FaRegCircle >
        <h2 className="mt-4 text-2xl">Hi Jaye Mark!</h2>
        <p className="text-sm">Have a nice day</p>
      </div>
      
      {/* Navigation */}
      <nav className="p-1 px-4 pt-7">
        <ul className="space-y-2">

          <li>
            <a href="#" className="flex gap-3 items-center p-4 pl-4 pr-4 rounded-lg hover:bg-green-100 text-gray-700">
              <FiHome className="text-2xl"></FiHome>
              <span className="text-base">Home</span>
            </a>
          </li>

          <li>
            <a href="#" className="flex gap-3 items-center p-4 pl-4 pr-4 rounded-lg hover:bg-green-100 text-gray-700">
              <FiCalendar className="text-2xl"></FiCalendar>
              <span className="text-base">Calendar</span>
            </a>
          </li>

          <li>
            <a href="#" className="flex gap-3 items-center p-4 pl-4 pr-4 rounded-lg hover:bg-green-100 text-gray-700">
              <TbSchool className="text-2xl"></TbSchool>
              <span className="text-base">Programs</span>
              <IoIosArrowDown className="text-ml ml-auto"></IoIosArrowDown>
            </a>
          </li>
          
          <li className="mt-80 mb-4">
            <a href="#" className="flex gap-3 items-center p-4 pl-4 pr-4 rounded-lg hover:bg-green-100 text-gray-700">
              <FiSettings className="text-2xl"></FiSettings>
              <span className="text-base">Settings</span>
              
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    {/* Main Content */}
    <div className="flex-1 p-8 overflow-auto">
       <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="flex items-center space-x-4">
          <FiMail className="text-2xl"></FiMail>
          <FiBell className="text-2xl"></FiBell>
          <CgProfile className="text-2xl"></CgProfile >
        </div>
      </header>
      
      {/* kemberlu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-1 border-gray-300 p-5 rounded-lg ">
        <div className="bg-green-100 p-6 rounded-lg ">
          <h3 className="text-sm-semibold mb-2">Today</h3>
          <p className="text-3xl font-extralight">03 / 17 / 2024</p>
        </div>
        
        <div className="bg-green-100 p-6 rounded-lg ">
          <h3 className="text-sm font-extralight mb-2">Time</h3>
          <p className="text-3xl font-extralight">6:30 AM</p>
        </div>
        
        <div className="bg-green-100 p-6 rounded-lg ">
          <h3 className="text-sm font-extralight mb-2">Attendance Preview</h3>
          <p className="text-3xl font-extralight">--</p>
        </div>

        {/* CALENDAR*/}
        <div className="bg-green-100 p-5 rounded-lg col-span-3">
          <h3 className="text-lg font-bold mb-150">Calendar</h3>
        </div>
      </div>
      
      
    </div>
  </div>
  )
}

export default page