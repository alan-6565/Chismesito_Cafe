"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-screen camera view that reads a gift card QR code (from the
 * customer's email) using the iPad/phone's back camera.
 */
export default function QrScanModal({ onScan, onClose }: { onScan: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Keep the latest callbacks without restarting the camera on every render.
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let scanner: { stop(): void; destroy(): void } | null = null;
    let cancelled = false;

    (async () => {
      const { default: QrScanner } = await import("qr-scanner");
      if (cancelled || !videoRef.current) return;
      const instance = new QrScanner(
        videoRef.current,
        (result) => {
          instance.stop();
          onScanRef.current(result.data);
        },
        { preferredCamera: "environment", highlightScanRegion: true, returnDetailedScanResult: true }
      );
      scanner = instance;
      try {
        await instance.start();
      } catch {
        if (!cancelled) setError("Couldn't open the camera. Allow camera access for this site, or type the code instead.");
      }
    })();

    return () => {
      cancelled = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <p className="text-cream font-semibold mb-3">Point the camera at the QR code in their email</p>
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-black">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      </div>
      {error && <p className="mt-3 max-w-md text-center text-sm text-red-300">{error}</p>}
      <button
        onClick={onClose}
        className="mt-5 rounded-full bg-cream text-maroon font-semibold px-6 py-2.5 text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
