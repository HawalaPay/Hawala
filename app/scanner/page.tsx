"use client";

import React, { useState } from "react";
import { useScanner, Contact } from "@/api/scanner";
import SendMoney from "@/components/ui/send-money";
import { QrCode, Scan, X } from "lucide-react";

const ScannerPage: React.FC = () => {
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [scannerActive, setScannerActive] = useState(true);

  // Reference images for face recognition
  const referenceImages = [
    { id: 1, src: "/people/Durva.jpeg" },
    { id: 2, src: "/people/Aviraj.jpg" },
    { id: 3, src: "/people/Mane.jpg" },
    
  ];

  // Contact data
  const contacts: Contact[] = [
    {
      id: 1,
      name: "Durva Dongre",
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-5.png?raw=true",
      lastAmount: "2,500",
      address: "0x6da09B40135aCa55a967CEA5BD08D4FE6D2bD608",
    },
    { 
      id: 2, 
      name: "Aviraj Patil", 
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-1.png?raw=true", 
      lastAmount: "1,800", 
      address: "0x2Cd79fa52973Ac5651314d9868bcdB779042FE87" 
    },
    { 
      id: 3, 
      name: "Dhanyakumar Mane", 
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/avatar-2.png?raw=true", 
      lastAmount: "3,200", 
      address: "0x951FB9620A09E1284Ec6Bf08296C977FDf0415B5" 
    },
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
    <div className="bg-white h-screen w-full flex flex-col relative">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg absolute top-4 left-4 right-4 z-50 shadow-md">
          {error}
        </div>
      )}

      {!showSendMoney && (
        <>
          {/* Header */}
          <div className="p-4 text-center border-b border-gray-100">
            <h1 className="text-lg font-medium text-gray-900">
              {detectionMode === "qr" ? "Scan QR Code" : "Face Recognition"}
            </h1>
          </div>
          
          {/* Scanner View */}
          <div className="flex-1 relative overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full z-10"
            />
            
            {/* Scanning frame */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white rounded-lg opacity-70"></div>
            </div>
            
            {/* Loading states */}
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-800">Initializing camera...</p>
                </div>
              </div>
            )}
            
            {isReady && !isFaceDetectionReady && detectionMode === "face" && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-800">Loading face recognition...</p>
                </div>
              </div>
            )}
            
            {/* Mode indicator */}
            <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
              <div className="px-4 py-2 bg-black bg-opacity-50 rounded-full text-white text-sm">
                {detectionMode === "qr" 
                  ? "Position QR code in the frame" 
                  : "Position face in the frame"}
              </div>
            </div>
          </div>
          
          {/* Control Bar */}
          <div className="p-6 border-t border-gray-100 flex justify-center items-center">
            <button 
              onClick={toggleDetectionMode}
              className="flex items-center justify-center bg-black text-white rounded-full w-14 h-14 shadow-md"
              aria-label={`Switch to ${detectionMode === "qr" ? "face recognition" : "QR code scanning"}`}
            >
              {detectionMode === "qr" 
                ? <Scan size={24} /> 
                : <QrCode size={24} />}
            </button>
            
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <div className="text-xs text-gray-500">
                Tap to switch to {detectionMode === "qr" ? "face recognition" : "QR code"}
              </div>
            </div>
          </div>
        </>
      )}

      {showSendMoney && selectedContact && (
        <div className="absolute inset-0 bg-white z-40">
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Send Money</h2>
            <button 
              onClick={closeSendMoney}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <SendMoney onClose={closeSendMoney} initialContact={selectedContact} />
        </div>
      )}
    </div>
  );
};

export default ScannerPage;