"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Globe, ArrowRight, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/types/database";
import { LoadingState, EmptyState, ErrorState, CountdownBadge, DemoBadge } from "@/components/ui/Feedback";

function OpportunitiesList() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type"); // "scholarship" | "international" | null

  const [filterType, setFilterType] = useState<string>(initialType || "all");
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialType && (initialType === "scholarship" || initialType === "international")) {
      setFilterType(initialType);
    }
  }, [initialType]);

  useEffect(() => {
    loadOpportunities();
  }, [filterType]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      let query = supabase
        .from("opportunities")
        .select("*")
        .eq("is_published", true)
        .order("deadline", { ascending: true });

      if (filterType === "scholarship") {
        query = query.eq("type", "scholarship");
      } else if (filterType === "international") {
        query = query.eq("type", "international");
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setItems(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Imkoniyatlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
              Stipendiya & Xalqaro Dasturlar
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-muted-text mt-0.5">
            Ochiq tanlovlar, grantlar va almashinuv dasturlari
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-white p-1 rounded-full border border-black/5 self-start shadow-sm">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              filterType === "all"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setFilterType("scholarship")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              filterType === "scholarship"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Stipendiyalar
          </button>
          <button
            onClick={() => setFilterType("international")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              filterType === "international"
                ? "bg-teal text-white shadow-sm"
                : "text-muted-text hover:text-ink"
            }`}
          >
            Xalqaro dasturlar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Stipendiya va grantlar yuklanmoqda..." />
      ) : error ? (
        <ErrorState message={error} retry={loadOpportunities} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Hozircha ochiq dasturlar yo'q"
          description="Ayni paytda ushbu toifadagi arizalar qabuli tugagan yoki hali e'lon qilinmagan."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm hover:border-teal/20 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal-light px-2.5 py-1 rounded-full">
                    {item.type === "scholarship" ? (
                      <>
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Stipendiya</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span>Xalqaro</span>
                      </>
                    )}
                  </span>
                  <CountdownBadge deadline={item.deadline} />
                </div>

                <h3 className="font-heading font-bold text-base text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-text line-clamp-3 mb-4 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="text-[11px] text-muted-text">
                  Muddat: {new Date(item.deadline).toLocaleDateString("uz-UZ")}
                </span>
                <Link
                  href={`/opportunities/${item.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-teal-hover transition"
                >
                  <span>Batafsil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<LoadingState message="Imkoniyatlar sahifasi tayyorlanmoqda..." />}>
      <OpportunitiesList />
    </Suspense>
  );
}
