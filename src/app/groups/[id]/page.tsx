"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Dumbbell, 
  Atom, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  UserMinus, 
  Loader2,
  Users
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth";
import type { GroupItem, Profile, GroupMember } from "@/types/database";
import { LoadingState, ErrorState, DemoBadge } from "@/components/ui/Feedback";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [group, setGroup] = useState<GroupItem | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const prof = await getCurrentProfile();
      setProfile(prof);

      // Fetch group
      const { data: grp, error: grpErr } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .single();

      if (grpErr || !grp) {
        throw new Error("To'garak topilmadi yoki o'chirilgan.");
      }
      setGroup(grp);

      // Fetch members count
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", id);
      setMemberCount(count || 0);

      // Check membership
      if (prof) {
        const { data: memberData } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", id)
          .eq("user_id", prof.id)
          .maybeSingle();

        setIsMember(!!memberData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "To'garak ma'lumotlarini yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!profile) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      setActionMessage(null);
      const supabase = createClient();

      const { error: joinErr } = await supabase
        .from("group_members")
        .insert({
          user_id: profile.id,
          group_id: id,
        });

      if (joinErr) {
        if (joinErr.code === "23505" || joinErr.message.includes("duplicate")) {
          throw new Error("Siz ushbu to'garakka allaqachon a'zosiz.");
        }
        throw new Error(joinErr.message);
      }

      setIsMember(true);
      setMemberCount((prev) => prev + 1);
      setActionMessage({
        type: "success",
        text: "Tabriklaymiz! Siz to'garakka muvaffaqiyatli a'zo bo'ldingiz.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "A'zo bo'lishda xatolik.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!profile) return;
    const confirmLeave = window.confirm("Rostdan ham to'garakdan chiqmoqchimisiz?");
    if (!confirmLeave) return;

    try {
      setSubmitting(true);
      setActionMessage(null);
      const supabase = createClient();

      const { error: leaveErr } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", id)
        .eq("user_id", profile.id);

      if (leaveErr) throw leaveErr;

      setIsMember(false);
      setMemberCount((prev) => Math.max(0, prev - 1));
      setActionMessage({
        type: "success",
        text: "Siz to'garak a'zoligidan chiqdingiz.",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "To'garakdan chiqishda xatolik.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="To'garak tafsilotlari yuklanmoqda..." />;
  if (error || !group) return <ErrorState message={error || "To'garak topilmadi"} retry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-text hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha to&apos;garaklarga qaytish</span>
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
            actionMessage.type === "success"
              ? "bg-teal-light text-ink border-teal/30"
              : "bg-danger-soft text-danger-text border-danger-text/20"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="font-medium leading-relaxed">{actionMessage.text}</div>
        </div>
      )}

      {/* Main Group Card */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-black/5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal-light px-3 py-1 rounded-full">
                {group.type === "sport" ? (
                  <>
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Sport seksiyasi</span>
                  </>
                ) : (
                  <>
                    <Atom className="w-3.5 h-3.5" />
                    <span>Ilmiy to&apos;garak</span>
                  </>
                )}
              </span>
              <DemoBadge />
            </div>

            <h1 className="font-heading font-bold text-xl md:text-2xl text-ink">
              {group.name}
            </h1>
          </div>

          <div className="self-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink bg-mist px-3 py-1.5 rounded-full border border-black/5">
              <Users className="w-4 h-4 text-teal" />
              <span>{memberCount} nafar a&apos;zo</span>
            </span>
          </div>
        </div>

        {/* Schedule & Leader Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-mist/50 border border-black/5">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                Mashg&apos;ulotlar vaqti
              </span>
              <span className="text-sm font-semibold text-ink">
                {group.schedule || "Muntazam kelishilgan holda"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-muted-text uppercase tracking-wider block">
                To&apos;garak rahbari
              </span>
              <span className="text-sm font-semibold text-ink">
                {group.leader_name || "Belgilanmagan"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold text-muted-text uppercase tracking-wider mb-2">
            To&apos;garak haqida
          </h2>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {group.description}
          </p>
        </div>

        {/* Contact info */}
        {group.contact && (
          <div className="flex items-center gap-3 text-xs text-muted-text p-3 rounded-xl bg-mist/30">
            <Phone className="w-4 h-4 text-teal flex-shrink-0" />
            <span>Bog&apos;lanish uchun kontakt: <strong className="text-ink">{group.contact}</strong></span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-6 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs text-muted-text">
            Barcha talabalar qatnashishi bepul
          </span>

          {isMember ? (
            <button
              onClick={handleLeave}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full bg-danger-soft text-danger-text hover:bg-danger-soft/80 text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4" />
              )}
              <span>To&apos;garakdan chiqish</span>
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-saffron text-ink hover:bg-saffron-hover text-xs font-heading font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>To&apos;garakka a&apos;zo bo&apos;lish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
