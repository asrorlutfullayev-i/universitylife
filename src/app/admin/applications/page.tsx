"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Loader2, 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("applications")
        .select(`
          *,
          opportunity:opportunities(title, type),
          profile:profiles(full_name, hemis_login, university, faculty, group_name)
        `)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: appErr } = await query;
      if (appErr) throw appErr;

      setApplications(data || []);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", text: "Arizalarni yuklashda xatolik yuz berdi." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: "approved" | "rejected") => {
    try {
      setActionId(appId);
      const supabase = createClient();

      const { error: updErr } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (updErr) throw updErr;

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setFeedback({
        type: "success",
        text: newStatus === "approved" ? "Ariza muvaffaqiyatli tasdiqlandi!" : "Ariza rad etildi.",
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Holatni o'zgartirishda xatolik." });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-ink mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin panelga qaytish</span>
          </Link>
          <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
            Talabalar Arizalari
          </h1>
          <p className="text-xs text-muted-text">
            Stipendiya va xalqaro dasturlarga yuborilgan arizalarni baholash
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-white p-1 rounded-full border border-black/5 self-start shadow-sm">
          <button
            onClick={() => setFilter("pending")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "pending"
                ? "bg-saffron text-ink font-bold shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Kutilayotgan
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "approved"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Tasdiqlangan
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "rejected"
                ? "bg-danger-soft text-danger-text font-bold shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Rad etilgan
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === "all"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Barchasi
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-teal-light text-ink border-teal/20"
              : "bg-danger-soft text-danger-text border-danger-text/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-teal" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-text">Yuklanmoqda...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-sm text-muted-text">
          Ushbu holatda arizalar mavjud emas.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-teal uppercase tracking-wider block">
                    {app.opportunity?.type === "scholarship" ? "Stipendiya tanlovi" : "Xalqaro dastur"}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-ink">
                    {app.opportunity?.title || "Dastur"}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      app.status === "approved"
                        ? "bg-teal-light text-teal border border-teal/20"
                        : app.status === "rejected"
                        ? "bg-danger-soft text-danger-text"
                        : "bg-saffron-light text-ink border border-saffron/20"
                    }`}
                  >
                    {app.status === "approved"
                      ? "Tasdiqlangan"
                      : app.status === "rejected"
                      ? "Rad etilgan"
                      : "Kutilmoqda"}
                  </span>
                  <span className="text-[11px] text-muted-text">{formatDate(app.created_at)}</span>
                </div>
              </div>

              {/* Student details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-mist/50 border border-black/5">
                <div>
                  <span className="text-muted-text block">Talaba:</span>
                  <strong className="text-ink font-semibold">
                    {app.profile?.full_name} ({app.profile?.hemis_login})
                  </strong>
                </div>
                <div>
                  <span className="text-muted-text block">Fakultet / Guruh:</span>
                  <strong className="text-ink font-semibold">
                    {app.profile?.faculty} • {app.profile?.group_name}
                  </strong>
                </div>
              </div>

              {app.notes && (
                <div className="text-xs text-ink bg-mist/30 p-3 rounded-xl border border-black/5">
                  <span className="font-semibold text-muted-text block mb-0.5">Talaba izohi:</span>
                  <p className="whitespace-pre-line">{app.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {app.status !== "approved" && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, "approved")}
                    disabled={actionId === app.id}
                    className="px-4 py-1.5 rounded-full bg-teal text-white hover:bg-teal-hover text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {actionId === app.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Tasdiqlash</span>
                  </button>
                )}

                {app.status !== "rejected" && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, "rejected")}
                    disabled={actionId === app.id}
                    className="px-4 py-1.5 rounded-full bg-danger-soft text-danger-text hover:bg-danger-soft/80 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {actionId === app.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>Rad etish</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
