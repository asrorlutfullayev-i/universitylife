"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  GraduationCap, 
  Globe, 
  Calendar, 
  FileText, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2,
  Send
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { Opportunity, Application, Profile } from "@/types/database";
import { LoadingState, ErrorState, CountdownBadge, DemoBadge } from "@/components/ui/Feedback";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<Opportunity | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
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

      // Fetch opportunity
      const { data: opp, error: oppErr } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .single();

      if (oppErr || !opp) {
        throw new Error("Dastur topilmadi yoki o'chirilgan.");
      }
      setItem(opp);

      // Check if user already applied
      if (prof) {
        const { data: appData } = await supabase
          .from("applications")
          .select("*")
          .eq("opportunity_id", id)
          .eq("user_id", prof.id)
          .maybeSingle();

        setExistingApp(appData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Ma'lumotni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      setActionMessage(null);
      const supabase = createClient();

      const { data, error: insertErr } = await supabase
        .from("applications")
        .insert({
          user_id: profile.id,
          opportunity_id: id,
          status: "pending",
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === "23505" || insertErr.message.includes("duplicate")) {
          throw new Error("Siz ushbu dasturga allaqachon ariza topshirgansiz.");
        }
        throw new Error(insertErr.message);
      }

      setExistingApp(data);
      setShowApplyModal(false);
      setActionMessage({
        type: "success",
        text: "Arizangiz muvaffaqiyatli qabul qilindi! Holatni Profil bo'limida kuzatishingiz mumkin.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Ariza yuborishda xatolik yuz berdi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Dastur tafsilotlari yuklanmoqda..." />;
  if (error || !item) return <ErrorState message={error || "Dastur topilmadi"} retry={loadData} />;

  const isExpired = new Date(item.deadline).getTime() < new Date().getTime();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha imkoniyatlarga qaytish</span>
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
          <div className="font-medium">{actionMessage.text}</div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-black/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal-light px-3 py-1 rounded-full">
                {item.type === "scholarship" ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Stipendiya</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Xalqaro Dastur</span>
                  </>
                )}
              </span>
              <DemoBadge />
            </div>
            <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
              {item.title}
            </h1>
          </div>

          <div className="self-start">
            <CountdownBadge deadline={item.deadline} />
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal" />
            <span>Dastur haqida</span>
          </h2>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {item.description}
          </p>
        </div>

        {/* Requirements */}
        {item.requirements && (
          <div className="p-4 rounded-xl bg-mist/60 border border-black/5">
            <h2 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Talablar va Hujjatlar</span>
            </h2>
            <p className="text-xs text-muted-text leading-relaxed whitespace-pre-line">
              {item.requirements}
            </p>
          </div>
        )}

        {/* Contact info */}
        {item.contact && (
          <div className="flex items-center gap-3 text-xs text-muted-text p-3 rounded-xl bg-mist/30">
            <Phone className="w-4 h-4 text-teal flex-shrink-0" />
            <span>Aloqa va ma&apos;lumot uchun: <strong className="text-ink">{item.contact}</strong></span>
          </div>
        )}

        {/* Action Bottom Section */}
        <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-text">
            Oxirgi qabul muddati:{" "}
            <strong className="text-ink">
              {new Date(item.deadline).toLocaleDateString("uz-UZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </div>

          <div>
            {existingApp ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-light text-ink text-xs font-bold border border-teal/20">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span>
                  Ariza topshirilgan (Holat:{" "}
                  {existingApp.status === "pending"
                    ? "Ko'rib chiqilmoqda"
                    : existingApp.status === "approved"
                    ? "Qabul qilingan"
                    : "Rad etilgan"}
                  )
                </span>
              </div>
            ) : isExpired ? (
              <button
                disabled
                className="px-6 py-2.5 rounded-full bg-black/10 text-muted-text text-xs font-semibold cursor-not-allowed"
              >
                Qabul muddati tugagan
              </button>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-2.5 rounded-full bg-saffron text-ink hover:bg-saffron-hover text-xs font-heading font-bold shadow-sm transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Ariza topshirish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Ariza topshirish formasi */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-heading font-bold text-base text-ink">
                Ariza topshirish
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-muted-text hover:text-ink text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-text">
              Dastur: <strong className="text-ink">{item.title}</strong>
              <br />
              Talaba: <strong className="text-ink">{profile?.full_name} ({profile?.group_name})</strong>
            </p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Qo&apos;shimcha izoh yoki havola (ixtiyoriy)
                </label>
                <textarea
                  rows={3}
                  placeholder="Yutuqlaringiz, portfoliongiz yoki tavsiyanoma havolasini yozing..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-black/10 text-xs text-ink placeholder:text-muted-text/50 focus:outline-none focus:ring-2 focus:ring-teal bg-mist/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-text hover:text-ink"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-teal text-white hover:bg-teal-hover text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <span>Tasdiqlash va Yuborish</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
