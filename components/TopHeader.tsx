"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useFilters, PeriodOption, JOB_FAMILIES } from "@/lib/context/FilterContext";
import {
  Menu,
  Calendar,
  Globe,
  MapPin,
  Building2,
  Briefcase,
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

  // Determine current page title
  const getPageMeta = (): { title: string; section: string } => {
    if (pathname === "/") {
      return { title: "Home", section: "Enterprise Lifecycle" };
    }
    if (pathname.startsWith("/vacancy")) {
      return { title: "Vacancy Intelligence", section: "Pre-Hire" };
    }
    if (pathname.startsWith("/team/capability/framework")) {
      return { title: "Capability Framework", section: "Frontline Architecture" };
    }
    if (pathname.startsWith("/team")) {
      return { title: "Team, Retention & Mobility", section: "Post-Hire" };
    }
    return { title: "People Intelligence", section: "Analytics" };
  };

  const meta = getPageMeta();
  const isHomePage = pathname === "/";
  const shouldHideFilters = isHomePage || hideGlobalFilters;

  const selectClass = "appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-border-default bg-surface-soft hover:border-brand-teal text-xs font-medium text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all cursor-pointer truncate";
  const iconClass = "w-3.5 h-3.5 text-ink-muted absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none";

  return (
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

      {/* Right: Operational Global Filters */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Filters appear on functional pages (hidden on Overview) */}
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
      </div>
    </header>
  );
}
