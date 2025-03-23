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
  const [faceGuideVisible, setFaceGuideVisible] = useState(true);
  const [captureAngle, setCaptureAngle] = useState('front'); // 'front', 'right', 'left'

  // Draw face guide overlay to help position the entire face including chin
  const drawFaceGuide = () => {
    if (!canvasRef.current || !faceGuideVisible) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    // Clear canvas first
    ctx.clearRect(0, 0, width, height);
    
    // Draw oval guide that's large enough to include the entire face
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Adjust oval to be slightly longer vertically to account for chin
    const radiusX = width * 0.22; // Horizontal radius
    const radiusY = height * 0.32; // Vertical radius - make this larger to accommodate chin
    
    // Position oval slightly higher to encourage users to include chin
    const offsetY = height * 0.03; // Small offset upward
    
    // Adjust offset based on capture angle for registration
    let angleOffset = 0;
    if (mode === 'register') {
      if (captureAngle === 'right') {
        angleOffset = width * 0.05; // Offset to the right
      } else if (captureAngle === 'left') {
        angleOffset = -width * 0.05; // Offset to the left
      }
    }
    
    // Draw oval
    ctx.beginPath();
    ctx.ellipse(centerX + angleOffset, centerY - offsetY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add a slight fill for better visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    
    // Add helper text based on capture angle
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    
    let helperText = 'Position your entire face including chin in this oval';
    if (mode === 'register') {
      if (captureAngle === 'front') {
        helperText = 'Look straight ahead and position your face in the oval';
      } else if (captureAngle === 'right') {
        helperText = 'Turn your head slightly to the RIGHT and position your face';
      } else if (captureAngle === 'left') {
        helperText = 'Turn your head slightly to the LEFT and position your face';
      }
    }
    
    ctx.fillText(helperText, centerX, height - 30);
    
    // Add chin indicator
    ctx.beginPath();
    ctx.moveTo(centerX + angleOffset - 15, centerY + radiusY - offsetY - 15);
    ctx.lineTo(centerX + angleOffset, centerY + radiusY - offsetY);
    ctx.lineTo(centerX + angleOffset + 15, centerY + radiusY - offsetY - 15);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add visual indicator for turning head direction
    if (mode === 'register' && captureAngle !== 'front') {
      const arrowWidth = 40;
      const arrowHeight = 20;
      const direction = captureAngle === 'right' ? 1 : -1;
      
      ctx.beginPath();
      ctx.moveTo(centerX - arrowWidth * direction, centerY - 80);
      ctx.lineTo(centerX + arrowWidth * direction, centerY - 80);
      ctx.lineTo(centerX + arrowWidth * direction, centerY - 80 - arrowHeight / 2);
      ctx.lineTo(centerX + (arrowWidth + arrowHeight) * direction, centerY - 80);
      ctx.lineTo(centerX + arrowWidth * direction, centerY - 80 + arrowHeight / 2);
      ctx.lineTo(centerX + arrowWidth * direction, centerY - 80);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }
  };

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
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Make sure video dimensions are set correctly when metadata is loaded
            videoRef.current.onloadedmetadata = () => {
              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                
                // Draw face guide initially
                drawFaceGuide();
              }
            };
          }
        } else {
          setError('Camera not available on your device');
        }
        
        setLoading(false);
        
        if (mode === 'register') {
          setMessage('Position your entire face within the oval guide looking straight ahead');
          setCaptureAngle('front');
        } else {
          setMessage('Position your entire face within the oval guide to authenticate');
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
  
  

  // Calculate similarity between two face descriptors
  const calculateSimilarity = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2) return 1;
    
    // Calculate Euclidean distance between descriptors
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    const distance = Math.sqrt(sum);
    
    // Convert distance to similarity score (0-1)
    // Lower distance means higher similarity
    // For face-api.js, distance < 0.5 typically means same person
    // Distance of 0 means identical, distance of 1+ means very different
    return 1 - Math.min(distance, 1);
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
    
    try {
      setMessage('Capturing face...');
      
      // Hide the face guide during capture
      setFaceGuideVisible(false);
      
      // Use extended detection options to ensure we get the full face
      const detectionOptions = new faceapi.SsdMobilenetv1Options({ 
        minConfidence: 0.5,
        // Increase the scoreThreshold slightly to ensure better quality detections
        scoreThreshold: 0.6 
      });
      
      // Detect face with full landmarks and descriptor
      const detections = await faceapi.detectSingleFace(videoRef.current, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        setMessage('No face detected. Please position your entire face properly and try again.');
        setFaceGuideVisible(true);
        drawFaceGuide();
        return;
      }
      
      // Check if the jawline is fully visible by examining the landmark points
      const jawOutline = detections.landmarks.getJawOutline();
      const allLandmarks = detections.landmarks.positions;
      
      // Validate that we have enough jawline points and they're in reasonable positions
      if (jawOutline.length < 15) { // Full jawline should have 17 points
        setMessage('Your entire face including chin must be visible. Please reposition.');
        setFaceGuideVisible(true);
        drawFaceGuide();
        return;
      }
      
      // Check jaw area completeness by looking at chin position relative to face box
      const faceBox = detections.detection.box;
      const chinPoint = jawOutline[8]; // Middle of chin
      
      // Calculate distance from chin to bottom of face box
      const chinToBoxBottomDistance = Math.abs(faceBox.bottom - chinPoint.y);
      const chinDistanceThreshold = faceBox.height * 0.1; // 10% of face height
      
      if (chinToBoxBottomDistance > chinDistanceThreshold) {
        setMessage('Please ensure your chin is fully visible. Adjust your position.');
        setFaceGuideVisible(true);
        drawFaceGuide();
        return;
      }
      
      // For registration mode, check if this face is too similar to previous captures
      if (mode === 'register' && faceDescriptors.length > 0) {
        const currentDescriptor = Array.from(detections.descriptor);
        
        // Check similarity with all previous captures
        for (let i = 0; i < faceDescriptors.length; i++) {
          const prevDescriptor = faceDescriptors[i];
          const similarity = calculateSimilarity(currentDescriptor, prevDescriptor);
          
          // If similarity is too high (above 0.8), reject the capture
          if (similarity > 0.8) {
            setMessage(`This angle is too similar to capture #${i+1}. Please turn your head ${captureAngle} more.`);
            setFaceGuideVisible(true);
            drawFaceGuide();
            return;
          }
        }
      }
      
      // Draw face mesh on canvas for visual feedback
      if (canvasRef.current) {
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // First draw the jawline with emphasis to ensure it's visible
        drawEnhancedJawline(ctx, resizedDetections.landmarks);
        
        // Then draw the rest of the landmarks
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      }
      
      if (mode === 'register') {
        // Registration mode - collect multiple face angles
        setFaceDescriptors(prev => [...prev, Array.from(detections.descriptor)]);
        setCaptureCount(prev => prev + 1);
        
        // Update capture angle for next capture
        if (captureCount === 0) {
          setCaptureAngle('right');
          setMessage('Face captured! Now turn your head slightly to the RIGHT for the next capture.');
        } else if (captureCount === 1) {
          setCaptureAngle('left');
          setMessage('Face captured! Now turn your head slightly to the LEFT for the final capture.');
        } else {
          setMessage('Face captured successfully! Finalizing registration...');
        }
        
        // Restore face guide after a short delay
        setTimeout(() => {
          setFaceGuideVisible(true);
          drawFaceGuide();
        }, 1500);
      } else {
        // Login mode - verify face immediately
        loginWithFace(Array.from(detections.descriptor));
      }
    } catch (error) {
      console.error('Face capture error:', error);
      setMessage('Error capturing face');
      setFaceGuideVisible(true);
      drawFaceGuide();
    }
  };
  
  // Function to draw enhanced jawline to ensure chin is captured
  const drawEnhancedJawline = (ctx, landmarks) => {
    if (!ctx || !landmarks) return;
    
    const jawOutline = landmarks.getJawOutline();
    
    // Draw jawline with more emphasis
    ctx.beginPath();
    ctx.moveTo(jawOutline[0].x, jawOutline[0].y);
    
    for (let i = 1; i < jawOutline.length; i++) {
      ctx.lineTo(jawOutline[i].x, jawOutline[i].y);
    }
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add circles at key chin points for better visibility
    const chinPoint = jawOutline[8]; // Middle of chin
    const leftChin = jawOutline[6];
    const rightChin = jawOutline[10];
    
    [chinPoint, leftChin, rightChin].forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.fill();
    });
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
      setFaceGuideVisible(true);
      drawFaceGuide();
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
    
    // Verify the captures have sufficient variation before proceeding
    const similarityMatrix = [];
    for (let i = 0; i < faceDescriptors.length; i++) {
      for (let j = i + 1; j < faceDescriptors.length; j++) {
        const similarity = calculateSimilarity(faceDescriptors[i], faceDescriptors[j]);
        similarityMatrix.push(similarity);
      }
    }
    
    // Calculate average similarity - if too high, captures are too similar
    const avgSimilarity = similarityMatrix.reduce((sum, val) => sum + val, 0) / similarityMatrix.length;
    if (avgSimilarity > 0.8) {
      setMessage('Your face captures are too similar. Please retry with more distinct angles.');
      return;
    }
    
    setProcessing(true);
    setMessage('Registering your face and creating account...');
    
    try {
      // Register both account and face in a single API call to ensure atomicity
      const registerResponse = await fetch('/api/auth/veriface/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userData: {
            name: userData.username,
            email: userData.email,
            password: userData.password,
            strand: userData.strand || ''
          },
          faceData: {
            faceDescriptors: faceDescriptors
          }
        })
      });
      
      const data = await registerResponse.json();
      
      if (!registerResponse.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Clear session storage
      sessionStorage.removeItem('signupData');
      
      // Save authentication data if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setMessage('Registration complete! Redirecting to dashboard...');
      
      // Redirect to dashboard after successful registration
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.message || 'Registration failed');
      setProcessing(false);
    }
  };
  
  // Retry capture button function
  const retryCapture = () => {
    if (mode === 'register' && captureCount > 0) {
      // Remove the last face descriptor
      setFaceDescriptors(prev => prev.slice(0, prev.length - 1));
      setCaptureCount(prev => prev - 1);
      
      // Update capture angle based on new count
      if (captureCount === 1) {  // Will be reduced to 0
        setCaptureAngle('front');
        setMessage('Retrying first capture. Look straight ahead.');
      } else if (captureCount === 2) {  // Will be reduced to 1
        setCaptureAngle('right');
        setMessage('Retrying second capture. Turn your head slightly to the RIGHT.');
      } else if (captureCount === 3) {  // Will be reduced to 2
        setCaptureAngle('left');
        setMessage('Retrying third capture. Turn your head slightly to the LEFT.');
      }
    }
    
    setFaceGuideVisible(true);
    drawFaceGuide();
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
            <div className="flex flex-col items-center mt-2">
              <div className="flex justify-center space-x-2 mb-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${i < captureCount ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
              
              {/* Retry last capture button */}
              {captureCount > 0 && !processing && (
                <button 
                  onClick={retryCapture} 
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Retry last capture
                </button>
              )}
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