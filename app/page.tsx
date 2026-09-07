import Link from "next/link";
import Image from "next/image";
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
  Compass,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const lifecycleSteps = [
    { label: "Vacancy", desc: "Demand & SLA", color: "text-brand-teal bg-brand-teal/10 border-brand-teal/30" },
    { label: "Hire", desc: "Funnel & Sourcing", color: "text-brand-teal bg-brand-teal/10 border-brand-teal/30" },
    { label: "Team", desc: "Onboarding & Tenure", color: "text-status-info bg-status-info/10 border-status-info/30" },
    { label: "Develop", desc: "Capability & Mercer Matrix", color: "text-status-attention bg-status-attention/10 border-status-attention/30" },
    { label: "Exit", desc: "Early Cliff & Diagnosis", color: "text-status-critical bg-status-critical/10 border-status-critical/30" },
    { label: "Replacement", desc: "Internal Mobility Fill", color: "text-brand-yellow bg-brand-yellow/20 border-brand-yellow/40" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 lg:p-16 max-w-6xl mx-auto">
      {/* Top Header & Badge */}
      <header className="w-full text-center space-y-6 pt-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-border-default flex-shrink-0 bg-white relative">
            <Image
              src="/fithub-logo-square.5b8e5d19f34833be3901.png"
              alt="FIT HUB Logo"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="font-spartan font-bold text-2xl tracking-tight text-ink-primary">
            FIT HUB
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-ink-primary font-medium text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span>Future-State Workforce Analytics & Decision Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-spartan font-extrabold tracking-tight text-ink-primary leading-none">
          FIT HUB <span className="text-brand-teal">People Intelligence</span>
        </h1>

        <p className="max-w-2xl mx-auto text-ink-secondary text-base sm:text-lg leading-relaxed">
          Connecting Vacancies, Sourcing Funnels, Early-Tenure Retention, Engagement, and Internal Mobility into one unified employee lifecycle.
        </p>
      </header>

      {/* Dual Primary Entry Points */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <Link
          href="/vacancy"
          className="p-8 rounded-card bg-surface-white border border-border-default shadow-card hover:border-brand-teal hover:shadow-dropdown transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-6 group-hover:bg-brand-teal group-hover:text-ink-primary transition-colors">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-brand-teal/10 text-brand-teal font-semibold text-xs uppercase tracking-wider mb-2">
              Pre-Hire Module
            </div>
            <h2 className="text-2xl font-spartan font-bold text-ink-primary mb-3 group-hover:text-brand-teal transition-colors">
              Vacancy
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Prioritize hiring demand, diagnose funnel pressure, optimize sourcing channels, and maintain recurring frontline talent pipelines.
            </p>
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

        <Link
          href="/team"
          className="p-8 rounded-card bg-surface-white border border-border-default shadow-card hover:border-brand-yellow hover:shadow-dropdown transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center text-ink-primary mb-6 group-hover:bg-brand-yellow transition-colors">
              <Users className="w-7 h-7" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-brand-yellow/25 text-ink-primary font-semibold text-xs uppercase tracking-wider mb-2">
              Post-Hire Module
            </div>
            <h2 className="text-2xl font-spartan font-bold text-ink-primary mb-3 group-hover:text-brand-teal transition-colors">
              Team
            </h2>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Monitor retention cohorts, employee experience, capability development, and internal mobility benchmarks after employees join.
            </p>
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

      {/* Core Product Lifecycle Ribbon */}
      <section className="w-full bg-surface-white p-6 rounded-card border border-border-default shadow-card mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-brand-teal" />
            <h3 className="font-spartan font-bold text-sm text-ink-primary uppercase tracking-wider">
              Core Lifecycle Loop
            </h3>
          </div>
          <span className="text-xs text-ink-muted">Unified Workforce Architecture</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {lifecycleSteps.map((step, idx) => (
            <div
              key={step.label}
              className="p-3 rounded-xl bg-surface-soft border border-border-default hover:border-brand-teal/50 transition-all flex flex-col justify-between relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-ink-muted">0{idx + 1}</span>
                {idx < 5 && (
                  <ChevronRight className="w-3.5 h-3.5 text-ink-muted hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-surface-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-spartan font-bold text-sm text-ink-primary">{step.label}</p>
                <p className="text-xs text-ink-secondary mt-0.5 leading-tight">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Below-the-fold Executive Signal Strip */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-card bg-surface-white border border-border-default hover:border-brand-teal/40 transition-all">
          <div className="flex items-center gap-2 text-status-attention mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Hiring Pressure</span>
          </div>
          <p className="font-spartan font-bold text-lg text-ink-primary">68.4% Replacement Demand</p>
          <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
            Hiring volume is dominated by replacement backfills with critical frontline pressure in Bali (34.0 median TTF).
          </p>
        </div>

        <div className="p-5 rounded-card bg-surface-white border border-border-default hover:border-brand-teal/40 transition-all">
          <div className="flex items-center gap-2 text-status-critical mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Early Attrition</span>
          </div>
          <p className="font-spartan font-bold text-lg text-ink-primary">&lt;12M Tenure Cliff</p>
          <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
            Workforce stability risks concentrate in early tenure, followed by a secondary dip at 1Y to 1.5Y milestones.
          </p>
        </div>

        <div className="p-5 rounded-card bg-surface-white border border-border-default hover:border-brand-teal/40 transition-all">
          <div className="flex items-center gap-2 text-brand-teal mb-2">
            <HeartHandshake className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Employee Voice</span>
          </div>
          <p className="font-spartan font-bold text-lg text-ink-primary">+56.6 eNPS &amp; Career Path</p>
          <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
            High overall loyalty paired with Career Development as the top departure driver, solved via Mercer skill mobility.
          </p>
        </div>
      </section>

      {/* Footer & Data Governance Disclosure */}
      <footer className="w-full pt-8 border-t border-border-default text-xs text-ink-muted flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-teal" />
          <span>
            Historical case insights use observed data. Future-state person-level capabilities use clearly labeled synthetic data.
          </span>
        </div>
        <div className="text-center md:text-right">
          Case Study Prototype by <span className="font-semibold text-ink-primary">M. Fakhri Musyaffa Budiman</span>
        </div>
      </footer>
    </main>
  );
}
