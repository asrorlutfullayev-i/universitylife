"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  Newspaper, 
  FileText, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoadingState, DemoBadge } from "@/components/ui/Feedback";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    opportunities: 0,
    events: 0,
    groups: 0,
    news: 0,
    pendingApps: 0,
    checkins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const [oppRes, evRes, grpRes, newsRes, appRes, checkRes] = await Promise.all([
        supabase.from("opportunities").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("is_checked_in", true),
      ]);

      setStats({
        opportunities: oppRes.count || 0,
        events: evRes.count || 0,
        groups: grpRes.count || 0,
        news: newsRes.count || 0,
        pendingApps: appRes.count || 0,
        checkins: checkRes.count || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ADMIN_MODULES = [
    {
      title: "XP berish (QR Skaner)",
      desc: "Tadbirda talabalar shaxsiy QR kodini skanerlash va XP berish",
      href: "/admin/checkin",
      icon: QrCode,
      badge: `${stats.checkins} marta berilgan`,
      highlight: true,
    },
    {
      title: "Talabalar Arizalari",
      desc: "Stipendiya va dasturlar arizalarini tasdiqlash yoki rad etish",
      href: "/admin/applications",
      icon: FileText,
      badge: `${stats.pendingApps} kutilmoqda`,
      highlight: stats.pendingApps > 0,
    },
    {
      title: "Stipendiyalar & Dasturlar",
      desc: "Yangi stipendiyalar va xalqaro dasturlar qo'shish, muddatlarni belgilash",
      href: "/admin/opportunities",
      icon: GraduationCap,
      badge: `${stats.opportunities} ta`,
    },
    {
      title: "Tadbirlar",
      desc: "Universitet tadbirlari, sana, manzil va XP larni boshqarish",
      href: "/admin/events",
      icon: Calendar,
      badge: `${stats.events} ta`,
    },
    {
      title: "To'garaklar",
      desc: "Sport va ilmiy seksiyalar, mashg'ulot jadvallari",
      href: "/admin/groups",
      icon: Users,
      badge: `${stats.groups} ta`,
    },
    {
      title: "Yangiliklar",
      desc: "Portalda yangiliklar va maqolalar nashr etish",
      href: "/admin/news",
      icon: Newspaper,
      badge: `${stats.news} ta`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-teal text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
              Administrator Boshqaruvi
            </h1>
          </div>
          <p className="text-xs text-muted-text mt-0.5">
            Portal ma&apos;lumotlarini to&apos;liq nazorat qilish va yangilash
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ADMIN_MODULES.map((mod) => {
          const Icon = mod.icon;

          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between hover:shadow-md ${
                mod.highlight
                  ? "border-saffron/40 hover:border-saffron"
                  : "border-black/5 hover:border-teal/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      mod.highlight ? "bg-saffron/20 text-ink" : "bg-teal-light text-teal"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      mod.highlight
                        ? "bg-saffron text-ink font-bold"
                        : "bg-mist text-muted-text"
                    }`}
                  >
                    {mod.badge}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-ink mb-1">
                  {mod.title}
                </h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-teal">
                <span>Boshqarish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
