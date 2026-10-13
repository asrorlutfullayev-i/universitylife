"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "datetime-local" | "number";
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: any;
}

interface AdminCrudProps {
  tableName: "opportunities" | "events" | "groups" | "news";
  title: string;
  description: string;
  titleField?: string;
  fields: FieldConfig[];
}

export function AdminCrud({
  tableName,
  title,
  description,
  titleField = "title",
  fields,
}: AdminCrudProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItems();
  }, [tableName]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data, error: fetchErr } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setItems(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Ma'lumotlarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const defaults: Record<string, any> = {};
    fields.forEach((f) => {
      defaults[f.name] = f.defaultValue !== undefined ? f.defaultValue : "";
    });
    setFormData(defaults);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    const values: Record<string, any> = { ...item };
    fields.forEach((f) => {
      if (f.type === "datetime-local" && item[f.name]) {
        // Format to YYYY-MM-DDTHH:mm
        const d = new Date(item[f.name]);
        const pad = (n: number) => String(n).padStart(2, "0");
        values[f.name] = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    });
    setFormData(values);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (item: any) => {
    try {
      const supabase = createClient();
      const updatedStatus = !item.is_published;

      const { error: updErr } = await supabase
        .from(tableName)
        .update({ is_published: updatedStatus })
        .eq("id", item.id);

      if (updErr) throw updErr;

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_published: updatedStatus } : i))
      );
      setFeedback({
        type: "success",
        text: updatedStatus ? "Nashr qilindi" : "Nashrdan olindi",
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Holatni o'zgartirishda xatolik." });
    }
  };

  const handleDelete = async (item: any) => {
    const name = item[titleField] || item.name || "Element";
    if (!window.confirm(`Haqiqatan ham "${name}" ni o'chirmoqchimisiz?`)) return;

    try {
      const supabase = createClient();
      const { error: delErr } = await supabase
        .from(tableName)
        .delete()
        .eq("id", item.id);

      if (delErr) throw delErr;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setFeedback({ type: "success", text: "Muvaffaqiyatli o'chirildi." });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "O'chirishda xatolik." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const supabase = createClient();

      const payload: Record<string, any> = {};
      fields.forEach((f) => {
        let val = formData[f.name];
        if (f.type === "number") {
          val = Number(val) || 0;
        } else if (f.type === "datetime-local" && val) {
          val = new Date(val).toISOString();
        }
        payload[f.name] = val;
      });

      if (editingItem) {
        // Update
        const { data, error: updErr } = await supabase
          .from(tableName)
          .update(payload)
          .eq("id", editingItem.id)
          .select()
          .single();

        if (updErr) throw updErr;

        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data : i)));
        setFeedback({ type: "success", text: "Ma'lumotlar saqlandi." });
      } else {
        // Insert
        payload.is_published = true;
        const { data, error: insErr } = await supabase
          .from(tableName)
          .insert(payload)
          .select()
          .single();

        if (insErr) throw insErr;

        setItems((prev) => [data, ...prev]);
        setFeedback({ type: "success", text: "Yangi ma'lumot qo'shildi." });
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Saqlashda xatolik yuz berdi." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
            {title}
          </h1>
          <p className="text-xs text-muted-text">{description}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full bg-teal text-white hover:bg-teal-hover text-xs font-semibold shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi qo&apos;shish</span>
        </button>
      </div>

      {/* Feedback Toast */}
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

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-text">Yuklanmoqda...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-sm text-muted-text">
          Hozircha hech qanday ma&apos;lumot mavjud emas. Yuqoridagi tugma orqali birinchi elementni qo&apos;shing.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const itemTitle = item[titleField] || item.name || item.title || "Element";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.is_published ? "bg-teal" : "bg-neutral-300"
                      }`}
                    />
                    <h3 className="font-heading font-bold text-sm text-ink truncate">
                      {itemTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-text truncate mt-0.5">
                    {item.description || item.category || item.schedule || item.type || ""}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    title={item.is_published ? "Nashrdan olish" : "Nashr qilish"}
                    className={`p-2 rounded-full transition ${
                      item.is_published
                        ? "text-teal bg-teal-light hover:bg-teal-light/80"
                        : "text-muted-text bg-mist hover:bg-neutral-200"
                    }`}
                  >
                    {item.is_published ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Tahrirlash"
                    className="p-2 rounded-full text-ink bg-mist hover:bg-neutral-200 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    title="O'chirish"
                    className="p-2 rounded-full text-danger-text bg-danger-soft hover:bg-danger-soft/80 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col shadow-xl border border-black/10">
            {/* Modal Header */}
            <div className="p-5 border-b border-black/5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-ink">
                {editingItem ? "Tahrirlash" : "Yangi element qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-text hover:text-ink text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                    {f.label} {f.required && <span className="text-danger-text">*</span>}
                  </label>

                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      required={f.required}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      className="w-full p-3 rounded-xl border border-black/10 text-xs text-ink bg-mist/40 focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  ) : f.type === "select" ? (
                    <select
                      required={f.required}
                      value={formData[f.name] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-black/10 text-xs text-ink bg-mist/40 focus:outline-none focus:ring-2 focus:ring-teal"
                    >
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      required={f.required}
                      value={formData[f.name] !== undefined ? formData[f.name] : ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [f.name]: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-black/10 text-xs text-ink bg-mist/40 focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-text hover:text-ink"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-teal text-white hover:bg-teal-hover text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <span>Saqlash</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
