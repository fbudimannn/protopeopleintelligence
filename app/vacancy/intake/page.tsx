"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequisitionIntakePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vacancy?tab=overview&stage=intake");
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-ink-tertiary flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      <span>Redirecting to Requisition Health Intake Assessment...</span>
    </div>
  );
}
