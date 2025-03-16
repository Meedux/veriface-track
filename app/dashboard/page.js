import React from 'react'

const page = () => {
  return (
    <div className="flex h-screen bg-gray-100">

    <div className="w-64 bg-white h-full shadow-md">

      <div className="p-4 border-b border-gray-200 text-center">
        
        <h2 className="mt-4 text-2xl">Hi Jaye Mark!</h2>
        <p className="text-sm">Have a nice day</p>
      </div>
      
      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">

          <li>
            <a href="#" className="block p-2 rounded bg-green-100 text-black">
              Home
            </a>
          </li>

          <li>
            <a href="#" className="block p-2 rounded hover:bg-green-100 text-gray-700">
              Calendar
            </a>
          </li>

          <li>
            <a href="#" className="block p-2 rounded hover:bg-green-100 text-gray-700">
              Programs
            </a>
          </li>
          
          <li className="mt-100 mb-4">
            <a href="#" className="block p-2 rounded hover:bg-gray-100 text-gray-700">
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    {/* Main Content */}
    <div className="flex-1 p-8 overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Today</h3>
          <p className="text-3xl font-extralight">March 17, 2024</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Time</h3>
          <p className="text-3xl font-extralight">6:30 AM</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Attendance Preview</h3>
          <p className="text-3xl font-extralight">--</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Calendar</h3>
        
      </div>
    </div>
  </div>
  )
}

export default page