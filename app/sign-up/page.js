"use client";

import React, { useState } from "react";
import { LuScanFace } from "react-icons/lu";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignUpPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [strand, setStrand] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // List of available strands
  const strands = ["STEM", "ABM", "HUMSS", "HE", "ICT", "SMAW"];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic form validation
    if (!username.trim() || !email.trim() || !strand) {
      setError("All fields are required, including strand");
      return;
    }

    // if (password.length < 6 || password.length > 18) {
    //   setError("Password must be between 6-18 characters");
    //   return;
    // }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const password = ""

    // Store sign-up data in session storage
    const signupData = {
      username,
      email,
      password,
      strand,
    };

    sessionStorage.setItem("signupData", JSON.stringify(signupData));

    // Redirect to face registration page
    router.push("/verification?mode=register");
  };

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
          <div className="w-[12rem] h-[12rem] rounded-full mt-[1.5rem] mb-[3rem] overflow-hidden flex items-center justify-center bg-[#E8F5E9]">
            <Image
              src="/logo.jpg"
              alt="VeriFace Track Logo"
              width={192}
              height={192}
              className="object-cover"
            />
          </div>
          
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

          <form className="w-[27rem]" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />
            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />
            {/* <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="password"
              placeholder="Password (6-18)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            /> */}

            {/* Strand selection dropdown */}
            <div className="relative mb-[1.5rem]">
              <select
                className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] pl-[1rem] pr-10 appearance-none bg-white cursor-pointer"
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
                style={{ fontFamily: '"Segoe UI", sans-serif' }}
              >
                <option value="" disabled>
                  Select your strand
                </option>
                {strands.map((strandOption) => (
                  <option key={strandOption} value={strandOption}>
                    {strandOption}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-[4.5rem] bg-[#0D8A3F] rounded-[10] text-white flex items-center justify-center gap-3 shadow-lg mt-4"
              whileHover={{ scale: 1.02, backgroundColor: "#0A7A37" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <LuScanFace className="w-[1.5rem] h-[1.5rem]" />
              <span className="text-[1.2rem]" style={{ fontFamily: '"Segoe UI", sans-serif', fontWeight: "500" }}>
                CONTINUE TO FACE SETUP
              </span>
            </motion.button>
            
            <p className="text-center text-gray-500 mt-4 text-sm">
              Face registration is required for account security.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default SignUpPage;