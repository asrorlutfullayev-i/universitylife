"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Award, ArrowRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EventItem } from "@/types/database";
import { LoadingState, EmptyState, ErrorState, DemoBadge } from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/utils";

const CATEGORIES = ["Barchasi", "Texnologiya", "Karyera", "Sport", "Innovatsiya", "Madaniyat"];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      let query = supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: true });

      if (selectedCategory !== "Barchasi") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setEvents(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Tadbirlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
            Universitet Tadbirlari
          </h1>
        </div>
        <p className="text-xs text-muted-text mt-0.5">
          Tadbirlarda qatnashing, QR orqali check-in qiling va XP to&apos;plang
        </p>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-teal text-white shadow-sm"
                : "bg-white text-muted-text hover:text-ink border border-black/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingState message="Tadbirlar ro'yxati yuklanmoqda..." />
      ) : error ? (
        <ErrorState message={error} retry={loadEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Tadbirlar topilmadi"
          description="Ushbu toifada hozircha rejalashtirilgan tadbirlar yo'q."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm hover:border-teal/20 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-teal bg-teal-light px-2.5 py-0.5 rounded-full">
                    {ev.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-saffron bg-saffron-light px-2.5 py-0.5 rounded-full border border-saffron/20 font-sans tabular-nums">
                    <Award className="w-3.5 h-3.5" />
                    <span>+{ev.points} XP</span>
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-ink mb-2">
                  {ev.title}
                </h3>

                <p className="text-xs text-muted-text line-clamp-2 mb-4 leading-relaxed">
                  {ev.description}
                </p>

                <div className="space-y-1.5 text-xs text-muted-text mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                    <span>{formatDateTime(ev.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-teal">
                  QR Check-in orqali ball beriladi
                </span>
                <Link
                  href={`/events/${ev.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-teal-hover transition"
                >
                  <span>Qatnashish</span>
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
