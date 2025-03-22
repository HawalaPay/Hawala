"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMode, setScanMode] = useState<'qr' | 'face'>('qr');
  const [message, setMessage] = useState('Initializing camera...');
  const [scanning, setScanning] = useState(false);

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setMessage('Camera ready. Position QR code or face in the frame.');
        }
      } catch (error) {
        setMessage('Camera access denied or not available');
        console.error('Error accessing camera:', error);
      }
    }

    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Function to capture frame and send to backend
  const captureFrame = async () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current || scanning) return;
    
    setScanning(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Send to backend API
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          type: scanMode
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessage(`${scanMode === 'qr' ? 'QR Code' : 'Face'} detected: ${result.data}`);
          // You can add additional handling for successful scans here
        } else {
          setMessage(`No ${scanMode === 'qr' ? 'QR code' : 'face'} detected. Try again.`);
        }
      } else {
        setMessage('Error processing scan. Please try again.');
      }
    } catch (error) {
      console.error('Error during scan:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // Continuous scanning every second
  useEffect(() => {
    if (cameraActive) {
      const interval = setInterval(captureFrame, 1000);
      return () => clearInterval(interval);
    }
  }, [cameraActive, scanMode, scanning]);

  // Toggle between QR and face scanning
  const toggleScanMode = () => {
    setScanMode(scanMode === 'qr' ? 'face' : 'qr');
    setMessage(`Switched to ${scanMode === 'qr' ? 'face' : 'QR code'} scanning mode`);
  };

  // Close scanner and go back to home
  const handleClose = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black border-b border-gray-800">
        <button 
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-medium">
          {scanMode === 'qr' ? 'QR Code Scanner' : 'Face Scanner'}
        </h1>
        <button 
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Camera View */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        {/* Scanner Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white opacity-70 rounded-lg"></div>
          </div>
        </div>
        
        {/* Video stream */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="h-full w-full object-cover"
        />
        
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-black border-t border-gray-800">
        <p className="text-center mb-4 text-sm text-gray-300">{message}</p>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={toggleScanMode}
            className="px-6 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            {scanMode === 'qr' ? 'Switch to Face Scan' : 'Switch to QR Scan'}
          </button>
          
          <button 
            onClick={captureFrame}
            className="px-6 py-2 border border-white rounded-full font-medium hover:bg-gray-900 transition-colors"
          >
            Scan Now
          </button>
        </div>
      </div>
    </div>
  );
}