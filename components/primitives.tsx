'use client';

import React from 'react';
import Link from 'next/link';
import { Info, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

// --- Section Card ---
export interface SectionCardProps {
  title?: string;
  description?: string;
  note?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  note,
  action,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`bg-white rounded-2xl border border-border-default shadow-card p-6 transition-all ${className}`}>
      {(title || action) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-border-default/60">
          <div>
            {title && <h2 className="font-spartan text-xl md:text-2xl font-bold text-ink-primary tracking-tight">{title}</h2>}
            {description && <p className="text-xs md:text-sm text-ink-secondary mt-1 leading-relaxed">{description}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}

      <div>{children}</div>

      {note && (
        <div className="mt-5 pt-3 border-t border-border-default/50 flex items-start gap-2 text-xs text-ink-secondary bg-surface-soft/60 p-3 rounded-xl">
          <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
          <span className="leading-relaxed">{note}</span>
        </div>
      )}
    </section>
  );
}

// --- KPI Card ---
export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  tone?: 'healthy' | 'attention' | 'critical' | 'teal' | 'neutral';
  badge?: string;
  icon?: React.ReactNode;
}

export function KpiCard({
  label,
  value,
  unit,
  subtext,
  tone = 'neutral',
  badge,
  icon,
}: KpiCardProps) {
  const toneBorder = {
    healthy: 'border-l-4 border-l-status-healthy',
    attention: 'border-l-4 border-l-status-attention',
    critical: 'border-l-4 border-l-status-critical',
    teal: 'border-l-4 border-l-brand-teal',
    neutral: 'border-l-4 border-l-ink-muted/40',
  }[tone];

  const toneValueColor = {
    healthy: 'text-status-healthy',
    attention: 'text-status-attention',
    critical: 'text-status-critical',
    teal: 'text-brand-teal',
    neutral: 'text-ink-primary',
  }[tone];

  return (
    <div className={`bg-white rounded-xl border border-border-default shadow-card p-5 ${toneBorder} flex flex-col justify-between hover:shadow-dropdown transition-all`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="label-xs text-ink-secondary">{label}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-soft border border-border-default text-ink-secondary">
            {badge}
          </span>
        )}
        {icon && <div className="text-ink-muted">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span className={`kpi-number ${toneValueColor}`}>{value}</span>
        {unit && <span className="text-sm font-semibold text-ink-secondary">{unit}</span>}
      </div>

      {subtext && <p className="text-xs text-ink-secondary mt-1 leading-snug">{subtext}</p>}
    </div>
  );
}

// --- Chip / Status Pill ---
export interface ChipProps {
  label: string;
  tone?: 'healthy' | 'attention' | 'critical' | 'teal' | 'neutral' | 'yellow';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Chip({
  label,
  tone = 'neutral',
  size = 'md',
  icon,
}: ChipProps) {
  const styles = {
    healthy: 'bg-[#EBF7F0] text-status-healthy border-status-healthy/30',
    attention: 'bg-[#FFF8E6] text-status-attention border-status-attention/30',
    critical: 'bg-[#FDF0F0] text-status-critical border-status-critical/30',
    teal: 'bg-[#E8FAF9] text-[#127F86] border-brand-teal/30',
    yellow: 'bg-[#FEFCE8] text-[#854D0E] border-[#CA8A04]/40',
    neutral: 'bg-surface-soft text-ink-secondary border-border-default',
  }[tone];

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles} ${sizeClass} transition-colors`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}

// --- Lifecycle Ribbon (Closed-Loop People Architecture) ---
export interface LifecycleStepDef {
  id: 'vacancy' | 'sourcing' | 'funnel' | 'onboarding' | 'engagement' | 'capability' | 'mobility' | 'exit';
  label: string;
  sub: string;
  href: string;
  targetTab?: string;
  pageScope?: 'vacancy' | 'team' | 'other';
}

export const LIFECYCLE_STEPS: LifecycleStepDef[] = [
  { id: 'vacancy', label: '1. Vacancy Demand', sub: 'Replacement Cycle', href: '/vacancy?tab=overview', targetTab: 'overview', pageScope: 'vacancy' },
  { id: 'sourcing', label: '2. Sourcing Mix', sub: 'Channels & Inflow', href: '/vacancy?tab=funnel', targetTab: 'funnel', pageScope: 'vacancy' },
  { id: 'funnel', label: '3. Hiring Funnel', sub: 'SLA & TTF Matrix', href: '/vacancy?tab=funnel', targetTab: 'funnel', pageScope: 'vacancy' },
  { id: 'onboarding', label: '4. 30/60/90 Listening', sub: 'Early Retention Cliff', href: '/team?tab=cliff', targetTab: 'cliff', pageScope: 'team' },
  { id: 'engagement', label: '5. eNPS Experience', sub: '6 Voice Dimensions', href: '/team?tab=engagement', targetTab: 'engagement', pageScope: 'team' },
  { id: 'capability', label: '6. Capability Matrix', sub: 'Competency (L1-L5)', href: '/team/capability/framework', pageScope: 'other' },
  { id: 'mobility', label: '7. Talent Mobility', sub: 'Promotion Pool', href: '/team?tab=mobility', targetTab: 'mobility', pageScope: 'team' },
  { id: 'exit', label: '8. Exit & Loop', sub: 'Triggers Requisition', href: '/team?tab=exits', targetTab: 'exits', pageScope: 'team' },
];

interface LifecycleStripProps {
  activeStep?: 'vacancy' | 'sourcing' | 'funnel' | 'onboarding' | 'engagement' | 'capability' | 'mobility' | 'exit';
  onSelectStep?: (stepId: string, targetTab?: string) => void;
  className?: string;
}

export function LifecycleStrip({ activeStep, onSelectStep, className = '' }: LifecycleStripProps) {
  return (
    <div className={`bg-white rounded-2xl border border-border-default shadow-card p-4 overflow-x-auto ${className}`}>
      <div className="flex items-center justify-between min-w-[920px] gap-2">
        {LIFECYCLE_STEPS.map((s, idx) => {
          const isActive = s.id === activeStep;

          const content = (
            <div
              className={`flex flex-col p-2.5 rounded-xl transition-all cursor-pointer select-none text-left relative h-full justify-between ${
                isActive
                  ? 'bg-brand-teal/15 border-2 border-brand-teal ring-2 ring-brand-teal/20 shadow-sm'
                  : 'bg-surface-soft/60 border border-border-default hover:border-brand-teal/50 hover:bg-brand-teal/5'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span
                  className={`text-xs font-bold tracking-tight ${
                    isActive ? 'text-brand-navy font-spartan text-sm' : 'text-ink-primary'
                  }`}
                >
                  {s.label}
                </span>
                {isActive && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-brand-teal bg-brand-teal/20 px-1.5 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                    Active
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-brand-teal font-semibold' : 'text-ink-secondary'}`}>
                {s.sub}
              </span>
            </div>
          );

          return (
            <React.Fragment key={s.id}>
              {onSelectStep && s.targetTab ? (
                <button
                  type="button"
                  onClick={() => onSelectStep(s.id, s.targetTab)}
                  className="flex-1 min-w-[120px] text-left focus:outline-none"
                  title={`Go to ${s.label}`}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={s.href}
                  className="flex-1 min-w-[120px] text-left focus:outline-none"
                  title={`Navigate to ${s.label}`}
                >
                  {content}
                </Link>
              )}
              {idx < LIFECYCLE_STEPS.length - 1 ? (
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted/60 shrink-0" />
              ) : (
                <span className="text-[10px] font-bold text-brand-teal bg-brand-teal/10 px-2.5 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 border border-brand-teal/30">
                  <Sparkles className="w-3 h-3" /> Closed-Loop
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
