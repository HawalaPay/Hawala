import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, FlipHorizontal, Flashlight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UIButton } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import jsQR from 'jsqr'; 

interface ScannerData {
  address: string;
  type: 'ethereum' | 'bitcoin' | 'url' | 'text';
}

interface CameraScannerProps {
  onClose: () => void;
  onScan?: (data: ScannerData) => void;
}

interface MediaDeviceWithTorch extends MediaStreamTrack {
  getCapabilities(): MediaTrackCapabilities & {
    torch?: boolean;
  };
  applyConstraints(constraints: MediaTrackConstraints & {
    advanced?: Array<{ torch?: boolean }>;
  }): Promise<void>;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onClose, onScan }) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTorchAvailable, setIsTorchAvailable] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const showError = (message: string) => {
    setError(message);
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
    setTimeout(() => setError(null), 3000);
  };

  const processQRCode = async (qrData: string) => {
    try {
      const response = await fetch('/api/scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        if (onScan) {
          onScan(data.data);
          toast({
            title: "Success",
            description: `QR code scanned successfully: ${data.data.type}`,
          });
        }
        stopCamera();
      } else {
        showError(data.error || 'Invalid QR code');
      }
    } catch (err) {
      console.error('Error processing QR code:', err);
      showError('Failed to process QR code');
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      processQRCode(code.data);
    }

    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const checkTorchCapability = async (stream: MediaStream) => {
    const track = stream.getVideoTracks()[0] as MediaDeviceWithTorch;
    const capabilities = track.getCapabilities();
    setIsTorchAvailable(!!capabilities.torch);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0] as MediaDeviceWithTorch;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isTorchOn }]
      });
      setIsTorchOn(!isTorchOn);
      toast({
        title: "Torch",
        description: !isTorchOn ? "Torch turned on" : "Torch turned off",
      });
    } catch (err) {
      showError('Failed to toggle torch');
    }
  };

  const flipCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    stopCamera();
    setFacingMode(newFacingMode);
    await startCamera(newFacingMode);
  };

  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);
        await checkTorchCapability(stream);
        
        videoRef.current.onloadedmetadata = () => {
          scanQRCode();
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      showError('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setIsTorchOn(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-black relative">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Scan QR Code</h2>
          <div className="flex items-center gap-2">
            {hasPermission && (
              <>
                <UIButton
                  variant="ghost"
                  size="icon"
                  onClick={flipCamera}
                  className="h-8 w-8 text-white hover:bg-zinc-800"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </UIButton>
                {isTorchAvailable && (
                  <UIButton
                    variant="ghost"
                    size="icon"
                    onClick={toggleTorch}
                    className={`h-8 w-8 text-white hover:bg-zinc-800 ${
                      isTorchOn ? 'bg-zinc-700' : ''
                    }`}
                  >
                    <Flashlight className="w-4 h-4" />
                  </UIButton>
                )}
              </>
            )}
            <UIButton
              variant="ghost"
              size="icon"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="h-8 w-8 bg-black text-black hover:bg-zinc-800"
            >
              <X className="w-4 h-4 text-black" />
            </UIButton>
          </div>
        </CardHeader>
        <div className="text-black text-center p-4">
          <p>Scan the QR code by aligning it within the frame.</p>
        </div>
        <CardContent className="p-0">
          <div className="relative bg-black aspect-[3/4] rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {isScanning && (
              <div className="absolute inset-0">
                {/* Scanner Corners */}
                {/* ... (rest of the scanner corner code remains the same) ... */}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Camera Permission Request */}
            {!hasPermission && !isScanning && (
              <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white p-6">
                <Camera className="w-16 h-16 mb-4 text-white/80" />
                <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
                <p className="text-center text-sm mb-4 text-gray-400">
                  Please allow camera access to scan QR codes
                </p>
                <UIButton
                  onClick={() => startCamera(facingMode)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Enable Camera
                </UIButton>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          {hasPermission && (
            <div className="p-4 border-t border-zinc-800">
              <UIButton
                onClick={isScanning ? stopCamera : () => startCamera(facingMode)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                {isScanning ? "Stop Scanning" : "Start Scanning"}
              </UIButton>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Export with SSR disabled
export default dynamic(() => Promise.resolve(CameraScanner), { 
  ssr: false 
});
