"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useFilters, PeriodOption } from "@/lib/context/FilterContext";
import DataProvenanceBadge, { ProvenanceType } from "./DataProvenanceBadge";
import {
  Menu,
  Calendar,
  MapPin,
  Briefcase,
  HelpCircle,
  X,
  CheckCircle2,
  Database,
  Code2,
} from "lucide-react";

export default function TopHeader() {
  const pathname = usePathname();
  const {
    period,
    setPeriod,
    roleFilter,
    setRoleFilter,
    locationFilter,
    setLocationFilter,
    setMobileMenuOpen,
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Filters appear on functional pages and compact on home */}
          {!isHomePage && (
            <div className="hidden md:flex items-center gap-2">
              {/* Period Selector */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                  className="appearance-none pl-7 pr-8 py-1.5 rounded-xl border border-border-default bg-surface-soft hover:border-brand-teal text-xs font-medium text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all cursor-pointer max-w-[160px] truncate"
                >
                  <option value="FY2024">FY 2024 (Full Year)</option>
                  <option value="Q1_2024">Q1 2024</option>
                  <option value="Q2_2024">Q2 2024</option>
                  <option value="Q3_2024">Q3 2024</option>
                  <option value="Q4_2024">Q4 2024</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Location Cluster Selector */}
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="appearance-none pl-7 pr-8 py-1.5 rounded-xl border border-border-default bg-surface-soft hover:border-brand-teal text-xs font-medium text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all cursor-pointer max-w-[200px] truncate"
                >
                  <option value="ALL">All Locations (National Total)</option>
                  <optgroup label="Regional Clusters">
                    <option value="Jabodetabek">Jabodetabek</option>
                    <option value="Jawa & Bali">Jawa & Bali</option>
                    <option value="Outside Java">Outside Java</option>
                  </optgroup>
                  <optgroup label="Key Metro Hubs">
                    <option value="Bali">Bali</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Jakarta Barat">Jakarta Barat</option>
                    <option value="Tangerang">Tangerang</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Medan">Medan</option>
                    <option value="Makassar">Makassar</option>
                  </optgroup>
                </select>
                <MapPin className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Role Segment Selector */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none pl-7 pr-8 py-1.5 rounded-xl border border-border-default bg-surface-soft hover:border-brand-teal text-xs font-medium text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all cursor-pointer max-w-[190px] truncate"
                >
                  <option value="ALL">All Roles</option>
                  <optgroup label="5 Job Families">
                    <option value="Fitness / Coaching">Fitness / Coaching</option>
                    <option value="Sales / Membership">Sales / Membership</option>
                    <option value="Customer Service">Customer Service (Family)</option>
                    <option value="Operations Support">Operations Support</option>
                    <option value="Club Management">Club Management</option>
                  </optgroup>
                  <optgroup label="Frontline & Key Roles">
                    <option value="Customer Service">Customer Service</option>
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Fitness Consultant">Fitness Consultant</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Club Manager">Club Manager</option>
                  </optgroup>
                </select>
                <Briefcase className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
