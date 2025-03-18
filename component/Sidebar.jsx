"use client";

import React, { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { FiHome, FiCalendar, FiSettings } from "react-icons/fi";
import { TbSchool } from "react-icons/tb";
import { FaRegCircle } from "react-icons/fa6";
import Link from 'next/link';

const Sidebar = ({ username = "John Doe" }) => {
  const [isStrandsOpen, setIsStrandsOpen] = useState(false);

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-5 border-b border-gray-200 flex flex-col items-center">
        <h1 className="text-lg font-bold text-[#0D8A3F]">VeriFace Track</h1>
        <div className="bg-[#E8F5E9] w-20 h-20 rounded-full mt-4 flex items-center justify-center">
          <FaRegCircle className="text-5xl text-gray-400" />
        </div>
        <h2 className="mt-3 text-lg font-medium">Hi {username}!</h2>
        <p className="text-xs text-gray-500">Have a nice day</p>
      </div>
      
      <nav className="flex-1 px-3 pt-5 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E8F5E9] text-gray-700 transition-colors">
              <FiHome className="text-xl text-[#0D8A3F]" />
              <span className="font-medium">Home</span>
            </Link>
          </li>

          <li>
            <Link href="/calendar" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E8F5E9] text-gray-700 transition-colors">
              <FiCalendar className="text-xl text-[#0D8A3F]" />
              <span className="font-medium">Calendar</span>
            </Link>
          </li>

          <li className="relative">
            <button 
              onClick={() => setIsStrandsOpen(!isStrandsOpen)}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-lg hover:bg-[#E8F5E9] text-gray-700 transition-colors">
              <TbSchool className="text-xl text-[#0D8A3F]" />
              <span className="font-medium">Strands</span>
              <IoIosArrowDown 
                className={`ml-auto text-sm transition-transform duration-300 ${isStrandsOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {/* Dropdown Menu with animation */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isStrandsOpen 
                  ? 'max-h-60 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <ul className="mt-1 ml-7 border-l border-gray-200 pl-4 space-y-1">
                <li>
                  <Link href="/dashboard/strands/stem" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    STEM
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/strands/abm" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    ABM
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/strands/humss" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    HUMSS
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/strands/he" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    HE
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/strands/ict" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    ICT
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/strands/smaw" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    SMAW
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>

        <ul className="absolute bottom-5 left-0 right-0 px-3">
          <li>
            <Link href="/profile" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E8F5E9] text-gray-700 transition-colors">
              <FiSettings className="text-xl text-[#0D8A3F]" />
              <span className="font-medium">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;