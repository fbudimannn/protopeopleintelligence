"use client";

import React, { useState } from "react";
import { Database, Sparkles, Layers, Info } from "lucide-react";

export type ProvenanceType = "OBSERVED" | "SYNTHETIC" | "HYBRID" | "DERIVED";

interface DataProvenanceBadgeProps {
  type?: ProvenanceType;
  label?: string;
  className?: string;
}

export default function DataProvenanceBadge({
  type = "HYBRID",
  label,
  className = "",
}: DataProvenanceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const configs = {
    OBSERVED: {
      bg: "bg-brand-teal/10 text-brand-teal border-brand-teal/30",
      icon: <Database className="w-3.5 h-3.5" />,
      defaultText: "Observed Case Data",
      description:
        "Extracted directly from the original FIT HUB case study datasets (1,552 hires, 888 exits, 1,234 survey respondents).",
    },
    SYNTHETIC: {
      bg: "bg-brand-yellow/20 text-ink-primary border-brand-yellow/50",
      icon: <Sparkles className="w-3.5 h-3.5 text-status-attention" />,
      defaultText: "Synthetic Future-State",
      description:
        "Person-level lifecycle linkages, Mercer capability competencies, and candidate readiness scoring generated to demonstrate future-state architecture.",
    },
    HYBRID: {
      bg: "bg-status-info/10 text-status-info border-status-info/30",
      icon: <Layers className="w-3.5 h-3.5" />,
      defaultText: "Observed + Synthetic",
      description:
        "Combines observed baseline workforce metrics with future-state decision-support capability enablers.",
    },
    DERIVED: {
      bg: "bg-surface-soft text-ink-secondary border-border-default",
      icon: <Info className="w-3.5 h-3.5" />,
      defaultText: "Derived Metric",
      description:
        "Calculated formula combining multiple observed workforce dimensions (e.g. annualized turnover, net eNPS).",
    },
  };

  const config = configs[type] || configs.HYBRID;
  const badgeText = label || config.defaultText;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${config.bg}`}
      >
        {config.icon}
        <span>{badgeText}</span>
      </button>

      {/* Provenance Explainer Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-surface-white rounded-xl shadow-dropdown border border-border-default z-50 text-xs text-ink-primary animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 font-bold mb-1 text-ink-primary">
            <Info className="w-3.5 h-3.5 text-brand-teal" />
            <span>Data Governance Disclosure</span>
          </div>
          <p className="text-ink-secondary leading-relaxed">{config.description}</p>
          <div className="mt-2 pt-2 border-t border-border-default text-[10px] text-ink-muted flex items-center justify-between">
            <span>Governance: FIT HUB PRD Sec 4.4</span>
            <span className="font-semibold text-brand-teal">Transparent</span>
          </div>
        </div>
      )}
    </div>
  );
}
