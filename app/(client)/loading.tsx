"use client";

import ClientLayoutLoading from "@/app/components/loading/ClientLayoutLoading";

export default function ClientLayoutLoadingPage() {
  return (
    <div className="fixed inset-0 z-50">
      <ClientLayoutLoading />
    </div>
  );
}
