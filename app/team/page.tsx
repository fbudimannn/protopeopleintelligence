"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/lib/context/FilterContext";
import DataProvenanceBadge from "@/components/DataProvenanceBadge";
import {
  getRetentionCohorts,
  getEngagementSummaries,
  getInternalMobilityMatches,
  getExitEvents,
  getTenureBands,
  getVoiceThemes,
} from "@/lib/data/api";
import {
  RetentionCohort,
  EngagementSummary,
  InternalMobilityMatch,
  ExitEvent,
  TenureBand,
  VoiceTheme,
} from "@/lib/data/fixtures";
import {
  Users,
  GitBranch,
  TrendingDown,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  HelpCircle,
  Zap,
  Info,
  Award,
  BookOpen,
  ArrowRight,
  Layers,
  Clock,
  Briefcase,
} from "lucide-react";

type TeamTab = "overview" | "cliff" | "engagement" | "mobility" | "exits";

function TeamContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TeamTab) || "overview";

  const [activeTab, setActiveTab] = useState<TeamTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [cohorts, setCohorts] = useState<RetentionCohort[]>([]);
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [mobilityMatches, setMobilityMatches] = useState<InternalMobilityMatch[]>([]);
  const [exitEvents, setExitEvents] = useState<ExitEvent[]>([]);
  const [tenureBands, setTenureBands] = useState<TenureBand[]>([]);
  const [voiceThemes, setVoiceThemes] = useState<VoiceTheme[]>([]);

  // Local page filters
  const { selectedLocation, selectedRole, selectedPeriod } = useFilters();
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [readinessFilter, setReadinessFilter] = useState<"ALL" | "Ready" | "Near Ready" | "Development Needed">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Interaction State
  const [selectedCandidate, setSelectedCandidate] = useState<InternalMobilityMatch | null>(null);
  const [promotionSuccess, setPromotionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TeamTab;
    if (tabParam && ["overview", "cliff", "engagement", "mobility", "exits"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cohortRes, engRes, mobRes, exitRes, bandRes, voiceRes] = await Promise.all([
        getRetentionCohorts(),
        getEngagementSummaries(),
        getInternalMobilityMatches(),
        getExitEvents(),
        getTenureBands(),
        getVoiceThemes(),
      ]);

      setCohorts(cohortRes.data);
      setEngagements(engRes.data);
      setMobilityMatches(mobRes.data);
      setExitEvents(exitRes.data);
      setTenureBands(bandRes.data);
      setVoiceThemes(voiceRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  // Filtered Cohorts
  const filteredCohorts = useMemo(() => {
    return cohorts.filter((c) => {
      if (selectedLocation !== "All Locations" && c.location_name !== selectedLocation) {
        return false;
      }
      if (selectedRole !== "All Roles" && c.role_name !== selectedRole) {
        return false;
      }
      if (riskFilter !== "ALL" && c.risk_level !== riskFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          c.role_name.toLowerCase().includes(q) ||
          c.location_name.toLowerCase().includes(q) ||
          c.primary_exit_driver.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cohorts, selectedLocation, selectedRole, riskFilter, searchQuery]);

  // Filtered Mobility Candidates
  const filteredMobility = useMemo(() => {
    return mobilityMatches.filter((m) => {
      if (selectedLocation !== "All Locations" && m.current_location_name !== selectedLocation && m.target_location_name !== selectedLocation) {
        return false;
      }
      if (selectedRole !== "All Roles" && m.current_role_name !== selectedRole && m.target_role_name !== selectedRole) {
        return false;
      }
      if (readinessFilter !== "ALL" && m.readiness_status !== readinessFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          m.candidate_name.toLowerCase().includes(q) ||
          m.employee_code.toLowerCase().includes(q) ||
          m.current_role_name.toLowerCase().includes(q) ||
          m.target_role_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mobilityMatches, selectedLocation, selectedRole, readinessFilter, searchQuery]);

  // Handle Promotion Simulation
  const handlePromote = (candidateName: string, targetRole: string, targetLoc: string) => {
    setPromotionSuccess(`${candidateName} promoted to ${targetRole} (${targetLoc})`);
    setSelectedCandidate(null);
    setTimeout(() => {
      setPromotionSuccess(null);
    }, 4500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header with Lifecycle Context */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              POST-HIRE LIFECYCLE
            </span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover & Experience"
              metricOrEntity="Historical Exits & Survey Results"
              originalSource="Turnover sheet (889 exits) + Engagement (1,636 respondents)"
              governanceRule="Exact empirical exit rates, voluntary classification, and eNPS scores."
              impactOnDecision="Pins Career Development as #1 exit reason (solving with internal mobility)."
            />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-primary tracking-tight">
            Team Intelligence & Internal Mobility
          </h1>
          <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
            Diagnose early tenure attrition, evaluate employee experience sentiment, and operationalize internal mobility to solve FIT HUB&apos;s number one exit driver.
          </p>
        </div>

        {/* Action Link to Vacancy */}
        <div className="flex items-center gap-3">
          <Link
            href="/vacancy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated hover:border-brand-teal/40 transition-all shadow-subtle"
          >
            <Briefcase className="w-4 h-4 text-brand-teal" />
            <span>Switch to Vacancy (Pre-Hire)</span>
            <ChevronRight className="w-4 h-4 text-ink-tertiary" />
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Row (6 Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Headcount */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Tracked Headcount</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              408
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">13 Clubs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Active Frontline</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Headcount"
              metricOrEntity="Club Employees"
              originalSource="Turnover sheet"
              governanceRule="Empirical club baseline"
              impactOnDecision="Operational baseline"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 2: Annualized Turnover */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Annualized Turnover</span>
            <TrendingDown className="w-4 h-4 text-status-danger" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              44.8%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">Bali: 62.5%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Voluntary Rate</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover"
              metricOrEntity="Annualized Exits"
              originalSource="Turnover sheet"
              governanceRule="Empirical calculation"
              impactOnDecision="Identifies hotspot clubs"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 3: Early Attrition (<12M) */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Early Attrition</span>
            <AlertTriangle className="w-4 h-4 text-status-attention" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-attention">
              57.4%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">&lt; 12 Months</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Onboarding Cliff</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Tenure"
              metricOrEntity="First-Year Exits"
              originalSource="Turnover sheet"
              governanceRule="Empirical tenure cutoff"
              impactOnDecision="Justifies buddy onboarding"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 4: Mid-Tenure Dip (13-18M) */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Mid-Tenure Dip</span>
            <Clock className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              21.9%
            </span>
            <span className="text-[11px] font-semibold text-status-attention">1Y to 1.5Y</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Career Plateau</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Retention"
              metricOrEntity="Tenure Dip Rate"
              originalSource="Turnover sheet"
              governanceRule="Empirical tenure distribution"
              impactOnDecision="Signals need for promotion"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 5: Regrettable Loss */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Regrettable Loss</span>
            <AlertTriangle className="w-4 h-4 text-status-danger" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              27.8%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">247 Top Staff</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>High Performer Exits</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover"
              metricOrEntity="Regrettable Losses"
              originalSource="Turnover sheet"
              governanceRule="Empirical HR tag"
              impactOnDecision="Proves cost of attrition"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 6: Ready Mobility Matches */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Ready Successors</span>
            <Sparkles className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-brand-teal">
              4
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">Score &gt;= 85%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Mercer Qualified</span>
            <DataProvenanceBadge
              provenance="SYNTHETIC_ENABLER"
              domain="Mobility"
              metricOrEntity="Scored Candidates"
              originalSource="010_internal_mobility_engine.sql"
              governanceRule="Mercer-style scoring model"
              impactOnDecision="Bypasses external hiring delay"
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* 3. Interactive Tab Bar Navigation */}
      <div className="flex items-center justify-between border-b border-surface-border gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Retention & Lifecycle Cohorts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal/10 text-brand-teal">
              {filteredCohorts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("cliff")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "cliff"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Tenure Cliff & Survival Curve</span>
          </button>

          <button
            onClick={() => setActiveTab("engagement")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "engagement"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Voice of Employee & eNPS</span>
          </button>

          <button
            onClick={() => setActiveTab("mobility")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "mobility"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Sparkles className="w-4 h-4 text-status-attention" />
            <span>Internal Mobility Match</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal text-surface-ground font-bold">
              {filteredMobility.filter((m) => m.readiness_status === "Ready").length} Ready
            </span>
          </button>

          <button
            onClick={() => setActiveTab("exits")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "exits"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Exit-to-Vacancy Continuity</span>
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

      {/* Promotion Success Notification */}
      {promotionSuccess && (
        <div className="p-4 rounded-xl bg-status-healthy/10 border border-status-healthy/30 flex items-center justify-between text-status-healthy animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Internal Promotion Approved
              </p>
              <p className="text-xs opacity-90">
                {promotionSuccess}. Vacancy requisition status automatically updated to &ldquo;Filled via Internal Transfer&rdquo;.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPromotionSuccess(null)}
            className="text-xs underline hover:opacity-75 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. TAB 1: Retention & Lifecycle Cohorts */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type="text"
                  placeholder="Search role, location, or exit driver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                />
              </div>

              {/* Risk Level Filter */}
              <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      riskFilter === r
                        ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {r === "ALL" ? "All Risk" : `${r} Risk`}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-ink-tertiary">
              Showing <span className="font-semibold text-ink-primary">{filteredCohorts.length}</span> cohorts
            </div>
          </div>

          {/* 12-Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left 8 Columns: Cohort Table */}
            <div className="xl:col-span-8 space-y-4">
              <div className="rounded-xl bg-surface-card border border-surface-border overflow-hidden shadow-subtle">
                <div className="p-4 border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-brand-teal" />
                    <h2 className="text-sm font-bold text-ink-primary font-display">
                      Workforce Retention & Cohort Attrition Matrix
                    </h2>
                  </div>
                  <span className="text-xs text-ink-tertiary">
                    Empirical data from 889 historical exits
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-ground/70 border-b border-surface-border text-ink-secondary font-semibold">
                        <th className="py-3 px-4">Role / Job Family</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-3 text-center">Headcount</th>
                        <th className="py-3 px-3 text-center">Turnover %</th>
                        <th className="py-3 px-3 text-center">&lt; 12M Cliff</th>
                        <th className="py-3 px-3 text-center">1Y to 1.5Y Dip</th>
                        <th className="py-3 px-3 text-center">Regrettable %</th>
                        <th className="py-3 px-4">Primary Exit Reason</th>
                        <th className="py-3 px-3 text-center">Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {filteredCohorts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-ink-tertiary">
                            No cohorts match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCohorts.map((cohort) => (
                          <tr
                            key={cohort.cohort_id}
                            className={`hover:bg-surface-elevated/80 transition-colors ${
                              cohort.risk_level === "HIGH" ? "bg-status-danger/5" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-semibold text-ink-primary">
                              {cohort.role_name}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-ground border border-surface-border text-ink-secondary">
                                {cohort.location_name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-ink-primary">
                              {cohort.headcount}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold">
                              <span className={cohort.annualized_turnover_pct > 50 ? "text-status-danger" : "text-ink-primary"}>
                                {cohort.annualized_turnover_pct}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className={cohort.early_attrition_pct > 60 ? "text-status-danger font-bold" : "text-status-attention"}>
                                {cohort.early_attrition_pct}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              {cohort.dip_tenure_pct}%
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className={cohort.regrettable_loss_pct > 30 ? "text-status-danger font-semibold" : "text-ink-primary"}>
                                {cohort.regrettable_loss_pct}%
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-ink-secondary">
                              {cohort.primary_exit_driver}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {cohort.risk_level === "HIGH" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-danger/20 text-status-danger border border-status-danger/30">
                                  HIGH RISK
                                </span>
                              ) : cohort.risk_level === "MEDIUM" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-attention/20 text-status-attention border border-status-attention/30">
                                  MEDIUM
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-healthy/20 text-status-healthy border border-status-healthy/30">
                                  LOW
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lifecycle Continuity Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/5 to-transparent border border-brand-teal/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-primary">
                      Solving #1 Exit Driver: Career Development
                    </h4>
                    <p className="text-[11px] text-ink-secondary">
                      Operation Specialists and Personal Trainers cite lack of visible career tracks as their primary departure driver. Match top talent directly to open vacancies.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("mobility")}
                  className="px-3 py-1.5 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors whitespace-nowrap"
                >
                  View Mobility Candidates
                </button>
              </div>
            </div>

            {/* Right 4 Columns: Systemic Diagnostics */}
            <div className="xl:col-span-4 space-y-4">
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3 flex items-center justify-between">
                  <span>Executive Retention Signals</span>
                  <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
                </h3>

                {/* Diagnostic 1: Early Attrition */}
                <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 mb-4 hover:border-status-danger/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-danger/20 text-status-danger">
                      SYSTEMIC CLIFF #1
                    </span>
                    <span className="text-[11px] text-ink-tertiary">Months 0 to 12</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    Frontline 90-Day Ramp-Up Cliff
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    57.4% of all departures occur before month 12. Operation Specialists in Bali reach 68.4% early attrition, driven by intense shift rosters and lack of floor mentoring.
                  </p>
                  <div className="p-2.5 rounded-lg bg-surface-ground border border-surface-border mb-3 text-[11px]">
                    <span className="font-semibold text-ink-primary block mb-0.5">
                      Recommendation 4 Action:
                    </span>
                    <span className="text-ink-secondary">
                      Deploy 30-day dedicated shift buddies and formalize 60-day check-in milestones with Area Managers.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("cliff")}
                    className="w-full py-1.5 px-3 rounded-lg bg-surface-card border border-surface-border text-ink-primary text-xs font-bold hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Inspect Tenure Survival Curve</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-teal" />
                  </button>
                </div>

                {/* Diagnostic 2: Mid-Tenure Plateau */}
                <div className="p-4 rounded-xl bg-status-attention/5 border border-status-attention/20 hover:border-status-attention/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-attention/20 text-status-attention">
                      RETENTION DIP #2
                    </span>
                    <span className="text-[11px] text-ink-tertiary">Months 13 to 18</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    Mid-Tenure Seniority Plateau
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    High performers who successfully survive Year 1 face a second attrition spike (21.9% dip) when external hires take managerial slots instead of internal staff.
                  </p>
                  <button
                    onClick={() => setActiveTab("mobility")}
                    className="w-full py-1.5 px-3 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Internal Mobility Engine</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Tenure Cliff & Survival Curve */}
      {activeTab === "cliff" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-status-danger" />
                  <span>Tenure Survival Curve & Frontline Exit Cliff</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Breakdown of 889 employee departures across milestone tenure intervals. Over half of all losses occur within the first year.
                </p>
              </div>
              <DataProvenanceBadge
                provenance="OBSERVED_CASE_STUDY"
                domain="Tenure Milestones"
                metricOrEntity="Tenure Interval Breakdown"
                originalSource="Turnover sheet (889 departures)"
                governanceRule="Exact tenure in months categorized by milestone bands"
                impactOnDecision="Pins onboarding failure and 1Y-1.5Y promotion ceiling"
              />
            </div>

            {/* Stepped Tenure Band Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
              {tenureBands.map((band, idx) => (
                <div
                  key={band.band_label}
                  className={`p-4 rounded-xl border relative transition-all ${
                    idx === 0 || idx === 1
                      ? "bg-status-danger/5 border-status-danger/30 shadow-subtle"
                      : idx === 3
                      ? "bg-status-attention/5 border-status-attention/30"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase">
                    Stage {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-ink-primary mt-0.5 mb-1">
                    {band.band_label}
                  </h4>
                  <div className="text-2xl font-display font-black text-ink-primary mb-1">
                    {band.exit_count} exits
                  </div>
                  <div className="space-y-1 text-[11px] pt-2 border-t border-surface-border">
                    <div className="flex justify-between text-ink-secondary">
                      <span>Band Share:</span>
                      <span className="font-bold text-ink-primary">{band.pct_of_exits}%</span>
                    </div>
                    <div className="flex justify-between text-ink-secondary">
                      <span>Cumulative:</span>
                      <span className={`font-bold ${idx <= 2 ? "text-status-danger" : "text-ink-primary"}`}>
                        {band.cumulative_pct}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-ink-tertiary uppercase">
                    {band.cliff_stage}
                  </div>
                </div>
              ))}
            </div>

            {/* Root Cause & Action Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
                <h4 className="text-xs font-bold text-status-danger mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Early Cliff (0 to 6 Months: 42.7% of all Exits)</span>
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  New hires face steep shift expectations without adequate buddy accompaniment. When opening or closing shifts encounter POS errors or equipment malfunctions, the lack of floor support generates immediate psychological exhaustion.
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-surface-card border border-surface-border text-[11px] text-ink-primary font-medium">
                  Recommendation 4: Introduce peer buddy pairing for all frontline roles during days 1 to 30.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
                <h4 className="text-xs font-bold text-status-attention mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>The Mid-Tenure Plateau (13 to 18 Months: 21.9% of Exits)</span>
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Staff who demonstrate top operational capability feel stuck when there is no transparent rubric for advancement to Lead Trainer, Assistant Club Manager, or Sales Lead.
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-surface-card border border-surface-border text-[11px] text-ink-primary font-medium">
                  Recommendation 5: Publish Mercer competency criteria and establish quarterly internal qualification cycles.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: Voice of Employee & eNPS Explorer */}
      {activeTab === "engagement" && (
        <div className="space-y-6">
          {/* World-Class eNPS with Survivorship Bias Warning */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-healthy/20 text-status-healthy uppercase">
                    Annual Engagement Survey
                  </span>
                  <DataProvenanceBadge
                    provenance="OBSERVED_CASE_STUDY"
                    domain="Engagement"
                    metricOrEntity="eNPS & 6 Core Dimensions"
                    originalSource="Engagement sheet (1,636 respondents)"
                    governanceRule="Calculated from Promoter (68.0%) minus Detractor (11.4%)"
                    impactOnDecision="Subject to mandatory survivorship bias disclosure"
                  />
                </div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-brand-teal" />
                  <span>Voice of Employee Sentiment & eNPS Explorer</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  1,234 respondents across 13 gym clubs evaluated FIT HUB across 6 operational dimensions.
                </p>
              </div>

              {/* eNPS Badge */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-ground border border-surface-border">
                <div className="text-right">
                  <span className="text-[11px] text-ink-tertiary block">Net eNPS Score</span>
                  <span className="text-2xl font-display font-black text-status-healthy">+56.6</span>
                </div>
                <div className="text-xs text-ink-secondary border-l border-surface-border pl-3">
                  <div>Promoters: <strong className="text-status-healthy">68.0%</strong></div>
                  <div>Passives: <strong>20.6%</strong></div>
                  <div>Detractors: <strong className="text-status-danger">11.4%</strong></div>
                </div>
              </div>
            </div>

            {/* Critical Survivorship Bias Warning Banner */}
            <div className="p-4 rounded-xl bg-status-attention/10 border border-status-attention/30 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-attention flex-shrink-0 mt-0.5" />
              <div className="text-xs text-ink-secondary leading-relaxed">
                <strong className="text-ink-primary block mb-0.5">
                  Analytical Governance Disclosure: Survivorship Bias in eNPS
                </strong>
                While a +56.6 net eNPS reflects high brand pride and camaraderie, the survey was administered only to active employees. Dissatisfied frontline staff departed prior to survey rollout (57.4% exiting in Year 1). True organizational sentiment must be interpreted in conjunction with turnover data.
              </div>
            </div>

            {/* 6 Engagement Dimensions Grid */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3">
              6 Core Workplace Dimensions (Out of 6.00 Scale)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {voiceThemes.map((v) => (
                <div
                  key={v.dimension_name}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    v.sentiment === "CONCERN"
                      ? "bg-status-danger/5 border-status-danger/30 shadow-subtle"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-ink-primary">
                        {v.dimension_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.sentiment === "CONCERN"
                          ? "bg-status-danger/20 text-status-danger"
                          : v.sentiment === "POSITIVE"
                          ? "bg-status-healthy/20 text-status-healthy"
                          : "bg-status-attention/20 text-status-attention"
                      }`}>
                        {v.score} / 6.00
                      </span>
                    </div>

                    <div className="text-[11px] text-ink-tertiary mb-2">
                      Benchmark: {v.national_benchmark} &bull; {v.segment_concentration}
                    </div>

                    <p className="text-xs text-ink-secondary leading-relaxed italic mb-3 p-2.5 rounded-lg bg-surface-card border border-surface-border">
                      &ldquo;{v.verbatim_sample}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-border text-[11px] text-brand-teal font-medium">
                    <span className="text-ink-tertiary block text-[10px] uppercase font-bold">Action:</span>
                    {v.strategic_action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: Internal Mobility & Readiness Match */}
      {activeTab === "mobility" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/20 text-brand-teal uppercase">
                    Mercer Capability Engine (010_internal_mobility_engine.sql)
                  </span>
                  <DataProvenanceBadge
                    provenance="SYNTHETIC_ENABLER"
                    domain="Mobility"
                    metricOrEntity="Scored Candidate Matches"
                    originalSource="010_internal_mobility_engine.sql"
                    governanceRule="Weighted composite scoring (Capabilities 40%, Performance 30%, Tenure 20%, Gap 10%)"
                    impactOnDecision="Solves Career Development exit driver"
                  />
                </div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-teal" />
                  <span>Internal Mobility & Successor Readiness Roster</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Match high-performing frontline staff to managerial vacancies before they seek career progression elsewhere.
                </p>
              </div>

              {/* Readiness Filter */}
              <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                {(["ALL", "Ready", "Near Ready", "Development Needed"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setReadinessFilter(status)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      readinessFilter === status
                        ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {status === "ALL" ? "All Tiers" : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Match Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
              {filteredMobility.map((c) => (
                <div
                  key={c.match_id}
                  className="p-4 rounded-xl bg-surface-ground border border-surface-border hover:border-brand-teal/40 transition-all shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-ink-tertiary">
                        {c.employee_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.readiness_status === "Ready"
                          ? "bg-status-healthy/20 text-status-healthy border border-status-healthy/30"
                          : c.readiness_status === "Near Ready"
                          ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                          : "bg-status-attention/20 text-status-attention border border-status-attention/30"
                      }`}>
                        {c.readiness_status} ({c.final_readiness_score}%)
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-primary">
                      {c.candidate_name}
                    </h3>

                    {/* Transition Route */}
                    <div className="mt-1 flex items-center gap-1 text-xs text-ink-secondary font-medium">
                      <span>{c.current_role_name}</span>
                      <ArrowRight className="w-3 h-3 text-brand-teal flex-shrink-0" />
                      <span className="font-bold text-brand-teal">{c.target_role_name}</span>
                    </div>
                    <div className="text-[11px] text-ink-tertiary">
                      {c.current_location_name} &rarr; {c.target_location_name}
                    </div>

                    {/* Metric pill */}
                    <div className="mt-3 p-2 rounded-lg bg-surface-card border border-surface-border space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Capability Coverage:</span>
                        <span className="font-bold text-status-healthy">{c.capability_coverage_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Performance:</span>
                        <span className="font-bold text-ink-primary">{c.performance_rating} / 5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Tenure:</span>
                        <span className="font-semibold text-ink-primary">{c.tenure_months} months</span>
                      </div>
                    </div>

                    {/* Top strength */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-ink-tertiary block mb-0.5">
                        Top Strength:
                      </span>
                      <p className="text-xs text-ink-primary font-medium">
                        {c.top_strength}
                      </p>
                    </div>

                    {/* Action plan */}
                    <div className="mt-2">
                      <span className="text-[10px] font-semibold text-ink-tertiary block mb-0.5">
                        Priority Development:
                      </span>
                      <p className="text-[11px] text-ink-secondary italic line-clamp-2">
                        {c.priority_development_action}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border">
                    <button
                      onClick={() => setSelectedCandidate(c)}
                      className="w-full py-1.5 px-3 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Evaluate for Promotion</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Strategic Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/10 to-transparent border border-brand-teal/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-ink-primary">
                  The Power of Internal Backfilling
                </h4>
                <p className="text-[11px] text-ink-secondary mt-0.5">
                  Promoting an internal Operation Specialist to Assistant Club Manager takes under 10 days, eliminates external agency costs, and protects club operational knowledge.
                </p>
              </div>
              <Link
                href="/vacancy"
                className="px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated transition-colors whitespace-nowrap"
              >
                Inspect Linked Vacancies &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 5: Exit-to-Vacancy Continuity */}
      {activeTab === "exits" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-teal" />
                  <span>Exit-to-Vacancy Continuity Registry</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  PRD Section 27.2: Illustrating how every frontline employee departure automatically generates a replacement requisition in Vacancy.
                </p>
              </div>
              <DataProvenanceBadge
                provenance="DERIVED"
                domain="Lifecycle Loop"
                metricOrEntity="Exit to Requisition Binding"
                originalSource="Turnover sheet + Hiring sheet"
                governanceRule="Synchronized exit code to requisition code mapping"
                impactOnDecision="Demonstrates closed-loop lifecycle intelligence"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                    <th className="py-3 px-4">Exit Code</th>
                    <th className="py-3 px-4">Staff Code & Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-3 text-center">Tenure</th>
                    <th className="py-3 px-3 text-center">Type</th>
                    <th className="py-3 px-3 text-center">Regrettable</th>
                    <th className="py-3 px-4">Primary Reason</th>
                    <th className="py-3 px-4">Triggered Vacancy</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {exitEvents.map((evt) => (
                    <tr key={evt.exit_code} className="hover:bg-surface-elevated/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-status-danger">
                        {evt.exit_code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink-primary block">
                          {evt.role_name}
                        </span>
                        <span className="text-[11px] text-ink-tertiary font-mono">
                          {evt.employee_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-ground border border-surface-border text-ink-secondary">
                          {evt.location_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {evt.tenure_months}m
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {evt.resignation_type}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {evt.is_regrettable ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-status-danger/20 text-status-danger">
                            YES
                          </span>
                        ) : (
                          <span className="text-ink-tertiary">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ink-secondary">
                        {evt.primary_reason}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-brand-teal block">
                          {evt.triggered_requisition_code}
                        </span>
                        <span className="text-[10px] text-ink-tertiary">
                          Replacement Requisition
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          href="/vacancy"
                          className="px-2.5 py-1 rounded-md bg-surface-ground border border-surface-border text-[11px] font-semibold text-brand-teal hover:bg-brand-teal hover:text-surface-ground transition-all whitespace-nowrap"
                        >
                          View Requisition &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Promotion Evaluation Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-teal/20 text-brand-teal">
                    {selectedCandidate.employee_code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-healthy/20 text-status-healthy">
                    {selectedCandidate.readiness_status} ({selectedCandidate.final_readiness_score}%)
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-ink-primary">
                  {selectedCandidate.candidate_name}
                </h3>
                <p className="text-xs text-ink-secondary">
                  Current: {selectedCandidate.current_role_name} ({selectedCandidate.current_location_name})
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-lg bg-surface-ground hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary flex items-center justify-center text-sm font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
                <span className="text-[10px] font-bold uppercase text-brand-teal block mb-0.5">
                  Target Role & Location
                </span>
                <div className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <span>{selectedCandidate.target_role_name}</span>
                  <span className="text-ink-tertiary">&bull;</span>
                  <span className="text-ink-secondary">{selectedCandidate.target_location_name} Cluster</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-ground border border-surface-border">
                <div>
                  <span className="text-ink-tertiary block">Capability Fit:</span>
                  <span className="font-bold text-status-healthy text-sm">
                    {selectedCandidate.capability_coverage_pct}%
                  </span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Performance:</span>
                  <span className="font-bold text-ink-primary text-sm">
                    {selectedCandidate.performance_rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Club Tenure:</span>
                  <span className="font-bold text-ink-primary text-sm">
                    {selectedCandidate.tenure_months} months
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-ink-primary block mb-1">Demonstrated Strengths:</span>
                <p className="text-ink-secondary p-3 rounded-lg bg-surface-ground border border-surface-border">
                  {selectedCandidate.top_strength}
                </p>
              </div>

              <div>
                <span className="font-bold text-ink-primary block mb-1">Onboarding & Transition Plan:</span>
                <p className="text-ink-secondary p-3 rounded-lg bg-surface-ground border border-surface-border">
                  {selectedCandidate.priority_development_action}
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-ground border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-lg border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handlePromote(
                    selectedCandidate.candidate_name,
                    selectedCandidate.target_role_name,
                    selectedCandidate.target_location_name
                  )
                }
                className="px-4 py-2 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Promotion & Assign Requisition</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-ink-tertiary flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Loading Team Intelligence...</span>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
