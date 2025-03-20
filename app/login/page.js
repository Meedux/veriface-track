"use client";

import React, { useState } from "react";
import { LuScanFace } from "react-icons/lu";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Store email in session storage for verification page
    sessionStorage.setItem("authEmail", email);
    
    // Navigate to face verification
    router.push("/verification?mode=login");
  };

  return (
    <main className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
      <div className="container flex flex-row justify-evenly items-center w-full max-w-7xl">
        <section className="flex flex-col max-w-md">
          <h1
            className="text-[1.7rem] text-black font-bold mb-2 text-center"
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

        <section className="bg-white w-[35rem] h-[48rem] rounded-[15px] flex flex-col items-center">
          <div className="w-[12rem] h-[12rem] rounded-full mt-[1.5rem] mb-[3rem] overflow-hidden flex items-center justify-center bg-[#E8F5E9]">
            <Image
              src="/logo.jpg"
              alt="VeriFace Track Logo"
              width={192}
              height={192}
              className="object-cover"
            />
          </div>
          
          <div className="bg-[#E8F5E9] h-[5rem] w-[27rem] rounded-[15] flex items-center mb-[3rem]">
            <div className="bg-[#0D8A3F] rounded-[10] ml-[0.5rem] mr-[4rem] h-[4rem] w-[14rem] flex justify-center items-center shadow-lg">
              <p
                className="text-[1.3rem] text-white"
                style={{
                  fontFamily: '"Segoe UI", sans-serif',
                  fontWeight: "500",
                }}
              >
                Login
              </p>
            </div>
            <Link
              href={"/sign-up"}
              className="text-[1.3rem] cursor-pointer"
              style={{
                fontFamily: '"Segoe UI", sans-serif',
                fontWeight: "500",
              }}
            >
              Sign Up
            </Link>
          </div>

          <form className="w-[27rem]" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-[4.5rem] bg-[#0D8A3F] rounded-[10] text-white flex items-center justify-center gap-3 shadow-lg"
              whileHover={{ scale: 1.02, backgroundColor: "#0A7A37" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <LuScanFace className="w-[1.5rem] h-[1.5rem]" />
              <span className="text-[1.2rem]" style={{ fontFamily: '"Segoe UI", sans-serif', fontWeight: "500" }}>
                VERIFY WITH FACE
              </span>
            </motion.button>
            
            <p className="text-center text-gray-500 mt-4 text-sm">
              Your face is your password. No traditional password needed.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}