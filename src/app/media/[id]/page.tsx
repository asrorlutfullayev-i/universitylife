"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Share2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NewsItem } from "@/types/database";
import { LoadingState, ErrorState, DemoBadge } from "@/components/ui/Feedback";
import { formatDate } from "@/lib/utils";

export default function MediaDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadNews();
    }
  }, [id]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: newsErr } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (newsErr || !data) {
        throw new Error("Yangilik topilmadi yoki o'chirilgan.");
      }
      setNews(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Yangilikni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <LoadingState message="Maqola yuklanmoqda..." />;
  if (error || !news) return <ErrorState message={error || "Yangilik topilmadi"} retry={loadNews} />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/media"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha yangiliklarga qaytish</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-hover bg-white px-3 py-1.5 rounded-full border border-black/5 shadow-sm transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "Nusxalandi!" : "Ulashish"}</span>
        </button>
      </div>

      <article className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-text">
              <Calendar className="w-3.5 h-3.5 text-teal" />
              <span>{formatDate(news.created_at)}</span>
            </span>
          </div>

          <h1 className="font-heading font-bold text-xl md:text-2xl text-ink leading-snug">
            {news.title}
          </h1>
        </div>

        {news.image_url && (
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-mist shadow-sm">
            <Image
              src={news.image_url}
              alt={news.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        )}

        <div className="text-sm text-ink leading-relaxed whitespace-pre-line space-y-4">
          {news.content}
        </div>
      </article>
    </div>
  );
}
