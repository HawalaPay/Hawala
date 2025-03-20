'use client';

import "@/styles/audio.css";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitAudioSupportRequest, AudioSupportRequest, SupportResponse } from '@/api/audio-support';
import { Mic, MicOff, Square, RotateCcw, Send } from 'lucide-react';

export default function AudioSupportPage() {
  const router = useRouter();
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  
const analyserRef = useRef<AnalyserNode | null>(null);
const animationFrameRef = useRef<number | null>(null);
  // Form states
  const [name, setName] = useState('Anonymous Customer');
  const [email, setEmail] = useState('support@example.com');
  const [phone, setPhone] = useState('9881679994'); // Default phone for demo
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<SupportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

// Add this to your state
const [voiceIntensity, setVoiceIntensity] = useState(0);

// Replace the basic voice detection with this more nuanced version
const detectVoiceActivity = () => {
  if (!analyserRef.current) return;
  
  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
  analyserRef.current.getByteFrequencyData(dataArray);
  
  // Calculate average volume
  const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  
  
  
  // Threshold for voice activity
  setVoiceActive(prevActive => {
    // If currently active, require lower volume to deactivate (creates smoother transition)
    const threshold = prevActive ? 12 : 15;
    return average > threshold;
  });
  
  // Continue checking voice activity
  animationFrameRef.current = requestAnimationFrame(detectVoiceActivity);
};
  
  // Start recording function
  const startRecording = async () => {
    try {
      setError(null);
      
      // Reset previous recording if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up audio analysis for voice activity detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Start voice detection
      detectVoiceActivity();
      
      // Rest of your existing code...
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop voice detection
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Reset voice active state
        setVoiceActive(false);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Microphone access denied or not available. Please ensure your browser has permission to use the microphone.');
      console.error('Error starting recording:', err);
    }
  };
  
  // Modify your existing stopRecording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop voice detection
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Reset voice active state
      setVoiceActive(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  // Reset recording function
  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setError(null);
  };
  
  // Submit recording function
  const submitRecording = async () => {
    if (!audioBlob) {
      setError('Please record your message before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const request: AudioSupportRequest = {
        name,
        email,
        phone,
        audioFile: audioBlob
      };
      
      const result = await submitAudioSupportRequest(request);
      
      if (result.success) {
        setResponse(result);
      } else {
        throw new Error(result.error || 'Failed to submit audio request');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  
  const handleBackToHome = () => {
    router.push('/support');
  };
  
  return (
    <div className="support-container">
      <h1 className="support-title">Voice Support Request</h1>
      
      {response ? (
        <div className="response-container">
          <h2 className="response-header">Request Submitted Successfully</h2>
          
          <div className="ticket-section">
            <h3 className="section-title">Ticket Information</h3>
            <div className="ticket-info">
              <p><strong>Ticket ID:</strong> {response.ticketId}</p>
            </div>
          </div>
          
          <div className="understanding-section">
            <h3 className="section-title">We Understood Your Request As</h3>
            <div className="understanding-content">
              <p><strong>Subject:</strong> {response.requestData.subject || 'Not detected'}</p>
              <p className="description-label"><strong>Description:</strong></p>
              <p className="description-content">
                {response.requestData.description || 'We could not transcribe your audio clearly. A support agent will listen to your recording.'}
              </p>
            </div>
          </div>
          
          <div className="solution-section">
            <h3 className="section-title">Our Response</h3>
            <div className="solution-content">
              <p>{response.analysis?.solution || "Thank you for contacting us. We've received your request and will respond shortly."}</p>
            </div>
          </div>
          
          <div className="next-steps-section">
            <h3 className="section-title">Next Steps</h3>
            <div className="next-steps-content">
              <p>
                We have scheduled a call with one of our support specialists to discuss your request in detail.
                Our team will call you shortly.
              </p>
            </div>
          </div>
          
          <div className="action-footer">
            <button
              onClick={handleBackToHome}
              className="back-button"
            >
              Back to Support Options
            </button>
          </div>
        </div>
      ) : (
        <div className="form-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="recording-section">
            <p className="instruction-text">
              Record your support request and our team will get back to you quickly.
            </p>
            
            <div className="recorder-container">
            <div className={`recorder-circle ${isRecording ? 'recording' : ''} ${audioUrl ? 'recorded' : ''}`}>
  {/* Voice responsive ring - only show when recording */}
  {isRecording && (
    <div 
      className={`voice-responsive-ring ${voiceActive ? 'active' : 'idle'}`}
      style={{
        // Optionally adjust intensity based on voice volume
        borderWidth: voiceActive ? `${4 + (voiceIntensity / 25)}px` : '4px',
      }}
    ></div>
  )}
  
  {isRecording && (
    <div className="pulse-overlay"></div>
  )}
  
  {/* Rest of your existing recorder circle content */}
  {isRecording ? (
    <div className="recording-indicator">
      <div className="timer-display">
        {formatTime(recordingDuration)}
      </div>
      <MicOff size={40} className="mic-icon-off" />
    </div>
  ) : audioUrl ? (
    <div className="recorded-indicator">
      <p className="recorded-text">Recording saved</p>
      <p className="duration-text">
        {formatTime(recordingDuration)}
      </p>
    </div>
  ) : (
    <Mic size={40} className="mic-icon" />
  )}
</div>
              
              <div className="control-buttons">
                {!isRecording && !audioUrl && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="start-button"
                  >
                    <Mic size={18} />
                    Start Recording
                  </button>
                )}
                
                {isRecording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="stop-button"
                  >
                    <Square size={18} />
                    Stop Recording
                  </button>
                )}
                
                {audioUrl && (
                  <>
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="reset-button"
                    >
                      <RotateCcw size={18} />
                      Reset
                    </button>
                    
                    <button
                      type="button"
                      onClick={submitRecording}
                      disabled={isSubmitting}
                      className={`send-button ${isSubmitting ? 'sending' : ''}`}
                    >
                      <Send size={18} />
                      {isSubmitting ? 'Sending...' : 'Send'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {audioUrl && (
            <div className="playback-section">
              <h3 className="playback-title">Your Recording</h3>
              <div className="audio-player-container">
                <audio 
                  src={audioUrl} 
                  controls 
                  className="audio-player"
                />
              </div>
            </div>
          )}
          
          <div className="footer-section">
            <p className="terms-text">
              By submitting a voice request, you agree to our terms of service and privacy policy.
              We'll call you back as soon as possible to help with your issue.
            </p>
            
            <button
              type="button"
              onClick={handleBackToHome}
              className="back-link"
            >
              Back to Support Options
            </button>
          </div>
        </div>
      )}
    </div>
  );
}