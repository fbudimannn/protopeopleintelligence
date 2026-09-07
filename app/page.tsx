import Link from "next/link";
import { ArrowRight, Users, Briefcase, Database, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-ink-primary font-medium text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span>Future-State Workforce Analytics & Decision Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-spartan font-bold tracking-tight text-ink-primary">
          FIT HUB <span className="text-brand-teal">People Intelligence</span>
        </h1>

        <p className="max-w-2xl mx-auto text-ink-secondary text-base sm:text-lg">
          Connecting Vacancies, Sourcing Funnels, Early-Tenure Retention, Engagement, and Internal Mobility into one seamless employee lifecycle.
        </p>

        {/* Dual Entry Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left">
          <div className="p-8 rounded-card bg-surface-white border border-border-default shadow-card hover:border-brand-teal transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-5 group-hover:bg-brand-teal group-hover:text-ink-primary transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-spartan font-bold text-ink-primary mb-2">Vacancy (Pre-Hire)</h3>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              Prioritize hiring demand, diagnose funnel pressure, optimize sourcing channels, and maintain recurring frontline talent pipelines.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-primary group-hover:text-brand-teal transition-colors">
              Enter Vacancy Module <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          <div className="p-8 rounded-card bg-surface-white border border-border-default shadow-card hover:border-brand-yellow transition-all duration-200 group">
            <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-ink-primary mb-5 group-hover:bg-brand-yellow transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-spartan font-bold text-ink-primary mb-2">Team (Post-Hire)</h3>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              Monitor retention cohorts, employee experience, capability development, and internal mobility benchmarks after employees join.
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-primary group-hover:text-brand-yellow transition-colors">
              Enter Team Module <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Attribution & Data Notice */}
        <div className="pt-8 border-t border-border-default flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-teal" />
            <span>Connected to Supabase PostgreSQL</span>
          </div>
          <div>
            Case Study Prototype by <span className="font-semibold text-ink-primary">M. Fakhri Musyaffa Budiman</span>
          </div>
        </div>
      </div>
    </main>
  );
}
