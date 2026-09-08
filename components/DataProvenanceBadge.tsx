"use client";

import React, { useState } from "react";
import { Database, Sparkles, Layers, Info } from "lucide-react";

export type ProvenanceType =
  | "OBSERVED"
  | "OBSERVED_CASE_STUDY"
  | "SYNTHETIC"
  | "SYNTHETIC_ENABLER"
  | "HYBRID"
  | "DERIVED";

export interface DataProvenanceBadgeProps {
  type?: ProvenanceType;
  provenance?: ProvenanceType | string;
  label?: string;
  className?: string;
  domain?: string;
  metricOrEntity?: string;
  originalSource?: string;
  governanceRule?: string;
  impactOnDecision?: string;
  showLabel?: boolean;
}

export default function DataProvenanceBadge({
  type,
  provenance,
  label,
  className = "",
  domain,
  metricOrEntity,
  originalSource,
  governanceRule,
  impactOnDecision,
  showLabel = true,
}: DataProvenanceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const rawType = (type || provenance || "HYBRID").toString().toUpperCase();
  const normalizedType: "OBSERVED" | "SYNTHETIC" | "HYBRID" | "DERIVED" =
    rawType.includes("OBSERVED")
      ? "OBSERVED"
      : rawType.includes("SYNTHETIC")
      ? "SYNTHETIC"
      : rawType.includes("DERIVED")
      ? "DERIVED"
      : "HYBRID";

  const configs = {
    OBSERVED: {
      bg: "bg-brand-teal/10 text-brand-teal border-brand-teal/30",
      icon: <Database className="w-3.5 h-3.5" />,
      defaultText: "Observed Case Data",
      description:
        "Extracted directly from the original FIT HUB case study datasets (1,552 hires, 889 exits, 1,636 survey respondents).",
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

  const config = configs[normalizedType];
  const badgeText = label || config.defaultText;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 ${
          showLabel ? "px-2.5 py-0.5" : "p-1"
        } rounded-full text-xs font-semibold border transition-all cursor-pointer ${config.bg}`}
      >
        {config.icon}
        {showLabel && <span>{badgeText}</span>}
      </button>

      {/* Provenance Explainer Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-80 p-3.5 bg-surface-card rounded-xl shadow-dropdown border border-surface-border z-50 text-xs text-ink-primary animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 font-bold mb-1.5 text-ink-primary">
            <Info className="w-3.5 h-3.5 text-brand-teal" />
            <span>Data Governance & Provenance Disclosure</span>
          </div>

          <p className="text-ink-secondary leading-relaxed mb-2">
            {config.description}
          </p>

          {(domain || metricOrEntity || originalSource || governanceRule || impactOnDecision) && (
            <div className="space-y-1.5 p-2 rounded-lg bg-surface-ground border border-surface-border text-[11px]">
              {domain && (
                <div>
                  <span className="text-ink-tertiary">Domain: </span>
                  <span className="font-semibold text-ink-primary">{domain}</span>
                </div>
              )}
              {metricOrEntity && (
                <div>
                  <span className="text-ink-tertiary">Entity / Metric: </span>
                  <span className="font-semibold text-ink-primary">{metricOrEntity}</span>
                </div>
              )}
              {originalSource && (
                <div>
                  <span className="text-ink-tertiary">Source: </span>
                  <span className="text-ink-secondary">{originalSource}</span>
                </div>
              )}
              {governanceRule && (
                <div>
                  <span className="text-ink-tertiary">Governance Rule: </span>
                  <span className="text-ink-secondary">{governanceRule}</span>
                </div>
              )}
              {impactOnDecision && (
                <div>
                  <span className="text-ink-tertiary">Decision Impact: </span>
                  <span className="text-brand-teal font-medium">{impactOnDecision}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-surface-border text-[10px] text-ink-tertiary flex items-center justify-between">
            <span>FIT HUB Architecture PRD Sec 4.4</span>
            <span className="font-semibold text-brand-teal">Governance Verified</span>
          </div>
        </div>
      )}
    </div>
  );
}
