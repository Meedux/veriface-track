import React from 'react'
<<<<<<< HEAD
=======
import { SlArrowRight } from "react-icons/sl";
>>>>>>> 54484c74bbaffa2c5acecf9f42f536f210a33078

const page = () => {
  return (
    <div className="min-h-screen bg-[#E8F5E9] flex justify-between items-center">
          {/* Left section - text */}
          <div className="flex flex-col items-start ml-[15rem] mr-[2rem]">
            <h1 
              className="text-[1.7rem] text-black ml-[3.5rem] font-bold" 
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            >
              VeriFace Track
            </h1>
            <p 
              className="text-[1.2rem] text-[#ACACAC]" 
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            >
              With this App Your Safety is Secured
            </p>
          </div>

      {/* Right section - sign up form */}
      <div className="items-end bg-white w-[35rem] h-[50rem] m-[1rem] rounded-[15px]">
        {/* Container of logo and contents */}
        <div className="flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="bg-[#E8F5E9] w-[9rem] h-[9rem] rounded-[50%] mt-[1.5rem] mb-[3rem]">
          </div>  

          {/* Sign up/login header container */}
          <div className="bg-[#E8F5E9] h-[5rem] w-[27rem] rounded-[15] flex justify-end items-center mb-[3rem]">
            <a 
              className="text-[1.3rem]" 
              style={{ fontFamily: '"Segoe UI", sans-serif', fontWeight: '500' }}
            >
              Login
            </a>
            {/* Green container for sign up */}
            <div className="bg-[#0D8A3F] rounded-[10] ml-[5rem] mr-[0.5rem] h-[4rem] w-[14rem] flex justify-center items-center shadow-lg">
              <p 
                className="text-[1.3rem] text-[white]"
                style={{ fontFamily: '"Segoe UI", sans-serif', fontWeight: '500' }}
              >
                Sign Up
              </p>
            </div>
          </div> 

          {/* Container of textboxes */}
          <div className="flex justify-center flex-col">
            <input 
              className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]" 
              type="text" 
              placeholder="Username"
              style={{ fontFamily: '"Segoe UI", sans-serif' }} 
            />
            <input 
              className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]" 
              type="text" 
              placeholder="Phone or Email"
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />
            <input 
              className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]" 
              type="password" 
              placeholder="Password (6-18)" 
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />
          </div>

          {/* Facial recognition section */}
          <div className="bg-[#E8F5E9] h-[4.5rem] w-[27rem] rounded-[15] flex justify-start items-center mt-[2rem] pl-[1rem]">
            <div className="bg-[green] w-[3rem] h-[3rem] mr-[1rem]">
            </div>
            <p className="text-[#473D3D]">Facial recognition</p>
          </div>
        </div>
      </div>
<<<<<<< HEAD
    </div>  
=======

    </div> 
    <div className="flex justify-center flex-col ">  {/*container of textbox*/}
      <input className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]" type="text" placeholder="Username"style={{ fontFamily: '"Segoe UI", sans-serif' }} />
      <input className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]" type="text" placeholder="Phone or Email"style={{ fontFamily: '"Segoe UI", sans-serif' }}/>
      <input className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]" type="password" placeholder="Password (6-18)" style={{ fontFamily: '"Segoe UI", sans-serif' }}/>
    </div>

    <div className="bg-[#E8F5E9] h-[4.5rem] w-[27rem] rounded-[15] flex justify-start items-center mt-[2rem] pl-[1rem] ">
      <div className="bg-[green] w-[3rem] h-[3rem] mr-[1rem]"></div>
      <p className="text-[#473D3D] ">Facial recognition</p>
      <span><SlArrowRight className="w-[2rem] h-[2rem]"/> </span>
    </div>
  </div>

</div>


</div>  
>>>>>>> 54484c74bbaffa2c5acecf9f42f536f210a33078
  )
}

export default page