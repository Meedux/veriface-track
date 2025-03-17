import React from 'react'
import { IoIosArrowDown } from "react-icons/io";

const page = () => {
  return (
  <div className="min-h-screen bg-base text-text grid grid-cols-[auto_1fr]">

    <div className="box-border h-screen w-59 py-[5px] bg-base border-r-1 border-gray-300 sticky top-0 self-start sidebar" id="sidebar">

      <div className="p-4 border-b-1 border-gray-300 text-center">
        <span>LOGO</span>
        <h2 className="mt-4 text-2xl">Hi Jaye Mark!</h2>
        <p className="text-sm">Have a nice day</p>
      </div>
      
      {/* Navigation */}
      <nav className="p-1 px-4 pt-7">
        <ul className="space-y-2">

          <li>
            <a href="#" className="block p-2 pl-4 rounded-lg bg-green-100 text-black">
              Home
            </a>
          </li>

          <li>
            <a href="#" className="block p-2 pl-4 rounded-lg hover:bg-green-100 text-gray-700">
              Calendar
            </a>
          </li>

          <li>
            <a href="#" className="flex p-2 pl-4 rounded-lg hover:bg-green-100 text-gray-700">
              <span>Programs</span>
              <span><IoIosArrowDown className="justify-end text-2x"/></span>
            </a>
            
          </li>
          
          <li className="mt-90 mb-4">
            <a href="#" className="block p-2 pl-4 rounded-lg hover:bg-gray-100 text-gray-700">
              Settings
              
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
          <span class="material-icons">MAIL</span>
          <span class="material-icons">NOTIF</span>
          <span class="material-icons">ACCOUNT</span>
        </div>
      </header>
      
      {/* kemberlu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-1 border-gray-300 p-5 rounded-lg ">
        <div className="bg-green-100 p-6 rounded-lg ">
          <h3 className="text-sm-semibold mb-2">Today</h3>
          <p className="text-3xl font-extralight">March 17, 2024</p>
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