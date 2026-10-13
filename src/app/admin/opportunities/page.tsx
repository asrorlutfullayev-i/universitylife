"use client";

import React from "react";
import { AdminCrud, FieldConfig } from "@/components/admin/AdminCrud";

const fields: FieldConfig[] = [
  {
    name: "title",
    label: "Sarlavha",
    type: "text",
    required: true,
  },
  {
    name: "type",
    label: "Turi",
    type: "select",
    required: true,
    defaultValue: "scholarship",
    options: [
      { value: "scholarship", label: "Stipendiya" },
      { value: "international", label: "Xalqaro dastur" },
    ],
  },
  {
    name: "deadline",
    label: "Oxirgi muddat (deadline)",
    type: "datetime-local",
    required: true,
  },
  {
    name: "description",
    label: "Tavsif va ma'lumot",
    type: "textarea",
    required: true,
  },
  {
    name: "requirements",
    label: "Talablar va Hujjatlar",
    type: "textarea",
  },
  {
    name: "contact",
    label: "Aloqa ma'lumotlari (tel, telegram, manzil)",
    type: "text",
  },
];

export default function AdminOpportunitiesPage() {
  return (
    <AdminCrud
      tableName="opportunities"
      title="Stipendiya va Xalqaro Dasturlar"
      description="Yangi grantlar e'lon qilish, talablarni kiritish va ochiqligini boshqarish"
      fields={fields}
    />
  );
}
