"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PeriodOption = "FY2024" | "Q1_2024" | "Q2_2024" | "Q3_2024" | "Q4_2024";

export interface FilterContextType {
  period: PeriodOption;
  setPeriod: (period: PeriodOption) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isSupabaseLive: boolean;
  setIsSupabaseLive: (live: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<PeriodOption>("FY2024");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(true);

  // Automatically test connection to Supabase on mount
  useEffect(() => {
    async function checkLiveStatus() {
      try {
        const res = await fetch("https://folepebumzqcakpaxevq.supabase.co/rest/v1/mart_vacancy_kpi?select=kpi_id&limit=1", {
          headers: {
            apikey: "sb_publishable_pP_swBun86s32OTrpUH4iA_wDhyVDid",
            Authorization: "Bearer sb_publishable_pP_swBun86s32OTrpUH4iA_wDhyVDid",
          },
        });
        setIsSupabaseLive(res.ok);
      } catch {
        setIsSupabaseLive(false);
      }
    }
    checkLiveStatus();
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <FilterContext.Provider
      value={{
        period,
        setPeriod,
        roleFilter,
        setRoleFilter,
        locationFilter,
        setLocationFilter,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileMenuOpen,
        setMobileMenuOpen,
        isSupabaseLive,
        setIsSupabaseLive,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
