"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';

export default function FaceVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [captureCount, setCaptureCount] = useState(0);
  const [faceDescriptors, setFaceDescriptors] = useState([]);
  const [userData, setUserData] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Determine mode based on query param
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setMode('register');
      
      // For registration, get user data from session storage
      const storedUserData = sessionStorage.getItem('signupData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        setError('No user data found. Please fill the sign-up form first.');
      }
    } else {
      // Default to login mode
      setMode('login');
      
      // Get email from session storage for login
      const storedEmail = sessionStorage.getItem('authEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setError('Email not provided. Please enter your email on the login page.');
      }
    }

    const loadModels = async () => {
      const MODEL_URL = '/models';
      
      try {
        setMessage('Loading face recognition models...');
        
        await Promise.all([
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ]);
        
        setMessage('Starting camera...');
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setError('Camera not available on your device');
        }
        
        setLoading(false);
        
        if (mode === 'register') {
          setMessage('Position your face in the frame and click "Capture Face"');
        } else {
          setMessage('Position your face in the frame to authenticate');
        }
      } catch (error) {
        console.error('Error initializing face recognition:', error);
        setError('Failed to initialize face recognition');
        setLoading(false);
      }
    };
    
    loadModels();
    
    // Cleanup
    const videoElement = videoRef.current;
    return () => {
      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [searchParams, mode]);

  const captureFace = async () => {
    if (!videoRef.current) return;
    
    try {
      setMessage('Capturing face...');
      
      // Detect face and get descriptor
      const detections = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        setMessage('No face detected. Please position your face properly and try again.');
        return;
      }
      
      // Draw face mesh on canvas for visual feedback
      if (canvasRef.current) {
        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      }
      
      if (mode === 'register') {
        // Registration mode - collect multiple face angles
        setFaceDescriptors(prev => [...prev, Array.from(detections.descriptor)]);
        setCaptureCount(prev => prev + 1);
        
        if (captureCount >= 2) {
          setMessage('Face captured successfully! Finalizing registration...');
        } else {
          setMessage(`Face captured (${captureCount + 1}/3). Please move slightly and capture again.`);
        }
      } else {
        // Login mode - verify face immediately
        loginWithFace(Array.from(detections.descriptor));
      }
    } catch (error) {
      console.error('Face capture error:', error);
      setMessage('Error capturing face');
    }
  };

  const loginWithFace = async (faceDescriptor) => {
    if (!faceDescriptor) return;
    
    setProcessing(true);
    setMessage('Verifying your face...');
    
    try {
      const response = await fetch('/api/auth/veriface', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          faceDescriptor,
          email: email // Pass email to help with verification
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Face verification failed');
      }
      
      // Save authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Clear session storage
      sessionStorage.removeItem('authEmail');
      
      setMessage('Face verified! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('Face verification error:', error);
      setMessage(error.message || 'Face verification failed');
      setProcessing(false);
    }
  };

  const completeFaceRegistration = async () => {
    if (faceDescriptors.length < 3) {
      setMessage('Please capture your face 3 times from different angles');
      return;
    }

    if (!userData) {
      setError('No user data found. Please fill the sign-up form first.');
      return;
    }
    
    setProcessing(true);
    setMessage('Registering your face and creating account...');
    
    try {
      // First, create the user account
      const signUpResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.username,
          email: userData.email,
          password: userData.password,
          strand: userData.strand || ''
        })
      });
      
      const signUpData = await signUpResponse.json();
      
      if (!signUpResponse.ok) {
        throw new Error(signUpData.message || 'Failed to create account');
      }
      
      // Register face data with user account
      const faceRegisterResponse = await fetch('/api/auth/veriface/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          faceDescriptor: faceDescriptors
        })
      });
      
      const faceRegisterData = await faceRegisterResponse.json();
      
      if (!faceRegisterResponse.ok) {
        throw new Error(faceRegisterData.message || 'Face registration failed');
      }
      
      // Clear session storage
      sessionStorage.removeItem('signupData');
      
      setMessage('Registration complete! Redirecting to dashboard...');
      
      // Redirect to dashboard after successful registration
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.message || 'Registration failed');
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-[#0D8A3F] mb-2">
          {mode === 'register' ? 'Face Registration' : 'Face Authentication'}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {mode === 'register' 
            ? 'Create your facial identity for secure access' 
            : 'Verify your identity with facial recognition'}
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            width={640}
            height={480}
          />
          
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-10"
            width={640}
            height={480}
          />
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="loader"></div>
            </div>
          )}
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-700">{message}</p>
          
          {mode === 'register' && captureCount > 0 && (
            <div className="flex justify-center mt-2 space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full ${i < captureCount ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
              ))}
            </div>
          )}
        </div>
        
        {mode === 'register' ? (
          // Registration mode UI
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              onClick={captureFace}
              disabled={loading || processing || captureCount >= 3}
              className={`w-full py-4 rounded-lg text-white font-medium ${
                loading || processing || captureCount >= 3 ? 'bg-gray-400' : 'bg-[#0D8A3F]'
              }`}
              whileHover={{ scale: loading || processing || captureCount >= 3 ? 1 : 1.02 }}
              whileTap={{ scale: loading || processing || captureCount >= 3 ? 1 : 0.98 }}
            >
              {captureCount >= 3 ? 'Faces Captured' : 'Capture Face'}
            </motion.button>
            
            <motion.button
              onClick={completeFaceRegistration}
              disabled={loading || processing || captureCount < 3}
              className={`w-full py-4 rounded-lg text-white font-medium ${
                loading || processing || captureCount < 3 ? 'bg-gray-400' : 'bg-[#0D8A3F]'
              }`}
              whileHover={{ scale: loading || processing || captureCount < 3 ? 1 : 1.02 }}
              whileTap={{ scale: loading || processing || captureCount < 3 ? 1 : 0.98 }}
            >
              {processing ? 'Registering...' : 'Complete Registration'}
            </motion.button>
          </div>
        ) : (
          // Login mode UI
          <div className="flex flex-col">
            <motion.button
              onClick={captureFace}
              disabled={loading || processing}
              className={`w-full py-4 rounded-lg text-white font-medium ${
                loading || processing ? 'bg-gray-400' : 'bg-[#0D8A3F]'
              }`}
              whileHover={{ scale: loading || processing ? 1 : 1.02 }}
              whileTap={{ scale: loading || processing ? 1 : 0.98 }}
            >
              {processing ? 'Verifying...' : 'Authenticate with Face'}
            </motion.button>
          </div>
        )}
        
        <button
          onClick={() => router.back()}
          disabled={processing}
          className="w-full mt-4 py-3 text-gray-500 text-sm hover:underline"
        >
          Go Back
        </button>
      </div>
      
      <style jsx>{`
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #fff;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}