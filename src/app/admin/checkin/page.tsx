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
  PlayCircle,
  Calendar,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Html5Qrcode } from "html5-qrcode";
import type { EventItem } from "@/types/database";

interface AwardResult {
  success: boolean;
  message: string;
  student?: string;
  faculty?: string;
  points?: number;
  total?: number;
  event_title?: string;
}

export default function AdminCheckinPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [manualToken, setManualToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AwardResult | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ token: string; time: number }>({ token: "", time: 0 });
  const selectedEventIdRef = useRef<string>("");

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  useEffect(() => {
    loadEvents();
    return () => {
      // Cleanup camera scanner on unmount
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
      }
    };
  }, []);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err: any) {
      console.error("Tadbirlarni yuklashda xatolik:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const processAward = async (token: string, eventId: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    if (!eventId) {
      setResult({
        success: false,
        message: "Iltimos, avval faollikni (tadbirni) tanlang.",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const supabase = createClient();

      const { data, error } = await supabase.rpc("award_points", {
        p_token: cleanToken,
        p_event_id: eventId,
      });

      if (error) throw error;

      if (data && typeof data === "object") {
        setResult({
          success: Boolean(data.success),
          message: data.message || (data.success ? "XP muvaffaqiyatli berildi!" : "Xatolik yuz berdi"),
          student: data.student,
          faculty: data.faculty,
          points: data.points,
          total: data.total,
          event_title: data.event_title,
        });
      } else {
        setResult({
          success: true,
          message: "XP berildi!",
        });
      }
    } catch (err: any) {
      console.error("award_points error:", err);
      setResult({
        success: false,
        message: err?.message || "XP berish jarayonida xatolik yuz berdi.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startScanner = async () => {
    if (!selectedEventIdRef.current) {
      setResult({
        success: false,
        message: "Kamerani yoqishdan oldin faollikni tanlang.",
      });
      return;
    }

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
          const now = Date.now();
          // Ignore repeated scans of the same code for 3 seconds
          if (
            lastScannedRef.current.token === decodedText &&
            now - lastScannedRef.current.time < 3000
          ) {
            return;
          }
          lastScannedRef.current = { token: decodedText, time: now };

          // Keep scanner running for next student!
          await processAward(decodedText, selectedEventIdRef.current);
        },
        () => {
          // Frame scan error ignored
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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await processAward(manualToken, selectedEventId);
    setManualToken("");
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

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
          XP berish
        </h1>
        <p className="text-xs text-muted-text">
          Tadbir yoki to&apos;garak uchun talabaning shaxsiy QR kodini skanerlab XP bering
        </p>
      </div>

      {/* 1. Faollikni tanlash (Dropdown) */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-3">
        <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
          Faollikni tanlang (Tadbir)
        </label>

        {loadingEvents ? (
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <Loader2 className="w-4 h-4 animate-spin text-teal" />
            <span>Tadbirlar ro&apos;yxati yuklanmoqda...</span>
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs text-danger-text">
            Hech qanday tadbir topilmadi. Avval tadbirlar bo&apos;limida tadbir yarating.
          </p>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-black/10 bg-mist/50 text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} (+{ev.points} XP)
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div className="flex items-center justify-between text-xs text-muted-text px-1">
                <span>Belgilangan ball:</span>
                <span className="font-sans font-bold tabular-nums text-teal bg-teal-light px-2.5 py-0.5 rounded-full">
                  +{selectedEvent.points} XP
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Natija kartasi (Result Card) */}
      {result && (
        <div
          className={`p-5 rounded-2xl border shadow-sm transition flex flex-col items-center text-center space-y-3 ${
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

          <div>
            <h3 className="font-heading font-bold text-base">
              {result.success ? "XP muvaffaqiyatli berildi!" : "Xatolik"}
            </h3>
            <p className="text-sm font-medium mt-0.5">{result.message}</p>
          </div>

          {result.success && result.student && (
            <div className="bg-white/80 rounded-xl p-3 border border-teal/20 w-full max-w-sm text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-text">Talaba:</span>
                <strong className="text-ink">{result.student}</strong>
              </div>
              {result.faculty && (
                <div className="flex justify-between">
                  <span className="text-muted-text">Fakultet:</span>
                  <span className="text-ink">{result.faculty}</span>
                </div>
              )}
              {result.event_title && (
                <div className="flex justify-between">
                  <span className="text-muted-text">Faollik:</span>
                  <span className="text-ink truncate max-w-[200px]">{result.event_title}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-black/5">
                <span className="text-muted-text">Berilgan XP:</span>
                <strong className="text-teal font-sans font-bold tabular-nums">+{result.points} XP</strong>
              </div>
              {result.total !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-text">Talabaning umumiy XP:</span>
                  <strong className="text-saffron font-sans font-bold tabular-nums">{result.total} XP</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Camera Scanner Block */}
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
              disabled={!selectedEventId}
              className="px-4 py-1.5 rounded-full bg-teal text-white hover:bg-teal-hover text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
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
              Faollikni tanlab, <strong>&ldquo;Kamerani yoqish&rdquo;</strong> tugmasini bosing. Skaner uzluksiz ishlaydi.
            </p>
          </div>
        )}
      </div>

      {/* 4. Manual Input Fallback */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-3">
        <h2 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
          <QrCode className="w-4 h-4 text-teal" />
          <span>Qo&apos;lda token kiritish (Fallback)</span>
        </h2>
        <p className="text-xs text-muted-text">
          Kameradan foydalanish imkoni bo&apos;lmasa, talabaning shaxsiy QR tokenini kiriting
        </p>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Masalan: 3f8a4e..."
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl border border-black/10 bg-mist/50 text-xs font-mono text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal"
          />

          <button
            type="submit"
            disabled={isProcessing || !manualToken.trim() || !selectedEventId}
            className="px-6 h-11 rounded-xl bg-saffron text-ink hover:bg-saffron-hover text-xs font-heading font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>XP berish</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
