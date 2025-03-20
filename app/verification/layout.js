"use client";

import React, { Suspense } from 'react';

export default function VerificationLayout({ children }) {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-[#0D8A3F] mb-6">Loading...</h1>
          <div className="flex justify-center">
            <div className="loader"></div>
          </div>
          <style jsx>{`
            .loader {
              border: 4px solid rgba(13, 138, 63, 0.1);
              border-radius: 50%;
              border-top: 4px solid #0D8A3F;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    }>
      {children}
    </Suspense>
  );
}