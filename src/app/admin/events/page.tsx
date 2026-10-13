"use client";

import React from "react";
import { AdminCrud, FieldConfig } from "@/components/admin/AdminCrud";

const fields: FieldConfig[] = [
  {
    name: "title",
    label: "Tadbir nomi",
    type: "text",
    required: true,
  },
  {
    name: "category",
    label: "Toifa (Category)",
    type: "select",
    required: true,
    defaultValue: "Texnologiya",
    options: [
      { value: "Texnologiya", label: "Texnologiya" },
      { value: "Karyera", label: "Karyera" },
      { value: "Sport", label: "Sport" },
      { value: "Innovatsiya", label: "Innovatsiya" },
      { value: "Madaniyat", label: "Madaniyat" },
      { value: "Umumiy", label: "Umumiy" },
    ],
  },
  {
    name: "event_date",
    label: "O'tkazilish sanasi va vaqti",
    type: "datetime-local",
    required: true,
  },
  {
    name: "location",
    label: "O'tkazilish joyi (manzil)",
    type: "text",
    required: true,
  },
  {
    name: "points",
    label: "Beriladigan ball (Faollik balli)",
    type: "number",
    required: true,
    defaultValue: 15,
  },
  {
    name: "description",
    label: "Tadbir tafsilotlari",
    type: "textarea",
    required: true,
  },
];

export default function AdminEventsPage() {
  return (
    <AdminCrud
      tableName="events"
      title="Tadbirlar Boshqaruvi"
      description="Yangi universitet tadbirlarini rejalashtirish va ballarni belgilash"
      fields={fields}
    />
  );
}
