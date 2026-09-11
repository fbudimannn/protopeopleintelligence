"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useFilters, PeriodOption, JOB_FAMILIES } from "@/lib/context/FilterContext";
import DataProvenanceBadge, { ProvenanceType } from "./DataProvenanceBadge";
import {
  Menu,
  Calendar,
  Globe,
  MapPin,
  Building2,
  Briefcase,
  HelpCircle,
  X,
  CheckCircle2,
  Database,
  Code2,
  UserCheck,
} from "lucide-react";

export default function TopHeader() {
  const pathname = usePathname();
  const {
    period,
    setPeriod,
    jobFamilyFilter,
    setJobFamilyFilter,
    roleFilter,
    setRoleFilter,
    availableRoles,
    clusterFilter,
    setClusterFilter,
    provinceFilter,
    setProvinceFilter,
    cityFilter,
    setCityFilter,
    availableProvinces,
    availableCities,
    setMobileMenuOpen,
    hideGlobalFilters,
  } = useFilters();

  const [showAboutModal, setShowAboutModal] = useState(false);

  // Determine current page title and default provenance badge
  const getPageMeta = (): { title: string; section: string; provenance: ProvenanceType } => {
    if (pathname === "/") {
      return {
        title: "Executive Overview",
        section: "Enterprise Lifecycle",
        provenance: "HYBRID",
      };
    }
    if (pathname.startsWith("/vacancy")) {
      return {
        title: "Vacancy Intelligence",
        section: "Pre-Hire",
        provenance: "OBSERVED",
      };
    }
    if (pathname.startsWith("/team/capability/framework")) {
      return {
        title: "Capability Framework",
        section: "Frontline Architecture",
        provenance: "DERIVED",
      };
    }
    if (pathname.startsWith("/team/engagement/survey")) {
      return {
        title: "eNPS Survey Builder",
        section: "Employee Voice",
        provenance: "OBSERVED",
      };
    }
    if (pathname.startsWith("/team/exit-survey")) {
      return {
        title: "Exit Interview Form",
        section: "Retention Closed-Loop",
        provenance: "HYBRID",
      };
    }
    if (pathname.startsWith("/team")) {
      return {
        title: "Team, Retention & Mobility",
        section: "Post-Hire",
        provenance: "HYBRID",
      };
    }
    if (pathname.startsWith("/data-readiness")) {
      return {
        title: "Data Readiness Hub",
        section: "Data Governance",
        provenance: "DERIVED",
      };
    }
    return {
      title: "People Intelligence",
      section: "Analytics",
      provenance: "HYBRID",
    };
  };

  const meta = getPageMeta();
  const isHomePage = pathname === "/";
  const shouldHideFilters = isHomePage || hideGlobalFilters;

  const selectClass = "appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-border-default bg-surface-soft hover:border-brand-teal text-xs font-medium text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all cursor-pointer truncate";
  const iconClass = "w-3.5 h-3.5 text-ink-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none";

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-surface-white/95 backdrop-blur-md border-b border-border-default px-4 sm:px-6 flex items-center justify-between gap-4 shadow-subtle">
        {/* Left: Mobile Toggle & Single-Line Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-border-default text-ink-secondary hover:bg-surface-soft hover:text-ink-primary"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold truncate">
            <span className="text-ink-muted text-xs uppercase tracking-wider font-bold hidden sm:inline">
              {meta.section}
            </span>
            <span className="text-ink-muted/50 hidden sm:inline">/</span>
            <h1 className="font-spartan font-bold text-sm sm:text-base text-ink-primary truncate">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Right: Operational Global Filters & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Filters appear on functional pages (hidden on Overview, Mobility Engine, and custom builder pages) */}
          {!shouldHideFilters && (
            <div className="hidden md:flex items-center gap-1.5">
              {/* Period Selector */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                  className={`${selectClass} max-w-[155px]`}
                >
                  <option value="ALL_TIME">All Time</option>
                  <optgroup label="By Year">
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </optgroup>
                  <optgroup label="By Quarter">
                    <option value="Q3_2024">Q3 2024 (Jul–Sep)</option>
                    <option value="Q4_2024">Q4 2024 (Oct–Dec)</option>
                    <option value="Q1_2025">Q1 2025 (Jan–Mar)</option>
                    <option value="Q2_2025">Q2 2025 (Apr–Jun)</option>
                    <option value="Q3_2025">Q3 2025 (Jul–Sep)</option>
                    <option value="Q4_2025">Q4 2025 (Oct–Dec)</option>
                  </optgroup>
                  <optgroup label="By Month — 2024">
                    <option value="2024-07">Jul 2024</option>
                    <option value="2024-08">Aug 2024</option>
                    <option value="2024-09">Sep 2024</option>
                    <option value="2024-10">Oct 2024</option>
                    <option value="2024-11">Nov 2024</option>
                    <option value="2024-12">Dec 2024</option>
                  </optgroup>
                  <optgroup label="By Month — 2025">
                    <option value="2025-01">Jan 2025</option>
                    <option value="2025-02">Feb 2025</option>
                    <option value="2025-03">Mar 2025</option>
                    <option value="2025-04">Apr 2025</option>
                    <option value="2025-05">May 2025</option>
                    <option value="2025-06">Jun 2025</option>
                    <option value="2025-07">Jul 2025</option>
                    <option value="2025-08">Aug 2025</option>
                    <option value="2025-09">Sep 2025</option>
                    <option value="2025-10">Oct 2025</option>
                    <option value="2025-11">Nov 2025</option>
                    <option value="2025-12">Dec 2025</option>
                  </optgroup>
                </select>
                <Calendar className={iconClass} />
              </div>

              {/* Cluster Selector */}
              <div className="relative">
                <select
                  value={clusterFilter}
                  onChange={(e) => setClusterFilter(e.target.value)}
                  className={`${selectClass} max-w-[140px]`}
                >
                  <option value="ALL">All Clusters</option>
                  <option value="Jabodetabek">Jabodetabek</option>
                  <option value="Jawa & Bali">Jawa & Bali</option>
                  <option value="Outside Java">Outside Java</option>
                </select>
                <Globe className={iconClass} />
              </div>

              {/* Province Selector */}
              <div className="relative">
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className={`${selectClass} max-w-[145px]`}
                >
                  <option value="ALL">All Provinces</option>
                  {availableProvinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <MapPin className={iconClass} />
              </div>

              {/* City Selector */}
              <div className="relative">
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className={`${selectClass} max-w-[145px]`}
                >
                  <option value="ALL">All Cities</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Building2 className={iconClass} />
              </div>

              {/* Job Family Selector */}
              <div className="relative">
                <select
                  value={jobFamilyFilter}
                  onChange={(e) => setJobFamilyFilter(e.target.value)}
                  className={`${selectClass} max-w-[150px]`}
                >
                  <option value="ALL">All Families</option>
                  {JOB_FAMILIES.map((fam) => (
                    <option key={fam} value={fam}>{fam}</option>
                  ))}
                </select>
                <Briefcase className={iconClass} />
              </div>

              {/* Specific Role Selector */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`${selectClass} max-w-[155px]`}
                >
                  <option value="ALL">All Roles</option>
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <UserCheck className={iconClass} />
              </div>
            </div>
          )}

          {/* Data Provenance Badge */}
          <DataProvenanceBadge type={meta.provenance} />

          {/* About Prototype Modal Button */}
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="p-1.5 rounded-xl border border-border-default text-ink-muted hover:text-brand-teal hover:border-brand-teal hover:bg-surface-soft transition-all"
            title="About Prototype & Architecture"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* About Prototype Dialog Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-white rounded-card border border-border-default shadow-dropdown p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-spartan font-bold text-base text-ink-primary">
                    About FIT HUB People Intelligence
                  </h3>
                  <p className="text-xs text-ink-secondary">Future-State Decision-Support Prototype</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="w-7 h-7 rounded-lg border border-border-default flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-soft"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink-secondary leading-relaxed">
              <p>
                This prototype operationalizes the empirical findings and strategic recommendations from the{" "}
                <strong className="text-ink-primary">FIT HUB People Analytics and Intelligence Case Study</strong>.
              </p>
              <div className="p-3.5 rounded-xl bg-surface-soft border border-border-default space-y-2">
                <div className="flex items-center gap-2 font-bold text-ink-primary">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Analytical Governance</span>
                </div>
                <p>
                  Historical hiring (1,552 rows), turnover (889 rows), and engagement (1,636 rows) use exact observed case study records. Person-level lifecycle links, frontline competency framework, and mobility scoring engine are clearly labeled synthetic future-state enablers.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-ink-primary font-medium">
                  <Code2 className="w-4 h-4 text-brand-teal" />
                  <span>Technology Stack</span>
                </div>
                <p className="font-mono text-[11px] text-ink-muted">
                  Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL 17.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border-default flex items-center justify-between text-xs">
              <span className="text-ink-muted">
                Author: <strong className="text-ink-primary">M. Fakhri Musyaffa Budiman</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-1.5 rounded-xl bg-ink-primary text-surface-white font-semibold hover:bg-brand-teal hover:text-ink-primary transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
