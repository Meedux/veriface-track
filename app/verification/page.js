'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { LuScanFace } from "react-icons/lu";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoCloseCircleOutline } from "react-icons/io5";

const VerificationPage = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureReady, setCaptureReady] = useState(false);
  const [processingData, setProcessingData] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('waiting'); // waiting, processing, success, failed

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log('Face detection models loaded');
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    loadModels();
  }, []);

  // Setup webcam
  useEffect(() => {
    if (modelsLoaded) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCaptureReady(true);
          }
        })
        .catch(err => console.error("Error accessing webcam:", err));
    }
  }, [modelsLoaded]);

  // Face detection function
  const detectFace = async () => {
    if (!captureReady || !videoRef.current || !canvasRef.current) return;
    
    setProcessingData(true);
    setVerificationStatus('processing');
    
    // Get video dimensions
    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    // Detect faces
    const detections = await faceapi.detectAllFaces(
      videoRef.current, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptors();
    
    if (detections.length === 0) {
      console.log("No face detected");
      setVerificationStatus('failed');
      setProcessingData(false);
      return;
    }
    
    if (detections.length > 1) {
      console.log("Multiple faces detected");
      setVerificationStatus('failed');
      setProcessingData(false);
      return;
    }
    
    // Draw detections
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    
    // Get facial data (descriptor is the unique facial fingerprint)
    const faceData = {
      landmarks: detections[0].landmarks.positions,
      descriptor: Array.from(detections[0].descriptor),
      boundingBox: detections[0].detection.box
    };
    
    console.log("Facial data captured:", faceData);
    
    // Draw rectangle around face
    faceapi.draw.drawDetections(canvasRef.current, detections);
    faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
    
    setVerificationStatus('success');
    setProcessingData(false);
    
    // In a real app, you would send this data to your backend
  };

  return (
    <main className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
      <div className="container flex flex-col items-center w-full max-w-7xl">
        <h1 
          className="text-[2rem] text-black font-bold mb-6" 
          style={{ fontFamily: '"Segoe UI", sans-serif' }}
        >
          Facial Verification
        </h1>
        
        <div className="bg-white w-[35rem] rounded-[15px] flex flex-col items-center p-8">
          <div className="relative w-full h-[25rem] bg-[#f0f0f0] rounded-[15px] mb-6 overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              muted
              className="w-full h-full object-cover"
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full"
            />
            
            {/* Status overlays */}
            {verificationStatus === 'processing' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#0D8A3F] border-solid"></div>
              </div>
            )}
            
            {verificationStatus === 'success' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <IoCheckmarkCircleOutline className="text-[#0D8A3F] text-7xl" />
              </div>
            )}
            
            {verificationStatus === 'failed' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <IoCloseCircleOutline className="text-red-500 text-7xl" />
              </div>
            )}
          </div>
          
          <div className="bg-[#E8F5E9] h-[4.5rem] w-full rounded-[15] flex items-center pl-[1rem] mb-[1rem]">
            <LuScanFace className="w-[2rem] h-[2rem]" style={{ color: '#0D8A3F' }} />
            <p className="text-[#473D3D] mr-auto ml-[1rem]">
              {captureReady ? 'Camera ready' : 'Setting up camera...'}
            </p>
            {captureReady && 
              <div className="bg-[#4CAF50] w-[1.2rem] h-[1.2rem] rounded-full mr-4"></div>
            }
          </div>
          
          <button 
            onClick={detectFace}
            disabled={!captureReady || processingData}
            className={`h-[3.7rem] w-full rounded-[10] flex justify-center items-center text-white text-[1.2rem] shadow-xl mt-4 
              ${!captureReady || processingData ? 'bg-gray-400' : 'bg-[#0D8A3F]'}`}
            style={{ fontFamily: '"Segoe UI", sans-serif' }}
          >
            {processingData ? 'PROCESSING...' : 'VERIFY FACE'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default VerificationPage;