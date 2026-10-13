"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NewsItem } from "@/types/database";
import { LoadingState, EmptyState, ErrorState, DemoBadge } from "@/components/ui/Feedback";
import { formatDate } from "@/lib/utils";

export default function MediaPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: newsErr } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (newsErr) throw newsErr;
      setNews(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Yangiliklarni yuklashda xatolik yuz berdi.");
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
            Media & Yangiliklar
          </h1>
          <DemoBadge />
        </div>
        <p className="text-xs text-muted-text mt-0.5">
          Universitet hayotidagi eng so&apos;nggi voqea va xushxabarlar
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState message="Yangiliklar yuklanmoqda..." />
      ) : error ? (
        <ErrorState message={error} retry={loadNews} />
      ) : news.length === 0 ? (
        <EmptyState
          title="Yangiliklar yo'q"
          description="Hozircha e'lon qilingan maqolalar mavjud emas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/media/${item.id}`}
              className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:border-teal/20 transition flex flex-col group"
            >
              {item.image_url ? (
                <div className="relative aspect-[16/9] w-full bg-mist overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full bg-ink/10 flex items-center justify-center text-teal">
                  <Newspaper className="w-8 h-8" />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-text mb-2">
                    <Calendar className="w-3.5 h-3.5 text-teal" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-ink mb-2 group-hover:text-teal transition line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-text line-clamp-3 leading-relaxed mb-4">
                    {item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-end text-xs font-semibold text-teal">
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    O&apos;qish <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
