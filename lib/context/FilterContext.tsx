"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

// ─── Period Options ─────────────────────────────────────────────────────────
export type PeriodOption =
  | "ALL_TIME"
  // Years
  | "2024" | "2025"
  // Quarters
  | "Q3_2024" | "Q4_2024"
  | "Q1_2025" | "Q2_2025" | "Q3_2025" | "Q4_2025"
  // Months 2024
  | "2024-07" | "2024-08" | "2024-09" | "2024-10" | "2024-11" | "2024-12"
  // Months 2025
  | "2025-01" | "2025-02" | "2025-03" | "2025-04" | "2025-05" | "2025-06"
  | "2025-07" | "2025-08" | "2025-09" | "2025-10" | "2025-11" | "2025-12";

// ─── Location Hierarchy (Cluster → Province → City) ────────────────────────
export interface LocationNode {
  cluster: string;
  province: string;
  city: string;
}

export const LOCATION_HIERARCHY: LocationNode[] = [
  // Jabodetabek
  { cluster: "Jabodetabek", province: "DKI Jakarta", city: "Jakarta Pusat" },
  { cluster: "Jabodetabek", province: "DKI Jakarta", city: "Jakarta Barat" },
  { cluster: "Jabodetabek", province: "DKI Jakarta", city: "Jakarta Selatan" },
  { cluster: "Jabodetabek", province: "DKI Jakarta", city: "Jakarta Timur" },
  { cluster: "Jabodetabek", province: "DKI Jakarta", city: "Jakarta Utara" },
  { cluster: "Jabodetabek", province: "Jawa Barat", city: "Bogor" },
  { cluster: "Jabodetabek", province: "Jawa Barat", city: "Depok" },
  { cluster: "Jabodetabek", province: "Jawa Barat", city: "Bekasi" },
  { cluster: "Jabodetabek", province: "Jawa Barat", city: "Cileungsi" },
  { cluster: "Jabodetabek", province: "Banten", city: "Tangerang" },
  // Jawa & Bali
  { cluster: "Jawa & Bali", province: "Jawa Barat", city: "Bandung" },
  { cluster: "Jawa & Bali", province: "Jawa Barat", city: "Cirebon" },
  { cluster: "Jawa & Bali", province: "Jawa Barat", city: "Karawang" },
  { cluster: "Jawa & Bali", province: "Banten", city: "Cilegon" },
  { cluster: "Jawa & Bali", province: "Jawa Tengah", city: "Semarang" },
  { cluster: "Jawa & Bali", province: "Jawa Tengah", city: "Surakarta" },
  { cluster: "Jawa & Bali", province: "DI Yogyakarta", city: "Yogyakarta" },
  { cluster: "Jawa & Bali", province: "Jawa Timur", city: "Surabaya" },
  { cluster: "Jawa & Bali", province: "Jawa Timur", city: "Malang" },
  { cluster: "Jawa & Bali", province: "Jawa Timur", city: "Sidoarjo" },
  { cluster: "Jawa & Bali", province: "Jawa Timur", city: "Gresik" },
  { cluster: "Jawa & Bali", province: "Bali", city: "Bali" },
  // Outside Java
  { cluster: "Outside Java", province: "Sumatera Selatan", city: "Palembang" },
  { cluster: "Outside Java", province: "Kepulauan Riau", city: "Batam" },
  { cluster: "Outside Java", province: "Kalimantan Timur", city: "Balikpapan" },
  { cluster: "Outside Java", province: "Kalimantan Timur", city: "Samarinda" },
  { cluster: "Outside Java", province: "Sulawesi Selatan", city: "Makassar" },
];

// ─── Role Hierarchy (Job Family → Specific Role) ───────────────────────────
export interface RoleNode {
  family: string;
  role: string;
}

export const ROLE_HIERARCHY: RoleNode[] = [
  // Club Management
  { family: "Club Management", role: "Assistant Club Manager" },
  { family: "Club Management", role: "Club Manager" },
  // Customer Service
  { family: "Customer Service", role: "Customer Service" },
  // Fitness / Coaching
  { family: "Fitness / Coaching", role: "Fitness Lead" },
  { family: "Fitness / Coaching", role: "Personal Trainer" },
  // Operations Support
  { family: "Operations Support", role: "Housekeeping" },
  // Sales / Membership
  { family: "Sales / Membership", role: "Fitness Consultant" },
  { family: "Sales / Membership", role: "Sales Lead" },
];

export const JOB_FAMILIES = [
  "Club Management",
  "Customer Service",
  "Fitness / Coaching",
  "Operations Support",
  "Sales / Membership",
];

// ─── Filter Utilities ───────────────────────────────────────────────────────
export function formatPeriodLabel(period: PeriodOption): string {
  if (period === "ALL_TIME") return "All Time";
  if (period === "2024" || period === "2025") return `FY ${period}`;
  if (period.startsWith("Q")) {
    const [q, yr] = period.split("_");
    return `${q} ${yr}`;
  }
  if (period.includes("-")) {
    const [yr, m] = period.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = parseInt(m, 10) - 1;
    return `${monthNames[monthIdx] || m} ${yr}`;
  }
  return period;
}

export function matchLocationHierarchy(
  itemLoc: string | undefined | null,
  cluster: string,
  province: string,
  city: string
): boolean {
  if (!itemLoc) return false;
  const isClusterAll = !cluster || cluster === "ALL" || cluster === "All Clusters";
  const isProvinceAll = !province || province === "ALL" || province === "All Provinces";
  const isCityAll = !city || city === "ALL" || city === "All Cities";

  if (isClusterAll && isProvinceAll && isCityAll) {
    return true;
  }

  const lowerItem = itemLoc.toLowerCase().trim();

  // 1. Most specific: City is chosen
  if (!isCityAll) {
    const lowerCity = city.toLowerCase().trim();
    if (lowerItem === lowerCity || lowerItem.includes(lowerCity)) return true;
    if (lowerCity === "bali" && (lowerItem.includes("denpasar") || lowerItem.includes("badung"))) return true;
    return false;
  }

  // 2. Province is chosen
  if (!isProvinceAll) {
    const matchedCities = LOCATION_HIERARCHY.filter(
      (node) =>
        node.province.toLowerCase() === province.toLowerCase() &&
        (isClusterAll || node.cluster.toLowerCase() === cluster.toLowerCase())
    ).map((node) => node.city.toLowerCase());

    return (
      lowerItem === province.toLowerCase() ||
      matchedCities.some((c) => lowerItem === c || lowerItem.includes(c))
    );
  }

  // 3. Cluster is chosen
  if (!isClusterAll) {
    const matchedCities = LOCATION_HIERARCHY.filter(
      (node) => node.cluster.toLowerCase() === cluster.toLowerCase()
    ).map((node) => node.city.toLowerCase());

    return (
      lowerItem === cluster.toLowerCase() ||
      matchedCities.some((c) => lowerItem === c || lowerItem.includes(c))
    );
  }

  return true;
}

export function matchRoleHierarchy(
  itemRole: string | undefined | null,
  jobFamily: string,
  specificRole: string
): boolean {
  if (!itemRole) return false;
  const isFamilyAll = !jobFamily || jobFamily === "ALL" || jobFamily === "All Families";
  const isRoleAll = !specificRole || specificRole === "ALL" || specificRole === "All Roles";

  if (isFamilyAll && isRoleAll) return true;

  const lowerItem = itemRole.toLowerCase().trim();

  // 1. If specific role selected
  if (!isRoleAll) {
    const lowerRole = specificRole.toLowerCase().trim();
    if (lowerItem === lowerRole || lowerItem.includes(lowerRole)) return true;
    if (lowerRole === "personal trainer" && (lowerItem.includes("trainer") || lowerItem === "pt")) return true;
    if (lowerRole === "fitness consultant" && (lowerItem.includes("consultant") || lowerItem === "fc")) return true;
    if (lowerRole === "customer service" && (lowerItem.includes("customer service") || lowerItem === "cs" || lowerItem.includes("front desk"))) return true;
    if (lowerRole === "housekeeping" && lowerItem.includes("housekeeping")) return true;
    if (lowerRole === "club manager" && (lowerItem.includes("club manager") || lowerItem === "gm" || lowerItem.includes("manajerial"))) return true;
    if (lowerRole === "assistant club manager" && (lowerItem.includes("assistant") || lowerItem.includes("acm"))) return true;
    if (lowerRole === "fitness lead" && lowerItem.includes("fitness lead")) return true;
    if (lowerRole === "sales lead" && lowerItem.includes("sales lead")) return true;
    return false;
  }

  // 2. If only job family selected
  if (!isFamilyAll) {
    if (jobFamily === "Fitness / Coaching") {
      return lowerItem.includes("trainer") || lowerItem.includes("fitness") || lowerItem === "pt";
    }
    if (jobFamily === "Sales / Membership") {
      return lowerItem.includes("consultant") || lowerItem.includes("sales") || lowerItem === "fc";
    }
    if (jobFamily === "Customer Service") {
      return lowerItem.includes("customer service") || lowerItem.includes("front desk") || lowerItem === "cs";
    }
    if (jobFamily === "Operations Support") {
      return lowerItem.includes("housekeeping");
    }
    if (jobFamily === "Club Management") {
      return lowerItem.includes("manager") || lowerItem.includes("management") || lowerItem.includes("manajerial") || lowerItem.includes("acm");
    }
  }

  return true;
}

export function matchPeriod(
  itemDate: string | undefined | null,
  period: PeriodOption,
  fallbackHashSeed?: string
): boolean {
  if (period === "ALL_TIME") return true;

  let dateStr = itemDate;
  if (!dateStr && fallbackHashSeed) {
    // Deterministic pseudo-date generator for items without an explicit date string
    let hash = 0;
    for (let i = 0; i < fallbackHashSeed.length; i++) {
      hash = (hash << 5) - hash + fallbackHashSeed.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    const months = [
      "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
      "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
      "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
    ];
    dateStr = months[positiveHash % months.length] + "-15";
  }

  if (!dateStr) return true;

  // Exact Year
  if (period === "2024") return dateStr.startsWith("2024");
  if (period === "2025") return dateStr.startsWith("2025");

  // Quarters
  if (period === "Q3_2024") return dateStr.startsWith("2024-07") || dateStr.startsWith("2024-08") || dateStr.startsWith("2024-09");
  if (period === "Q4_2024") return dateStr.startsWith("2024-10") || dateStr.startsWith("2024-11") || dateStr.startsWith("2024-12");
  if (period === "Q1_2025") return dateStr.startsWith("2025-01") || dateStr.startsWith("2025-02") || dateStr.startsWith("2025-03");
  if (period === "Q2_2025") return dateStr.startsWith("2025-04") || dateStr.startsWith("2025-05") || dateStr.startsWith("2025-06");
  if (period === "Q3_2025") return dateStr.startsWith("2025-07") || dateStr.startsWith("2025-08") || dateStr.startsWith("2025-09");
  if (period === "Q4_2025") return dateStr.startsWith("2025-10") || dateStr.startsWith("2025-11") || dateStr.startsWith("2025-12");

  // Monthly
  return dateStr.startsWith(period);
}

// ─── Context Interface ──────────────────────────────────────────────────────
export interface FilterContextType {
  // Date
  period: PeriodOption;
  setPeriod: (period: PeriodOption) => void;
  // Role — 2 cascading levels
  jobFamilyFilter: string;
  setJobFamilyFilter: (family: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  availableRoles: string[];
  // Location — 3 cascading levels
  clusterFilter: string;
  setClusterFilter: (cluster: string) => void;
  provinceFilter: string;
  setProvinceFilter: (province: string) => void;
  cityFilter: string;
  setCityFilter: (city: string) => void;
  // Derived: single location value for backward compatibility
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  // Derived: available provinces/cities based on current selection
  availableProvinces: string[];
  availableCities: string[];
  // UI
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
  const [period, setPeriod] = useState<PeriodOption>("ALL_TIME");
  const [jobFamilyFilter, setJobFamilyFilterState] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [clusterFilter, setClusterFilter] = useState<string>("ALL");
  const [provinceFilter, setProvinceFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(true);

  // Cascade: when job family changes, reset specific role
  const setJobFamilyFilter = (family: string) => {
    setJobFamilyFilterState(family);
    setRoleFilter("ALL");
  };

  // Available roles filtered by selected job family
  const availableRoles = useMemo(() => {
    const nodes = jobFamilyFilter === "ALL"
      ? ROLE_HIERARCHY
      : ROLE_HIERARCHY.filter((n) => n.family === jobFamilyFilter);
    return Array.from(new Set(nodes.map((n) => n.role))).sort();
  }, [jobFamilyFilter]);

  // Cascade: when cluster changes, reset province & city
  const handleClusterChange = (cluster: string) => {
    setClusterFilter(cluster);
    setProvinceFilter("ALL");
    setCityFilter("ALL");
  };

  // Cascade: when province changes, reset city
  const handleProvinceChange = (province: string) => {
    setProvinceFilter(province);
    setCityFilter("ALL");
  };

  // Available provinces filtered by selected cluster
  const availableProvinces = useMemo(() => {
    const nodes = clusterFilter === "ALL"
      ? LOCATION_HIERARCHY
      : LOCATION_HIERARCHY.filter((n) => n.cluster === clusterFilter);
    return Array.from(new Set(nodes.map((n) => n.province))).sort();
  }, [clusterFilter]);

  // Available cities filtered by selected cluster + province
  const availableCities = useMemo(() => {
    let nodes = LOCATION_HIERARCHY;
    if (clusterFilter !== "ALL") {
      nodes = nodes.filter((n) => n.cluster === clusterFilter);
    }
    if (provinceFilter !== "ALL") {
      nodes = nodes.filter((n) => n.province === provinceFilter);
    }
    return Array.from(new Set(nodes.map((n) => n.city))).sort();
  }, [clusterFilter, provinceFilter]);

  // Backward-compatible derived locationFilter (most specific non-ALL wins)
  const locationFilter = useMemo(() => {
    if (cityFilter !== "ALL") return cityFilter;
    if (provinceFilter !== "ALL") return provinceFilter;
    if (clusterFilter !== "ALL") return clusterFilter;
    return "ALL";
  }, [clusterFilter, provinceFilter, cityFilter]);

  // Backward-compatible setter for locationFilter (legacy pages)
  const setLocationFilter = (location: string) => {
    if (location === "ALL") {
      setClusterFilter("ALL");
      setProvinceFilter("ALL");
      setCityFilter("ALL");
    } else {
      const clusters = Array.from(new Set(LOCATION_HIERARCHY.map((n) => n.cluster)));
      const provinces = Array.from(new Set(LOCATION_HIERARCHY.map((n) => n.province)));
      if (clusters.includes(location)) {
        handleClusterChange(location);
      } else if (provinces.includes(location)) {
        const node = LOCATION_HIERARCHY.find((n) => n.province === location);
        if (node) {
          setClusterFilter(node.cluster);
          setProvinceFilter(location);
          setCityFilter("ALL");
        }
      } else {
        const node = LOCATION_HIERARCHY.find((n) => n.city === location);
        if (node) {
          setClusterFilter(node.cluster);
          setProvinceFilter(node.province);
          setCityFilter(location);
        }
      }
    }
  };

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
        jobFamilyFilter,
        setJobFamilyFilter,
        roleFilter,
        setRoleFilter,
        availableRoles,
        clusterFilter,
        setClusterFilter: handleClusterChange,
        provinceFilter,
        setProvinceFilter: handleProvinceChange,
        cityFilter,
        setCityFilter,
        locationFilter,
        setLocationFilter,
        availableProvinces,
        availableCities,
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
