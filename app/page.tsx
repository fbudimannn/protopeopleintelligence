"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  Zap,
  HeartHandshake,
  Award,
  Target,
  Filter,
  RotateCcw,
} from "lucide-react";
import {
  useFilters,
  matchLocationHierarchy,
  matchRoleHierarchy,
  matchPeriod,
  formatPeriodLabel,
} from "@/lib/context/FilterContext";
import {
  SEED_DATA,
  getEngagementMetrics,
} from "@/lib/data/seed";

/* ─── Progress Bar ─── */
function ProgressBar({
  value,
  max = 100,
  tone = "teal",
  label,
  detail,
}: {
  value: number;
  max?: number;
  tone?: "teal" | "danger" | "attention" | "healthy";
  label: string;
  detail?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap = {
    teal: "bg-brand-teal",
    danger: "bg-status-danger",
    attention: "bg-status-attention",
    healthy: "bg-status-healthy",
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-secondary font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-ink-primary">{value}%</span>
          {detail && <span className="text-ink-tertiary text-[10px]">{detail}</span>}
        </div>
      </div>
      <div className="h-2 bg-surface-ground rounded-full overflow-hidden border border-surface-border/50">
        <div
          className={`h-full rounded-full ${colorMap[tone]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── KPI Scorecard ─── */
function ScoreCard({
  label,
  value,
  unit,
  tone,
  icon,
  subLabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone: "teal" | "danger" | "attention" | "healthy";
  icon: React.ReactNode;
  subLabel: string;
}) {
  const toneMap = {
    teal: "border-brand-teal/30 bg-brand-teal/5",
    danger: "border-status-danger/30 bg-status-danger/5",
    attention: "border-status-attention/30 bg-status-attention/5",
    healthy: "border-status-healthy/30 bg-status-healthy/5",
  };
  const valueColor = {
    teal: "text-brand-teal",
    danger: "text-status-danger",
    attention: "text-status-attention",
    healthy: "text-status-healthy",
  };
  return (
    <div className={`p-5 rounded-xl border ${toneMap[tone]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">{label}</span>
        <div className={`p-1.5 rounded-lg ${toneMap[tone]}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-spartan font-black ${valueColor[tone]}`}>{value}</span>
        {unit && <span className="text-sm text-ink-tertiary font-medium">{unit}</span>}
      </div>
      <p className="text-[11px] text-ink-secondary mt-1.5 leading-relaxed">{subLabel}</p>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function HomePage() {
  const {
    period,
    clusterFilter,
    provinceFilter,
    cityFilter,
    jobFamilyFilter,
    roleFilter,
    resetFilters,
  } = useFilters();

  const isFiltered =
    period !== "ALL_TIME" ||
    clusterFilter !== "ALL" ||
    provinceFilter !== "ALL" ||
    cityFilter !== "ALL" ||
    jobFamilyFilter !== "ALL" ||
    roleFilter !== "ALL";

  // Dynamic Requisitions based on all active global filters
  const filteredReqs = useMemo(() => {
    return SEED_DATA.requisitions.filter((r) => {
      const locMatch = matchLocationHierarchy(r.location, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(r.role, jobFamilyFilter, roleFilter);
      const periodMatch = matchPeriod(r.openedDate, period, r.id);
      return locMatch && roleMatch && periodMatch;
    });
  }, [clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, period]);

  // Dynamic Employees based on all active global filters
  const filteredEmployees = useMemo(() => {
    return SEED_DATA.employees.filter((e) => {
      const locMatch = matchLocationHierarchy(e.location, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(e.role, jobFamilyFilter, roleFilter);
      const periodMatch = matchPeriod(e.hireDate, period, e.id);
      return locMatch && roleMatch && periodMatch;
    });
  }, [clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, period]);

  // Derived Dynamic Vacancy KPIs
  const totalReqs = filteredReqs.length;
  const replacementReqs = filteredReqs.filter((r) => r.demandType === "REPLACEMENT").length;
  const expansionReqs = filteredReqs.filter((r) => r.demandType === "NEW_EXPANSION").length;
  const replacementSharePct = totalReqs > 0 ? Number(((replacementReqs / totalReqs) * 100).toFixed(1)) : 68.1;
  const expansionSharePct = totalReqs > 0 ? Number(((expansionReqs / totalReqs) * 100).toFixed(1)) : 31.9;
  const beyondSlaCount = filteredReqs.filter((r) => r.isBeyondSla).length;
  const beyondSlaPct = totalReqs > 0 ? Number(((beyondSlaCount / totalReqs) * 100).toFixed(1)) : 27.5;
  const avgDaysOpen = totalReqs > 0
    ? Number((filteredReqs.reduce((acc, r) => acc + r.currentDaysOpen, 0) / totalReqs).toFixed(1))
    : 34.2;
  const slaTarget = 28;

  // Derived Dynamic Retention KPIs
  const exitedStaff = useMemo(() => filteredEmployees.filter((e) => e.status === "EXITED"), [filteredEmployees]);
  const activeStaff = useMemo(() => filteredEmployees.filter((e) => e.status === "ACTIVE"), [filteredEmployees]);
  const totalActiveStaff = activeStaff.length;
  const totalExits = exitedStaff.length;
  const earlyExits = exitedStaff.filter((e) => e.tenureMonths < 12).length;
  const earlyExitPct = totalExits > 0 ? Number(((earlyExits / totalExits) * 100).toFixed(1)) : 57.4;
  const voluntaryExits = exitedStaff.filter((e) => e.exitDetails?.exitType === "VOLUNTARY").length;
  const voluntaryPct = totalExits > 0 ? Number(((voluntaryExits / totalExits) * 100).toFixed(1)) : 68.2;
  const regrettableExits = exitedStaff.filter((e) => e.exitDetails?.regrettable).length;
  const regrettablePct = totalExits > 0 ? Number(((regrettableExits / totalExits) * 100).toFixed(1)) : 27.8;

  const approxHeadcount = totalActiveStaff + totalExits;
  const annualizedTurnoverRate = approxHeadcount > 0 ? Number(((totalExits / approxHeadcount) * 100).toFixed(1)) : 24.8;

  // Promotion Readiness Pool
  const readyNowCount = activeStaff.filter((e) => e.promotionReadiness === "READY_NOW").length;
  const ready6MCount = activeStaff.filter((e) => e.promotionReadiness === "READY_6M").length;

  // Dynamic Hotspot Location Breakdown
  const hotspotLoc = useMemo(() => {
    const list = filteredReqs.length > 0 ? filteredReqs : SEED_DATA.requisitions;
    const locMap: Record<string, { location: string; total: number; beyondSla: number }> = {};
    list.forEach((r) => {
      if (!locMap[r.location]) locMap[r.location] = { location: r.location, total: 0, beyondSla: 0 };
      locMap[r.location].total++;
      if (r.isBeyondSla) locMap[r.location].beyondSla++;
    });
    const sorted = Object.values(locMap)
      .map((item) => ({
        ...item,
        rate: Number(((item.beyondSla / (item.total || 1)) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.rate - a.rate);
    return sorted[0] || { location: "National", rate: 0, beyondSla: 0, total: 0 };
  }, [filteredReqs]);

  // Dynamic Engagement Metrics
  const engagementMetrics = useMemo(() => getEngagementMetrics(), []);
  const lowestDimension = useMemo(() => {
    const dims = engagementMetrics.dimensions;
    return [...dims].sort((a, b) => a.score - b.score)[0];
  }, [engagementMetrics]);

  const lowestSegment = useMemo(() => {
    const segs = engagementMetrics.segmentCuts;
    return [...segs].sort((a, b) => a.enps - b.enps)[0];
  }, [engagementMetrics]);

  // Active filter label summary
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (period !== "ALL_TIME") parts.push(formatPeriodLabel(period));
    if (clusterFilter !== "ALL") parts.push(clusterFilter);
    if (provinceFilter !== "ALL") parts.push(provinceFilter);
    if (cityFilter !== "ALL") parts.push(cityFilter);
    if (jobFamilyFilter !== "ALL") parts.push(jobFamilyFilter);
    if (roleFilter !== "ALL") parts.push(roleFilter);
    return parts.join(" • ");
  }, [period, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Compact Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-spartan font-extrabold text-ink-primary tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Unified view across Vacancy, Retention &amp; Talent Mobility
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-secondary">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-medium">
            <Users className="w-3.5 h-3.5 text-brand-teal" />
            <span><strong className="text-ink-primary">{totalActiveStaff}</strong> Active Staff</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-medium">
            <Briefcase className="w-3.5 h-3.5 text-status-attention" />
            <span><strong className="text-ink-primary">{totalReqs}</strong> Open Reqs</span>
          </span>
        </div>
      </div>

      {/* Active Filter Notification Bar */}
      {isFiltered && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-brand-teal/10 border border-brand-teal/30 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-ink-primary">
            <Filter className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
            <span>
              Filtered: <strong className="font-semibold text-brand-teal">{filterSummary}</strong>
              <span className="text-ink-muted ml-2">
                ({totalReqs} reqs, {totalActiveStaff} active staff, {totalExits} exits)
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-white text-ink-secondary hover:text-ink-primary hover:bg-surface-soft text-[11px] font-medium border border-border-default transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* 4 Top-Level KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          label="Open Demand"
          value={totalReqs}
          unit="positions"
          tone="attention"
          icon={<Briefcase className="w-4 h-4 text-status-attention" />}
          subLabel={`${replacementSharePct}% replacement backfills, ${expansionSharePct}% new expansion`}
        />
        <ScoreCard
          label="Beyond SLA"
          value={`${beyondSlaPct}%`}
          tone={beyondSlaPct > 30 ? "danger" : beyondSlaPct > 15 ? "attention" : "healthy"}
          icon={<Clock className="w-4 h-4 text-status-danger" />}
          subLabel={`${beyondSlaCount} of ${totalReqs} requisitions past target (${slaTarget}d)`}
        />
        <ScoreCard
          label="Turnover Rate"
          value={`${annualizedTurnoverRate}%`}
          tone={annualizedTurnoverRate > 25 ? "danger" : annualizedTurnoverRate > 15 ? "attention" : "healthy"}
          icon={<TrendingDown className="w-4 h-4 text-status-attention" />}
          subLabel={`${totalExits} exits recorded, ${earlyExitPct}% within first 12 months`}
        />
        <ScoreCard
          label="eNPS Score"
          value={`+${engagementMetrics.enpsScore}`}
          tone={engagementMetrics.enpsScore >= 50 ? "healthy" : engagementMetrics.enpsScore >= 30 ? "attention" : "danger"}
          icon={<HeartHandshake className="w-4 h-4 text-status-healthy" />}
          subLabel={`${engagementMetrics.promotersPct}% promoters, ${engagementMetrics.detractorsPct}% detractors`}
        />
      </div>

      {/* Two Summary Panels: Vacancy Health + Team Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vacancy Health Panel */}
        <div className="rounded-xl bg-surface-card border border-surface-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-brand-teal/10">
                <Briefcase className="w-4 h-4 text-brand-teal" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink-primary font-display">Vacancy Health</h2>
                <span className="text-[10px] text-ink-tertiary">Pre-Hire Pipeline</span>
              </div>
            </div>
            <Link
              href="/vacancy"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-teal/10 text-brand-teal text-xs font-bold hover:bg-brand-teal/20 transition-colors"
            >
              <span>View Vacancy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <ProgressBar
              label="Replacement Share"
              value={replacementSharePct}
              tone={replacementSharePct > 60 ? "danger" : "attention"}
              detail={`${replacementReqs} of ${totalReqs} reqs`}
            />
            <ProgressBar
              label="Beyond SLA Rate"
              value={beyondSlaPct}
              tone={beyondSlaPct > 30 ? "danger" : beyondSlaPct > 20 ? "attention" : "healthy"}
              detail={`${beyondSlaCount} breached`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-secondary font-medium">Avg Days Open</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold font-mono ${avgDaysOpen > slaTarget ? "text-status-danger" : "text-ink-primary"}`}>
                  {avgDaysOpen}d
                </span>
                <span className="text-ink-tertiary text-[10px]">/ {slaTarget}d target</span>
              </div>
            </div>
          </div>

          {/* Mini Hotspot */}
          <div className="p-3 rounded-lg bg-surface-ground border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-status-danger" />
              <div>
                <span className="text-[11px] text-ink-tertiary block">Top Pressure Cluster</span>
                <span className="text-xs font-bold text-ink-primary">{hotspotLoc.location}</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-status-danger">{hotspotLoc.rate}% beyond SLA</span>
          </div>

          {/* Ready Pool */}
          <div className="p-3 rounded-lg bg-brand-teal/5 border border-brand-teal/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand-teal" />
              <div>
                <span className="text-[11px] text-ink-tertiary block">Frontline Ready Pool</span>
                <span className="text-xs font-bold text-ink-primary">{readyNowCount} ready now</span>
              </div>
            </div>
            <span className="text-[11px] text-ink-secondary font-medium">{ready6MCount} in 6 months</span>
          </div>
        </div>

        {/* Team Health Panel */}
        <div className="rounded-xl bg-surface-card border border-surface-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink-primary font-display">Team Health</h2>
                <span className="text-[10px] text-ink-tertiary">Post-Hire Retention &amp; Mobility</span>
              </div>
            </div>
            <Link
              href="/team"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-colors"
            >
              <span>View Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <ProgressBar
              label="Early Attrition (<12M)"
              value={earlyExitPct}
              tone={earlyExitPct > 50 ? "danger" : "attention"}
              detail={`${earlyExits} of ${totalExits} exits`}
            />
            <ProgressBar
              label="Voluntary Exit Share"
              value={voluntaryPct}
              tone={voluntaryPct > 60 ? "attention" : "healthy"}
              detail="controllable"
            />
            <ProgressBar
              label="Regrettable Loss"
              value={regrettablePct}
              tone={regrettablePct > 25 ? "danger" : "attention"}
              detail={`${regrettableExits} high-performers`}
            />
          </div>

          {/* eNPS Dimensions Mini-View */}
          <div className="p-3 rounded-lg bg-surface-ground border border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink-secondary">eNPS Dimensions</span>
              <span className="text-[10px] text-ink-tertiary">Scale 0–7.0</span>
            </div>
            <div className="space-y-1.5">
              {engagementMetrics.dimensions.map((dim) => {
                const pct = (dim.score / dim.max) * 100;
                const isLowest = dim.dimension === lowestDimension?.dimension;
                return (
                  <div key={dim.dimension} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-32 truncate ${isLowest ? "text-status-danger font-bold" : "text-ink-secondary"}`}>
                      {dim.dimension.split("&")[0].trim()}
                    </span>
                    <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isLowest ? "bg-status-danger" : dim.status === "HEALTHY" ? "bg-brand-teal" : "bg-status-attention"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold w-8 text-right ${isLowest ? "text-status-danger" : "text-ink-primary"}`}>
                      {dim.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Promotion Readiness */}
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <div>
                <span className="text-[11px] text-ink-tertiary block">Promotion Pipeline</span>
                <span className="text-xs font-bold text-ink-primary">{readyNowCount} ready now</span>
              </div>
            </div>
            <span className="text-[11px] text-ink-secondary font-medium">{ready6MCount} developing</span>
          </div>
        </div>
      </div>

      {/* Hotspot Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hotspot: Top Location Pressure */}
        <Link
          href="/vacancy"
          className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 hover:border-status-danger/40 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-status-danger" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-status-danger">
                Vacancy Hotspot
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-tertiary group-hover:text-status-danger group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-spartan font-bold text-lg text-ink-primary mb-1">
            {hotspotLoc.location} Cluster
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            {hotspotLoc.beyondSla} of {hotspotLoc.total} requisitions ({hotspotLoc.rate}%) are beyond SLA target.
            Highest vacancy pressure across all clusters.
          </p>
        </Link>

        {/* Hotspot: Lowest eNPS Segment */}
        <Link
          href="/team?tab=engagement"
          className="p-4 rounded-xl bg-status-attention/5 border border-status-attention/20 hover:border-status-attention/40 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-attention" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-status-attention">
                Engagement Alert
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-tertiary group-hover:text-status-attention group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-spartan font-bold text-lg text-ink-primary mb-1">
            {lowestSegment?.segment || "Bali"} — eNPS +{lowestSegment?.enps || 37.8}
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Lowest engagement segment. {lowestDimension?.dimension || "Compensation"} scored {lowestDimension?.score || 4.96}/{lowestDimension?.max || 7.0} — lowest across all eNPS dimensions.
          </p>
        </Link>
      </div>
    </div>
  );
}
