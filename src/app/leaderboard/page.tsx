"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, User, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { LeaderboardEntry, Profile } from "@/types/database";
import { LoadingState, EmptyState, ErrorState, DemoBadge } from "@/components/ui/Feedback";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const prof = await getCurrentProfile();
      setCurrentUser(prof);

      // Read directly from the leaderboard view (top 20)
      const { data, error: lbErr } = await supabase
        .from("leaderboard")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(20);

      if (lbErr) throw lbErr;
      setLeaderboard(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Reyting ma'lumotlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-saffron text-ink font-heading font-bold text-sm flex items-center justify-center shadow-sm">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-slate-200 text-ink font-heading font-bold text-sm flex items-center justify-center shadow-sm">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-heading font-bold text-sm flex items-center justify-center shadow-sm">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-full bg-mist text-muted-text font-heading font-bold text-xs flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
            Talabalar Faollik Reytingi
          </h1>
          <DemoBadge />
        </div>
        <p className="text-xs text-muted-text mt-0.5">
          Universitet bo&apos;yicha eng faol top-20 talabalar ro&apos;yxati
        </p>
      </div>

      {loading ? (
        <LoadingState message="Reyting hisoblanmoqda..." />
      ) : error ? (
        <ErrorState message={error} retry={loadLeaderboard} />
      ) : leaderboard.length === 0 ? (
        <EmptyState
          title="Reyting bo'sh"
          description="Hozircha hech qaysi talaba faollik ballariga ega emas."
        />
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((entry, index) => {
            const isMe = currentUser?.id === entry.user_id;

            return (
              <div
                key={entry.user_id || index}
                className={`rounded-2xl p-4 transition flex items-center justify-between gap-3 shadow-sm ${
                  isMe
                    ? "bg-teal-light border-2 border-teal shadow-md"
                    : "bg-white border border-black/5"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {getRankBadge(entry.rank || index + 1)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-sm text-ink truncate">
                        {entry.full_name}
                      </h3>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal text-white">
                          Siz
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-text truncate">
                      {entry.faculty} • {entry.group_name}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-heading font-bold text-base md:text-lg text-saffron block leading-none">
                    {entry.total_points}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-text">ball</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
