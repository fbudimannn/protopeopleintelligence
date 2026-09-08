"use client";

import React from "react";
import { FilterProvider, useFilters } from "@/lib/context/FilterContext";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useFilters();

  const mainPadding = sidebarCollapsed ? "lg:pl-20" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-surface-soft flex">
      {/* Persistent Left Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${mainPadding}`}>
        <TopHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <ShellInner>{children}</ShellInner>
    </FilterProvider>
  );
}
