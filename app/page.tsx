import Link from "next/link";
import {
  ArrowRight,
  Users,
  Briefcase,
  Database,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  Repeat,
  Target,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  getVacancyKPIs,
  getRetentionCohorts,
  getEngagementSummaries,
  getInternalMobilityMatches,
} from "@/lib/data/api";
import { getVacancyMetrics, getRetentionMetrics, getEngagementMetrics, getTalentPool } from "@/lib/data/seed";
import { KpiCard, SectionCard, LifecycleStrip, Chip } from "@/components/primitives";
import { StackedBarShare } from "@/components/charts";

export default async function HomePage() {
  // Fetch from seed engine and live database
  const [vacancyRes, retentionRes, engagementRes, mobilityRes] = await Promise.all([
    getVacancyKPIs(),
    getRetentionCohorts(),
    getEngagementSummaries(),
    getInternalMobilityMatches(),
  ]);

  const vacancyMetrics = getVacancyMetrics();
  const retentionMetrics = getRetentionMetrics();
  const engagementMetrics = getEngagementMetrics();
  const talentPool = getTalentPool();

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
              {vacancyRes.isLive ? "Live Supabase PostgreSQL" : "Enriched Deterministic Model"}
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

      {/* 4 Executive Signal KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Replacement Demand Share"
          value={`${vacancyMetrics.replacementSharePct}%`}
          tone="attention"
          badge="High Inflow"
          subtext="68.1% of all requisitions backfill departures rather than network growth"
          icon={<AlertTriangle className="w-4 h-4 text-status-attention" />}
        />
        <KpiCard
          label="Early Attrition Cliff"
          value={`${retentionMetrics.earlyExitPct}%`}
          tone="critical"
          badge="< 12 Months"
          subtext="Departures concentrated in months 3-6 post-probation ramp-up"
          icon={<TrendingUp className="w-4 h-4 text-status-critical" />}
        />
        <KpiCard
          label="Beyond SLA Hotspot"
          value="44.9%"
          unit="in Bali"
          tone="attention"
          badge="TTF 48.7d"
          subtext="Frontline consultant & trainer sourcing delay in expansion markets"
          icon={<Briefcase className="w-4 h-4 text-status-attention" />}
        />
        <KpiCard
          label="Ready Mobility Pool"
          value={talentPool.readyNowCount}
          unit="candidates"
          tone="healthy"
          badge="Ready Now"
          subtext="Pre-qualified internal frontline staff ready to fill open leader roles"
          icon={<CheckCircle2 className="w-4 h-4 text-status-healthy" />}
        />
      </section>

      {/* Macro Demand Distribution: Replacement vs Expansion Share */}
      <SectionCard
        title="Hiring Demand Composition: The Replacement Cycle"
        description="Data from 2024 hiring requisitions reveals that workforce loss generates the majority of open demand. Addressing retention directly compresses recruitment overhead."
        note="Insight from fithub_analysis.ipynb Section 3: High replacement share (68.1%) indicates that sourcing volume is treating a symptom of turnover rather than net expansion."
      >
        <div className="space-y-4 pt-2">
          <StackedBarShare
            segments={[
              {
                label: "Replacement Requisitions",
                value: vacancyMetrics.replacementReqs,
                pct: vacancyMetrics.replacementSharePct,
                color: "#1D3557",
              },
              {
                label: "New Expansion Requisitions",
                value: vacancyMetrics.expansionReqs,
                pct: vacancyMetrics.expansionSharePct,
                color: "#23C9D3",
              },
            ]}
            totalLabel={`Total Requisitions: ${vacancyMetrics.totalReqs} positions`}
          />
        </div>
      </SectionCard>

      {/* Dual Primary Entry Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vacancy Card */}
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
                <span className="font-semibold text-ink-primary">{vacancyMetrics.totalReqs} Positions ({vacancyMetrics.replacementSharePct}% Rep)</span>
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

        {/* Team Card */}
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
                <span className="font-semibold text-status-critical">{retentionMetrics.earlyExitPct}% Depart &lt;12M</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-soft border border-border-default/60 text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Loyalty Index</span>
                <span className="font-semibold text-brand-teal">+{engagementMetrics.enpsScore} eNPS Score</span>
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

      {/* 3 Actionable Strategic Insights (from Notebook Findings) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Signal 1: Hiring Pressure */}
        <Link
          href="/vacancy?tab=overview"
          className="p-5 rounded-2xl bg-surface-white border border-border-default hover:border-brand-teal/50 hover:shadow-card transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-status-attention">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Hiring Pressure</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
          </div>
          <p className="font-spartan font-bold text-xl text-ink-primary">68.1% Replacement Demand</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            Hiring volume is dominated by backfilling existing roles rather than expansion, with acute pressure in Bali (44.9% beyond SLA) and Sales Consultants.
          </p>
        </Link>

        {/* Signal 2: Early Attrition */}
        <Link
          href="/team?tab=cliff"
          className="p-5 rounded-2xl bg-surface-white border border-border-default hover:border-brand-teal/50 hover:shadow-card transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-status-critical">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Early Attrition</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
          </div>
          <p className="font-spartan font-bold text-xl text-ink-primary">57.4% &lt;12M Tenure Cliff</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            Departures peak at months 3-6 post-probation. 30/60/90 Day listening protocols capture role clarity issues before resignation occurs.
          </p>
        </Link>

        {/* Signal 3: Internal Mobility */}
        <Link
          href="/team?tab=mobility"
          className="p-5 rounded-2xl bg-surface-white border border-border-default hover:border-brand-teal/50 hover:shadow-card transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-teal">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Internal Mobility</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
          </div>
          <p className="font-spartan font-bold text-xl text-ink-primary">{talentPool.readyNowCount} Staff Ready for Promotion</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            Career development is both the top exit reason and top motivator. Matching frontline talent internally compresses replacement TTF by 62%.
          </p>
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
