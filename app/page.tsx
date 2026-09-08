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
  ChevronRight,
  Target,
  UserCheck,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  getVacancyKPIs,
  getRetentionCohorts,
  getEngagementSummaries,
  getInternalMobilityMatches,
} from "@/lib/data/api";

export default async function HomePage() {
  // Fetch live aggregated data from Supabase (with automatic offline fallback)
  const [vacancyRes, retentionRes, engagementRes, mobilityRes] = await Promise.all([
    getVacancyKPIs(),
    getRetentionCohorts(),
    getEngagementSummaries(),
    getInternalMobilityMatches(),
  ]);

  const vacancyData = vacancyRes.data;
  const retentionData = retentionRes.data;
  const engagementData = engagementRes.data;
  const mobilityData = mobilityRes.data;

  // Aggregate high-level executive indicators
  const totalOpenReqs = vacancyData.reduce((acc, curr) => acc + curr.open_requisitions, 0);
  const avgReplacementPct = (
    vacancyData.reduce((acc, curr) => acc + Number(curr.replacement_share_pct), 0) / (vacancyData.length || 1)
  ).toFixed(1);

  const totalHeadcount = retentionData.reduce((acc, curr) => acc + curr.headcount, 0);
  const readyCandidateCount = mobilityData.filter((m) => m.readiness_status === "Ready").length;

  const lifecycleSteps = [
    {
      step: "01",
      label: "Vacancy",
      desc: "Demand & SLA Target",
      pill: "Pre-Hire",
      color: "border-brand-teal/40 hover:border-brand-teal",
    },
    {
      step: "02",
      label: "Hire",
      desc: "Funnel & Sourcing ROI",
      pill: "Recruiting",
      color: "border-brand-teal/40 hover:border-brand-teal",
    },
    {
      step: "03",
      label: "Team",
      desc: "30/60/90 Onboarding",
      pill: "Tenure",
      color: "border-status-info/40 hover:border-status-info",
    },
    {
      step: "04",
      label: "Develop",
      desc: "Mercer Capability Matrix",
      pill: "Skill Framework",
      color: "border-status-attention/40 hover:border-status-attention",
    },
    {
      step: "05",
      label: "Exit",
      desc: "Early Cliff & Diagnosis",
      pill: "Retention",
      color: "border-status-critical/40 hover:border-status-critical",
    },
    {
      step: "06",
      label: "Replacement",
      desc: "Internal Mobility Match",
      pill: "Re-Entry",
      color: "border-brand-yellow/50 hover:border-brand-yellow",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Executive Hero Banner */}
      <section className="bg-surface-white rounded-card border border-border-default shadow-card p-6 sm:p-10 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-ink-primary font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Future-State People Intelligence Prototype</span>
            <span className="text-ink-muted">|</span>
            <span className="font-semibold text-brand-teal">
              {vacancyRes.isLive ? "Live Supabase PostgreSQL" : "Offline Fallback Mode"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-spartan font-extrabold tracking-tight text-ink-primary leading-tight">
            Connect Hiring, Retention, and <span className="text-brand-teal">Internal Mobility</span>
          </h1>

          <p className="text-ink-secondary text-sm sm:text-base leading-relaxed">
            An executive decision-support system built for FIT HUB leadership. Move from fragmented spreadsheets into an interconnected lifecycle where vacancies connect to onboarding, early attrition triggers replacement requisitions, and Mercer-style competency matching prepares internal talent for promotion.
          </p>
        </div>

        {/* Quick KPI Ribbon */}
        <div className="mt-8 pt-6 border-t border-border-default grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Open Requisitions
            </span>
            <p className="font-spartan font-bold text-2xl text-ink-primary mt-0.5">
              {totalOpenReqs} <span className="text-xs font-normal text-ink-secondary">positions</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Replacement Share
            </span>
            <p className="font-spartan font-bold text-2xl text-status-attention mt-0.5">
              {avgReplacementPct}%
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Tracked Headcount
            </span>
            <p className="font-spartan font-bold text-2xl text-ink-primary mt-0.5">
              {totalHeadcount} <span className="text-xs font-normal text-ink-secondary">staff</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Ready Mobility Matches
            </span>
            <p className="font-spartan font-bold text-2xl text-brand-teal mt-0.5">
              {readyCandidateCount} <span className="text-xs font-normal text-ink-secondary">candidates</span>
            </p>
          </div>
        </div>
      </section>

      {/* Dual Primary Entry Cards (PRD Section 14.4 & 14.5) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vacancy Card */}
        <Link
          href="/vacancy"
          className="p-8 rounded-card bg-surface-white border border-border-default shadow-card hover:border-brand-teal hover:shadow-dropdown transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-ink-primary transition-colors">
                <Briefcase className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 rounded-md bg-brand-teal/10 text-brand-teal font-semibold text-xs uppercase tracking-wider">
                Pre-Hire Module
              </span>
            </div>

            <h2 className="text-2xl font-spartan font-bold text-ink-primary mb-2 group-hover:text-brand-teal transition-colors">
              Vacancy &amp; Hiring
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Prioritize hiring demand, diagnose funnel pressure, optimize sourcing channels, and maintain recurring frontline talent pipelines to compress replacement time-to-fill.
            </p>

            {/* Quick Micro-Data Badges */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-surface-soft border border-border-default text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Frontline TTF Pressure</span>
                <span className="font-semibold text-ink-primary">Bali: 34.0 days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-soft border border-border-default text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Talent Pool Ready</span>
                <span className="font-semibold text-brand-teal">8 Pre-qualified</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-default flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-primary group-hover:text-brand-teal transition-colors">
              Enter Vacancy Module
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center group-hover:bg-brand-teal group-hover:text-ink-primary transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Team Card */}
        <Link
          href="/team"
          className="p-8 rounded-card bg-surface-white border border-border-default shadow-card hover:border-brand-yellow hover:shadow-dropdown transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-ink-primary group-hover:bg-brand-yellow transition-colors">
                <Users className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 rounded-md bg-brand-yellow/25 text-ink-primary font-semibold text-xs uppercase tracking-wider">
                Post-Hire Module
              </span>
            </div>

            <h2 className="text-2xl font-spartan font-bold text-ink-primary mb-2 group-hover:text-brand-teal transition-colors">
              Team, Retention &amp; Mobility
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Monitor retention cohorts, employee experience dimensions, capability frameworks, and operationalize internal candidate readiness benchmarks using Mercer competency scoring.
            </p>

            {/* Quick Micro-Data Badges */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-surface-soft border border-border-default text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Early Attrition Cliff</span>
                <span className="font-semibold text-status-critical">57.4% &lt;12 Months</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-soft border border-border-default text-xs">
                <span className="text-ink-muted text-[10px] uppercase font-bold block">Top Voluntary Driver</span>
                <span className="font-semibold text-ink-primary">Career Development</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-default flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-primary group-hover:text-ink-primary transition-colors">
              Enter Team Module
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-ink-primary transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* Core Product Lifecycle Loop Ribbon (PRD Section 14.3) */}
      <section className="bg-surface-white p-6 rounded-card border border-border-default shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-brand-teal" />
            <h3 className="font-spartan font-bold text-sm text-ink-primary uppercase tracking-wider">
              Core Lifecycle Loop Ribbon
            </h3>
          </div>
          <span className="text-xs text-ink-muted">Unified Workforce Decision Architecture</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {lifecycleSteps.map((s, idx) => (
            <div
              key={s.label}
              className={`p-3.5 rounded-xl bg-surface-soft border ${s.color} transition-all flex flex-col justify-between relative group hover:bg-surface-white`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-ink-muted">{s.step}</span>
                <span className="text-[10px] font-semibold text-ink-muted px-1.5 py-0.5 rounded bg-surface-white border border-border-default">
                  {s.pill}
                </span>
                {idx < 5 && (
                  <ChevronRight className="w-3.5 h-3.5 text-ink-muted hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-surface-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-spartan font-bold text-sm text-ink-primary">{s.label}</p>
                <p className="text-xs text-ink-secondary mt-1 leading-tight">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Below-the-fold Executive Signal Strip (PRD Section 14.6) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Signal 1: Hiring Pressure */}
        <Link
          href="/vacancy"
          className="p-5 rounded-card bg-surface-white border border-border-default hover:border-brand-teal/50 hover:shadow-card transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-status-attention">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Hiring Pressure</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
          </div>
          <p className="font-spartan font-bold text-xl text-ink-primary">68.4% Replacement Demand</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            Hiring volume is dominated by backfilling existing roles rather than expansion, with acute pressure in Bali (34.0d median TTF) and Operation Specialists.
          </p>
        </Link>

        {/* Signal 2: Early Attrition */}
        <Link
          href="/team#retention"
          className="p-5 rounded-card bg-surface-white border border-border-default hover:border-brand-teal/50 hover:shadow-card transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-status-critical">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Early Attrition</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
          </div>
          <p className="font-spartan font-bold text-xl text-ink-primary">&lt;12M Tenure Cliff</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            57.4% of all departures occur before month 12 due to dual KPI friction during ramp-up, followed by a secondary retention dip at 1Y to 1.5Y milestones.
          </p>
        </Link>

        {/* Signal 3: Employee Voice & Mobility */}
        <Link
          href="/team#mobility"
          className="p-5 rounded-card bg-surface-white border border-border-default hover:border-brand-teal/50 hover:shadow-card transition-all block group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-teal">
              <HeartHandshake className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Employee Voice</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
          </div>
          <p className="font-spartan font-bold text-xl text-ink-primary">+56.6 eNPS &amp; Career Path</p>
          <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
            High overall loyalty paired with Career Development as the top departure driver. Solved via Mercer skill matching with 8 active candidates ready for internal moves.
          </p>
        </Link>
      </section>

      {/* Transparent Data Governance Disclosure Footer (PRD Section 14.7) */}
      <footer className="pt-6 border-t border-border-default text-xs text-ink-muted flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-teal flex-shrink-0" />
          <span>
            Historical case insights use observed data. Future-state person-level lifecycle capabilities use clearly labeled synthetic data.
          </span>
        </div>
        <div className="text-center md:text-right flex-shrink-0">
          Case Study Prototype by <span className="font-semibold text-ink-primary">M. Fakhri Musyaffa Budiman</span>
        </div>
      </footer>
    </div>
  );
}
