import React from "react";
import { SlArrowRight } from "react-icons/sl";
import { LuScanFace } from "react-icons/lu";
import Link from "next/link";

const page = () => {
  return (
    <main className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
      <div className="container flex flex-row justify-evenly items-center w-full max-w-7xl">
        <section className="flex flex-col max-w-md">
          <h1
            className="text-[1.7rem] text-black font-bold mb-2"
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
        </section>

        <section className="bg-white w-[35rem] h-[50rem] rounded-[15px] flex flex-col items-center">
          <div className="bg-[#E8F5E9] w-[9rem] h-[9rem] rounded-full mt-[1.5rem] mb-[3rem]"></div>

          <div className="bg-[#E8F5E9] h-[5rem] w-[27rem] rounded-[15] flex justify-between items-center mb-[3rem]">
            <Link
              href={"/login"}
              className="text-[1.3rem] cursor-pointer ml-8"
              style={{
                fontFamily: '"Segoe UI", sans-serif',
                fontWeight: "500",
              }}
            >
              Login
            </Link>
            <div className="bg-[#0D8A3F] rounded-[10] h-[4rem] w-[14rem] flex justify-center items-center shadow-lg mr-1">
              <p
                className="text-[1.3rem] text-white"
                style={{
                  fontFamily: '"Segoe UI", sans-serif',
                  fontWeight: "500",
                }}
              >
                Sign Up
              </p>
            </div>
          </div>

          <form className="w-[27rem]">
            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="text"
              placeholder="Username"
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />
            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="text"
              placeholder="Phone or Email"
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />
            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="password"
              placeholder="Password (6-18)"
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />

            <div className="bg-[#E8F5E9] h-[4.5rem] w-full rounded-[15] flex items-center mt-[1.5rem] pl-[1rem] mb-[1rem]">
              <LuScanFace
                className="w-[2rem] h-[2rem]"
                style={{ color: "#0D8A3F" }}
              />
              <p className="text-[#473D3D] mr-auto ml-[1rem]">
                Facial recognition
              </p>
              <SlArrowRight className="w-[1rem] h-[1rem] mr-4" />
            </div>

            <button
              type="submit"
              className="bg-[#0D8A3F] h-[3.7rem] w-full rounded-[10] flex justify-center items-center text-white text-[1.2rem] shadow-xl mt-4"
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            >
              COMPLETE SIGN UP
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default page;
