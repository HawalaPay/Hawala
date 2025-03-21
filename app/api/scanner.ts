"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import * as faceapi from "face-api.js";

// Types
export interface Contact {
  id: number;
  name: string;
  image: string;
  lastAmount: string;
  address: string;
}

export interface ScannerProps {
  onAddressFound: (address: string) => void;
  onFaceRecognized: (contactId: number) => void;
  referenceImages: { id: number; src: string }[];
  isActive: boolean;
  cameraConstraints?: MediaTrackConstraints;
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
export const useScanner = ({
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