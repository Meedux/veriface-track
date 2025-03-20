"use client";

import React, { useState, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { FiHome, FiCalendar, FiSettings, FiLogOut } from "react-icons/fi";
import { TbSchool } from "react-icons/tb";
import { FaRegCircle } from "react-icons/fa6";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Sidebar = () => {
  const [isStrandsOpen, setIsStrandsOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const router = useRouter();
  
  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Use name field if available, otherwise use username
        setUsername(user.name || user.username || "Guest");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  // Handle logout function
  const handleLogout = () => {
    try {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('signupData');
      
      // Show logout message
      alert('You have been logged out successfully');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-5 border-b border-gray-200 flex flex-col items-center">
        <h1 className="text-lg font-bold text-[#0D8A3F]">VeriFace Track</h1>
        <div className="w-20 h-20 mt-4 rounded-full overflow-hidden flex items-center justify-center bg-[#E8F5E9]">
          <Image
            src="/logo.jpg"
            alt="VeriFace Track Logo"
            width={80}
            height={80}
            className="object-cover rounded-full"
          />
        </div>
        <h2 className="mt-3 text-lg font-medium">Hi {username}!</h2>
        <p className="text-xs text-gray-500">Have a nice day</p>
      </div>
      
      {/* Main navigation */}
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
                  <Link href="/strand/stem" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    STEM
                  </Link>
                </li>
                <li>
                  <Link href="/strand/abm" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    ABM
                  </Link>
                </li>
                <li>
                  <Link href="/strand/humss" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    HUMSS
                  </Link>
                </li>
                <li>
                  <Link href="/strand/he" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    HE
                  </Link>
                </li>
                <li>
                  <Link href="/strand/ict" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    ICT
                  </Link>
                </li>
                <li>
                  <Link href="/strand/smaw" className="block py-2 px-3 text-sm text-gray-600 hover:text-[#0D8A3F] transition-colors">
                    SMAW
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>

        {/* Bottom navigation - fixed position at the bottom */}
        <div className="absolute bottom-5 left-0 right-0 px-3 space-y-1">
          <Link href="/profile" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#E8F5E9] text-gray-700 transition-colors">
            <FiSettings className="text-xl text-[#0D8A3F]" />
            <span className="font-medium">Profile</span>
          </Link>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
          >
            <FiLogOut className="text-xl text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;