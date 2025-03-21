"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import * as faceapi from "face-api.js";
import SendMoney from "@/components/ui/send-money";

// Types
interface Contact {
  id: number;
  name: string;
  image: string;
  lastAmount: string;
  address: string;
}

interface ScannerProps {
  onAddressFound: (address: string) => void;
  onFaceRecognized: (contactId: number) => void;
  referenceImages: { id: number; src: string }[];
  isActive: boolean;
}

// Custom image loading function
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src.startsWith("/") ? src : `/${src}`;
  });
};

// Custom hook for scanner logic
const useScanner = ({
  onAddressFound,
  onFaceRecognized,
  referenceImages,
  isActive,
}: ScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionMode, setDetectionMode] = useState<"qr" | "face">("face"); // Start with face detection
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models
  const loadFaceDetectionModels = async () => {
    if (modelsLoaded) return;
    
    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      setIsFaceDetectionReady(true);
      console.log("Face detection models loaded successfully");
    } catch (err) {
      setError("Failed to load face detection models. Ensure models are in the public/models directory.");
      console.error("Error loading face detection models:", err);
    }
  };

  // Process reference images for face recognition
  const processReferenceImage = async (refImg: { id: number; src: string }) => {
    try {
      const img = await loadImage(refImg.src);
      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        console.warn(`No faces detected in reference image ${refImg.id}`);
        return null;
      }

      return new faceapi.LabeledFaceDescriptors(
        refImg.id.toString(),
        detections.map((d) => d.descriptor)
      );
    } catch (error) {
      console.error(`Error processing reference image ${refImg.id}:`, error);
      return null;
    }
  };

  // Create face matcher from reference images
  const createFaceMatcher = async () => {
    if (!isFaceDetectionReady || referenceImages.length === 0) return;

    try {
      const descriptors = await Promise.all(
        referenceImages.map(processReferenceImage)
      );
      const validDescriptors = descriptors.filter(
        (desc): desc is faceapi.LabeledFaceDescriptors => desc !== null
      );

      if (validDescriptors.length === 0) {
        setError("No valid face descriptors could be extracted. Check image paths and quality.");
        return;
      }

      const matcher = new faceapi.FaceMatcher(validDescriptors, 0.6); // Slightly higher threshold for better matching
      setFaceMatcher(matcher);
      console.log("Face matcher created successfully");
    } catch (err) {
      setError("Failed to create face matcher");
      console.error("Error creating face matcher:", err);
    }
  };

  // Initialize camera
  const initializeCamera = async () => {
    if (!videoRef.current) return;

    try {
      const constraints = {
        video: {
          facingMode: "user", // Use front camera for face detection by default
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setHasCameraPermission(true);
              console.log("Camera initialized successfully");
            });
          }
        };
      }
    } catch (err) {
      setError("Camera access denied or camera not available");
      console.error("Error accessing camera:", err);
    }
  };

  // Initialize QR scanner
  const initQrScanner = () => {
    if (!videoRef.current || qrScannerRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (/^0x[a-fA-F0-9]{40}$/.test(result.data)) {
            console.log("Valid Ethereum address found:", result.data);
            onAddressFound(result.data);
          }
        },
        { 
          returnDetailedScanResult: true, 
          highlightScanRegion: true,
          highlightCodeOutline: true 
        }
      );

      qrScannerRef.current = qrScanner;
      console.log("QR scanner initialized");
    } catch (err) {
      setError("Failed to initialize QR scanner");
      console.error("Error initializing QR scanner:", err);
    }
  };

  // Start face detection
  const startFaceDetection = async () => {
    if (!videoRef.current || !canvasRef.current || !faceMatcher || !isActive || detectionMode !== "face") return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make sure video is playing before starting detection
    if (video.paused) {
      try {
        await video.play();
      } catch (err) {
        console.error("Failed to play video:", err);
        return;
      }
    }
    
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    // Stop any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Recursive detection function
    const detectFrame = async () => {
      if (!isActive || detectionMode !== "face" || !videoRef.current || !canvasRef.current) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Clear previous drawings
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          // Match detected faces
          for (const detection of resizedDetections) {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            if (bestMatch.label !== "unknown" && bestMatch.distance < 0.6) {
              console.log(`Identified: ${bestMatch.label} with confidence: ${(1-bestMatch.distance).toFixed(2)}`);
              
              // Draw detection with name
              if (ctx) {
                const drawBox = new faceapi.draw.DrawBox(detection.detection.box, { 
                  label: bestMatch.label, 
                  boxColor: "green",
                  drawLabelOptions: {
                    fontSize: 16,
                    fontStyle: "bold" 
                  }
                });
                drawBox.draw(canvas);
              }
              
              // Notify about recognized face
              onFaceRecognized(parseInt(bestMatch.label));
              return; // Stop loop after recognition
            } else {
              // Draw detection box for unknown faces
              faceapi.draw.drawDetections(canvas, [resizedDetections[0]]);
            }
          }
        }

        // Continue detection loop
        animationRef.current = requestAnimationFrame(detectFrame);
      } catch (error) {
        console.error("Face detection error:", error);
        animationRef.current = requestAnimationFrame(detectFrame);
      }
    };

    // Start detection loop
    detectFrame();
  };

  // Toggle between QR and face detection modes
  const toggleDetectionMode = () => {
    // Stop current detection method
    if (detectionMode === "qr" && qrScannerRef.current) {
      qrScannerRef.current.stop();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Update camera settings based on new mode
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      
      // Re-initialize camera with appropriate facing mode
      const newMode = detectionMode === "qr" ? "face" : "qr";
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newMode === "face" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    }
    
    // Change detection mode
    setDetectionMode(prev => (prev === "qr" ? "face" : "qr"));
  };

  // Initialize scanner
  useEffect(() => {
    loadFaceDetectionModels();
    initializeCamera();

    return () => {
      // Clean up resources
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      qrScannerRef.current?.stop();
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Set up QR scanner after camera is initialized
  useEffect(() => {
    if (hasCameraPermission && videoRef.current) {
      initQrScanner();
      setIsReady(true);
    }
  }, [hasCameraPermission]);

  // Create face matcher when models are loaded
  useEffect(() => {
    if (isFaceDetectionReady) {
      createFaceMatcher();
    }
  }, [isFaceDetectionReady, referenceImages]);

  // Manage active detection mode
  useEffect(() => {
    if (!isReady) return;

    if (isActive) {
      if (detectionMode === "qr") {
        // Stop face detection if running
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        
        // Start QR scanner
        if (qrScannerRef.current) {
          qrScannerRef.current.start();
        }
      } else if (detectionMode === "face" && faceMatcher) {
        // Stop QR scanner if running
        qrScannerRef.current?.stop();
        
        // Start face detection
        startFaceDetection();
      }
    } else {
      // Cleanup when inactive
      qrScannerRef.current?.stop();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isActive, detectionMode, isReady, faceMatcher]);

  return {
    videoRef,
    canvasRef,
    isReady,
    hasCameraPermission,
    isFaceDetectionReady,
    error,
    detectionMode,
    toggleDetectionMode,
  };
};

// Scanner component
const Scanner: React.FC = () => {
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [scannerActive, setScannerActive] = useState(true);

  // Reference images for face recognition
  const referenceImages = [
    { id: 1, src: "/people/Durva.jpeg" }, // Ensure this path is correct
    // Add more reference images as needed
  ];

  // Contact data
  const contacts: Contact[] = [
    {
      id: 1,
      name: "Durva Dongre",
      image: "/people/Durva.jpeg",
      lastAmount: "2,500",
      address: "0x6da09B40135aCa55a967CEA5BD08D4FE6D2bD608",
    },
    // Add more contacts as needed
  ];

  // Handle face recognition
  const handleFaceRecognized = (contactId: number) => {
    const matchedContact = contacts.find((c) => c.id === contactId);
    if (matchedContact) {
      setSelectedContact(matchedContact);
      setScannerActive(false);
      setShowSendMoney(true);
    }
  };

  // Handle QR code detection
  const handleAddressFound = (address: string) => {
    const matchedContact = contacts.find((c) => c.address === address);
    setSelectedContact(
      matchedContact || {
        id: 0,
        name: "Unknown",
        image: "/img/avatar-default.png",
        lastAmount: "",
        address,
      }
    );
    setShowSendMoney(true);
    setScannerActive(false);
  };

  const { 
    videoRef, 
    canvasRef, 
    error, 
    detectionMode, 
    toggleDetectionMode,
    isReady,
    isFaceDetectionReady 
  } = useScanner({
    onAddressFound: handleAddressFound,
    onFaceRecognized: handleFaceRecognized,
    referenceImages,
    isActive: scannerActive,
  });

  const closeSendMoney = () => {
    setShowSendMoney(false);
    setSelectedContact(null);
    setTimeout(() => setScannerActive(true), 500);
  };

  return (
    <div className="scanner-container relative w-full h-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded absolute top-0 left-0 right-0 z-50">
          {error}
        </div>
      )}

      {!showSendMoney && (
        <div className="scanner-view relative w-full h-full">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full z-10"
          />
          
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="text-white text-lg">Initializing camera...</div>
            </div>
          )}
          
          {isReady && !isFaceDetectionReady && detectionMode === "face" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="text-white text-lg">Loading face recognition models...</div>
            </div>
          )}
          
          <div className="scanner-controls absolute bottom-4 left-0 right-0 flex justify-center z-20">
            <button 
              onClick={toggleDetectionMode}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors"
            >
              {detectionMode === "qr" ? "Switch to Face Recognition" : "Switch to QR Code"}
            </button>
          </div>
          
          {detectionMode === "face" && (
            <div className="absolute top-4 left-0 right-0 text-center z-20">
              <div className="inline-block bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                Looking for faces...
              </div>
            </div>
          )}
          
          {detectionMode === "qr" && (
            <div className="absolute top-4 left-0 right-0 text-center z-20">
              <div className="inline-block bg-black bg-opacity-70 text-white px-4 py-2 rounded-md">
                Scan Ethereum QR code
              </div>
            </div>
          )}
        </div>
      )}

      {showSendMoney && selectedContact && (
        <SendMoney onClose={closeSendMoney} initialContact={selectedContact} />
      )}
    </div>
  );
};

export default Scanner;