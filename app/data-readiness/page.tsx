"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/lib/context/FilterContext";
import DataProvenanceBadge from "@/components/DataProvenanceBadge";
import {
  getPipelineLayers,
  getRoadmapHorizons,
  getMetricDefinitions,
  getDataProvenance,
} from "@/lib/data/api";
import {
  PipelineLayer,
  RoadmapHorizon,
  MetricDefinition,
  ProvenanceRecord,
} from "@/lib/data/fixtures";
import {
  Database,
  Layers,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Server,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  GitBranch,
  Search,
  Filter,
  Code2,
} from "lucide-react";

type GovernanceTab = "pipeline" | "provenance" | "roadmap" | "dictionary";

function DataReadinessContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as GovernanceTab) || "pipeline";

  const [activeTab, setActiveTab] = useState<GovernanceTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [pipelineLayers, setPipelineLayers] = useState<PipelineLayer[]>([]);
  const [roadmapHorizons, setRoadmapHorizons] = useState<RoadmapHorizon[]>([]);
  const [metricDefinitions, setMetricDefinitions] = useState<MetricDefinition[]>([]);
  const [provenanceRecords, setProvenanceRecords] = useState<ProvenanceRecord[]>([]);

  // Selected layer for interactive deep dive
  const [selectedLayerId, setSelectedLayerId] = useState<string>("layer-4");

  // Local filter for provenance
  const [domainFilter, setDomainFilter] = useState<string>("ALL");
  const [provenanceTypeFilter, setProvenanceTypeFilter] = useState<"ALL" | "Observed" | "Synthetic">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { isSupabaseLive } = useFilters();

  useEffect(() => {
    const tabParam = searchParams.get("tab") as GovernanceTab;
    if (tabParam && ["pipeline", "provenance", "roadmap", "dictionary"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [layersRes, horizonsRes, metricsRes] = await Promise.all([
        getPipelineLayers(),
        getRoadmapHorizons(),
        getMetricDefinitions(),
      ]);

      setPipelineLayers(layersRes.data);
      setRoadmapHorizons(horizonsRes.data);
      setMetricDefinitions(metricsRes.data);
      setProvenanceRecords(getDataProvenance());
      setLoading(false);
    }

    loadData();
  }, []);

  // Filtered Provenance Records
  const filteredProvenance = useMemo(() => {
    return provenanceRecords.filter((record) => {
      if (domainFilter !== "ALL" && record.domain !== domainFilter) {
        return false;
      }
      if (provenanceTypeFilter === "Observed" && record.source_type !== "Observed Historical Case") {
        return false;
      }
      if (provenanceTypeFilter === "Synthetic" && record.source_type !== "Synthetic Future-State") {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          record.domain.toLowerCase().includes(q) ||
          record.metric_or_entity.toLowerCase().includes(q) ||
          record.governance_rule.toLowerCase().includes(q) ||
          record.impact_on_decision.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [provenanceRecords, domainFilter, provenanceTypeFilter, searchQuery]);

  const selectedLayer = useMemo(() => {
    return pipelineLayers.find((l) => l.layer_id === selectedLayerId) || pipelineLayers[3];
  }, [pipelineLayers, selectedLayerId]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              DATA ARCHITECTURE & GOVERNANCE
            </span>
            <div className="flex items-center gap-1 text-xs text-status-healthy font-semibold bg-status-healthy/10 px-2.5 py-0.5 rounded-full border border-status-healthy/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse" />
              <span>{isSupabaseLive ? "Supabase PostgreSQL Live" : "Bundled Fixture Fallback"}</span>
            </div>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-primary tracking-tight">
            Data Readiness & Governance Hub
          </h1>
          <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
            End-to-end data lineage, schema tiering, transparent provenance disclosure, and multi-horizon maturity roadmap for FIT HUB People Intelligence.
          </p>
        </div>

        {/* Action Link to Home */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated hover:border-brand-teal/40 transition-all shadow-subtle"
          >
            <span>Back to Executive Home</span>
            <ChevronRight className="w-4 h-4 text-ink-tertiary" />
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Row (6 Governance & Readiness Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Total Raw Ingested</span>
            <Database className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              4,077
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">100% Ingested</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Hires, Exits & Surveys</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>PostgreSQL Schemas</span>
            <Server className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              8
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">Supabase</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>raw, core, mart, talent</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Data Cleanliness Pass</span>
            <CheckCircle2 className="w-4 h-4 text-status-healthy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-healthy">
              100%
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">0 Loss</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>8-Step Pipeline Verified</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Governed Metrics</span>
            <BookOpen className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              7
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">SLA Defined</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Formal Mathematical Rules</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Mercer Capabilities</span>
            <Sparkles className="w-4 h-4 text-status-attention" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-attention">
              6
            </span>
            <span className="text-[11px] font-semibold text-ink-primary">4 Levels</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Competency Framework</span>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Maturity Tier</span>
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-brand-teal">
              H2
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">Delivered</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Relational Warehouse</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Tab Navigation */}
      <div className="flex items-center justify-between border-b border-surface-border gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pipeline"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>6-Layer Architecture Flow</span>
          </button>

          <button
            onClick={() => setActiveTab("provenance")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "provenance"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Data Provenance & Governance Audit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal/10 text-brand-teal font-bold">
              {provenanceRecords.length} Rules
            </span>
          </button>

          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "roadmap"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3-Horizon Data Maturity Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab("dictionary")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "dictionary"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Workforce Metric Dictionary & SLA Rules</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-card border border-surface-border text-ink-secondary">
              {metricDefinitions.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. TAB 1: 6-Layer Architecture Flow */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-teal" />
                  <span>Interactive 6-Layer Data Lineage Architecture</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  PRD Section 24: How raw operational Excel exports transform into relational entities, decision marts, and executive applications.
                </p>
              </div>
              <span className="text-xs text-ink-tertiary">
                Click any layer card below to inspect its schema contents and latency SLA
              </span>
            </div>

            {/* Stepped Interactive Layer Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 my-6">
              {pipelineLayers.map((layer) => {
                const isSelected = layer.layer_id === selectedLayerId;
                return (
                  <div
                    key={layer.layer_id}
                    onClick={() => setSelectedLayerId(layer.layer_id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-brand-teal/10 border-brand-teal shadow-md ring-2 ring-brand-teal/20"
                        : "bg-surface-ground border-surface-border hover:border-brand-teal/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? "bg-brand-teal text-surface-ground" : "bg-surface-card text-ink-tertiary border border-surface-border"
                        }`}>
                          L{layer.layer_number}
                        </span>
                        <span className="text-[10px] font-semibold text-ink-tertiary">
                          {layer.latency.split("/")[0]}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-ink-primary mb-1">
                        {layer.layer_name}
                      </h4>
                      <p className="text-[11px] text-brand-teal font-mono truncate mb-2">
                        {layer.schema_or_system}
                      </p>
                      <p className="text-[11px] text-ink-secondary line-clamp-2">
                        {layer.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-surface-border text-[10px] text-ink-tertiary flex items-center justify-between">
                      <span>{layer.record_count}</span>
                      {isSelected && <span className="text-brand-teal font-bold">&bull; Active</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Layer Deep-Dive Drawer */}
            {selectedLayer && (
              <div className="p-6 rounded-xl bg-surface-ground border border-brand-teal/30 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-surface-border">
                  <div>
                    <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider block mb-0.5">
                      Selected Tier: Layer {selectedLayer.layer_number} &bull; {selectedLayer.layer_name}
                    </span>
                    <h3 className="text-lg font-bold font-display text-ink-primary">
                      {selectedLayer.schema_or_system}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      selectedLayer.governance_status === "PRODUCED_EMPIRICAL"
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                        : selectedLayer.governance_status === "GOVERNED_TRANSFORMATION"
                        ? "bg-status-healthy/20 text-status-healthy border border-status-healthy/30"
                        : "bg-status-attention/20 text-status-attention border border-status-attention/30"
                    }`}>
                      {selectedLayer.governance_status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-ink-tertiary">
                      Latency: <strong className="text-ink-primary">{selectedLayer.latency}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="md:col-span-2 space-y-3">
                    <span className="font-bold text-ink-primary block">
                      Architectural Role & Functionality:
                    </span>
                    <p className="text-ink-secondary leading-relaxed">
                      {selectedLayer.description}
                    </p>

                    <span className="font-bold text-ink-primary block pt-2">
                      Registered Entities & Database Tables:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedLayer.entities_or_tables.map((tbl) => (
                        <div
                          key={tbl}
                          className="p-2.5 rounded-lg bg-surface-card border border-surface-border font-mono text-[11px] text-ink-primary flex items-center gap-2"
                        >
                          <Code2 className="w-3.5 h-3.5 text-brand-teal" />
                          <span>{tbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
                    <span className="font-bold text-ink-primary block text-xs">
                      Governance & Security Posture
                    </span>
                    <div className="space-y-2 text-[11px] text-ink-secondary">
                      <div className="flex justify-between">
                        <span>Database Platform:</span>
                        <strong className="text-ink-primary">PostgreSQL 15</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Hosting Instance:</span>
                        <strong className="text-ink-primary">folepebumzqcakpaxevq</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Row-Level Security:</span>
                        <strong className="text-status-healthy">Enabled (security_invoker)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Client Fallback:</span>
                        <strong className="text-brand-teal">Zero-Downtime Fixtures</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2: Data Provenance & Governance Audit */}
      {activeTab === "provenance" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  <span>Data Provenance & Governance Transparency Registry</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Full disclosure distinguishing empirical case facts from future-state prototype enablers.
                </p>
              </div>

              {/* Provenance Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border">
                  {(["ALL", "Observed", "Synthetic"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setProvenanceTypeFilter(type)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        provenanceTypeFilter === type
                          ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                          : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      {type === "ALL" ? "All Sources" : `${type} Only`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Governance Disclosure Alert Banner */}
            <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
              <div className="text-xs text-ink-secondary leading-relaxed">
                <strong className="text-ink-primary block mb-0.5">
                  Core Principle of Analytic Integrity
                </strong>
                The original FIT HUB case study datasets lacked person-level foreign keys (no employee IDs in the Hiring or Turnover sheets). Rather than inventing false historical matches or hallucinating data, this prototype maintains a strict boundary: all historical metrics are 100% empirical, while person-level entity links and Mercer competency frameworks operate as synthetic future-state enablers.
              </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Metric / Entity Name</th>
                    <th className="py-3 px-3 text-center">Data Provenance</th>
                    <th className="py-3 px-4">Original Source / Artifact</th>
                    <th className="py-3 px-4">Governance Rule Applied</th>
                    <th className="py-3 px-4">Decision-Making Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredProvenance.map((rec) => (
                    <tr key={rec.metric_or_entity} className="hover:bg-surface-elevated/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink-primary">
                        {rec.domain}
                      </td>
                      <td className="py-3 px-4 font-medium text-ink-primary">
                        {rec.metric_or_entity}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <DataProvenanceBadge
                          provenance={rec.source_type === "Observed Historical Case" ? "OBSERVED_CASE_STUDY" : "SYNTHETIC_ENABLER"}
                          domain={rec.domain}
                          metricOrEntity={rec.metric_or_entity}
                          originalSource={rec.original_source_file}
                          governanceRule={rec.governance_rule}
                          impactOnDecision={rec.impact_on_decision}
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-ink-tertiary">
                        {rec.original_source_file}
                      </td>
                      <td className="py-3 px-4 text-ink-secondary">
                        {rec.governance_rule}
                      </td>
                      <td className="py-3 px-4 text-ink-secondary">
                        {rec.impact_on_decision}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: 3-Horizon Data Maturity Roadmap */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-teal" />
                  <span>3-Horizon Workforce Data Maturity Roadmap</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Evolutionary trajectory from disconnected operational spreadsheets to predictive enterprise people intelligence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
              {roadmapHorizons.map((h) => (
                <div
                  key={h.horizon_number}
                  className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                    h.status === "DELIVERED_IN_PROTOTYPE"
                      ? "bg-brand-teal/5 border-brand-teal shadow-subtle ring-1 ring-brand-teal/20"
                      : h.status === "CURRENT_BASELINE"
                      ? "bg-surface-ground border-surface-border"
                      : "bg-surface-ground/60 border-surface-border border-dashed"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-ink-tertiary">
                        Horizon {h.horizon_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === "DELIVERED_IN_PROTOTYPE"
                          ? "bg-brand-teal text-surface-ground"
                          : h.status === "CURRENT_BASELINE"
                          ? "bg-ink-tertiary/20 text-ink-secondary"
                          : "bg-status-attention/20 text-status-attention"
                      }`}>
                        {h.status === "DELIVERED_IN_PROTOTYPE"
                          ? "DELIVERED IN PROTO"
                          : h.status === "CURRENT_BASELINE"
                          ? "HISTORICAL BASELINE"
                          : "TARGET FUTURE-STATE"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-primary mb-1">
                      {h.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-brand-teal block mb-3">
                      {h.timeframe}
                    </span>

                    <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                      {h.business_capability}
                    </p>

                    <div className="space-y-3 pt-3 border-t border-surface-border text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-ink-tertiary block mb-1">
                          Key Deliverables:
                        </span>
                        <ul className="space-y-1 text-[11px] text-ink-secondary">
                          {h.key_deliverables.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <span className="text-brand-teal font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-ink-tertiary block mb-1">
                          Technical Prerequisites:
                        </span>
                        <ul className="space-y-1 text-[11px] text-ink-tertiary">
                          {h.technical_prerequisites.map((req) => (
                            <li key={req} className="flex items-start gap-1.5">
                              <span>-</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: Workforce Metric Dictionary & SLA Rules */}
      {activeTab === "dictionary" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-teal" />
                  <span>Workforce Metric Dictionary & SLA Thresholds</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Governed mathematical formulas, business benchmarks, and operational interpretations for all core People Intelligence metrics.
                </p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              {metricDefinitions.map((m) => (
                <div
                  key={m.metric_name}
                  className="p-4 rounded-xl bg-surface-ground border border-surface-border hover:border-brand-teal/30 transition-all space-y-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-primary font-display">
                        {m.metric_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-card border border-surface-border text-ink-secondary">
                        {m.domain}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-brand-teal">
                      Target: {m.target_benchmark}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border font-mono text-xs text-brand-teal">
                    Formula: {m.formula}
                  </div>

                  <p className="text-xs text-ink-secondary leading-relaxed">
                    <strong className="text-ink-primary">Business Interpretation:</strong> {m.business_interpretation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataReadinessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-ink-tertiary flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Loading Data Readiness Hub...</span>
        </div>
      }
    >
      <DataReadinessContent />
    </Suspense>
  );
}
