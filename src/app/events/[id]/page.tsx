"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Clock, 
  Loader2,
  Trash2,
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { EventItem, EventRegistration, Profile } from "@/types/database";
import { LoadingState, ErrorState, DemoBadge } from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const prof = await getCurrentProfile();
      setProfile(prof);

      // Fetch event
      const { data: ev, error: evErr } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (evErr || !ev) {
        throw new Error("Tadbir topilmadi yoki o'chirilgan.");
      }
      setEvent(ev);

      // Check if registered
      if (prof) {
        const { data: reg } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", id)
          .eq("user_id", prof.id)
          .maybeSingle();

        setRegistration(reg);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Tadbir ma'lumotlarini yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!profile) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      setActionMessage(null);
      const supabase = createClient();

      const { data, error: insertErr } = await supabase
        .from("event_registrations")
        .insert({
          user_id: profile.id,
          event_id: id,
        })
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === "23505" || insertErr.message.includes("duplicate")) {
          throw new Error("Siz ushbu tadbirga allaqachon ro'yxatdan o'tgansiz.");
        }
        throw new Error(insertErr.message);
      }

      setRegistration(data);
      setActionMessage({
        type: "success",
        text: "Tabriklaymiz! Siz tadbirga muvaffaqiyatli ro'yxatdan o'tdingiz. Tadbirda Profil sahifasidagi shaxsiy QR kodingizni ko'rsating.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Ro'yxatdan o'tishda xatolik yuz berdi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registration) return;
    if (registration.is_checked_in) {
      setActionMessage({
        type: "error",
        text: "Siz allaqachon tadbirda check-in qilgansiz, bekor qilib bo'lmaydi.",
      });
      return;
    }

    const confirmCancel = window.confirm("Rostdan ham tadbirdan ro'yxatdan o'tishni bekor qilmoqchimisiz?");
    if (!confirmCancel) return;

    try {
      setSubmitting(true);
      setActionMessage(null);
      const supabase = createClient();

      const { error: delErr } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", registration.id);

      if (delErr) throw delErr;

      setRegistration(null);
      setActionMessage({
        type: "success",
        text: "Ro'yxatdan o'tish bekor qilindi.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Bekor qilishda xatolik.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Tadbir tafsilotlari yuklanmoqda..." />;
  if (error || !event) return <ErrorState message={error || "Tadbir topilmadi"} retry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha tadbirlarga qaytish</span>
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
            actionMessage.type === "success"
              ? "bg-teal-light text-ink border-teal/30"
              : "bg-danger-soft text-danger-text border-danger-text/20"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="font-medium leading-relaxed">{actionMessage.text}</div>
        </div>
      )}

      {/* Main Event Card */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-black/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal bg-teal-light px-3 py-1 rounded-full">
                {event.category}
              </span>
            </div>
            <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
              {event.title}
            </h1>
          </div>

          <div className="self-start">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-saffron bg-saffron-light px-3.5 py-1.5 rounded-full border border-saffron/20 font-sans tabular-nums">
              <Award className="w-4 h-4" />
              <span>+{event.points} XP taqdim etiladi</span>
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-mist/50 border border-black/5">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                O&apos;tkazilish vaqti
              </span>
              <span className="text-sm font-semibold text-ink">
                {formatDateTime(event.event_date)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                Manzil
              </span>
              <span className="text-sm font-semibold text-ink">
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2">
            Tadbir haqida batafsil
          </h2>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* REGISTRATION SECTION */}
        <div className="pt-6 border-t border-black/5">
          {registration ? (
            <div className="bg-mist/60 rounded-2xl p-6 border border-black/5 flex flex-col items-center text-center max-w-md mx-auto">
              {registration.is_checked_in ? (
                <div className="w-full">
                  <div className="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-ink mb-1">
                    Ishtirok tasdiqlangan!
                  </h3>
                  <p className="text-xs text-muted-text mb-2">
                    Siz ushbu tadbirda ishtirok etdingiz va ball hisobingizga qo&apos;shildi.
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full bg-teal text-white text-xs font-bold font-sans tabular-nums">
                    +{event.points} XP qo&apos;shildi
                  </span>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-light text-teal flex items-center justify-center mx-auto mb-1 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-ink">
                    Siz ro&apos;yxatdan o&apos;tgansiz!
                  </h3>

                  <div className="p-4 bg-white rounded-xl border border-black/5 text-xs text-muted-text space-y-2">
                    <p className="font-semibold text-ink text-sm">
                      Tadbirda Profil sahifasidagi shaxsiy QR kodingizni ko&apos;rsating.
                    </p>
                    <p>
                      Admin shaxsiy QR kodingizni skaner qilganda sizga{" "}
                      <strong className="text-teal font-sans tabular-nums font-semibold">+{event.points} XP</strong> beriladi.
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal text-white text-xs font-semibold hover:bg-teal-hover transition shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Shaxsiy QR kodimni ko&apos;rish</span>
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={handleCancelRegistration}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 text-xs text-danger-text hover:underline pt-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ro&apos;yxatdan o&apos;tishni bekor qilish</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-text">
                  Tadbirda ishtirok etish uchun oldindan ro&apos;yxatdan o&apos;ting.
                </p>
              </div>

              <button
                onClick={handleRegister}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-saffron text-ink hover:bg-saffron-hover text-xs font-heading font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ro&apos;yxatdan o&apos;tilmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tadbirga ro&apos;yxatdan o&apos;tish</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
