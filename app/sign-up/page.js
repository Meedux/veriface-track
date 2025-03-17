import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen bg-[#E8F5E9] flex justify-between items-center">

      
    <div className="flex flex-col items-start ml-[15rem] mr-[2rem]"> {/*left section text*/}
      <h1 className="text-[1.7rem] text-black ml-[2.8rem] font-bold" style={{ fontFamily: '"Segoe UI", sans-serif' }} >VeriFace Track</h1>
      <p className="text-[1.2rem] text-[#ACACAC]" style={{ fontFamily: '"Segoe UI", sans-serif' }}>With this App Your Safety is Secured</p>
    </div>

<div className=" items-end bg-white w-[35rem] h-[50rem] m-[1rem] rounded-[15px]"> {/*right section sign up form*/}

  <div className="flex flex-col items-center justify-center"> {/*container of logo and contents below it*/}

    <div className="bg-[#E8F5E9] w-[9rem] h-[9rem] rounded-[50%] mt-[3rem] mb-[3rem]"></div>  {/*logo*/}

    <div className="bg-[#E8F5E9] h-[5rem] w-[27rem] rounded-[15] flex justify-end items-center"> {/*white container of the text header (sign up/login)*/}
      <p className="text-[1.3rem]" style={{ fontFamily: '"Segoe UI", sans-serif' }}>Login</p>
      <div className="bg-[#0D8A3F] rounded-[10] ml-[5rem] mr-[0.5rem] h-[4rem] w-[14rem] flex justify-center  items-center shadow-lg"> {/*green container for text (sign up)*/}
        <p className="text-[1.3rem] text-[white]"style={{ fontFamily: '"Segoe UI", sans-serif' }}>Sign Up</p>
      </div>

    </div> 
    <div className="flex justify-center flex-col ">  {/*container of textbox*/}
      <input className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1rem] pl-[1rem]" type="text" placeholder="Username"style={{ fontFamily: '"Segoe UI", sans-serif' }} />
      <input className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1rem] pl-[1rem]" type="text" placeholder="Phone or Email"style={{ fontFamily: '"Segoe UI", sans-serif' }}/>
      <input className="w-[27rem] h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1rem] pl-[1rem]" type="password" placeholder="Password (6-18)" style={{ fontFamily: '"Segoe UI", sans-serif' }}/>
     

    </div>
  </div>

</div>


</div>  
  )
}

export default page