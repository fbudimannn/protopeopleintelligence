"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
  Repeat,
  Database,
} from "lucide-react";
import { useFilters } from "@/lib/context/FilterContext";
import {
  getVacancyMetrics,
  getRetentionMetrics,
  getEngagementMetrics,
} from "@/lib/data/seed";
import { LifecycleStrip, Chip } from "@/components/primitives";

export default function HomePage() {
  const { isSupabaseLive } = useFilters();

  // Dynamic seed engine metrics
  const vacancyMetrics = useMemo(() => getVacancyMetrics(), []);
  const retentionMetrics = useMemo(() => getRetentionMetrics(), []);
  const engagementMetrics = useMemo(() => getEngagementMetrics(), []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Executive Hero Banner */}
      <section className="bg-surface-white rounded-2xl border border-border-default shadow-card p-6 sm:p-10 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-ink-primary font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span className="font-semibold">FIT HUB People Intelligence v2</span>
            <span className="text-ink-muted">|</span>
            <span className="text-brand-teal font-medium">
              {isSupabaseLive ? "Live Supabase PostgreSQL" : "Enriched Deterministic Model"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-spartan font-extrabold tracking-tight text-ink-primary leading-tight">
            Connect Hiring, Retention, and <span className="text-brand-teal">Internal Mobility</span>
          </h1>

          <p className="text-ink-secondary text-sm sm:text-base leading-relaxed">
            An executive decision-support system built for FIT HUB leadership. Move from fragmented spreadsheets into an interconnected lifecycle where vacancies connect to onboarding, early attrition triggers replacement requisitions, and internal competency matching prepares frontline talent for promotion.
          </p>
        </div>

        {/* Closed-Loop Lifecycle Strip */}
        <div className="mt-8 pt-6 border-t border-border-default/80">
          <div className="flex items-center justify-between mb-3">
            <span className="label-xs text-ink-secondary flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-brand-teal" /> Closed-Loop Workforce Architecture
            </span>
            <span className="text-xs text-ink-muted hidden sm:inline">
              Every exit triggers a replacement requisition; every vacancy screens internal talent first
            </span>
          </div>
          <LifecycleStrip />
        </div>
      </section>

      {/* 2 Navigation Module Cards with Detailed Descriptions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Vacancy & Sourcing Intelligence */}
        <Link
          href="/vacancy"
          className="p-8 rounded-2xl bg-surface-white border border-border-default shadow-card hover:border-brand-teal hover:shadow-dropdown transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-ink-primary transition-colors">
                <Briefcase className="w-7 h-7" />
              </div>
              <Chip label="Pre-Hire Module" tone="teal" />
            </div>

            <h2 className="text-2xl font-spartan font-bold text-ink-primary mb-2 group-hover:text-brand-teal transition-colors">
              Vacancy &amp; Sourcing Intelligence
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Prioritize demand by Role × Location, diagnose conversion bottlenecks across the 5-stage funnel, compare channel quality (Referrals vs Portals), and match open requisitions with internal candidates.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-3 rounded-xl bg-surface-soft border border-border-default/60 text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Open Demand</span>
                <span className="font-semibold text-ink-primary">
                  {vacancyMetrics.totalReqs} Positions ({vacancyMetrics.replacementSharePct}% Rep)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-soft border border-border-default/60 text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Sourcing Leader</span>
                <span className="font-semibold text-brand-teal">Referral (35.6% Share)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-default flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-primary group-hover:text-brand-teal transition-colors">
              Explore Vacancy Module
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center group-hover:bg-brand-teal group-hover:text-ink-primary transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Module 2: Team, Retention & Mobility */}
        <Link
          href="/team"
          className="p-8 rounded-2xl bg-surface-white border border-border-default shadow-card hover:border-brand-yellow hover:shadow-dropdown transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-ink-primary group-hover:bg-brand-yellow transition-colors">
                <Users className="w-7 h-7" />
              </div>
              <Chip label="Post-Hire Module" tone="yellow" />
            </div>

            <h2 className="text-2xl font-spartan font-bold text-ink-primary mb-2 group-hover:text-brand-teal transition-colors">
              Team, Retention &amp; Mobility
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Detect early attrition with 30/60/90 Day Listening check-ins, analyze tenure survival curves, review 6 eNPS engagement dimensions, and execute internal promotions using the 5-level Capability Framework.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-3 rounded-xl bg-surface-soft border border-border-default/60 text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Early Attrition</span>
                <span className="font-semibold text-status-critical">
                  {retentionMetrics.earlyExitPct}% Depart &lt;12M
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-soft border border-border-default/60 text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Loyalty Index</span>
                <span className="font-semibold text-brand-teal">
                  +{engagementMetrics.enpsScore} eNPS Score
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-default flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-primary group-hover:text-ink-primary transition-colors">
              Explore Team Module
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-ink-primary transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* Transparent Data Governance Disclosure Footer */}
      <footer className="pt-6 border-t border-border-default text-xs text-ink-muted flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-teal flex-shrink-0" />
          <span>
            Calibrated against real distributions from FIT HUB case study datasets. Person-level lifecycle simulations use deterministic synthetic modeling.
          </span>
        </div>
        <div className="text-center md:text-right flex-shrink-0">
          Case Study Solution by <span className="font-semibold text-ink-primary">M. Fakhri Musyaffa Budiman</span>
        </div>
      </footer>
    </div>
  );
}
