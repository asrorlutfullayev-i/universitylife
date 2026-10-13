"use client";

import React from "react";
import { AdminCrud, FieldConfig } from "@/components/admin/AdminCrud";

const fields: FieldConfig[] = [
  {
    name: "name",
    label: "To'garak nomi",
    type: "text",
    required: true,
  },
  {
    name: "type",
    label: "Turi",
    type: "select",
    required: true,
    defaultValue: "science",
    options: [
      { value: "science", label: "Ilmiy to'garak" },
      { value: "sport", label: "Sport seksiyasi" },
    ],
  },
  {
    name: "leader_name",
    label: "To'garak rahbari / murabbiy",
    type: "text",
  },
  {
    name: "schedule",
    label: "Mashg'ulotlar jadvali (masalan: Dush, Chor 16:00)",
    type: "text",
  },
  {
    name: "contact",
    label: "Aloqa (telefon yoki telegram)",
    type: "text",
  },
  {
    name: "description",
    label: "Tavsifi",
    type: "textarea",
    required: true,
  },
];

export default function AdminGroupsPage() {
  return (
    <AdminCrud
      tableName="groups"
      title="To'garaklar va Klublar"
      description="Sport va ilmiy seksiyalarni shakllantirish va boshqarish"
      titleField="name"
      fields={fields}
    />
  );
}
