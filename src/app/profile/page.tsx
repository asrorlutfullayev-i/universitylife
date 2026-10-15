"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { 
  User, 
  Trophy, 
  FileText, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Award, 
  ExternalLink, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  X,
  History,
  AlertCircle,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { Profile, Application, EventRegistration, GroupMember, PointsLog } from "@/types/database";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/Feedback";
import { formatDate, formatDateTime, calculateLevel } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [personalQrToken, setPersonalQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);

  const [applications, setApplications] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsLog[]>([]);

  const [activeTab, setActiveTab] = useState<"apps" | "events" | "groups" | "points">("apps");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const prof = await getCurrentProfile();
      if (!prof) {
        setError("Foydalanuvchi ma'lumotlari topilmadi");
        setLoading(false);
        return;
      }
      setProfile(prof);

      // Load personal QR token via RPC
      try {
        setQrLoading(true);
        const { data: token, error: qrErr } = await supabase.rpc("my_qr_token");
        if (qrErr) throw qrErr;
        setPersonalQrToken(token);
      } catch (qErr: any) {
        console.error("QR token error:", qErr);
        setQrError("Shaxsiy QR kodni yuklab bo'lmadi.");
      } finally {
        setQrLoading(false);
      }

      // 1. Applications with opportunity info
      const { data: apps } = await supabase
        .from("applications")
        .select("*, opportunity:opportunities(*)")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });
      setApplications(apps || []);

      // 2. Event Registrations with event info
      const { data: regs } = await supabase
        .from("event_registrations")
        .select("*, event:events(*)")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });
      setEventRegistrations(regs || []);

      // 3. Groups joined
      const { data: grps } = await supabase
        .from("group_members")
        .select("*, group:groups(*)")
        .eq("user_id", prof.id)
        .order("joined_at", { ascending: false });
      setMyGroups(grps || []);

      // 4. Points logs
      const { data: logs } = await supabase
        .from("points_log")
        .select("*, event:events(title)")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });
      setPointsHistory(logs || []);

      // Total points
      const sum = (logs || []).reduce((acc: number, curr: any) => acc + (curr.points || 0), 0);
      setTotalPoints(sum);
    } catch (err: any) {
      console.error(err);
      setError("Profil ma'lumotlarini yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Profil yuklanmoqda..." />;
  if (error || !profile) return <ErrorState message={error || "Profil topilmadi"} retry={loadProfileData} />;

  const levelInfo = calculateLevel(totalPoints);

  return (
    <div className="space-y-6">
      {/* 1. SHAXSIY QR KOD KARTA (AT THE TOP) */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mist text-teal text-xs font-semibold mb-3">
          <QrCode className="w-4 h-4" />
          <span>Shaxsiy QR kod</span>
        </div>
        <h2 className="font-heading font-bold text-lg md:text-xl text-ink mb-1">
          Talaba identifikatori
        </h2>
        <p className="text-xs text-muted-text max-w-md mb-6">
          Tadbirda yoki to&apos;garakda shu kodni admin skanerlaydi va sizga XP beradi.
        </p>

        {qrLoading ? (
          <div className="w-[240px] h-[240px] flex flex-col items-center justify-center bg-mist/50 rounded-2xl border border-black/5">
            <Loader2 className="w-8 h-8 text-teal animate-spin mb-2" />
            <span className="text-xs text-muted-text">QR kod yuklanmoqda...</span>
          </div>
        ) : qrError || !personalQrToken ? (
          <div className="w-[240px] h-[240px] flex flex-col items-center justify-center bg-danger-soft/40 rounded-2xl border border-danger-text/20 p-4">
            <AlertCircle className="w-8 h-8 text-danger-text mb-2" />
            <span className="text-xs text-danger-text text-center">{qrError || "QR kod topilmadi"}</span>
          </div>
        ) : (
          <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-sm inline-block">
            <QRCodeSVG
              value={personalQrToken}
              size={240}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#151230"
            />
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-heading font-bold text-base text-ink">
            {profile.full_name}
          </h3>
          <p className="text-xs text-muted-text mt-0.5">
            {profile.university} • {profile.faculty}
          </p>
        </div>
      </div>

      {/* 2. Header Profile Card */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal text-white flex items-center justify-center font-heading font-bold text-2xl shadow-sm flex-shrink-0">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-xl text-ink">
                  {profile.full_name}
                </h1>
                {profile.role === "admin" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal text-white px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-light text-teal border border-teal/20">
                  {levelInfo.level}
                </span>
              </div>

              {/* TODO: rename to username after launch */}
              <p className="text-xs text-muted-text mt-1">
                Foydalanuvchi nomi: <strong className="text-ink">{profile.hemis_login}</strong> • {profile.group_name}
              </p>
              <p className="text-xs text-muted-text mt-0.5">
                {profile.university} • {profile.faculty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-mist p-3 rounded-2xl border border-black/5 text-right px-5">
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                Umumiy XP
              </span>
              <span className="font-sans font-bold tabular-nums text-2xl text-saffron">
                {totalPoints} XP
              </span>
            </div>

            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-full bg-ink text-white hover:bg-ink-dark text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-saffron" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Level Progress Bar on Profile */}
        <div className="mt-5 pt-4 border-t border-black/5">
          <div className="flex items-center justify-between text-xs text-muted-text mb-1.5">
            <span>
              Daraja: <strong className="text-ink font-semibold">{levelInfo.level}</strong>
            </span>
            {levelInfo.nextLevelPoints ? (
              <span>
                Keyingi darajagacha:{" "}
                <strong className="font-sans tabular-nums text-teal font-semibold">
                  {levelInfo.nextLevelPoints - levelInfo.currentPoints} XP
                </strong>
              </span>
            ) : (
              <span className="text-teal font-semibold">Maksimal daraja</span>
            )}
          </div>
          <div className="w-full bg-mist rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-teal h-full rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("apps")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === "apps"
              ? "bg-teal text-white shadow-sm"
              : "bg-white text-muted-text hover:text-ink border border-black/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Arizalarim ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === "events"
              ? "bg-teal text-white shadow-sm"
              : "bg-white text-muted-text hover:text-ink border border-black/5"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Tadbirlarim ({eventRegistrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === "groups"
              ? "bg-teal text-white shadow-sm"
              : "bg-white text-muted-text hover:text-ink border border-black/5"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>To&apos;garaklarim ({myGroups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("points")}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === "points"
              ? "bg-teal text-white shadow-sm"
              : "bg-white text-muted-text hover:text-ink border border-black/5"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>XP tarixi ({pointsHistory.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: ARIZALAR */}
      {activeTab === "apps" && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <EmptyState
              title="Arizalar mavjud emas"
              description="Siz hali hech qanday stipendiya yoki xalqaro dasturga ariza topshirmagansiz."
            />
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-black/5 p-4 md:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-teal capitalize">
                      {app.opportunity?.type === "scholarship" ? "Stipendiya" : "Xalqaro dastur"}
                    </span>
                    <span className="text-[11px] text-muted-text">• {formatDate(app.created_at)}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-ink">
                    {app.opportunity?.title || "Dastur"}
                  </h3>
                  {app.notes && (
                    <p className="text-xs text-muted-text mt-1 italic">&ldquo;{app.notes}&rdquo;</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === "approved"
                        ? "bg-teal-light text-ink border border-teal/20"
                        : app.status === "rejected"
                        ? "bg-danger-soft text-danger-text"
                        : "bg-saffron-light text-ink border border-saffron/20"
                    }`}
                  >
                    {app.status === "approved"
                      ? "Qabul qilingan"
                      : app.status === "rejected"
                      ? "Rad etilgan"
                      : "Ko'rib chiqilmoqda"}
                  </span>

                  {app.opportunity && (
                    <Link
                      href={`/opportunities/${app.opportunity.id}`}
                      className="p-1.5 rounded-full text-muted-text hover:text-ink hover:bg-mist transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: TADBIRLAR & QR */}
      {activeTab === "events" && (
        <div className="space-y-3">
          {eventRegistrations.length === 0 ? (
            <EmptyState
              title="Ro'yxatdan o'tilgan tadbirlar yo'q"
              description="Tadbirlar bo'limidan qiziqarli uchrashuvlarni tanlab, ro'yxatdan o'ting."
            />
          ) : (
            eventRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-black/5 p-4 md:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-teal">
                      {reg.event?.category}
                    </span>
                    <span className="text-[11px] text-muted-text">
                      • {reg.event?.event_date ? formatDateTime(reg.event.event_date) : ""}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-ink">
                    {reg.event?.title || "Tadbir"}
                  </h3>
                  <p className="text-xs text-muted-text mt-0.5">
                    Manzil: {reg.event?.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {reg.is_checked_in ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-light text-teal border border-teal/20 flex items-center gap-1 font-sans tabular-nums">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Check-in qilingan (+{reg.event?.points} XP)</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-mist text-muted-text border border-black/5">
                      Ro&apos;yxatdan o&apos;tilgan
                    </span>
                  )}

                  {reg.event && (
                    <Link
                      href={`/events/${reg.event.id}`}
                      className="p-2 rounded-full text-muted-text hover:text-ink hover:bg-mist transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: TO'GARAKLAR */}
      {activeTab === "groups" && (
        <div className="space-y-3">
          {myGroups.length === 0 ? (
            <EmptyState
              title="To'garaklar yo'q"
              description="Siz hali hech qaysi to'garakka a'zo bo'lmagansiz."
            />
          ) : (
            myGroups.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-black/5 p-4 md:p-5 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-semibold text-teal capitalize block mb-0.5">
                    {item.group?.type === "sport" ? "Sport seksiyasi" : "Ilmiy to'garak"}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-ink">
                    {item.group?.name}
                  </h3>
                  <p className="text-xs text-muted-text mt-0.5">
                    Vaqti: {item.group?.schedule || "Kelishilgan"}
                  </p>
                </div>

                {item.group && (
                  <Link
                    href={`/groups/${item.group.id}`}
                    className="px-4 py-1.5 rounded-full bg-mist hover:bg-teal-light text-xs font-semibold text-ink transition"
                  >
                    Batafsil
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: BALLAR TARIXI */}
      {activeTab === "points" && (
        <div className="space-y-3">
          {pointsHistory.length === 0 ? (
            <EmptyState
              title="XP tarixi bo'sh"
              description="Tadbirlarda qatnashing va shaxsiy QR kodingiz orqali faollik XP lariga ega bo'ling."
            />
          ) : (
            pointsHistory.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-sm text-ink">
                    {log.reason}
                  </h3>
                  <span className="text-[11px] text-muted-text">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>

                <div className="font-sans font-bold tabular-nums text-sm text-saffron bg-saffron-light px-3 py-1 rounded-full border border-saffron/20">
                  +{log.points} XP
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
