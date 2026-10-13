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
  History
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { Profile, Application, EventRegistration, GroupMember, PointsLog } from "@/types/database";
import { LoadingState, EmptyState, ErrorState, DemoBadge } from "@/components/ui/Feedback";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsLog[]>([]);

  // Selected QR modal
  const [activeQr, setActiveQr] = useState<{ token: string; title: string } | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
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
                <DemoBadge />
              </div>

              <p className="text-xs text-muted-text mt-0.5">
                HEMIS: <strong className="text-ink">{profile.hemis_login}</strong> • {profile.group_name}
              </p>
              <p className="text-xs text-muted-text">
                {profile.university} • {profile.faculty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-mist p-3 rounded-2xl border border-black/5 text-right px-5">
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                Umumiy Ballar
              </span>
              <span className="font-heading font-bold text-2xl text-saffron">
                {totalPoints} ball
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
          <span>Tadbirlarim & QR ({eventRegistrations.length})</span>
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
          <span>Ballar tarixi ({pointsHistory.length})</span>
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
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-light text-teal border border-teal/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Check-in qilingan (+{reg.event?.points} ball)</span>
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        setActiveQr({
                          token: reg.qr_token,
                          title: reg.event?.title || "Tadbir chiptasi",
                        })
                      }
                      className="px-4 py-2 rounded-full bg-saffron text-ink hover:bg-saffron-hover text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>QR Chipta</span>
                    </button>
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
              title="Ballar tarixi bo'sh"
              description="Tadbirlarda qatnashing va QR check-in orqali faollik ballariga ega bo'ling."
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

                <div className="font-heading font-bold text-sm text-saffron bg-saffron-light px-3 py-1 rounded-full border border-saffron/20">
                  +{log.points} ball
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QR MODAL */}
      {activeQr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-black/10 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-heading font-bold text-sm text-ink truncate pr-2">
                {activeQr.title}
              </h3>
              <button
                onClick={() => setActiveQr(null)}
                className="text-muted-text hover:text-ink text-sm font-semibold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block shadow-sm border border-black/5 mx-auto">
              <QRCodeSVG
                value={activeQr.token}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div>
              <p className="text-[11px] font-mono text-muted-text break-all">
                Token: <strong className="text-ink">{activeQr.token}</strong>
              </p>
              <p className="text-xs text-muted-text mt-2">
                Tadbirga kirishda ushbu QR kodni admin yoki nazoratchiga ko&apos;rsating.
              </p>
            </div>

            <button
              onClick={() => setActiveQr(null)}
              className="w-full py-2 rounded-full bg-teal text-white text-xs font-semibold hover:bg-teal-hover transition"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
