"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Sparkles,
  Upload,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Lock,
} from "lucide-react";
import { Quest } from "@/types/quest";

interface SceneCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestGenerated: (quest: Quest) => void;
}

export function SceneCameraModal({
  isOpen,
  onClose,
  onQuestGenerated,
}: SceneCameraModalProps) {
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "active" | "denied" | "unsupported"
  >("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [userConsentRemote, setUserConsentRemote] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopActiveStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopActiveStream();
    setCapturedImage(null);
    setIsAnalyzing(false);
    setError(null);
    setCameraState("idle");
    onClose();
  }, [stopActiveStream, onClose]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopActiveStream();
    };
  }, [stopActiveStream]);

  if (!isOpen) return null;

  const startCamera = async () => {
    setError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      if (!isHttps && !isLocalhost) {
        setError(
          "Camera access requires HTTPS or localhost. If testing from your phone over Wi-Fi/LAN, please use 'Upload Snapshot' below."
        );
      } else {
        setError(
          "Camera access is not supported by your current browser. You can use 'Upload Snapshot' instead."
        );
      }
      return;
    }

    setCameraState("requesting");
    let stream: MediaStream | null = null;

    try {
      // First attempt: environment/back camera with 720p ideal
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (firstErr: unknown) {
      // Fallback attempt: basic video constraints (best for desktop/USB webcams or strict drivers)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (fallbackErr: unknown) {
        console.warn("Camera access denied or failed:", fallbackErr || firstErr);
        setCameraState("denied");
        stopActiveStream();

        const errObj = (fallbackErr || firstErr) as { name?: string; message?: string };
        if (
          errObj?.name === "NotAllowedError" ||
          errObj?.name === "PermissionDeniedError"
        ) {
          setError(
            "Camera permission was denied. Please click the lock or camera icon in your browser address bar to allow camera access, or use 'Upload Snapshot'."
          );
        } else if (
          errObj?.name === "NotFoundError" ||
          errObj?.name === "DevicesNotFoundError"
        ) {
          setError(
            "No camera device was detected on your computer. You can use 'Upload Snapshot' to select a photo instead."
          );
        } else if (
          errObj?.name === "NotReadableError" ||
          errObj?.name === "TrackStartError"
        ) {
          setError(
            "Camera is currently in use by another application (e.g. Teams, Zoom). Please close other camera apps, or use 'Upload Snapshot'."
          );
        } else {
          setError(
            errObj?.message ||
              "Could not open camera. Please check your browser settings or use 'Upload Snapshot'."
          );
        }
        return;
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraState("active");

      // Give element time to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const maxDim = 896;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.82);

    // Stop camera immediately after snapshot
    stopActiveStream();
    setCameraState("idle");
    setCapturedImage(jpegDataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 896;
        let width = img.naturalWidth || 640;
        let height = img.naturalHeight || 480;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          setCapturedImage(jpegDataUrl);
          stopActiveStream();
          setCameraState("idle");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeScene = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-scene-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: capturedImage,
          durationMinutes: 10,
          userConsentRemote,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.quest) {
        if (data.code === "CONSENT_REQUIRED") {
          throw new Error(
            "Hosted inference requires your confirmation to transmit this single snapshot."
          );
        }
        throw new Error(data.error || "Failed to analyze outdoor scene");
      }

      // Quest successfully created — discard image from memory
      setCapturedImage(null);
      handleClose();
      onQuestGenerated(data.quest);
    } catch (err: unknown) {
      console.error("Scene quest generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while analyzing the scene."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-3xl border border-[#E6DFD3] bg-[#FBF9F4] p-5 shadow-2xl sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#244836] text-white">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C2720]">
                Look Once. See More.
              </h2>
              <p className="text-xs text-[#667269]">
                One snapshot. Gemma AI guides you into the physical world.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-[#667269] hover:bg-[#EAE4D7] hover:text-[#1C2720] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Viewfinder / Capture Box */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#D5E2D8] bg-[#1C2720] relative aspect-4/3 flex items-center justify-center">
          {/* Active Live Video Stream */}
          {cameraState === "active" && !capturedImage && (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-cover"
              />
              {/* Viewfinder Reticle */}
              <div className="absolute inset-6 rounded-xl border border-white/40 pointer-events-none flex flex-col justify-between p-3">
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-mono">
                  Temporary Scene Sensor
                </span>
                <span className="text-[10px] text-white/70 text-right font-mono">
                  1 frame only
                </span>
              </div>
            </>
          )}

          {/* Captured Still Preview */}
          {capturedImage && (
            // In-memory preview only. Discarded after submission.
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImage}
                alt="Captured scene"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
                Snapshot ready
              </div>
            </div>
          )}

          {/* Idle / Requesting Screen */}
          {!capturedImage && cameraState !== "active" && (
            <div className="p-6 text-center text-white">
              {cameraState === "requesting" ? (
                <>
                  <Loader2 className="mx-auto h-10 w-10 text-[#88C69D] animate-spin mb-3" />
                  <p className="font-serif text-base font-semibold">
                    Requesting camera access...
                  </p>
                  <p className="mt-1 text-xs text-white/70 max-w-xs mx-auto">
                    Please approve browser camera permissions if prompted.
                  </p>
                </>
              ) : (
                <>
                  <Camera className="mx-auto h-10 w-10 text-[#88C69D] opacity-80 mb-3" />
                  <p className="font-serif text-base font-semibold">
                    Point at trees, ground textures, or paths
                  </p>
                  <p className="mt-1 text-xs text-white/70 max-w-xs mx-auto">
                    The photo is a temporary context sensor. We never save or publish your picture.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Capture Controls */}
        <div className="mt-4 flex flex-col gap-2.5">
          {/* Action 1: Capture or Activate Camera */}
          {!capturedImage && cameraState === "active" && (
            <button
              type="button"
              onClick={captureFrame}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#244836] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1B382A] cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Capture Snapshot</span>
            </button>
          )}

          {!capturedImage && cameraState !== "active" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraState === "requesting"}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#244836] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1B382A] disabled:opacity-75 cursor-pointer"
              >
                {cameraState === "requesting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Opening Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Open Camera</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#D5E2D8] bg-white py-3 text-xs font-semibold text-[#244836] transition hover:bg-[#E8EDE3] cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Snapshot</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {/* Action 2: Image Captured — Ready for Inference */}
          {capturedImage && (
            <div className="space-y-3">
              {/* Remote Consent Checkbox */}
              <label className="flex items-start gap-2.5 rounded-xl border border-[#E6DFD3] bg-[#F7F4EC] p-2.5 text-xs text-[#4C584E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={userConsentRemote}
                  onChange={(e) => setUserConsentRemote(e.target.checked)}
                  className="mt-0.5 rounded text-[#244836] focus:ring-[#244836]"
                />
                <span>
                  Allow transmission to configured vision endpoint if not running local Ollama.
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#D5E2D8] bg-white py-3 text-xs font-semibold text-[#667269] hover:bg-[#F4EFE6] transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleAnalyzeScene}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#244836] py-3 text-xs font-semibold text-white shadow-md hover:bg-[#1B382A] transition disabled:opacity-70 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Gemma Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Synthesize Quest</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy & Zero-Persistence Guarantee */}
        <div className="mt-4 flex items-center justify-between border-t border-[#E6DFD3] pt-3 text-[11px] text-[#7A867D]">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-[#244836]" />
            <span>Zero Image Storage: Auto-discarded immediately</span>
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#244836]" />
            <span>896px Optimized</span>
          </span>
        </div>
      </div>
    </div>
  );
}
