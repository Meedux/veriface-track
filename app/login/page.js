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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
            <input
              className="w-full h-[3rem] border-[1px] border-[#d8d8d8] rounded-[10] mb-[1.5rem] pl-[1rem]"
              type="password"
              placeholder="Password (6-18)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
            />

            <Link href="/verification?mode=login">
              <motion.div
                className="bg-[#E8F5E9] h-[4.5rem] w-full rounded-[15] flex items-center mt-[1.5rem] pl-[1rem] mb-[1rem] cursor-pointer relative overflow-hidden group"
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(13, 138, 63, 0.08)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <LuScanFace className="w-[2rem] h-[2rem] text-[#0D8A3F] group-hover:scale-110 transition-transform" />
                <p className="text-[#473D3D] mr-auto ml-[1rem] group-hover:translate-x-1 transition-transform">
                  Facial recognition ready
                </p>
                <div className="bg-[#4CAF50] w-[1.2rem] h-[1.2rem] rounded-full mr-4 group-hover:scale-110 transition-transform"></div>

                {/* Animation indicator */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-[#0D8A3F]"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Link>

            <motion.button
              type="submit"
              disabled={loading}
              className={`bg-[#0D8A3F] h-[3.7rem] w-full rounded-[10] flex justify-center items-center text-white text-[1.2rem] shadow-xl mt-4 ${
                loading ? "opacity-70" : ""
              }`}
              style={{ fontFamily: '"Segoe UI", sans-serif' }}
              whileHover={{
                scale: loading ? 1 : 1.02,
                backgroundColor: loading ? "#0D8A3F" : "#0A7A37",
              }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </motion.button>
          </form>
        </section>
      </div>
    </main>
  );
}
