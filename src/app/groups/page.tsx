"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Dumbbell, Atom, Clock, ArrowRight, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GroupItem } from "@/types/database";
import { LoadingState, EmptyState, ErrorState, DemoBadge } from "@/components/ui/Feedback";

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "sport" | "science">("all");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, [activeTab]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      let query = supabase
        .from("groups")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (activeTab === "sport") {
        query = query.eq("type", "sport");
      } else if (activeTab === "science") {
        query = query.eq("type", "science");
      }

      const { data, error: grpErr } = await query;
      if (grpErr) throw grpErr;

      setGroups(data || []);

      // Fetch member counts
      const { data: members } = await supabase
        .from("group_members")
        .select("group_id");

      const counts: Record<string, number> = {};
      (members || []).forEach((m: any) => {
        counts[m.group_id] = (counts[m.group_id] || 0) + 1;
      });
      setMemberCounts(counts);
    } catch (err: any) {
      console.error(err);
      setError("To'garaklarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
              Talabalar To&apos;garaklari
            </h1>
          </div>
          <p className="text-xs text-muted-text mt-0.5">
            Sport seksiyalari, ilmiy laboratoriyalar va qiziqish klublari
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-white p-1 rounded-full border border-black/5 self-start shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setActiveTab("science")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "science"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Ilmiy to&apos;garaklar</span>
          </button>
          <button
            onClick={() => setActiveTab("sport")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "sport"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Sport seksiyalari</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState message="To'garaklar yuklanmoqda..." />
      ) : error ? (
        <ErrorState message={error} retry={loadGroups} />
      ) : groups.length === 0 ? (
        <EmptyState
          title="To'garaklar topilmadi"
          description="Hozircha ushbu bo'limda faol to'garaklar mavjud emas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => {
            const memberCount = memberCounts[group.id] || 0;

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm hover:border-teal/20 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal-light px-2.5 py-0.5 rounded-full">
                      {group.type === "sport" ? (
                        <>
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>Sport</span>
                        </>
                      ) : (
                        <>
                          <Atom className="w-3.5 h-3.5" />
                          <span>Ilmiy</span>
                        </>
                      )}
                    </span>

                    <span className="text-xs font-semibold text-muted-text flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal" />
                      <span>{memberCount} a&apos;zo</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-ink mb-2">
                    {group.name}
                  </h3>

                  <p className="text-xs text-muted-text line-clamp-2 mb-4 leading-relaxed">
                    {group.description}
                  </p>

                  {group.schedule && (
                    <div className="flex items-center gap-2 text-xs text-muted-text mb-4">
                      <Clock className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                      <span>{group.schedule}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[11px] text-muted-text">
                    Yetakchi: <strong className="text-ink">{group.leader_name || "Ko'rsatilmagan"}</strong>
                  </span>
                  <Link
                    href={`/groups/${group.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-teal-hover transition"
                  >
                    <span>Batafsil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
