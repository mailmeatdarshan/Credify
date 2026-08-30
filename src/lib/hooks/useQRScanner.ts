'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';

interface UseQRScannerOptions {
  onScan?: (data: string) => void;
  scanInterval?: number;
}

interface UseQRScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  isStarting: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  lastScanResult: string | null;
  scanImageFile: (file: File) => Promise<boolean>;
}

export function useQRScanner({
  onScan,
  scanInterval = 150,
}: UseQRScannerOptions = {}): UseQRScannerReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);

  const scanFrame = useCallback(() => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const now = Date.now();
    if (now - lastScanTimeRef.current >= scanInterval) {
      lastScanTimeRef.current = now;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data && code.data.trim()) {
            if (code.data !== lastScannedCodeRef.current) {
              lastScannedCodeRef.current = code.data;
              setLastScanResult(code.data);
              onScan?.(code.data);

              if (cooldownTimerRef.current) {
                clearTimeout(cooldownTimerRef.current);
              }
              cooldownTimerRef.current = setTimeout(() => {
                lastScannedCodeRef.current = null;
              }, 3000);
            }
          }
        } catch {
          // jsQR ignore invalid frames
        }
      }
    }

    if (isScanningRef.current) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [onScan, scanInterval]);

  const start = useCallback(async () => {
    try {
      setError(null);
      setIsStarting(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment. Please use HTTPS.');
      }

      // Stop any existing stream before starting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream: MediaStream;

      // 1. Try back/environment camera first (mobile)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // 2. Fallback to any available video camera (desktop / webcam / user camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsActive(true);
      isScanningRef.current = true;
    } catch (err) {
      console.error('Camera access error:', err);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser.'
          : err instanceof Error && err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : err instanceof Error
          ? err.message
          : 'Unable to access camera';
      setError(message);
      setIsActive(false);
      isScanningRef.current = false;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stop = useCallback(() => {
    isScanningRef.current = false;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  // When active & stream is ready, guarantee video source attachment
  useEffect(() => {
    if (!isActive || !streamRef.current) return;

    const video = videoRef.current;
    if (video) {
      video.srcObject = streamRef.current;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.play().catch((e) => {
        console.warn('Video playback interaction required:', e);
      });

      isScanningRef.current = true;
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isActive, scanFrame]);

  // Decode QR code directly from an uploaded image file
  const scanImageFile = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(false);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data && code.data.trim()) {
              setLastScanResult(code.data);
              onScan?.(code.data);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(file);
    });
  }, [onScan]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    isActive,
    isStarting,
    error,
    start,
    stop,
    lastScanResult,
    scanImageFile,
  };
}
