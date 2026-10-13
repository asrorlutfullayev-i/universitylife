"use client";

import React from "react";
import { AdminCrud, FieldConfig } from "@/components/admin/AdminCrud";

const fields: FieldConfig[] = [
  {
    name: "title",
    label: "Yangilik sarlavhasi",
    type: "text",
    required: true,
  },
  {
    name: "image_url",
    label: "Rasm havolasi (URL)",
    type: "text",
  },
  {
    name: "content",
    label: "Yangilik to'liq matni",
    type: "textarea",
    required: true,
  },
];

export default function AdminNewsPage() {
  return (
    <AdminCrud
      tableName="news"
      title="Yangiliklar va Maqolalar"
      description="Talabalar uchun yangiliklar va e'lonlarni chop etish"
      fields={fields}
    />
  );
}
