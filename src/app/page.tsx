"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { 
  Search, 
  Trophy, 
  GraduationCap, 
  Calendar, 
  Users, 
  Globe, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  Sparkles,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { Profile, Opportunity, EventItem, GroupItem, LeaderboardEntry } from "@/types/database";
import { LoadingState, ErrorState, CountdownBadge, StarDecoration } from "@/components/ui/Feedback";
import { calculateLevel } from "@/lib/utils";

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Counts
  const [scholarshipCount, setScholarshipCount] = useState<number>(0);
  const [internationalCount, setInternationalCount] = useState<number>(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState<number>(0);
  const [sportClubsCount, setSportClubsCount] = useState<number>(0);

  // Urgent opportunity (Muddati yaqin)
  const [urgentOpportunity, setUrgentOpportunity] = useState<Opportunity | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    opportunities: Opportunity[];
    events: EventItem[];
    groups: GroupItem[];
  }>({ opportunities: [], events: [], groups: [] });
  const [isSearching, setIsSearching] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // 1. Current Profile
      const prof = await getCurrentProfile();
      setProfile(prof);

      if (prof) {
        // Leaderboard rank & points from leaderboard view
        const { data: lbEntry } = await supabase
          .from("leaderboard")
          .select("rank, total_points")
          .eq("user_id", prof.id)
          .maybeSingle();

        if (lbEntry) {
          setUserRank(lbEntry.rank);
          setUserPoints(lbEntry.total_points);
        } else {
          // If view entry not yet formed, calculate from points_log
          const { data: logs } = await supabase
            .from("points_log")
            .select("points")
            .eq("user_id", prof.id);
          const total = (logs || []).reduce((acc: number, curr: any) => acc + (curr.points || 0), 0);
          setUserPoints(total);
          setUserRank(1);
        }
      }

      // 2. Counts
      const { count: sCount } = await supabase
        .from("opportunities")
        .select("*", { count: "exact", head: true })
        .eq("type", "scholarship")
        .eq("is_published", true);
      setScholarshipCount(sCount || 0);

      const { count: iCount } = await supabase
        .from("opportunities")
        .select("*", { count: "exact", head: true })
        .eq("type", "international")
        .eq("is_published", true);
      setInternationalCount(iCount || 0);

      const { count: eCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true)
        .gte("event_date", new Date().toISOString());
      setUpcomingEventsCount(eCount || 0);

      const { count: scCount } = await supabase
        .from("groups")
        .select("*", { count: "exact", head: true })
        .eq("type", "sport")
        .eq("is_published", true);
      setSportClubsCount(scCount || 0);

      // 3. Urgent opportunity: nearest deadline
      const { data: opps } = await supabase
        .from("opportunities")
        .select("*")
        .eq("is_published", true)
        .gte("deadline", new Date().toISOString())
        .order("deadline", { ascending: true })
        .limit(1);

      if (opps && opps.length > 0) {
        setUrgentOpportunity(opps[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Bosh sahifa ma'lumotlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults({ opportunities: [], events: [], groups: [] });
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const supabase = createClient();
      const term = `%${query.trim()}%`;

      const [oppRes, evRes, grpRes] = await Promise.all([
        supabase
          .from("opportunities")
          .select("*")
          .eq("is_published", true)
          .ilike("title", term)
          .limit(4),
        supabase
          .from("events")
          .select("*")
          .eq("is_published", true)
          .ilike("title", term)
          .limit(4),
        supabase
          .from("groups")
          .select("*")
          .eq("is_published", true)
          .ilike("name", term)
          .limit(4),
      ]);

      setSearchResults({
        opportunities: oppRes.data || [],
        events: evRes.data || [],
        groups: grpRes.data || [],
      });
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  if (loading) {
    return <LoadingState message="Bosh sahifa ma'lumotlari tayyorlanmoqda..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
          <Search className="w-4 h-4 stroke-[1.8]" />
        </div>
        <input
          type="text"
          placeholder="Stipendiya, tadbir yoki to'garaklarni qidiring..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-full bg-white border border-black/10 text-ink text-sm placeholder:text-muted-text/60 focus:outline-none focus:ring-2 focus:ring-teal shadow-sm transition"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-muted-text hover:text-ink font-semibold"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searchQuery.trim().length > 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="font-heading font-bold text-sm text-ink flex items-center gap-2">
              <Search className="w-4 h-4 text-teal" />
              <span>&ldquo;{searchQuery}&rdquo; bo&apos;yicha qidiruv natijalari</span>
            </h2>
          </div>

          {searchResults.opportunities.length === 0 &&
          searchResults.events.length === 0 &&
          searchResults.groups.length === 0 ? (
            <p className="text-sm text-muted-text py-4 text-center">
              Hech qanday natija topilmadi. Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Opportunities results */}
              {searchResults.opportunities.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2">
                    Stipendiya va Dasturlar ({searchResults.opportunities.length})
                  </h3>
                  <div className="space-y-2">
                    {searchResults.opportunities.map((item) => (
                      <Link
                        key={item.id}
                        href={`/opportunities/${item.id}`}
                        className="p-3 rounded-xl bg-mist hover:bg-teal-light/40 transition flex items-center justify-between text-sm block"
                      >
                        <span className="font-semibold text-ink truncate pr-2">{item.title}</span>
                        <CountdownBadge deadline={item.deadline} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events results */}
              {searchResults.events.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2">
                    Tadbirlar ({searchResults.events.length})
                  </h3>
                  <div className="space-y-2">
                    {searchResults.events.map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/events/${ev.id}`}
                        className="p-3 rounded-xl bg-mist hover:bg-teal-light/40 transition flex items-center justify-between text-sm block"
                      >
                        <span className="font-semibold text-ink truncate pr-2">{ev.title}</span>
                        <span className="text-xs font-bold text-teal bg-white px-2 py-0.5 rounded-full font-sans tabular-nums">
                          +{ev.points} XP
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups results */}
              {searchResults.groups.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2">
                    To&apos;garaklar ({searchResults.groups.length})
                  </h3>
                  <div className="space-y-2">
                    {searchResults.groups.map((grp) => (
                      <Link
                        key={grp.id}
                        href={`/groups/${grp.id}`}
                        className="p-3 rounded-xl bg-mist hover:bg-teal-light/40 transition flex items-center justify-between text-sm block"
                      >
                        <span className="font-semibold text-ink truncate pr-2">{grp.name}</span>
                        <span className="text-xs text-muted-text capitalize">{grp.type}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD DASHBOARD VIEW */
        <>
          {/* GREETING */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal tracking-wide uppercase">
                Xush kelibsiz!
              </p>
              <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
                {profile?.full_name || profile?.hemis_login || "Talaba"}
              </h1>
              <p className="text-xs text-muted-text mt-0.5">
                {profile?.university} • {profile?.faculty} • {profile?.group_name}
              </p>
            </div>
          </div>

          {/* MAIN BLOCK: Dark ink card with XP (saffron, large), level, progress bar, and "#N reyting" pill */}
          {(() => {
            const levelInfo = calculateLevel(userPoints);
            return (
              <div className="relative overflow-hidden bg-ink text-white rounded-2xl p-6 md:p-8 shadow-md">
                {/* 8-point star faint decoration */}
                <StarDecoration className="absolute -right-4 -bottom-4 md:right-4 md:bottom-2" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                        Faollik (XP)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-saffron border border-saffron/30">
                        {levelInfo.level}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-sans font-bold tabular-nums text-4xl md:text-5xl text-saffron tracking-tight">
                        {userPoints}
                      </span>
                      <span className="text-sm font-semibold text-white/80">XP</span>
                    </div>
                    <p className="text-xs text-white/60 mt-1 max-w-sm">
                      Tadbirlarda QR orqali check-in qiling va XP to&apos;plab yangi darajalarga erishing.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/leaderboard"
                      className="inline-flex items-center gap-2 bg-saffron text-ink px-4 py-2 rounded-full font-bold text-sm hover:bg-saffron-hover transition shadow-sm"
                    >
                      <Trophy className="w-4 h-4 stroke-[2]" />
                      <span>
                        #<span className="font-sans tabular-nums">{userRank ?? 1}</span> reyting
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div className="relative z-10 mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                    <span>
                      Daraja: <strong className="text-white">{levelInfo.level}</strong>
                    </span>
                    {levelInfo.nextLevelPoints ? (
                      <span>
                        Keyingi darajagacha:{" "}
                        <strong className="font-sans tabular-nums text-saffron">
                          {levelInfo.nextLevelPoints - levelInfo.currentPoints} XP
                        </strong>
                      </span>
                    ) : (
                      <span className="text-teal-light font-medium">Maksimal daraja</span>
                    )}
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-saffron h-full rounded-full transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* BELOW HERO: MAX 3 STAT ROWS (grid cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/opportunities?type=scholarship"
              className="bg-white rounded-2xl p-4 border border-black/5 hover:border-teal/30 transition shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-teal mb-2">
                <GraduationCap className="w-5 h-5 stroke-[1.8]" />
                <span className="font-sans font-bold tabular-nums text-xl text-ink">
                  {scholarshipCount}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-text">
                Ochiq stipendiyalar
              </span>
            </Link>

            <Link
              href="/events"
              className="bg-white rounded-2xl p-4 border border-black/5 hover:border-teal/30 transition shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-teal mb-2">
                <Calendar className="w-5 h-5 stroke-[1.8]" />
                <span className="font-sans font-bold tabular-nums text-xl text-ink">
                  {upcomingEventsCount}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-text">
                Kutilayotgan tadbirlar
              </span>
            </Link>

            <Link
              href="/opportunities?type=international"
              className="bg-white rounded-2xl p-4 border border-black/5 hover:border-teal/30 transition shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-teal mb-2">
                <Globe className="w-5 h-5 stroke-[1.8]" />
                <span className="font-sans font-bold tabular-nums text-xl text-ink">
                  {internationalCount}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-text">
                Xalqaro dasturlar
              </span>
            </Link>

            <Link
              href="/groups"
              className="bg-white rounded-2xl p-4 border border-black/5 hover:border-teal/30 transition shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-teal mb-2">
                <Users className="w-5 h-5 stroke-[1.8]" />
                <span className="font-sans font-bold tabular-nums text-xl text-ink">
                  {sportClubsCount}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-text">
                Sport to&apos;garaklari
              </span>
            </Link>
          </div>

          {/* MUDDATI YAQIN CARD WITH SAFFRON BORDER */}
          {urgentOpportunity && (
            <div className="bg-white rounded-2xl border-2 border-saffron p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-saffron uppercase tracking-wider">
                  <Clock className="w-4 h-4 stroke-[2]" />
                  <span>Muddati yaqin</span>
                </span>
                <CountdownBadge deadline={urgentOpportunity.deadline} />
              </div>

              <h3 className="font-heading font-bold text-base text-ink mb-1">
                {urgentOpportunity.title}
              </h3>
              <p className="text-xs text-muted-text line-clamp-2 mb-4">
                {urgentOpportunity.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                <span className="text-xs text-muted-text">
                  Turi: {urgentOpportunity.type === "scholarship" ? "Stipendiya" : "Xalqaro dastur"}
                </span>
                <Link
                  href={`/opportunities/${urgentOpportunity.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-teal-hover"
                >
                  <span>Batafsil ko&apos;rish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
