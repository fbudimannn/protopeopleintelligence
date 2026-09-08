"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useFilters } from "@/lib/context/FilterContext";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Database,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  GitBranch,
  Radio,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, isSupabaseLive, mobileMenuOpen, setMobileMenuOpen } = useFilters();

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        {
          label: "Executive Home",
          href: "/",
          icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
        },
      ],
    },
    {
      title: "VACANCY (PRE-HIRE)",
      items: [
        {
          label: "Vacancy Overview",
          href: "/vacancy",
          icon: <Briefcase className="w-5 h-5 flex-shrink-0" />,
        },
        {
          label: "Demand & SLA Matrix",
          href: "/vacancy#matrix",
          icon: <Target className="w-5 h-5 flex-shrink-0" />,
        },
        {
          label: "Sourcing & Funnel",
          href: "/vacancy#funnel",
          icon: <TrendingUp className="w-5 h-5 flex-shrink-0" />,
        },
      ],
    },
    {
      title: "TEAM (POST-HIRE)",
      items: [
        {
          label: "Team Overview",
          href: "/team",
          icon: <Users className="w-5 h-5 flex-shrink-0" />,
        },
        {
          label: "Retention & Cohorts",
          href: "/team#retention",
          icon: <GitBranch className="w-5 h-5 flex-shrink-0" />,
        },
        {
          label: "Internal Mobility Match",
          href: "/team#mobility",
          icon: <Sparkles className="w-5 h-5 flex-shrink-0 text-status-attention" />,
        },
      ],
    },
    {
      title: "GOVERNANCE",
      items: [
        {
          label: "Data Readiness Hub",
          href: "/data-readiness",
          icon: <Database className="w-5 h-5 flex-shrink-0" />,
        },
      ],
    },
  ];

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-64";

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-ink-primary/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-surface-white border-r border-border-default flex flex-col justify-between transition-all duration-300 ${sidebarWidth} ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-border-default">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-border-default flex-shrink-0 bg-white relative">
                <Image
                  src="/fithub-logo-square.5b8e5d19f34833be3901.png"
                  alt="FIT HUB Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-spartan font-bold text-base tracking-tight text-ink-primary leading-tight">
                    FIT HUB
                  </span>
                  <span className="text-[11px] font-medium text-brand-teal tracking-wider uppercase leading-none">
                    People Intelligence
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex w-7 h-7 rounded-lg border border-border-default items-center justify-center text-ink-secondary hover:bg-surface-soft hover:text-ink-primary transition-all"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold tracking-wider text-ink-muted uppercase mb-2">
                    {section.title}
                  </p>
                )}

                {section.items.map((item) => {
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-brand-teal/10 text-ink-primary border-l-4 border-brand-teal font-semibold shadow-sm"
                          : "text-ink-secondary hover:bg-surface-soft hover:text-ink-primary border-l-4 border-transparent"
                      }`}
                    >
                      <div className={isActive ? "text-brand-teal" : "text-ink-muted"}>
                        {item.icon}
                      </div>
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-border-default space-y-3 bg-surface-white">
          {/* Connection Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isSupabaseLive
                ? "bg-status-healthy/10 border-status-healthy/30 text-status-healthy"
                : "bg-status-attention/10 border-status-attention/30 text-status-attention"
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            {!sidebarCollapsed && (
              <span className="truncate">
                {isSupabaseLive ? "Supabase PostgreSQL Live" : "Offline Fallback Mode"}
              </span>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="px-1 text-[11px] text-ink-muted leading-tight">
              Prototype by{" "}
              <span className="font-semibold text-ink-primary">M. Fakhri Musyaffa Budiman</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
