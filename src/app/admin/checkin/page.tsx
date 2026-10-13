"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Award, 
  StopCircle,
  PlayCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function AdminCheckinPage() {
  const [manualToken, setManualToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    points?: number;
    event_title?: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera scanner on unmount
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setResult(null);
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Scanned successfully!
          if (!isProcessing) {
            await stopScanner();
            await performCheckIn(decodedText);
          }
        },
        (errorMessage) => {
          // Ignored per-frame error
        }
      );
    } catch (err: any) {
      console.error(err);
      setIsScanning(false);
      setResult({
        success: false,
        message: "Kameraga ulanishda xatolik yuz berdi. Iltimos, token kodini qo'lda kiriting.",
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error(err);
      }
    }
    setIsScanning(false);
  };

  const performCheckIn = async (token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    try {
      setIsProcessing(true);
      setResult(null);
      const supabase = createClient();

      // Call supabase RPC check_in(p_token)
      const { data, error } = await supabase.rpc("check_in", {
        p_token: cleanToken,
      });

      if (error) {
        throw error;
      }

      if (data && typeof data === "object") {
        setResult({
          success: data.success,
          message: data.message,
          points: data.points,
          event_title: data.event_title,
        });
      } else {
        setResult({
          success: true,
          message: "Check-in muvaffaqiyatli yakunlandi!",
        });
      }

      setManualToken("");
    } catch (err: any) {
      console.error(err);
      setResult({
        success: false,
        message: err?.message || "Check-in jarayonida xatolik yuz berdi.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await performCheckIn(manualToken);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-ink mb-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Admin panelga qaytish</span>
        </Link>
        <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
          Tadbir QR Check-in Nazorati
        </h1>
        <p className="text-xs text-muted-text">
          Ishtirokchilarning QR kodini kamera orqali skanerlang yoki token kodini kiriting
        </p>
      </div>

      {/* Result Card */}
      {result && (
        <div
          className={`p-5 rounded-2xl border shadow-sm transition flex flex-col items-center text-center space-y-2 ${
            result.success
              ? "bg-teal-light text-ink border-teal/30"
              : "bg-danger-soft text-danger-text border-danger-text/20"
          }`}
        >
          {result.success ? (
            <div className="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-danger-text text-white flex items-center justify-center shadow-sm">
              <AlertCircle className="w-7 h-7" />
            </div>
          )}

          <h3 className="font-heading font-bold text-base">
            {result.success ? "Check-in Tasdiqlandi!" : "Check-in Xatosi"}
          </h3>

          <p className="text-sm font-medium leading-relaxed max-w-md">
            {result.message}
          </p>

          {result.success && result.points && (
            <div className="inline-flex items-center gap-1.5 bg-saffron text-ink px-4 py-1.5 rounded-full font-heading font-bold text-sm shadow-sm mt-1">
              <Award className="w-4 h-4" />
              <span>+{result.points} ball talabaga qo&apos;shildi</span>
            </div>
          )}
        </div>
      )}

      {/* Camera Scanner Block */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal" />
            <span>Kamera orqali skanerlash</span>
          </h2>

          {isScanning ? (
            <button
              onClick={stopScanner}
              className="px-4 py-1.5 rounded-full bg-danger-soft text-danger-text hover:bg-danger-soft/80 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <StopCircle className="w-4 h-4" />
              <span>Kamerani to&apos;xtatish</span>
            </button>
          ) : (
            <button
              onClick={startScanner}
              className="px-4 py-1.5 rounded-full bg-teal text-white hover:bg-teal-hover text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Kamerani yoqish</span>
            </button>
          )}
        </div>

        {/* Video stream container */}
        <div
          id="reader"
          className={`w-full max-w-sm mx-auto rounded-xl overflow-hidden ${
            isScanning ? "block" : "hidden"
          }`}
        />

        {!isScanning && (
          <div className="p-8 border-2 border-dashed border-black/10 rounded-xl text-center bg-mist/40">
            <QrCode className="w-10 h-10 text-teal/60 mx-auto mb-2" />
            <p className="text-xs text-muted-text">
              QR kodni skanerlash uchun yuqoridagi <strong>&ldquo;Kamerani yoqish&rdquo;</strong> tugmasini bosing
            </p>
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
          <QrCode className="w-4 h-4 text-teal" />
          <span>Qo&apos;lda token kiritish (Fallback)</span>
        </h2>
        <p className="text-xs text-muted-text">
          Agar kamera ishlamasa yoki skaner qilishning imkoni bo&apos;lmasa, talabaning 32 belgili token kodini kiriting
        </p>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Masalan: a1b2c3d4e5f6..."
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl border border-black/10 bg-mist/50 text-xs font-mono text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal"
          />

          <button
            type="submit"
            disabled={isProcessing || !manualToken.trim()}
            className="px-6 h-11 rounded-xl bg-saffron text-ink hover:bg-saffron-hover text-xs font-heading font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Check-in</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
