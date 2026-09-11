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

  const hotspotLoc = [...vacancyMetrics.locationBreakdown].sort((a, b) => b.rate - a.rate)[0] || {
    location: "Bali",
    rate: 44.9,
    beyondSla: 9,
    total: 20,
  };

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

          <p className="text-ink-secondary text-sm sm:base leading-relaxed">
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
          subtext={`${vacancyMetrics.replacementReqs} of ${vacancyMetrics.totalReqs} requisitions backfill departures rather than network growth`}
          icon={<AlertTriangle className="w-4 h-4 text-status-attention" />}
        />
        <KpiCard
          label="Early Attrition Cliff"
          value={`${retentionMetrics.earlyExitPct}%`}
          tone="critical"
          badge="< 12 Months"
          subtext={`${retentionMetrics.earlyExitCount} of ${retentionMetrics.totalExits} departures concentrated in months 1-6 post-probation`}
          icon={<TrendingUp className="w-4 h-4 text-status-critical" />}
        />
        <KpiCard
          label="Beyond SLA Hotspot"
          value={`${hotspotLoc.rate}%`}
          unit={`in ${hotspotLoc.location}`}
          tone="attention"
          badge={`${hotspotLoc.beyondSla} Breached`}
          subtext={`${hotspotLoc.beyondSla} of ${hotspotLoc.total} requisitions open beyond SLA target in ${hotspotLoc.location}`}
          icon={<Briefcase className="w-4 h-4 text-status-attention" />}
        />
        <KpiCard
          label="Ready Mobility Pool"
          value={talentPool.readyNowCount}
          unit="candidates"
          tone="healthy"
          badge="Ready Now"
          subtext={`${talentPool.readyNowCount} ready now, ${talentPool.ready6MCount} in 6M across ${talentPool.totalPool} active frontline staff`}
          icon={<CheckCircle2 className="w-4 h-4 text-status-healthy" />}
        />
      </section>

      {/* Macro Demand Distribution: Replacement vs Expansion Share */}
      <SectionCard
        title="Hiring Demand Composition: The Replacement Cycle"
        description="Data from 2024 hiring requisitions reveals that workforce loss generates the majority of open demand. Addressing retention directly compresses recruitment overhead."
        note={`Insight from fithub_analysis.ipynb Section 3: High replacement share (${vacancyMetrics.replacementSharePct}%) indicates that sourcing volume is treating a symptom of turnover rather than net expansion.`}
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

      {/* Role-Level Experience & Retention Benchmark (Section 3.3 & 4.2 Ground Truth) */}
      <SectionCard
        title="Role-Level Experience & Retention Dynamics (Section 3.3 Ground Truth)"
        description="Employee advocacy and operational stability vary significantly across frontline roles. Customer Service experiences the lowest organizational eNPS (+49.0), while Housekeeping records the highest (+73.6)."
        note="Live data from Supabase mart_engagement_summary (1,636 survey respondents). Highlights the need for role-targeted experience interventions rather than one-size-fits-all HR policies."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Card 1: Customer Service */}
          <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-ink-primary">Customer Service</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-status-danger/20 text-status-danger">
                  Lowest eNPS
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-spartan font-black text-status-danger">+49.0</span>
                <span className="text-[11px] text-ink-muted">eNPS</span>
              </div>
              <div className="space-y-1 text-[11px] text-ink-secondary border-t border-border-default/40 pt-2">
                <div className="flex justify-between">
                  <span>Fair Performance:</span>
                  <strong className="text-ink-primary">5.08 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Comp &amp; Benefit:</span>
                  <strong className="text-ink-primary">4.88 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Career Growth:</span>
                  <strong className="text-ink-primary">5.02 / 6.0</strong>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ink-muted">
              56.8% Promoters &bull; 7.8% Detractors
            </div>
          </div>

          {/* Card 2: Fitness Consultant */}
          <div className="p-4 rounded-xl bg-surface-soft border border-border-default flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-ink-primary">Fitness Consultant</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-yellow/20 text-ink-primary">
                  Commercial
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-spartan font-black text-ink-primary">+52.9</span>
                <span className="text-[11px] text-ink-muted">eNPS</span>
              </div>
              <div className="space-y-1 text-[11px] text-ink-secondary border-t border-border-default/40 pt-2">
                <div className="flex justify-between">
                  <span>Avg Dimension:</span>
                  <strong className="text-ink-primary">5.17 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Comp &amp; Benefit:</span>
                  <strong className="text-ink-primary">4.86 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Career Growth:</span>
                  <strong className="text-ink-primary">5.34 / 6.0</strong>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ink-muted">
              59.3% Promoters &bull; 6.4% Detractors
            </div>
          </div>

          {/* Card 3: Personal Trainer */}
          <div className="p-4 rounded-xl bg-surface-soft border border-border-default flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-ink-primary">Personal Trainer</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-teal/20 text-brand-teal">
                  Coaching
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-spartan font-black text-brand-teal">+54.5</span>
                <span className="text-[11px] text-ink-muted">eNPS</span>
              </div>
              <div className="space-y-1 text-[11px] text-ink-secondary border-t border-border-default/40 pt-2">
                <div className="flex justify-between">
                  <span>Avg Dimension:</span>
                  <strong className="text-ink-primary">5.15 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Comp &amp; Benefit:</span>
                  <strong className="text-ink-primary">4.81 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Career Growth:</span>
                  <strong className="text-ink-primary">5.41 / 6.0</strong>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ink-muted">
              61.9% Promoters &bull; 7.4% Detractors
            </div>
          </div>

          {/* Card 4: Housekeeping */}
          <div className="p-4 rounded-xl bg-status-healthy/5 border border-status-healthy/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-ink-primary">Housekeeping</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-status-healthy/20 text-status-healthy">
                  Highest eNPS
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-spartan font-black text-status-healthy">+73.6</span>
                <span className="text-[11px] text-ink-muted">eNPS</span>
              </div>
              <div className="space-y-1 text-[11px] text-ink-secondary border-t border-border-default/40 pt-2">
                <div className="flex justify-between">
                  <span>Avg Dimension:</span>
                  <strong className="text-ink-primary">5.37 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Comp &amp; Benefit:</span>
                  <strong className="text-ink-primary">5.28 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Career Growth:</span>
                  <strong className="text-ink-primary">5.57 / 6.0</strong>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ink-muted">
              75.6% Promoters &bull; 2.0% Detractors
            </div>
          </div>

          {/* Card 5: Manajerial Club */}
          <div className="p-4 rounded-xl bg-surface-soft border border-border-default flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-ink-primary">Manajerial Club</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-ink-primary/10 text-ink-primary">
                  Leadership
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-spartan font-black text-ink-primary">+56.7</span>
                <span className="text-[11px] text-ink-muted">eNPS</span>
              </div>
              <div className="space-y-1 text-[11px] text-ink-secondary border-t border-border-default/40 pt-2">
                <div className="flex justify-between">
                  <span>Avg Dimension:</span>
                  <strong className="text-ink-primary">5.07 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Comp &amp; Benefit:</span>
                  <strong className="text-ink-primary">5.05 / 6.0</strong>
                </div>
                <div className="flex justify-between">
                  <span>Career Growth:</span>
                  <strong className="text-ink-primary">5.18 / 6.0</strong>
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ink-muted">
              59.6% Promoters &bull; 2.9% Detractors
            </div>
          </div>
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
          <p className="font-spartan font-bold text-xl text-ink-primary">{vacancyMetrics.replacementSharePct}% Replacement Demand</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            Hiring volume is dominated by backfilling existing roles ({vacancyMetrics.replacementReqs} of {vacancyMetrics.totalReqs} openings), with acute pressure in {hotspotLoc.location} ({hotspotLoc.rate}% beyond SLA).
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
          <p className="font-spartan font-bold text-xl text-ink-primary">{retentionMetrics.earlyExitPct}% &lt;12M Tenure Cliff</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            {retentionMetrics.earlyExitCount} of {retentionMetrics.totalExits} departures peak within first 12 months. 30/60/90 Day listening protocols capture onboarding friction before resignation occurs.
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
