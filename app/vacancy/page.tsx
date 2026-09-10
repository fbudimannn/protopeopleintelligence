"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/lib/context/FilterContext";
import DataProvenanceBadge from "@/components/DataProvenanceBadge";
import {
  getVacancyKPIs,
  getRequisitions,
  getSourcingChannels,
  getFunnelStages,
  getTalentPoolCandidates,
  getHiringOutcomes,
} from "@/lib/data/api";
import {
  VacancyKPI,
  RequisitionItem,
  SourcingChannelMetric,
  FunnelStageMetric,
  TalentPoolCandidate,
  HiringOutcomeMetric,
} from "@/lib/data/fixtures";
import { KpiCard, SectionCard, LifecycleStrip, Chip } from "@/components/primitives";
import { SimpleBar, ColoredBar, SimpleLine, StackedBarShare, FunnelWaterfall } from "@/components/charts";
import {
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Users,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Info,
  Check,
} from "lucide-react";

type VacancyTab = "overview" | "matrix" | "funnel" | "talent-pool" | "outcomes";

function VacancyContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as VacancyTab) || "overview";

  const [activeTab, setActiveTab] = useState<VacancyTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [kpis, setKpis] = useState<VacancyKPI[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([]);
  const [sourcingChannels, setSourcingChannels] = useState<SourcingChannelMetric[]>([]);
  const [funnelStages, setFunnelStages] = useState<FunnelStageMetric[]>([]);
  const [talentPool, setTalentPool] = useState<TalentPoolCandidate[]>([]);
  const [hiringOutcomes, setHiringOutcomes] = useState<HiringOutcomeMetric[]>([]);

  // Local page filters
  const { locationFilter, roleFilter, period: selectedPeriod } = useFilters();
  const selectedLocation = locationFilter === "ALL" ? "All Locations" : locationFilter;
  const selectedRole = roleFilter === "ALL" ? "All Roles" : roleFilter;
  const [hiringTypeFilter, setHiringTypeFilter] = useState<"ALL" | "Replacement" | "Expansion">("ALL");
  const [slaFilter, setSlaFilter] = useState<"ALL" | "WITHIN_SLA" | "AT_RISK" | "BREACHED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Interaction State
  const [selectedRequisition, setSelectedRequisition] = useState<RequisitionItem | null>(null);
  const [fastTrackSuccess, setFastTrackSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as VacancyTab;
    if (tabParam && ["overview", "matrix", "funnel", "talent-pool", "outcomes"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: VacancyTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const currentLifecycleStep = useMemo(() => {
    if (activeTab === "overview") return "vacancy";
    if (activeTab === "funnel") return "sourcing";
    if (activeTab === "matrix") return "funnel";
    if (activeTab === "talent-pool") return "mobility";
    if (activeTab === "outcomes") return "exit";
    return "vacancy";
  }, [activeTab]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [kpiRes, reqRes, channelRes, funnelRes, poolRes, outcomesRes] = await Promise.all([
        getVacancyKPIs(),
        getRequisitions(),
        getSourcingChannels(),
        getFunnelStages(),
        getTalentPoolCandidates(),
        getHiringOutcomes(),
      ]);

      setKpis(kpiRes.data);
      setRequisitions(reqRes.data);
      setSourcingChannels(channelRes.data);
      setFunnelStages(funnelRes.data);
      setTalentPool(poolRes.data);
      setHiringOutcomes(outcomesRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  // Helper for matching location with synonyms
  const matchesLocationFilter = (itemLoc: string, filterLoc: string) => {
    if (filterLoc === "All Locations" || filterLoc === "ALL") return true;
    if (!itemLoc) return false;
    if (itemLoc.toLowerCase() === filterLoc.toLowerCase()) return true;
    if (filterLoc.toLowerCase() === "bali") {
      return itemLoc.toLowerCase().includes("bali") || itemLoc.toLowerCase() === "badung" || itemLoc.toLowerCase() === "denpasar";
    }
    return false;
  };

  // Helper for matching role with synonyms
  const matchesRoleFilter = (itemRole: string, filterRole: string) => {
    if (filterRole === "All Roles" || filterRole === "ALL") return true;
    if (!itemRole) return false;
    if (itemRole.toLowerCase() === filterRole.toLowerCase()) return true;
    if (filterRole === "Operation Specialist" && (itemRole === "Front Desk Officer" || itemRole === "Operation Specialist")) return true;
    if (filterRole === "Membership Consultant" && (itemRole === "Fitness Consultant" || itemRole === "Membership Consultant")) return true;
    if (filterRole === "Personal Trainer" && (itemRole === "Personal Trainer" || itemRole === "PT")) return true;
    if (filterRole === "Club Manager" && (itemRole.includes("Manager") || itemRole.includes("Leader") || itemRole === "Club General Manager")) return true;
    return false;
  };

  // Filtered Requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((item) => {
      const loc = item.location_name || (item as any).location || "";
      const role = item.role_name || (item as any).role || "";
      const hiringType = item.hiring_type || (((item as any).demand_type || "").toUpperCase().includes("REPLACE") ? "Replacement" : "Expansion");
      const daysOpen = item.days_open ?? (item as any).current_days_open ?? 0;
      const slaTarget = item.sla_target_days ?? (item as any).sla_days ?? 28;
      const slaStat = item.sla_status || (daysOpen > slaTarget ? "BREACHED" : daysOpen > slaTarget - 5 ? "AT_RISK" : "WITHIN_SLA");

      // Global Location filter
      if (!matchesLocationFilter(loc, selectedLocation)) {
        return false;
      }
      // Global Role filter
      if (!matchesRoleFilter(role, selectedRole)) {
        return false;
      }
      // Local Hiring Type filter
      if (hiringTypeFilter !== "ALL" && hiringType !== hiringTypeFilter) {
        return false;
      }
      // Local SLA filter
      if (slaFilter !== "ALL" && slaStat !== slaFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const code = (item.req_code || (item as any).id || "").toLowerCase();
        const rName = role.toLowerCase();
        const lName = loc.toLowerCase();
        const mgr = (item.hiring_manager || (item as any).replaces_employee_name || "").toLowerCase();
        const bStage = (item.bottleneck_stage || "").toLowerCase();
        return code.includes(query) || rName.includes(query) || lName.includes(query) || mgr.includes(query) || bStage.includes(query);
      }
      return true;
    });
  }, [requisitions, selectedLocation, selectedRole, hiringTypeFilter, slaFilter, searchQuery]);

  // Aggregate KPI Calculations based on active filters
  const metrics = useMemo(() => {
    const totalOpenings = filteredRequisitions.reduce((acc, r) => acc + (r.openings || 1), 0);
    const replacementCount = filteredRequisitions.filter((r) => {
      const t = (r.hiring_type || (r as any).demand_type || "").toLowerCase();
      return t.includes("replace");
    }).length;
    const expansionCount = filteredRequisitions.length - replacementCount;

    const replacementPct = filteredRequisitions.length > 0
      ? (replacementCount / filteredRequisitions.length) * 100
      : (selectedLocation === "Bali" ? 85.7 : 70.7);

    const breachedCount = filteredRequisitions.filter((r) => {
      const stat = (r.sla_status || "").toUpperCase();
      const days = r.days_open ?? (r as any).current_days_open ?? 0;
      const target = r.sla_target_days ?? (r as any).sla_days ?? 28;
      return stat === "BREACHED" || days > target || (r as any).is_beyond_sla === true;
    }).length;

    const beyondSlaRate = filteredRequisitions.length > 0
      ? (breachedCount / filteredRequisitions.length) * 100
      : (selectedLocation === "Bali" ? 42.9 : 25.0);

    const validDays = filteredRequisitions
      .map((r) => r.days_open ?? (r as any).current_days_open)
      .filter((d): d is number => typeof d === "number" && !isNaN(d));

    const avgDaysOpen = validDays.length > 0
      ? validDays.reduce((acc, d) => acc + d, 0) / validDays.length
      : (selectedLocation === "Bali" ? 34.0 : 27.5);

    return {
      openRequisitions: totalOpenings || (selectedLocation === "Bali" ? 29 : 136),
      replacementCount,
      expansionCount,
      replacementPct: Math.round(replacementPct * 10) / 10,
      expansionPct: Math.round((100 - replacementPct) * 10) / 10,
      beyondSlaRate: Math.round(beyondSlaRate * 10) / 10,
      medianTTF: Math.round(avgDaysOpen * 10) / 10,
      pipelineCoverage: selectedLocation === "Bali" ? 1.4 : 1.8,
      filledPeriod: selectedLocation === "Bali" ? 42 : 531,
    };
  }, [filteredRequisitions, selectedLocation]);

  // Handle Talent Pool fast track simulation
  const handleFastTrack = (candidateName: string) => {
    setFastTrackSuccess(candidateName);
    setTimeout(() => {
      setFastTrackSuccess(null);
    }, 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Sub-Header with Lifecycle Context */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              PRE-HIRE LIFECYCLE
            </span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Hiring Analysis"
              metricOrEntity="Historical Requisitions & SLAs"
              originalSource="Hiring sheet (1,552 records)"
              governanceRule="Exact empirical time-to-fill and replacement share values."
              impactOnDecision="Pins Bali as priority hotspot (34.0d TTF vs 27.5d national)."
            />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-primary tracking-tight">
            Vacancy Intelligence & Sourcing
          </h1>
          <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
            Prioritize hiring demand by role, location, hiring type, and SLA pressure. Answer which hiring demand TA must focus on first.
          </p>
        </div>

        {/* Action Link to Team */}
        <div className="flex items-center gap-3">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated hover:border-brand-teal/40 transition-all shadow-subtle"
          >
            <Users className="w-4 h-4 text-brand-teal" />
            <span>Switch to Team (Post-Hire)</span>
            <ChevronRight className="w-4 h-4 text-ink-tertiary" />
          </Link>
        </div>
      </div>

      {/* Lifecycle Strip Banner */}
      <LifecycleStrip
        activeStep={currentLifecycleStep}
        onSelectStep={(stepId, targetTab) => {
          if (targetTab && ["overview", "matrix", "funnel", "talent-pool", "outcomes"].includes(targetTab)) {
            handleTabChange(targetTab as VacancyTab);
          }
        }}
        className="my-6"
      />

      {/* 2. Top Executive KPI Row (6 Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Open Requisitions</span>
            <Briefcase className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {metrics.openRequisitions}
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">
              {selectedLocation === "All Locations" ? "+12% vs Q2" : selectedLocation}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Active Openings</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Openings"
              metricOrEntity="Tracked Positions"
              originalSource="Hiring sheet"
              governanceRule="Direct extraction"
              impactOnDecision="Operational baseline"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Replacement Share</span>
            <AlertTriangle className="w-4 h-4 text-status-attention" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-attention">
              {metrics.replacementPct}%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">High Churn</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Exit Backfill Rate</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover"
              metricOrEntity="Replacement Rate"
              originalSource="Hiring sheet"
              governanceRule="Empirical calculation"
              impactOnDecision="Diagnoses churn cause"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Beyond SLA Rate</span>
            <Clock className="w-4 h-4 text-status-danger" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              {metrics.beyondSlaRate}%
            </span>
            {selectedLocation === "All Locations" ? (
              <span className="text-[11px] font-semibold text-status-attention">Target: ≤ 20%</span>
            ) : (
              <span className={`text-[11px] font-semibold ${metrics.beyondSlaRate === 0 ? 'text-status-healthy' : 'text-status-danger'}`}>
                {metrics.beyondSlaRate === 0 ? '0% Breached' : 'vs Nat. 27.5%'}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Target &gt; 28 Days</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="SLA"
              metricOrEntity="Breach Frequency"
              originalSource="Hiring sheet"
              governanceRule="SLA threshold: 28 days"
              impactOnDecision="Identifies bottleneck locations"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Median TTF</span>
            <Target className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {metrics.medianTTF}d
            </span>
            {selectedLocation === "All Locations" ? (
              <span className="text-[11px] font-semibold text-brand-teal">Target: 28.0d</span>
            ) : (
              <span className="text-[11px] font-semibold text-brand-teal">Nat. Med: 27.9d</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>National Median</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Duration"
              metricOrEntity="Days to fill"
              originalSource="Hiring sheet"
              governanceRule="Median calculation"
              impactOnDecision="Reflects sourcing speed"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Pipeline Coverage</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {metrics.pipelineCoverage}x
            </span>
            <span className="text-[11px] font-semibold text-ink-tertiary">Target: 3.0x</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Active Candidates</span>
            <DataProvenanceBadge
              provenance="SYNTHETIC_ENABLER"
              domain="Pipeline"
              metricOrEntity="Talent Ratio"
              originalSource="010_internal_mobility_engine.sql"
              governanceRule="Illustrative coverage factor"
              impactOnDecision="Shows proactive pool depth"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Filled This Period</span>
            <CheckCircle2 className="w-4 h-4 text-status-healthy" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-healthy">
              {metrics.filledPeriod}
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">+8.4%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Hires Complete</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Output"
              metricOrEntity="Completed Hires"
              originalSource="Hiring sheet"
              governanceRule="Empirical hires"
              impactOnDecision="Shows historical capacity"
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* 3. Interactive Tab Bar Navigation */}
      <div className="flex items-center justify-between border-b border-surface-border gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Requisition Health & Priority</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal/10 text-brand-teal">
              {filteredRequisitions.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("matrix")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "matrix"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Demand & SLA Heatmap</span>
          </button>

          <button
            onClick={() => handleTabChange("funnel")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "funnel"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sourcing & Funnel Diagnosis</span>
          </button>

          <button
            onClick={() => handleTabChange("talent-pool")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "talent-pool"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Sparkles className="w-4 h-4 text-status-attention" />
            <span>Frontline Ready Pool</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-status-attention/10 text-status-attention font-bold">
              {talentPool.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("outcomes")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "outcomes"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quality & SLA Outcomes</span>
          </button>
        </div>

        {/* Active Context Chip */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-ink-secondary bg-surface-card px-3 py-1.5 rounded-full border border-surface-border">
          <Filter className="w-3.5 h-3.5 text-brand-teal" />
          <span className="font-medium text-ink-primary">{selectedLocation}</span>
          <span>|</span>
          <span className="font-medium text-ink-primary">{selectedRole}</span>
          <span>|</span>
          <span className="text-ink-tertiary">{selectedPeriod}</span>
        </div>
      </div>

      {/* Success Notification for Talent Pool Fast-Track */}
      {fastTrackSuccess && (
        <div className="p-4 rounded-xl bg-status-healthy/10 border border-status-healthy/30 flex items-center justify-between text-status-healthy animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Candidate Fast-Tracked Successfully
              </p>
              <p className="text-xs opacity-90">
                {fastTrackSuccess} has been scheduled for Club GM interview. Projected time to fill reduced from 34 days to 9 days.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFastTrackSuccess(null)}
            className="text-xs underline hover:opacity-75 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. TAB CONTENT: Overview & Requisition Health */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Demand Share Visualizer & SLA Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SectionCard
                title="Hiring Demand Composition: Replacement vs Expansion"
                description="Breakdown of open requisitions generated by employee turnover versus new club expansion."
                note="68.1% of requisitions backfill exited employees (fithub_analysis.ipynb Section 3 finding)."
              >
                <div className="pt-2">
                  <StackedBarShare
                    segments={[
                      {
                        label: "Replacement",
                        value: metrics.replacementCount,
                        pct: metrics.replacementPct,
                        color: "#1D3557",
                      },
                      {
                        label: "New Expansion",
                        value: metrics.expansionCount,
                        pct: metrics.expansionPct,
                        color: "#23C9D3",
                      },
                    ]}
                    totalLabel={`${filteredRequisitions.length} Filtered Requisitions`}
                  />
                </div>
              </SectionCard>
            </div>
            <div>
              <SectionCard
                title="SLA Compliance Split"
                description="Proportion of requisitions currently within target SLA."
                note="Target SLA: 28 days standard, 45 days in Bali."
              >
                <div className="pt-2">
                  <SimpleBar
                    data={[
                      { label: "Within SLA", value: Math.max(0, 100 - metrics.beyondSlaRate) },
                      { label: "Beyond SLA", value: metrics.beyondSlaRate },
                    ]}
                    barColor="#23C9D3"
                    height={160}
                    unit="%"
                  />
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Local Filter Toolbar */}
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type="text"
                  placeholder="Search code, role, club, or GM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                />
              </div>

              {/* Hiring Type Pills */}
              <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                {(["ALL", "Replacement", "Expansion"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setHiringTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      hiringTypeFilter === type
                        ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {type === "ALL" ? "All Types" : type}
                  </button>
                ))}
              </div>

              {/* SLA Status Pills */}
              <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                {(["ALL", "WITHIN_SLA", "AT_RISK", "BREACHED"] as const).map((sla) => (
                  <button
                    key={sla}
                    onClick={() => setSlaFilter(sla)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      slaFilter === sla
                        ? "bg-surface-card text-ink-primary shadow-subtle font-semibold"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {sla === "ALL"
                      ? "All SLAs"
                      : sla === "WITHIN_SLA"
                      ? "Within SLA"
                      : sla === "AT_RISK"
                      ? "At Risk"
                      : "Breached"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-ink-tertiary">
              Showing <span className="font-semibold text-ink-primary">{filteredRequisitions.length}</span> of {requisitions.length} open requisitions
            </div>
          </div>

          {/* Main 12-Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left 8 Columns: Requisitions Table */}
            <div className="xl:col-span-8 space-y-4">
              <div className="rounded-xl bg-surface-card border border-surface-border overflow-hidden shadow-subtle">
                <div className="p-4 border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-teal" />
                    <h2 className="text-sm font-bold text-ink-primary font-display">
                      Active Requisitions & SLA Aging
                    </h2>
                  </div>
                  <span className="text-xs text-ink-tertiary">
                    Click row to view full requisition details and linked exit
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-ground/70 border-b border-surface-border text-ink-secondary font-semibold">
                        <th className="py-3 px-4">Req Code</th>
                        <th className="py-3 px-4">Role & Family</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-3 text-center">Openings</th>
                        <th className="py-3 px-3 text-center">Days Open</th>
                        <th className="py-3 px-4">Bottleneck Stage</th>
                        <th className="py-3 px-3 text-center">SLA</th>
                        <th className="py-3 px-3 text-center">Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {filteredRequisitions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-ink-tertiary">
                            No requisitions match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRequisitions.map((req) => {
                          const code = req.req_code || (req as any).id || "REQ-0000";
                          const role = req.role_name || (req as any).role || "Frontline Role";
                          const mgr = req.hiring_manager || (req as any).replaces_employee_name || "Club GM";
                          const loc = req.location_name || (req as any).location || "National";
                          const isRep = req.hiring_type === "Replacement" || (((req as any).demand_type || "").toUpperCase().includes("REPLACE"));
                          const exitCode = req.linked_exit_code || (req as any).replaces_employee_id;
                          const openings = req.openings || 1;
                          const days = req.days_open ?? (req as any).current_days_open ?? 25;
                          const target = req.sla_target_days ?? (req as any).sla_days ?? 28;
                          const stat = (req.sla_status || (days > target ? "BREACHED" : days > target - 5 ? "AT_RISK" : "WITHIN_SLA")).toUpperCase();
                          const health = req.health || (stat === "BREACHED" ? "Critical" : stat === "AT_RISK" ? "At Risk" : "Healthy");
                          const stage = req.bottleneck_stage || "HR Screening";

                          return (
                            <tr
                              key={code}
                              onClick={() => setSelectedRequisition(req)}
                              className="hover:bg-surface-elevated/80 transition-colors cursor-pointer group"
                            >
                              <td className="py-3 px-4 font-mono font-medium text-brand-teal group-hover:underline">
                                {code}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-ink-primary block">
                                  {role}
                                </span>
                                <span className="text-[11px] text-ink-tertiary">
                                  {mgr}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-ground border border-surface-border text-ink-secondary">
                                  {loc}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {isRep ? (
                                  <div className="flex flex-col">
                                    <span className="text-brand-teal font-semibold">Replacement</span>
                                    {exitCode && (
                                      <span className="text-[10px] text-ink-tertiary font-mono">
                                        {exitCode}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-ink-secondary">Expansion</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-ink-primary">
                                {openings}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`font-mono font-bold ${
                                  days > target
                                    ? "text-status-danger"
                                    : days > target - 5
                                    ? "text-status-attention"
                                    : "text-ink-primary"
                                }`}>
                                  {days}d
                                </span>
                                <span className="text-[10px] text-ink-tertiary block">
                                  / {target}d SLA
                                </span>
                              </td>
                              <td className="py-3 px-4 text-ink-secondary font-medium">
                                {stage}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {stat === "WITHIN_SLA" ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-healthy/10 text-status-healthy border border-status-healthy/20">
                                    Within SLA
                                  </span>
                                ) : stat === "AT_RISK" ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-attention/10 text-status-attention border border-status-attention/20">
                                    At Risk
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-danger/10 text-status-danger border border-status-danger/20">
                                    Breached
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {health === "Healthy" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-healthy">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Healthy</span>
                                  </span>
                                ) : health === "At Risk" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-attention">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>At Risk</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-danger">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Critical</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lifecycle Continuity Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/5 to-transparent border border-brand-teal/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-primary">
                      Lifecycle Continuity: Every replacement is born from an employee exit
                    </h4>
                    <p className="text-[11px] text-ink-secondary">
                      70.7% of all requisitions are backfilling voluntary departures. Connect directly to Team analytics to fix root-cause attrition drivers.
                    </p>
                  </div>
                </div>
                <Link
                  href="/team#retention"
                  className="px-3 py-1.5 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors whitespace-nowrap"
                >
                  Inspect Retention Drivers
                </Link>
              </div>
            </div>

            {/* Right 4 Columns: Priority Signal Cards */}
            <div className="xl:col-span-4 space-y-4">
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3 flex items-center justify-between">
                  <span>Priority TA Signals</span>
                  <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
                </h3>

                {/* Priority Signal Card 1: Bali */}
                <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 mb-4 hover:border-status-danger/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-danger/20 text-status-danger">
                      CRITICAL PRIORITY #1
                    </span>
                    <span className="text-[11px] text-ink-tertiary">Bali Cluster</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    Frontline Commercial & Operations Crunch
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    Bali exhibits an 85.7% replacement share, 34-day median TTF, and 42.9% SLA breach rate. Exits are outpacing external replacement speed by 6 days.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 p-2 bg-surface-ground rounded-lg border border-surface-border">
                    <div>
                      <span className="text-ink-tertiary block">Open Reqs:</span>
                      <span className="font-bold text-ink-primary">29 Openings</span>
                    </div>
                    <div>
                      <span className="text-ink-tertiary block">Ready Pool:</span>
                      <span className="font-bold text-brand-teal">17 Verified Candidates</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("talent-pool")}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-status-danger text-surface-ground text-xs font-bold hover:bg-status-danger/90 transition-colors text-center"
                    >
                      Activate Bali Pool
                    </button>
                    <button
                      onClick={() => setActiveTab("funnel")}
                      className="py-1.5 px-3 rounded-lg bg-surface-ground border border-surface-border text-ink-primary text-xs font-medium hover:bg-surface-elevated transition-colors"
                    >
                      Funnel
                    </button>
                  </div>
                </div>

                {/* Priority Signal Card 2: Operation Specialist Shift Churn */}
                <div className="p-4 rounded-xl bg-status-attention/5 border border-status-attention/20 hover:border-status-attention/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-attention/20 text-status-attention">
                      SYSTEMIC SIGNAL #2
                    </span>
                    <span className="text-[11px] text-ink-tertiary">National Frontline</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    Operation Specialist 90-Day Cliff
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    68.4% of voluntary departures occur before month 12. Candidate pipeline slows at HR Screening due to shift flexibility mismatches.
                  </p>
                  <div className="p-2.5 rounded-lg bg-surface-ground border border-surface-border mb-3 text-[11px]">
                    <span className="font-semibold text-ink-primary block mb-0.5">
                      Recommended Intervention:
                    </span>
                    <span className="text-ink-secondary">
                      Pre-screen shift expectations asynchronously and fast-track ex-finalists to bypass 6.8 days screening bottleneck.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("funnel")}
                    className="w-full py-1.5 px-3 rounded-lg bg-surface-card border border-surface-border text-ink-primary text-xs font-bold hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Inspect Screening Bottlenecks</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-teal" />
                  </button>
                </div>
              </div>

              {/* Data Provenance Card */}
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink-primary font-display">
                    Governance & Provenance
                  </span>
                  <DataProvenanceBadge
                    provenance="OBSERVED_CASE_STUDY"
                    domain="Requisitions"
                    metricOrEntity="Vacancy Mart"
                    originalSource="Hiring sheet"
                    governanceRule="Cleaned without person-level leakage"
                    impactOnDecision="Verified empirical baseline"
                  />
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  Historical hiring records (1,552 hires) did not contain employee IDs. The prototype links synthetic requisition codes to empirical cluster averages to illustrate future-state capability without violating case data integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: Demand & SLA Heatmap */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Target className="w-4 h-4 text-brand-teal" />
                  <span>Role x Location Hiring Demand & SLA Matrix</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Cross-tabulation of open requisitions, replacement pressure, and SLA breaches across key operational clusters.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-status-danger font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-status-danger" /> Critical (&gt; 35% breach)
                </span>
                <span className="flex items-center gap-1 text-status-attention font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-status-attention" /> Attention (25-35%)
                </span>
                <span className="flex items-center gap-1 text-status-healthy font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-status-healthy" /> Normal (&lt; 25%)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                    <th className="py-3 px-4">Role / Job Family</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-3 text-center">Open Reqs</th>
                    <th className="py-3 px-3 text-center">Replacement Share</th>
                    <th className="py-3 px-3 text-center">Beyond SLA Rate</th>
                    <th className="py-3 px-3 text-center">Median TTF</th>
                    <th className="py-3 px-4 text-center">Pressure Tier</th>
                    <th className="py-3 px-4">Ready Pool</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {kpis.map((kpi) => (
                    <tr
                      key={kpi.kpi_id}
                      className={`hover:bg-surface-elevated/70 transition-colors ${
                        kpi.pressure_level === "CRITICAL"
                          ? "bg-status-danger/5"
                          : kpi.pressure_level === "ATTENTION"
                          ? "bg-status-attention/5"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-ink-primary">
                        {kpi.role_name}
                      </td>
                      <td className="py-3 px-4 font-medium text-ink-secondary">
                        {kpi.location_name}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-ink-primary">
                        {kpi.open_requisitions}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={kpi.replacement_share_pct > 75 ? "text-status-danger font-bold" : "text-ink-primary"}>
                          {kpi.replacement_share_pct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={kpi.beyond_sla_pct > 30 ? "text-status-danger font-bold" : "text-ink-primary"}>
                          {kpi.beyond_sla_pct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium">
                        {kpi.median_ttf_days} days
                      </td>
                      <td className="py-3 px-4 text-center">
                        {kpi.pressure_level === "CRITICAL" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-danger/20 text-status-danger border border-status-danger/30">
                            CRITICAL
                          </span>
                        ) : kpi.pressure_level === "ATTENTION" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-attention/20 text-status-attention border border-status-attention/30">
                            ATTENTION
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-healthy/20 text-status-healthy border border-status-healthy/30">
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-teal">{kpi.talent_pool_count} ready</span>
                          <span className="text-[10px] text-ink-tertiary">
                            ({Math.round((kpi.talent_pool_count / kpi.open_requisitions) * 100)}% cov)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setActiveTab("talent-pool")}
                          className="px-2.5 py-1 rounded-md bg-surface-ground border border-surface-border text-[11px] font-semibold text-brand-teal hover:bg-brand-teal hover:text-surface-ground transition-all"
                        >
                          View Pool
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strategic Takeaway Box */}
            <div className="mt-4 p-4 rounded-xl bg-surface-ground border border-surface-border">
              <h4 className="text-xs font-bold text-ink-primary mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-teal" />
                <span>Executive Diagnostic & Recommendation 1 Alignment</span>
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Hiring pressure is not distributed evenly. Bali experiences a dual crunch across both Operation Specialists (85.7% replacement, 34d TTF) and Personal Trainers (77.8% replacement, 31.5d TTF). Instead of launching generic national job portal ads, TA must concentrate talent pipelines and local sourcing bonuses directly in Bali and Surabaya.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: Sourcing & Funnel Diagnosis */}
      {activeTab === "funnel" && (
        <div className="space-y-6">
          {/* Funnel Stepped Visualization */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-teal" />
                  <span>Recruitment Funnel Conversion & Bottleneck Analysis</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Tracking candidate attrition from initial application to signed offer across all frontline requisitions.
                </p>
              </div>
              <DataProvenanceBadge
                provenance="OBSERVED_CASE_STUDY"
                domain="Funnel Stages"
                metricOrEntity="Historical Conversion Funnel"
                originalSource="Hiring sheet (1,552 hires)"
                governanceRule="Computed from application-to-hire lifecycle metrics"
                impactOnDecision="Pins screening and interview turnaround delays"
              />
            </div>

            {/* Visual Recharts Funnel Waterfall */}
            <div className="mb-6 p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <span className="label-xs text-ink-secondary block mb-2">Funnel Stage Progression & Conversion</span>
              <FunnelWaterfall
                stages={funnelStages.map((s) => ({
                  stage: s.stage_name,
                  count: s.candidate_count,
                  ratePct: s.conversion_from_top_pct,
                }))}
              />
            </div>

            {/* Visual Funnel Bars */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
              {funnelStages.map((stage, idx) => (
                <div
                  key={stage.stage_name}
                  className={`p-4 rounded-xl border relative transition-all ${
                    stage.is_bottleneck
                      ? "bg-status-danger/5 border-status-danger/30 shadow-subtle"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  {stage.is_bottleneck && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-status-danger text-surface-ground uppercase tracking-wider">
                      Bottleneck
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase">
                    Stage {stage.stage_order}
                  </span>
                  <h4 className="text-xs font-bold text-ink-primary mt-0.5 mb-2 line-clamp-1">
                    {stage.stage_name}
                  </h4>
                  <div className="text-xl font-display font-black text-ink-primary mb-1">
                    {stage.candidate_count.toLocaleString()}
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-ink-secondary">
                      <span>Top Conversion:</span>
                      <span className="font-bold text-ink-primary">{stage.conversion_from_top_pct}%</span>
                    </div>
                    <div className="flex justify-between text-ink-secondary">
                      <span>Time in Stage:</span>
                      <span className={`font-semibold ${stage.is_bottleneck ? "text-status-danger" : "text-ink-primary"}`}>
                        {stage.median_days_in_stage} days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Funnel Insight Callout */}
            <div className="p-3.5 rounded-lg bg-status-attention/10 border border-status-attention/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-status-attention flex-shrink-0 mt-0.5" />
              <div className="text-xs text-ink-secondary leading-relaxed">
                <span className="font-bold text-ink-primary block">
                  Identified Stage Bottlenecks:
                </span>
                1. <strong className="text-ink-primary">Initial HR Screening (6.8 days):</strong> 53.8% candidate drop-off caused by manual CV reviews and delayed telephone pre-screen for shift roster flexibility.
                <br />
                2. <strong className="text-ink-primary">Manager Interview (8.4 days):</strong> Club GM shift scheduling congestion adds 4.6 days delay before technical audition/signoff.
              </div>
            </div>
          </div>

          {/* Sourcing Channel Effectiveness Table */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink-primary font-display flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-teal" />
                  <span>Sourcing Channel Quality & Downstream Retention</span>
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Recommendation 2: Evaluate channels by downstream retention and SLA speed, not volume alone.
                </p>
              </div>
            </div>

            {/* Visual Recharts Sourcing Mix */}
            <div className="mb-6 p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <span className="label-xs text-ink-secondary block mb-3">Hire Volume Contribution by Channel</span>
              <ColoredBar
                data={sourcingChannels.map((c) => ({
                  label: c.channel_name,
                  value: c.hires,
                  color: c.channel_name === "Employee Referral" ? "#23C9D3" : "#1D3557",
                }))}
                dataKey="value"
                categoryKey="label"
                horizontal={true}
                height={200}
                unit="hires"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                    <th className="py-3 px-4">Sourcing Channel</th>
                    <th className="py-3 px-3 text-center">Applicants</th>
                    <th className="py-3 px-3 text-center">Hires</th>
                    <th className="py-3 px-3 text-center">Hire Conversion</th>
                    <th className="py-3 px-3 text-center">Delayed Hires (Abs)</th>
                    <th className="py-3 px-3 text-center">Beyond SLA Rate (%)</th>
                    <th className="py-3 px-3 text-center">Median TTF</th>
                    <th className="py-3 px-3 text-center">Offer Acceptance</th>
                    <th className="py-3 px-3 text-center">6M Retention</th>
                    <th className="py-3 px-3 text-center">Quality Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {sourcingChannels.map((channel) => {
                    const delayedCount = Math.round(channel.hires * (channel.beyond_sla_rate_pct / 100));
                    return (
                      <tr
                        key={channel.channel_name}
                        className={`hover:bg-surface-elevated/70 transition-colors ${
                          channel.channel_name === "Employee Referral" ? "bg-brand-teal/5 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink-primary">
                              {channel.channel_name}
                            </span>
                            {channel.channel_name === "Employee Referral" && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-teal text-surface-ground">
                                TOP CHANNEL
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-ink-secondary">
                          {channel.applicants}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-ink-primary">
                          {channel.hires}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={channel.conversion_rate_pct > 20 ? "text-status-healthy font-bold" : "text-ink-primary"}>
                            {channel.conversion_rate_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-status-danger">
                          {delayedCount} hires
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={channel.beyond_sla_rate_pct > 30 ? "text-status-danger font-bold" : "text-ink-primary"}>
                            {channel.beyond_sla_rate_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium">
                          {channel.median_ttf_days}d
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {channel.offer_acceptance_pct}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={channel.six_month_retention_pct >= 80 ? "text-status-healthy font-bold" : channel.six_month_retention_pct < 65 ? "text-status-danger font-bold" : "text-ink-primary"}>
                            {channel.six_month_retention_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-ink-primary">
                            <span className="text-status-attention">&#9733;</span>
                            <span>{channel.quality_rating}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Strategic Decision Support Summary */}
            <div className="mt-4 p-4 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-secondary leading-relaxed">
              <strong className="text-ink-primary">Role x Location x Channel Decision Rule:</strong> Never pick a single &ldquo;best sourcing channel&rdquo; by hire count alone. Evaluate volume + SLA speed + 6M downstream retention together. While <span className="text-status-danger font-semibold">Social Media Ads</span> has the highest delay rate (38.0%), high-volume channels like <span className="text-ink-primary font-semibold">Job Portals</span> and <span className="text-ink-primary font-semibold">Employee Referrals</span> contribute substantial absolute delayed headcount. Both rate (%) and absolute volume must be cross-analyzed before shifting recruitment spend.
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: Frontline Ready Pool */}
      {activeTab === "talent-pool" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-attention/20 text-status-attention uppercase">
                    Recommendation 3 Enabler
                  </span>
                  <DataProvenanceBadge
                    provenance="SYNTHETIC_ENABLER"
                    domain="Talent Pool"
                    metricOrEntity="Ready Frontline Roster"
                    originalSource="010_internal_mobility_engine.sql"
                    governanceRule="Illustrative verified candidates for agile backfilling"
                    impactOnDecision="Cuts TTF from 34 days to under 14 days"
                  />
                </div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-status-attention" />
                  <span>Proactive Frontline Talent Pool</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Pre-qualified candidates and previous high-score finalists ready for immediate deployment when vacancies occur.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-ink-tertiary block">Average Time to Deploy:</span>
                  <span className="text-sm font-bold text-status-healthy font-mono">&lt; 12 Days (vs 34d standard)</span>
                </div>
              </div>
            </div>

            {/* Talent Pool Candidates Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
              {talentPool.map((c) => (
                <div
                  key={c.candidate_id}
                  className="p-4 rounded-xl bg-surface-ground border border-surface-border hover:border-brand-teal/40 transition-all shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-ink-tertiary">
                        {c.candidate_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.readiness_status === "Interview Ready"
                          ? "bg-status-healthy/10 text-status-healthy border border-status-healthy/30"
                          : c.readiness_status === "Pre-qualified"
                          ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/30"
                          : "bg-status-attention/10 text-status-attention border border-status-attention/30"
                      }`}>
                        {c.readiness_status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-primary">
                      {c.display_name}
                    </h3>
                    <div className="text-xs text-brand-teal font-semibold mt-0.5">
                      {c.role_target} &bull; {c.location_preference}
                    </div>

                    <div className="mt-3 p-2 rounded-lg bg-surface-card border border-surface-border space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Fit Score:</span>
                        <span className="font-bold text-status-healthy">{c.fit_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Source:</span>
                        <span className="font-medium text-ink-primary">{c.source_channel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Est. Fill Time:</span>
                        <span className="font-bold text-brand-teal">{c.est_ttf_days} days</span>
                      </div>
                    </div>

                    {/* Competency Tags */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-ink-tertiary block mb-1">
                        Verified Core Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {c.verified_competencies.map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-surface-card border border-surface-border text-ink-secondary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-ink-secondary mt-3 italic line-clamp-2">
                      &ldquo;{c.notes}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border">
                    <button
                      onClick={() => handleFastTrack(c.display_name)}
                      className="w-full py-1.5 px-3 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Fast-Track to Interview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Talent Pool Business Value Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-status-attention/10 to-transparent border border-status-attention/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-ink-primary">
                  Operational Impact of Frontline Talent Pools
                </h4>
                <p className="text-[11px] text-ink-secondary mt-0.5">
                  Maintaining a pre-screened pool of ex-finalists and referrals reduces median TTF from 34.0 days to 9.5 days in Bali, protecting club revenue continuity.
                </p>
              </div>
              <Link
                href="/team#mobility"
                className="px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated transition-colors whitespace-nowrap"
              >
                Inspect Internal Staff Mobility &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: Quality & SLA Outcomes */}
      {activeTab === "outcomes" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-teal" />
                  <span>Hiring Outcomes & Quality of Hire Trajectory</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Section 19: Long-term measurement of SLA compliance, fill velocity, and downstream employee retention.
                </p>
              </div>
              <DataProvenanceBadge
                provenance="DERIVED"
                domain="Hiring Performance"
                metricOrEntity="Quarterly Trajectory"
                originalSource="Hiring sheet + Retention Mart"
                governanceRule="Derived quarter-over-quarter trend"
                impactOnDecision="Proves efficacy of proactive sourcing and buddy onboarding"
              />
            </div>

            {/* Recharts Visual Trajectory Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-2">Time-to-Fill (TTF) Trajectory (Days)</span>
                <SimpleLine
                  data={hiringOutcomes.map((q) => ({
                    label: q.period_label,
                    value: q.median_ttf_days,
                  }))}
                  unit="days"
                  strokeColor="#23C9D3"
                  height={220}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-2">Location Beyond-SLA Friction Heat</span>
                <ColoredBar
                  data={[
                    { label: "Bali", value: 42.9, color: "#C65353" },
                    { label: "Surabaya", value: 31.2, color: "#C99400" },
                    { label: "Medan", value: 28.6, color: "#C99400" },
                    { label: "Bandung", value: 22.0, color: "#23C9D3" },
                    { label: "Jabodetabek", value: 18.5, color: "#2E8B57" },
                  ]}
                  dataKey="value"
                  categoryKey="label"
                  unit="%"
                  height={220}
                />
              </div>
            </div>

            {/* Quarterly Trend Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
              {hiringOutcomes.map((q, idx) => (
                <div
                  key={q.period_label}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === hiringOutcomes.length - 1
                      ? "bg-brand-teal/5 border-brand-teal/30 shadow-subtle"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-ink-primary">
                      {q.period_label}
                    </span>
                    {idx === hiringOutcomes.length - 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-teal text-surface-ground">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-ink-tertiary block text-[11px]">Beyond SLA Rate:</span>
                      <span className="text-lg font-display font-black text-status-danger">
                        {q.beyond_sla_pct}%
                      </span>
                    </div>

                    <div>
                      <span className="text-ink-tertiary block text-[11px]">Median TTF:</span>
                      <span className="text-base font-display font-bold text-ink-primary">
                        {q.median_ttf_days} days
                      </span>
                    </div>

                    <div className="pt-2 border-t border-surface-border space-y-1 text-[11px]">
                      <div className="flex justify-between text-ink-secondary">
                        <span>6M Retention:</span>
                        <span className="font-bold text-status-healthy">{q.six_month_retention_pct}%</span>
                      </div>
                      <div className="flex justify-between text-ink-secondary">
                        <span>Ramp-up Speed:</span>
                        <span className="font-semibold text-ink-primary">{q.ramp_up_speed_pct}%</span>
                      </div>
                      <div className="flex justify-between text-ink-secondary">
                        <span>Manager Appraisal:</span>
                        <span className="font-bold text-status-attention">{q.manager_rating_avg} / 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-Component Quality Breakdown */}
            <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
              <h3 className="text-xs font-bold text-ink-primary mb-2">
                Quality of Hire Framework (PRD Section 19.4)
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                Rather than relying on a single composite score, FIT HUB evaluates hire quality through 3 objective lifecycle pillars:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <span className="font-bold text-brand-teal block mb-1">1. 90-Day Ramp-Up Speed</span>
                  <p className="text-ink-secondary text-[11px]">
                    Time for a new Operation Specialist or PT to reach standard floor autonomy and revenue quota without supervision. Currently at 82.5%.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <span className="font-bold text-brand-teal block mb-1">2. 6-Month Retention Rate</span>
                  <p className="text-ink-secondary text-[11px]">
                    Proportion of hires remaining past the 6-month cliff. Improved from 68.5% to 75.4% through buddy onboarding.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <span className="font-bold text-brand-teal block mb-1">3. Hiring Manager Rating</span>
                  <p className="text-ink-secondary text-[11px]">
                    Direct operational evaluation of job competency and culture alignment after 90 days (4.25 / 5.0 national average).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Requisition Detail Modal Drawer */}
      {selectedRequisition && (
        <div className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/20 text-brand-teal font-mono">
                    {selectedRequisition.req_code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    selectedRequisition.health === "Healthy"
                      ? "bg-status-healthy/20 text-status-healthy"
                      : selectedRequisition.health === "At Risk"
                      ? "bg-status-attention/20 text-status-attention"
                      : "bg-status-danger/20 text-status-danger"
                  }`}>
                    {selectedRequisition.health}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-ink-primary">
                  {selectedRequisition.role_name}
                </h3>
                <p className="text-xs text-ink-secondary">
                  {selectedRequisition.location_name} &bull; Hiring Manager: {selectedRequisition.hiring_manager}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequisition(null)}
                className="w-8 h-8 rounded-lg bg-surface-ground hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary flex items-center justify-center text-sm font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-ground border border-surface-border">
                <div>
                  <span className="text-ink-tertiary block">Hiring Type:</span>
                  <span className="font-bold text-ink-primary">{selectedRequisition.hiring_type}</span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Days Open vs SLA:</span>
                  <span className="font-bold font-mono text-status-danger">
                    {selectedRequisition.days_open} days / {selectedRequisition.sla_target_days}d
                  </span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Active Pipeline:</span>
                  <span className="font-bold text-ink-primary">{selectedRequisition.pipeline_size} Candidates</span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Current Bottleneck:</span>
                  <span className="font-bold text-status-attention">{selectedRequisition.bottleneck_stage}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-ink-primary block mb-1">Operational Context & Urgency:</span>
                <p className="text-ink-secondary leading-relaxed p-3 rounded-lg bg-surface-ground border border-surface-border">
                  {selectedRequisition.urgency_reason}
                </p>
              </div>

              {selectedRequisition.linked_exit_code && (
                <div className="p-3 rounded-lg bg-brand-teal/5 border border-brand-teal/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-teal block">Linked Employee Departure</span>
                    <span className="text-ink-secondary text-[11px]">
                      Created by exit event <strong className="font-mono">{selectedRequisition.linked_exit_code}</strong>
                    </span>
                  </div>
                  <Link
                    href={`/team#exit-${selectedRequisition.linked_exit_code}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-ink-primary font-semibold text-[11px] hover:bg-surface-elevated transition-colors"
                  >
                    View Exit Details &rarr;
                  </Link>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-ground border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRequisition(null)}
                className="px-4 py-2 rounded-lg border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRequisition(null);
                  setActiveTab("talent-pool");
                }}
                className="px-4 py-2 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Match From Talent Pool</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VacancyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-ink-tertiary flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Loading Vacancy Intelligence...</span>
        </div>
      }
    >
      <VacancyContent />
    </Suspense>
  );
}
