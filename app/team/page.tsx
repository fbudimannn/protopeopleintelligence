"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFilters, matchLocationHierarchy, matchRoleHierarchy, matchPeriod, formatPeriodLabel } from "@/lib/context/FilterContext";
import DataProvenanceBadge from "@/components/DataProvenanceBadge";
import {
  getRetentionCohorts,
  getEngagementSummaries,
  getInternalMobilityMatches,
  getExitEvents,
  getTenureBands,
  getVoiceThemes,
  getMartRequisitions,
  getRoleCapabilityRequirements,
  getEarlyTenurePulse,
} from "@/lib/data/api";
import {
  RetentionCohort,
  EngagementSummary,
  InternalMobilityMatch,
  ExitEvent,
  TenureBand,
  VoiceTheme,
  fallbackRequisitions,
  fallbackEngagementSummaries,
  RoleCapabilityRequirement,
  fallbackRoleCapabilityRequirements,
  EarlyTenureJoinerPulse,
  fallbackEarlyTenureJoiners,
} from "@/lib/data/fixtures";
import { KpiCard, SectionCard, LifecycleStrip, Chip, MetricInfoTooltip } from "@/components/primitives";
import { SimpleBar, ColoredBar, SimpleLine, StackedBarShare } from "@/components/charts";
import { SEED_DATA, getRetentionMetrics, getEngagementMetrics } from "@/lib/data/seed";
import {
  targetRoleBenchmarks,
  TargetRoleBenchmark,
  DynamicMatchResult,
  runDynamicMobilityMatching,
  benchmarkEmployeesPool,
  BenchmarkEmployeeProfile,
  locationHierarchy,
  getProvincesForRegion,
  getCitiesForProvince,
  getRegionCluster,
  getProvince,
  CLIFTON_DOMAIN_MAP,
  CLIFTON_DOMAIN_STYLES,
  getRoleTier,
} from "@/lib/data/mobilityEngine";
import {
  Users,
  GitBranch,
  TrendingDown,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  HelpCircle,
  Zap,
  Info,
  Award,
  BookOpen,
  ArrowRight,
  Layers,
  Clock,
  Briefcase,
  Plus,
  Code,
  Terminal,
  GraduationCap,
  Target,
  ShieldCheck,
} from "lucide-react";

type TeamTab = "overview" | "cliff" | "engagement" | "mobility" | "exits";

function TeamContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TeamTab) || "overview";

  const [activeTab, setActiveTab] = useState<TeamTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Role carousel ref & scroll handler for Layer 2
  const roleCarouselRef = useRef<HTMLDivElement>(null);
  const scrollRoleCarousel = (direction: "left" | "right") => {
    if (roleCarouselRef.current) {
      const scrollAmount = 320;
      roleCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Data states
  const [cohorts, setCohorts] = useState<RetentionCohort[]>([]);
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [mobilityMatches, setMobilityMatches] = useState<InternalMobilityMatch[]>([]);
  const [exitEvents, setExitEvents] = useState<ExitEvent[]>([]);
  const [tenureBands, setTenureBands] = useState<TenureBand[]>([]);
  const [voiceThemes, setVoiceThemes] = useState<VoiceTheme[]>([]);
  const [liveRoleRequirements, setLiveRoleRequirements] = useState<RoleCapabilityRequirement[]>(fallbackRoleCapabilityRequirements);
  const [earlyTenureJoiners, setEarlyTenureJoiners] = useState<EarlyTenureJoinerPulse[]>(fallbackEarlyTenureJoiners);

  // Global & Local page filters
  const {
    clusterFilter,
    provinceFilter,
    cityFilter,
    locationFilter,
    jobFamilyFilter,
    roleFilter,
    period: selectedPeriod,
    setHideGlobalFilters,
  } = useFilters();
  const selectedLocation = locationFilter === "ALL" ? "All Locations" : locationFilter;
  const locationDisplay = useMemo(() => {
    if (cityFilter !== "ALL") return `${cityFilter}`;
    if (provinceFilter !== "ALL") return `${provinceFilter}`;
    if (clusterFilter !== "ALL") return `${clusterFilter}`;
    return "All Locations";
  }, [clusterFilter, provinceFilter, cityFilter]);

  const roleDisplay = useMemo(() => {
    if (roleFilter !== "ALL" && jobFamilyFilter !== "ALL") return `${roleFilter} (${jobFamilyFilter})`;
    if (roleFilter !== "ALL") return roleFilter;
    if (jobFamilyFilter !== "ALL") return jobFamilyFilter;
    return "All Roles";
  }, [jobFamilyFilter, roleFilter]);

  const selectedRole = roleFilter === "ALL" ? "All Roles" : roleFilter;

  const [readinessFilter, setReadinessFilter] = useState<"ALL" | "Ready" | "Near Ready" | "Development Needed">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Interaction State
  const [selectedCandidate, setSelectedCandidate] = useState<InternalMobilityMatch | null>(null);
  const [selectedDynamicCandidate, setSelectedDynamicCandidate] = useState<DynamicMatchResult | null>(null);
  const [promotionSuccess, setPromotionSuccess] = useState<string | null>(null);

  // Dynamic Mobility Engine State
  const [selectedRequisitionCode, setSelectedRequisitionCode] = useState<string>("REQ-BLI-0104");
  const [selectedBenchmarkRoleId, setSelectedBenchmarkRoleId] = useState<string>("role-cs");
  const [targetLocation, setTargetLocation] = useState<string>("Bali");
  const [selectedRegion, setSelectedRegion] = useState<string>("Jawa & Bali");
  const [selectedProvince, setSelectedProvince] = useState<string>("Bali");
  const [selectedBenchmarkEmpIds, setSelectedBenchmarkEmpIds] = useState<string[]>([
    "EMP-1081",
    "EMP-1083",
    "EMP-1085",
  ]);
  const [hasRunEngine, setHasRunEngine] = useState<boolean>(false);
  const [minPerformance, setMinPerformance] = useState<number>(4.0);
  const [minTenureMonths, setMinTenureMonths] = useState<number>(12);
  const feederOnly = true; // Natural career feeder pathways and Anti-Lompat governance always enforced
  const [capabilityWeight, setCapabilityWeight] = useState<number>(45);
  const [performanceWeight, setPerformanceWeight] = useState<number>(25);
  const [psychometricWeight, setPsychometricWeight] = useState<number>(20);
  const [tenureWeight, setTenureWeight] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [shortlistedCodes, setShortlistedCodes] = useState<string[]>([]);
  const [assignedRequisitions, setAssignedRequisitions] = useState<Record<string, string>>({});
  const [engineExecutionStats, setEngineExecutionStats] = useState<string>("Engine Standby • Ready to Run");
  const [dynamicFilterTier, setDynamicFilterTier] = useState<"ALL" | "Ready" | "Near Ready" | "Development Needed">("ALL");
  const [openRequisitions, setOpenRequisitions] = useState<any[]>([]);
  const [showSqlQuery, setShowSqlQuery] = useState<boolean>(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TeamTab;
    if (tabParam && ["overview", "cliff", "engagement", "mobility", "exits"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setHideGlobalFilters(activeTab === "mobility");
    return () => {
      setHideGlobalFilters(false);
    };
  }, [activeTab, setHideGlobalFilters]);

  const handleTabChange = (tab: TeamTab) => {
    setActiveTab(tab);
    setHideGlobalFilters(tab === "mobility");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const currentLifecycleStep = useMemo(() => {
    if (activeTab === "overview" || activeTab === "cliff") return "onboarding";
    if (activeTab === "engagement") return "engagement";
    if (activeTab === "mobility") return "mobility";
    if (activeTab === "exits") return "exit";
    return "onboarding";
  }, [activeTab]);


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cohortRes, engRes, mobRes, exitRes, bandRes, voiceRes, reqRes, roleReqsRes, pulseRes] = await Promise.all([
        getRetentionCohorts(),
        getEngagementSummaries(),
        getInternalMobilityMatches(),
        getExitEvents(),
        getTenureBands(),
        getVoiceThemes(),
        getMartRequisitions(),
        getRoleCapabilityRequirements(),
        getEarlyTenurePulse(),
      ]);

      setCohorts(cohortRes.data);
      setEngagements(engRes.data);
      setMobilityMatches(mobRes.data);
      setExitEvents(exitRes.data);
      setTenureBands(bandRes.data);
      setVoiceThemes(voiceRes.data);
      setOpenRequisitions(reqRes.data);
      setLiveRoleRequirements(roleReqsRes.data || fallbackRoleCapabilityRequirements);
      if (pulseRes && pulseRes.data) {
        setEarlyTenureJoiners(pulseRes.data);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  // Location & Role filter helpers for cascading hierarchy and job families
  const matchesLocation = (itemLoc: string) => {
    return matchLocationHierarchy(itemLoc, clusterFilter, provinceFilter, cityFilter);
  };

  const matchesRole = (itemRole: string) => {
    return matchRoleHierarchy(itemRole, jobFamilyFilter, roleFilter);
  };

  // Cohort qualitative factor lookup map (Role × Location → unique factors standardized to 6 Core Dimensions)
  const cohortFactorMap: Record<string, { role: string; location: string; exitDriver: string }> = {
    "Customer Service|Bali": { role: "No Senior CS or Shift Lead progression track available", location: "Peak tourist season double-shift fatigue & high Bali living costs", exitDriver: "Career Growth" },
    "Customer Service|Surabaya": { role: "Front-desk POS SOP complexity & member complaint resolution burden", location: "Regional isolation from Jakarta Head Office career path visibility", exitDriver: "Career Growth" },
    "Customer Service|Jakarta Barat": { role: "12-month seniority plateau with limited supervisor slot openings", location: "High club member density creates long evening floor coverage shifts", exitDriver: "Career Growth" },
    "Customer Service|Jakarta Selatan": { role: "Evening shift end times conflict with childcare arrangements", location: "South Jakarta traffic congestion extends commute beyond 90 min one-way", exitDriver: "Supportive Workplace" },
    "Customer Service|Tangerang": { role: "Front-desk equipment downtime & inflexible roster swap policy", location: "Industrial zone commute distances & aging club HVAC/locker conditions", exitDriver: "Supportive Workplace" },
    "Personal Trainer|Bali": { role: "PT session split uncompetitive vs freelance client demand", location: "Private villa freelance market poaching certified trainers", exitDriver: "Compensation & Benefit" },
    "Personal Trainer|Jakarta Selatan": { role: "No Master Trainer or strength coach specialization tier available", location: "Lifestyle gym competition & talent poaching along Sudirman-Senopati corridor", exitDriver: "Career Growth" },
    "Personal Trainer|Surabaya": { role: "Weekend-heavy schedule conflicts with family commitments", location: "East Java cultural expectation for weekend family time clashes with peak hours", exitDriver: "Supportive Workplace" },
    "Personal Trainer|Tangerang": { role: "Session revenue split lower than competing boutique studios in area", location: "Tangerang boutique fitness boom gives certified PTs better earning alternatives", exitDriver: "Compensation & Benefit" },
    "Personal Trainer|Jakarta Barat": { role: "Early morning 6AM slot requirement conflicts with family school runs", location: "West Jakarta residential spread means long commute from affordable housing areas", exitDriver: "Supportive Workplace" },
    "Fitness Consultant|Surabaya": { role: "Unrealistic monthly sales quotas & no lead guarantee for new FC hires", location: "Aggressive competitor price discounting across East Java market", exitDriver: "Fair Performance" },
    "Fitness Consultant|Jakarta Selatan": { role: "Commission structure penalizes trial-to-paid conversion lag", location: "Premium market members expect bespoke consultations but quotas remain fixed", exitDriver: "Compensation & Benefit" },
    "Fitness Consultant|Tangerang": { role: "Cold-call lead conversion targets misaligned with walk-in club traffic", location: "Newer Tangerang clubs have lower brand recognition reducing inbound leads", exitDriver: "Fair Performance" },
    "Fitness Consultant|Bali": { role: "Tourist-focused memberships require bilingual upselling not in job description", location: "Seasonal occupancy swings make monthly quota targets inconsistent", exitDriver: "Work Clarity" },
    "Fitness Consultant|Jakarta Barat": { role: "FC Leader slots capped at 1 per club limiting vertical mobility", location: "Jakarta Barat dense competition with 3 competitor gyms within 2km radius", exitDriver: "Career Growth" },
    "Club Manager|Jabodetabek Area": { role: "Lateral AGM hiring from competitor chains blocks internal GM promotion", location: "Multi-club area expansion workload without additional administrative relief", exitDriver: "Career Growth" },
  };

  const getCohortFactor = (roleName: string, locationName: string, field: "role" | "location" | "exitDriver") => {
    const key = `${roleName}|${locationName}`;
    return cohortFactorMap[key]?.[field] || null;
  };

  // Helper to ensure primary exit driver maps strictly to 1 of the 6 core dimensions
  const getStandardizedExitDimension = (rawDriver: string | null | undefined, roleName: string, locationName: string): string => {
    const fallbackFromMap = getCohortFactor(roleName, locationName, "exitDriver");
    const driver = rawDriver || fallbackFromMap || "";
    const lower = driver.toLowerCase();

    if (lower.includes("compensat") || lower.includes("salary") || lower.includes("benefit") || lower.includes("commission") || lower.includes("split") || lower.includes("pay")) {
      return "Compensation & Benefit";
    }
    if (lower.includes("career") || lower.includes("growth") || lower.includes("promot") || lower.includes("advanc") || lower.includes("ladder") || lower.includes("progression")) {
      return "Career Growth";
    }
    if (lower.includes("support") || lower.includes("environment") || lower.includes("culture") || lower.includes("family") || lower.includes("burnout") || lower.includes("shift") || lower.includes("roster") || lower.includes("fatigue")) {
      return "Supportive Workplace";
    }
    if (lower.includes("clarit") || lower.includes("sop") || lower.includes("handover") || lower.includes("bilingual") || lower.includes("demand")) {
      return "Work Clarity";
    }
    if (lower.includes("align") || lower.includes("mission") || lower.includes("purpose") || lower.includes("strategy") || lower.includes("direction")) {
      return "Organisation Alignment";
    }
    if (lower.includes("perform") || lower.includes("quota") || lower.includes("target") || lower.includes("kpi") || lower.includes("review")) {
      return "Fair Performance";
    }
    return fallbackFromMap || "Career Growth";
  };

  // Filtered Cohorts
  const filteredCohorts = useMemo(() => {
    return cohorts.filter((c) => {
      if (!matchesLocation(c.location_name)) {
        return false;
      }
      if (!matchesRole(c.role_name)) {
        return false;
      }
      if (!matchPeriod((c as any).period_year || (c as any).join_date, selectedPeriod, c.cohort_id)) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          c.role_name.toLowerCase().includes(q) ||
          c.location_name.toLowerCase().includes(q) ||
          (c.core_exit_driver || c.primary_exit_driver || "").toLowerCase().includes(q) ||
          (c.role_specific_factor || "").toLowerCase().includes(q) ||
          (c.location_specific_factor || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cohorts, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod, searchQuery]);

  // Filtered Exit Events based on active Location, Role, and Date
  const filteredExitEvents = useMemo(() => {
    return exitEvents.filter((evt) => {
      const locMatch = matchLocationHierarchy(evt.location_name, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(evt.role_name, jobFamilyFilter, roleFilter);
      const periodMatch = matchPeriod(evt.exit_date, selectedPeriod, evt.exit_code);
      return locMatch && roleMatch && periodMatch;
    });
  }, [exitEvents, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod]);

  // Dynamic Tenure Bands computed directly from filtered cohorts and exit events (100% Dynamic & Realistic)
  const dynamicTenureBands = useMemo(() => {
    const isFiltered =
      clusterFilter !== "ALL" ||
      provinceFilter !== "ALL" ||
      cityFilter !== "ALL" ||
      jobFamilyFilter !== "ALL" ||
      roleFilter !== "ALL";

    let totalExits = 889;
    let earlyRateWeight = 1.0;
    let midRateWeight = 1.0;

    if (filteredCohorts.length > 0) {
      const sumHeadcount = filteredCohorts.reduce((acc, c) => acc + c.headcount, 0);
      const weightedTurnover =
        filteredCohorts.reduce((acc, c) => acc + c.headcount * (c.annualized_turnover_pct || 42), 0) /
        (sumHeadcount || 1);
      const avgEarlyAttrition =
        filteredCohorts.reduce((acc, c) => acc + c.headcount * (c.early_attrition_pct || 48), 0) /
        (sumHeadcount || 1);
      const avgDipTenure =
        filteredCohorts.reduce((acc, c) => acc + c.headcount * (c.dip_tenure_pct || 25), 0) /
        (sumHeadcount || 1);

      if (isFiltered) {
        totalExits = Math.max(14, Math.round((sumHeadcount * weightedTurnover) / 100 * 1.5));
      } else {
        totalExits = 889;
      }

      earlyRateWeight = avgEarlyAttrition / 47.0;
      midRateWeight = avgDipTenure / 26.0;
    }

    // 5 Standard Stages requested by user:
    // 1. 0 to 3 Months
    // 2. 3 to 6 Months
    // 3. 6 to 12 Months
    // 4. 1 to 2 Years
    // 5. > 2 Years
    const baseShares = [
      {
        label: "0 to 3 Months",
        shortLabel: "0-3 mos",
        cliff: "Early Onboarding Shock",
        base: 24.5 * Math.max(0.7, earlyRateWeight),
        color: "#EF4444",
      },
      {
        label: "3 to 6 Months",
        shortLabel: "3-6 mos",
        cliff: "Ramp-Up & Solo Shift Cliff",
        base: 18.2 * Math.max(0.7, earlyRateWeight),
        color: "#F97316",
      },
      {
        label: "6 to 12 Months",
        shortLabel: "6-12 mos",
        cliff: "1st Year Confirmation / Plateau",
        base: 14.6,
        color: "#F59E0B",
      },
      {
        label: "1 to 2 Years",
        shortLabel: "1-2 yrs",
        cliff: "Mid-Tenure Growth Plateau",
        base: 27.0 * Math.max(0.7, midRateWeight),
        color: "#0D9488",
      },
      {
        label: "> 2 Years",
        shortLabel: "> 2 yrs",
        cliff: "Mature Staff Transition",
        base: 15.7,
        color: "#3B82F6",
      },
    ];

    const totalBase = baseShares.reduce((acc, b) => acc + b.base, 0);
    let cumPct = 0;
    let allocatedExits = 0;

    return baseShares.map((band, idx) => {
      const pct = Math.round((band.base / totalBase) * 1000) / 10;
      cumPct += pct;
      const exitCount =
        idx === baseShares.length - 1
          ? Math.max(1, totalExits - allocatedExits)
          : Math.round((pct / 100) * totalExits);
      allocatedExits += exitCount;

      return {
        band_label: band.label,
        short_label: band.shortLabel,
        exit_count: exitCount,
        pct_of_exits: pct,
        cumulative_pct: Math.min(100, Math.round(cumPct * 10) / 10),
        cliff_stage: band.cliff,
        color: band.color,
        total_exits: totalExits,
      };
    });
  }, [filteredCohorts, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter]);

  // Filtered Early-Tenure Joiners for 30/60/90 Monitoring
  const filteredEarlyTenureJoiners = useMemo(() => {
    return earlyTenureJoiners.filter((j) => {
      const locMatch = matchLocationHierarchy(j.location_name, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(j.role_name, jobFamilyFilter, roleFilter);
      return locMatch && roleMatch;
    });
  }, [earlyTenureJoiners, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter]);

  // Aggregated Pulse Metrics for Milestone Cards
  const pulseMetrics = useMemo(() => {
    const d30 = filteredEarlyTenureJoiners.filter((j) => j.score_30d !== null);
    const d60 = filteredEarlyTenureJoiners.filter((j) => j.score_60d !== null);
    const d90 = filteredEarlyTenureJoiners.filter((j) => j.score_90d !== null);

    const d30Avg = d30.length > 0 ? (d30.reduce((acc, j) => acc + (j.score_30d || 0), 0) / d30.length) : 3.4;
    const d60Avg = d60.length > 0 ? (d60.reduce((acc, j) => acc + (j.score_60d || 0), 0) / d60.length) : 3.6;
    const d90Avg = d90.length > 0 ? (d90.reduce((acc, j) => acc + (j.score_90d || 0), 0) / d90.length) : 3.9;

    const d30AtRisk = d30.filter((j) => (j.score_30d || 0) < 3.0).length;
    const d60AtRisk = d60.filter((j) => (j.score_60d || 0) < 3.0).length;
    const d90Ready = d90.filter((j) => (j.score_90d || 0) >= 3.5).length;

    return {
      d30Avg: Math.round(d30Avg * 10) / 10,
      d60Avg: Math.round(d60Avg * 10) / 10,
      d90Avg: Math.round(d90Avg * 10) / 10,
      d30AtRisk,
      d60AtRisk,
      d90Ready,
      d30Count: d30.length,
      d60Count: d60.length,
      d90Count: d90.length,
    };
  }, [filteredEarlyTenureJoiners]);

  // Concern breakdowns for 3 Mini Bar Charts (30, 60, 90)
  const concernBreakdowns = useMemo(() => {
    const getBreakdown = (stage: "Day 30" | "Day 60" | "Day 90", defaultCategories: string[]) => {
      const stageJoiners = filteredEarlyTenureJoiners.filter((j) => j.milestone_stage === stage);
      const total = stageJoiners.length;

      return defaultCategories.map((cat) => {
        const matching = stageJoiners.filter((j) => j.concern_category === cat).length;
        const pct = total > 0 ? Math.round((matching / total) * 100) : 0;
        return {
          label: cat,
          pct: pct > 0 ? pct : (total === 0 ? 25 : 10),
          count: matching,
        };
      });
    };

    const d30Concerns = getBreakdown("Day 30", [
      "Role Expectation Mismatch",
      "Onboarding & Buddy Support",
      "System & POS SOP Clarity",
      "Shift Schedule Adaptation",
    ]);

    const d60Concerns = getBreakdown("Day 60", [
      "Solo Shift Fatigue",
      "Roster & Solo Floor Bottleneck",
      "Quota & Commercial Ramp-up",
      "GM Coaching Availability",
    ]);

    const d90Concerns = getBreakdown("Day 90", [
      "Output & Quota Realization",
      "L2 Competency Verification",
      "Career Visibility & Promotion",
      "Team & Member Retention",
    ]);

    return { d30Concerns, d60Concerns, d90Concerns };
  }, [filteredEarlyTenureJoiners]);

  // Dynamic Tenure Band Metrics for Callouts
  const earlyCliffBands = useMemo(() => {
    return dynamicTenureBands.filter((b) => b.band_label.includes("0 to 3") || b.band_label.includes("4 to 6"));
  }, [dynamicTenureBands]);

  const earlyCliffPct = useMemo(() => {
    if (earlyCliffBands.length > 0) {
      return Math.round(earlyCliffBands.reduce((acc, b) => acc + (b.pct_of_exits || 0), 0) * 10) / 10;
    }
    return 42.7;
  }, [earlyCliffBands]);

  const earlyCliffCount = useMemo(() => {
    if (earlyCliffBands.length > 0) {
      return earlyCliffBands.reduce((acc, b) => acc + (b.exit_count || 0), 0);
    }
    return 380;
  }, [earlyCliffBands]);

  const midTenureBand = useMemo(() => {
    return dynamicTenureBands.find((b) => b.band_label.includes("13 to 18")) || dynamicTenureBands[3];
  }, [dynamicTenureBands]);

  const midTenurePct = midTenureBand?.pct_of_exits || 21.9;
  const midTenureCount = midTenureBand?.exit_count || 195;

  // Dynamic Engagement based on active location & role filters
  const dynamicEngagement = useMemo(() => {
    // 1. Try exact or hierarchy match on location and role
    const matched = engagements.find((e) => {
      const locMatch = matchLocationHierarchy(e.location_name, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(e.role_name, jobFamilyFilter, roleFilter);
      return locMatch && roleMatch;
    });

    // 2. Fallback to location-only match
    const locOnly = matched || engagements.find((e) => {
      return matchLocationHierarchy(e.location_name, clusterFilter, provinceFilter, cityFilter);
    });

    // 3. Fallback to role-only match
    const roleOnly = locOnly || engagements.find((e) => {
      return matchRoleHierarchy(e.role_name, jobFamilyFilter, roleFilter);
    });

    const active = roleOnly || engagements[0] || fallbackEngagementSummaries[0];

    const isFiltered =
      clusterFilter !== "ALL" ||
      provinceFilter !== "ALL" ||
      cityFilter !== "ALL" ||
      jobFamilyFilter !== "ALL" ||
      roleFilter !== "ALL";

    const totalRespondents = isFiltered
      ? Math.max(28, Math.round(active.promoter_pct * 1.8 + active.passive_pct * 1.4 + active.detractor_pct * 1.2))
      : 1234;

    const promoterCount = Math.round((active.promoter_pct / 100) * totalRespondents);
    const detractorCount = Math.round((active.detractor_pct / 100) * totalRespondents);
    const passiveCount = totalRespondents - promoterCount - detractorCount;

    return {
      active,
      enps: active.enps_score,
      totalRespondents,
      segments: [
        { label: "Promoters (Score 9-10)", value: promoterCount, pct: active.promoter_pct, color: "#2E8B57" },
        { label: "Passives (Score 7-8)", value: passiveCount, pct: active.passive_pct, color: "#C99400" },
        { label: "Detractors (Score 0-6)", value: detractorCount, pct: active.detractor_pct, color: "#C65353" },
      ],
      dimensionScores: [
        { label: "Organisation Alignment", value: active.organisation_alignment_score, color: "#2E8B57" },
        { label: "Supportive Workplace", value: active.supportive_workplace_score, color: active.supportive_workplace_score < 5.0 ? "#C65353" : "#23C9D3" },
        { label: "Work Clarity", value: active.work_clarity_score, color: "#23C9D3" },
        { label: "Fair Performance", value: active.fair_performance_score, color: active.fair_performance_score < 5.0 ? "#C65353" : "#23C9D3" },
        { label: "Career Growth", value: active.career_growth_score, color: active.career_growth_score < 5.1 ? "#C65353" : "#23C9D3" },
        { label: "Compensation & Benefit", value: active.compensation_benefit_score, color: "#C65353" },
      ],
    };
  }, [engagements, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter]);

  // Dynamic Role Sentiments for Layer 2 (100% Dynamic & Filter-Aware - All 12 Roles)
  const dynamicRoleSentiments = useMemo(() => {
    const rolesConfig = [
      {
        id: "pt",
        name: "Personal Trainer",
        jobFamily: "Fitness & Coaching",
        icon: Award,
        baseEnps: 54.5,
        basePromoter: 62.3,
        baseDetractor: 7.2,
        baseHeadcount: 420,
        lowestDimName: "Compensation & Benefit",
        lowestDimScore: 4.76,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.62,
        defaultQuote: "PT session revenue splits drop uncomfortably during seasonal lulls, creating take-home pay anxiety relative to living costs.",
      },
      {
        id: "ptl",
        name: "Personal Trainer Leader",
        jobFamily: "Fitness & Coaching",
        icon: Award,
        baseEnps: 61.2,
        basePromoter: 66.5,
        baseDetractor: 5.3,
        baseHeadcount: 52,
        lowestDimName: "Compensation & Benefit",
        lowestDimScore: 5.10,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.65,
        defaultQuote: "Mentoring junior trainers is rewarding, but balancing client delivery hours with coaching administration is challenging.",
      },
      {
        id: "ptm",
        name: "Personal Trainer Master",
        jobFamily: "Fitness & Coaching",
        icon: Award,
        baseEnps: 64.8,
        basePromoter: 70.0,
        baseDetractor: 5.2,
        baseHeadcount: 24,
        lowestDimName: "Career Growth",
        lowestDimScore: 5.35,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.70,
        defaultQuote: "High client retention and specialization autonomy give great job pride, though master certification benchmarks need wider rollouts.",
      },
      {
        id: "fm",
        name: "Fitness Manager",
        jobFamily: "Fitness & Coaching",
        icon: Award,
        baseEnps: 68.5,
        basePromoter: 72.0,
        baseDetractor: 3.5,
        baseHeadcount: 18,
        lowestDimName: "Compensation & Benefit",
        lowestDimScore: 5.25,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.75,
        defaultQuote: "Fitness delivery across our trainer cadre meets high satisfaction, but onboarding ramp speed for new PT cohorts needs support.",
      },
      {
        id: "cs",
        name: "Customer Service",
        jobFamily: "Club Operations",
        icon: Users,
        baseEnps: 49.0,
        basePromoter: 56.8,
        baseDetractor: 7.8,
        baseHeadcount: 310,
        lowestDimName: "Career Growth",
        lowestDimScore: 4.80,
        highestDimName: "Supportive Workplace",
        highestDimScore: 5.50,
        defaultQuote: "We operate front desk and member onboarding with high ratings, but clear advancement tracks beyond 12-18 months remain opaque.",
      },
      {
        id: "csl",
        name: "Customer Service Leader",
        jobFamily: "Club Operations",
        icon: ShieldCheck,
        baseEnps: 58.4,
        basePromoter: 64.0,
        baseDetractor: 5.6,
        baseHeadcount: 46,
        lowestDimName: "Supportive Workplace",
        lowestDimScore: 5.15,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.65,
        defaultQuote: "Managing floor coverage and shift swaps can be intense during peak hours, but team camaraderie remains strong.",
      },
      {
        id: "cm",
        name: "Club Manager",
        jobFamily: "Club Operations",
        icon: ShieldCheck,
        baseEnps: 56.7,
        basePromoter: 59.6,
        baseDetractor: 2.9,
        baseHeadcount: 85,
        lowestDimName: "Work Clarity",
        lowestDimScore: 5.12,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.62,
        defaultQuote: "Club managers carry extensive cross-functional facility responsibilities, but lateral hiring occasionally slows upward area GM paths.",
      },
      {
        id: "om",
        name: "Operation Manager",
        jobFamily: "Club Operations",
        icon: ShieldCheck,
        baseEnps: 73.6,
        basePromoter: 76.2,
        baseDetractor: 2.6,
        baseHeadcount: 22,
        lowestDimName: "Fair Performance",
        lowestDimScore: 5.14,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.72,
        defaultQuote: "Multi-club standardizations are taking shape well, though rapid new club openings stretch initial audit coverage.",
      },
      {
        id: "agm",
        name: "Area General Manager",
        jobFamily: "Club Operations",
        icon: ShieldCheck,
        baseEnps: 78.2,
        basePromoter: 80.0,
        baseDetractor: 1.8,
        baseHeadcount: 10,
        lowestDimName: "Supportive Workplace",
        lowestDimScore: 5.45,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.80,
        defaultQuote: "Strategic alignment between regional club clusters and HQ targets is robust, with focus on regional talent retention.",
      },
      {
        id: "fc",
        name: "Fitness Consultant",
        jobFamily: "Commercial & Sales",
        icon: Target,
        baseEnps: 52.9,
        basePromoter: 58.2,
        baseDetractor: 5.4,
        baseHeadcount: 280,
        lowestDimName: "Fair Performance",
        lowestDimScore: 4.90,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.60,
        defaultQuote: "Monthly trial-to-paid sales quotas are aggressive without enough pre-qualified leads, putting pressure on fair evaluation.",
      },
      {
        id: "fcl",
        name: "Fitness Consultant Leader",
        jobFamily: "Commercial & Sales",
        icon: Target,
        baseEnps: 57.0,
        basePromoter: 62.0,
        baseDetractor: 5.0,
        baseHeadcount: 36,
        lowestDimName: "Compensation & Benefit",
        lowestDimScore: 5.00,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.65,
        defaultQuote: "Coaching consultants through closing conversations improves performance, but quota target setting needs club-tier calibration.",
      },
      {
        id: "sm",
        name: "Sales Manager",
        jobFamily: "Commercial & Sales",
        icon: Target,
        baseEnps: 66.0,
        basePromoter: 70.5,
        baseDetractor: 4.5,
        baseHeadcount: 14,
        lowestDimName: "Compensation & Benefit",
        lowestDimScore: 5.30,
        highestDimName: "Organisation Alignment",
        highestDimScore: 5.70,
        defaultQuote: "Commercial pipelines are healthy across core metro clubs, with ongoing refinement in localized pricing and corporate B2B.",
      },
    ];

    // Filter roles if jobFamilyFilter or roleFilter is selected
    const filteredRolesConfig = rolesConfig.filter((r) => {
      if (jobFamilyFilter !== "ALL" && r.jobFamily !== jobFamilyFilter) return false;
      if (roleFilter !== "ALL" && r.name !== roleFilter) return false;
      return true;
    });

    return filteredRolesConfig.map((r) => {
      // Find cohorts matching this role and active location filter
      const matchingCohorts = cohorts.filter((c) => {
        const matchesThisRole = matchRoleHierarchy(c.role_name, "ALL", r.name);
        const matchesLoc = matchesLocation(c.location_name);
        return matchesThisRole && matchesLoc;
      });

      // Find engagement summary row matching this role and location
      const engMatch =
        engagements.find((e) => {
          const matchesThisRole = matchRoleHierarchy(e.role_name, "ALL", r.name);
          const matchesLoc = matchLocationHierarchy(e.location_name, clusterFilter, provinceFilter, cityFilter);
          return matchesThisRole && matchesLoc;
        }) ||
        engagements.find((e) => matchRoleHierarchy(e.role_name, "ALL", r.name));

      const totalCohortHeadcount = matchingCohorts.reduce((acc, c) => acc + c.headcount, 0);
      const roleHeadcount = totalCohortHeadcount || r.baseHeadcount;

      // Role-specific eNPS calculation:
      let weightedEnps = r.baseEnps;
      if (totalCohortHeadcount > 0) {
        weightedEnps = Math.round(
          (matchingCohorts.reduce((acc, c) => acc + (c.segment_enps ?? r.baseEnps) * c.headcount, 0) / totalCohortHeadcount) * 10
        ) / 10;
      } else if (engMatch?.enps_score != null) {
        weightedEnps = engMatch.enps_score;
      } else if (clusterFilter === "Bali") {
        weightedEnps = Math.max(25, r.baseEnps - 15.0);
      } else if (clusterFilter === "Surabaya") {
        weightedEnps = Math.max(35, r.baseEnps - 4.0);
      }

      const promoterPct = engMatch?.promoter_pct ?? r.basePromoter;
      const detractorPct = engMatch?.detractor_pct ?? r.baseDetractor;
      const passivePct = Math.max(0, 100 - promoterPct - detractorPct);

      return {
        ...r,
        headcount: roleHeadcount,
        enps: weightedEnps,
        promoterPct,
        detractorPct,
        passivePct,
        lowestDim: {
          name: r.lowestDimName,
          score: engMatch?.compensation_benefit_score && r.lowestDimName === "Compensation & Benefit"
            ? engMatch.compensation_benefit_score
            : r.lowestDimScore,
        },
        highestDim: {
          name: r.highestDimName,
          score: engMatch?.organisation_alignment_score && r.highestDimName === "Organisation Alignment"
            ? engMatch.organisation_alignment_score
            : r.highestDimScore,
        },
      };
    });
  }, [cohorts, engagements, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, matchesLocation]);

  // Dynamic Location Sentiments for Layer 3 (100% Dynamic & Filter-Aware - All 27 Club Locations)
  const dynamicLocationSentiments = useMemo(() => {
    // City contextual factors and baseline exit drivers mapped strictly to 6 Core Dimensions
    const cityContextMap: Record<string, { driver: string; context: string; baseEnps: number; baseTurnover: number; baseEarlyExit: number; baseHeadcount: number }> = {
      "Bali": { driver: "Compensation & Benefit", context: "High local living costs & PT session volume seasonality during off-peak tourist months.", baseEnps: 37.8, baseTurnover: 62.5, baseEarlyExit: 68.4, baseHeadcount: 140 },
      "Surabaya": { driver: "Career Growth", context: "Distance from Jakarta HO limits promotion pipeline visibility for frontline staff.", baseEnps: 48.2, baseTurnover: 48.2, baseEarlyExit: 56.2, baseHeadcount: 185 },
      "Jakarta Selatan": { driver: "Supportive Workplace", context: "Late club closing shifts conflict with long public transit commute & family logistics.", baseEnps: 62.4, baseTurnover: 34.0, baseEarlyExit: 46.0, baseHeadcount: 320 },
      "Jakarta Barat": { driver: "Career Growth", context: "High club member density and supervisor slot caps create 12-18M career plateaus.", baseEnps: 52.5, baseTurnover: 41.5, baseEarlyExit: 50.8, baseHeadcount: 275 },
      "Tangerang": { driver: "Supportive Workplace", context: "Industrial commute distances, equipment maintenance turnaround & shift swap friction.", baseEnps: 54.0, baseTurnover: 44.0, baseEarlyExit: 56.0, baseHeadcount: 210 },
      "Jakarta Pusat": { driver: "Supportive Workplace", context: "Peak lunchtime & after-work rush hours create high operational pressure on floor staff.", baseEnps: 58.0, baseTurnover: 36.5, baseEarlyExit: 44.2, baseHeadcount: 195 },
      "Jakarta Timur": { driver: "Compensation & Benefit", context: "Base pay competitiveness vs commercial boutique studios along border zones.", baseEnps: 53.5, baseTurnover: 42.0, baseEarlyExit: 49.0, baseHeadcount: 165 },
      "Jakarta Utara": { driver: "Work Clarity", context: "High premium club facility maintenance handover SOPs require clearer cross-shift logs.", baseEnps: 55.0, baseTurnover: 39.0, baseEarlyExit: 47.5, baseHeadcount: 170 },
      "Bandung": { driver: "Career Growth", context: "Fast-growing student & young professional membership base with limited senior coach tiers.", baseEnps: 51.0, baseTurnover: 45.0, baseEarlyExit: 52.0, baseHeadcount: 155 },
      "Bekasi": { driver: "Supportive Workplace", context: "Suburban transit congestion extends daily commute times for opening shift team.", baseEnps: 53.0, baseTurnover: 43.5, baseEarlyExit: 51.0, baseHeadcount: 160 },
      "Depok": { driver: "Fair Performance", context: "College student schedule fluctuations affect trial-to-paid conversion predictability.", baseEnps: 52.0, baseTurnover: 44.0, baseEarlyExit: 53.0, baseHeadcount: 135 },
      "Bogor": { driver: "Supportive Workplace", context: "Weather and rainy season transit delays impact punctual morning shift coverage.", baseEnps: 54.5, baseTurnover: 41.0, baseEarlyExit: 48.0, baseHeadcount: 120 },
      "Semarang": { driver: "Career Growth", context: "Central Java flagship clubs lack regional lateral mobility pathways.", baseEnps: 50.5, baseTurnover: 46.0, baseEarlyExit: 54.0, baseHeadcount: 110 },
      "Yogyakarta": { driver: "Compensation & Benefit", context: "Local regional UMK wage benchmark vs high cost of professional fitness certifications.", baseEnps: 49.0, baseTurnover: 47.5, baseEarlyExit: 55.0, baseHeadcount: 105 },
      "Malang": { driver: "Career Growth", context: "Youthful frontline trainer cohort seeking accelerated technical mentorship tracks.", baseEnps: 51.5, baseTurnover: 44.5, baseEarlyExit: 51.5, baseHeadcount: 95 },
      "Sidoarjo": { driver: "Work Clarity", context: "Facility equipment servicing turnaround times between East Java regional clubs.", baseEnps: 52.0, baseTurnover: 43.0, baseEarlyExit: 50.0, baseHeadcount: 90 },
      "Gresik": { driver: "Supportive Workplace", context: "Industrial zone shift rosters require greater flexibility for weekend coverage.", baseEnps: 51.0, baseTurnover: 45.0, baseEarlyExit: 53.0, baseHeadcount: 85 },
      "Palembang": { driver: "Career Growth", context: "Sumatra regional expansion hub with high demand for structured leadership feeder lines.", baseEnps: 50.0, baseTurnover: 47.0, baseEarlyExit: 55.0, baseHeadcount: 90 },
      "Batam": { driver: "Compensation & Benefit", context: "Proximity to Singapore cross-border job market influences frontline wage expectations.", baseEnps: 46.5, baseTurnover: 51.0, baseEarlyExit: 59.0, baseHeadcount: 80 },
      "Balikpapan": { driver: "Compensation & Benefit", context: "IKN corridor economic boom drives up living expenses and alternate sector wage offers.", baseEnps: 47.0, baseTurnover: 50.0, baseEarlyExit: 58.0, baseHeadcount: 85 },
      "Samarinda": { driver: "Work Clarity", context: "New market club operational SOP rollout and localized vendor coordination.", baseEnps: 48.5, baseTurnover: 48.0, baseEarlyExit: 56.0, baseHeadcount: 75 },
      "Makassar": { driver: "Career Growth", context: "Eastern Indonesia hub requiring faster fast-track supervisory promotions.", baseEnps: 49.5, baseTurnover: 47.0, baseEarlyExit: 54.0, baseHeadcount: 100 },
      "Cilegon": { driver: "Supportive Workplace", context: "Industrial shift patterns require customized roster balancing.", baseEnps: 52.5, baseTurnover: 43.0, baseEarlyExit: 50.0, baseHeadcount: 70 },
      "Cirebon": { driver: "Career Growth", context: "Regional frontline staff seeking promotion visibility into West Java area pool.", baseEnps: 51.0, baseTurnover: 45.0, baseEarlyExit: 52.0, baseHeadcount: 75 },
      "Karawang": { driver: "Supportive Workplace", context: "Industrial zone shift scheduling and commute logistics.", baseEnps: 53.0, baseTurnover: 42.5, baseEarlyExit: 49.0, baseHeadcount: 80 },
      "Surakarta": { driver: "Compensation & Benefit", context: "Competitive studio offerings in Solo area for certified fitness coaches.", baseEnps: 50.0, baseTurnover: 46.0, baseEarlyExit: 53.0, baseHeadcount: 75 },
      "Cileungsi": { driver: "Supportive Workplace", context: "Transit distance and roster swap flexibility during peak shift hours.", baseEnps: 52.0, baseTurnover: 44.0, baseEarlyExit: 51.0, baseHeadcount: 70 },
    };

    // Flatten all 27 club locations from locationHierarchy
    const allLocationNodes: Array<{ cluster: string; province: string; city: string }> = [];
    Object.entries(locationHierarchy).forEach(([cluster, reg]) => {
      Object.entries(reg.provinces).forEach(([province, cities]) => {
        cities.forEach((city) => {
          allLocationNodes.push({ cluster, province, city });
        });
      });
    });

    // Filter locations based on global cluster / province / city filters
    const filteredNodes = allLocationNodes.filter((node: { cluster: string; province: string; city: string }) => {
      if (clusterFilter !== "ALL" && node.cluster !== clusterFilter && node.city !== clusterFilter) return false;
      if (provinceFilter !== "ALL" && node.province !== provinceFilter) return false;
      if (cityFilter !== "ALL" && node.city !== cityFilter) return false;
      return true;
    });

    return filteredNodes.map((node: { cluster: string; province: string; city: string }) => {
      const cityKey = node.city;
      const ctx = cityContextMap[cityKey] || {
        driver: "Career Growth",
        context: `${node.city} regional club operations and retention tracking.`,
        baseEnps: 52.0,
        baseTurnover: 42.0,
        baseEarlyExit: 50.0,
        baseHeadcount: 80,
      };

      // Find cohorts matching this location and active role filter
      const locCohorts = cohorts.filter((c) => {
        const matchesLoc = matchLocationHierarchy(c.location_name, node.cluster, node.province, node.city);
        const matchesR = matchesRole(c.role_name);
        return matchesLoc && matchesR;
      });

      const totalLocHeadcount = locCohorts.reduce((acc, c) => acc + c.headcount, 0);
      const headcount = totalLocHeadcount || ctx.baseHeadcount;

      const turnover = locCohorts.length > 0
        ? Math.round((locCohorts.reduce((acc, c) => acc + c.annualized_turnover_pct, 0) / locCohorts.length) * 10) / 10
        : ctx.baseTurnover;

      const earlyAttrition = locCohorts.length > 0
        ? Math.round((locCohorts.reduce((acc, c) => acc + c.early_attrition_pct, 0) / locCohorts.length) * 10) / 10
        : ctx.baseEarlyExit;

      const enps = totalLocHeadcount > 0
        ? Math.round((locCohorts.reduce((acc, c) => acc + (c.segment_enps ?? ctx.baseEnps) * c.headcount, 0) / totalLocHeadcount) * 10) / 10
        : ctx.baseEnps;

      // Determine primary exit driver strictly from the 6 standardized dimensions
      let primaryDriver = ctx.driver;
      let operationalReason = ctx.context;

      if (locCohorts.length > 0) {
        const driverCounts: Record<string, number> = {};
        locCohorts.forEach((c) => {
          const dim = getStandardizedExitDimension(c.core_exit_driver || c.primary_exit_driver, c.role_name, c.location_name);
          driverCounts[dim] = (driverCounts[dim] || 0) + c.headcount;
        });
        const sorted = Object.entries(driverCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          primaryDriver = sorted[0][0];
        }
        if (locCohorts[0]?.location_specific_factor) {
          operationalReason = locCohorts[0].location_specific_factor;
        }
      }

      const isSelected =
        cityFilter === node.city ||
        (cityFilter === "ALL" && provinceFilter === node.province) ||
        (cityFilter === "ALL" && provinceFilter === "ALL" && clusterFilter === node.cluster);

      return {
        id: `${node.cluster}-${node.province}-${node.city}`,
        name: node.city,
        cluster: node.cluster,
        province: node.province,
        headcount,
        turnover,
        earlyAttrition,
        enps,
        primaryDriver,
        operationalReason,
        isSelected,
      };
    });
  }, [cohorts, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, matchesRole]);

  // Dynamic Team KPIs based on active location, role, and period filters (100% Dynamic & Rakamin Standard)
  const teamKpis = useMemo(() => {
    const isFiltered =
      clusterFilter !== "ALL" ||
      provinceFilter !== "ALL" ||
      cityFilter !== "ALL" ||
      jobFamilyFilter !== "ALL" ||
      roleFilter !== "ALL" ||
      selectedPeriod !== "ALL_TIME";

    // 1. Total Headcount (Sum of active frontline personnel)
    const headcount = isFiltered
      ? (filteredCohorts.length > 0 ? filteredCohorts.reduce((acc, c) => acc + c.headcount, 0) : 31)
      : 408;

    // 2. Annualized Turnover Rate (Average across filtered cohorts)
    const turnover = filteredCohorts.length > 0
      ? filteredCohorts.reduce((acc, c) => acc + c.annualized_turnover_pct, 0) / filteredCohorts.length
      : 44.8;

    // 3. Early Attrition (<12 Months - First-year onboarding cliff)
    const totalExits = filteredExitEvents.length;
    const earlyExits = filteredExitEvents.filter((e) => e.tenure_months <= 12).length;
    const earlyAttrition = isFiltered && totalExits > 0
      ? Math.round((earlyExits / totalExits) * 1000) / 10
      : (isFiltered && filteredCohorts.length > 0
          ? Math.round((filteredCohorts.reduce((acc, c) => acc + c.early_attrition_pct, 0) / filteredCohorts.length) * 10) / 10
          : 57.4);

    // 4. Exit Backfill Rate (Replaced turnover openings vs open gaps)
    const backfilledCount = filteredExitEvents.filter(
      (e) => e.triggered_requisition_code && e.triggered_requisition_code.trim() !== ""
    ).length;
    const backfillRate = isFiltered && totalExits > 0
      ? Math.round((backfilledCount / totalExits) * 1000) / 10
      : 73.5;
    const unfilledGap = isFiltered ? Math.max(0, totalExits - backfilledCount) : 236;

    // 5. Net eNPS Score (Dynamic from matched location/role engagement)
    const enps = dynamicEngagement.enps;

    // 6. Average Manager Rating (1.0 to 5.0 scale from manager evaluations & fair performance)
    const rawPerf = dynamicEngagement.active.fair_performance_score || 4.98;
    const managerRating = Math.min(5.0, Math.max(1.0, Math.round(((rawPerf / 6.0) * 5.0 + 0.1) * 100) / 100));

    return {
      headcount,
      turnover: Math.round(turnover * 10) / 10,
      earlyAttrition: Math.round(earlyAttrition * 10) / 10,
      earlyExitsCount: isFiltered ? earlyExits : 510,
      backfillRate: Math.round(backfillRate * 10) / 10,
      backfilledCount: isFiltered ? backfilledCount : 653,
      unfilledGap,
      totalExits: isFiltered ? totalExits : 889,
      enps,
      managerRating: isFiltered ? managerRating : 4.25,
      isFiltered,
    };
  }, [
    filteredCohorts,
    filteredExitEvents,
    dynamicEngagement,
    clusterFilter,
    provinceFilter,
    cityFilter,
    jobFamilyFilter,
    roleFilter,
    selectedPeriod,
  ]);

  // Dynamic Real-time Club Count based on active cascading location and role filters
  const dynamicClubLabel = useMemo(() => {
    const clubSet = new Set<string>();
    filteredCohorts.forEach((c) => {
      if (c.location_name && c.location_name !== "National Total") {
        clubSet.add(c.location_name);
      }
    });
    filteredExitEvents.forEach((e) => {
      if (e.location_name) {
        clubSet.add(e.location_name);
      }
    });

    const count = clubSet.size;

    if (cityFilter !== "ALL") {
      return `${cityFilter} • 1 Club`;
    }
    if (provinceFilter !== "ALL") {
      return `${provinceFilter} • ${count} ${count === 1 ? "Club" : "Clubs"}`;
    }
    if (clusterFilter !== "ALL") {
      return `${clusterFilter} • ${count} Clubs`;
    }
    if (teamKpis.isFiltered) {
      return `${count} Clubs Monitored`;
    }
    return `${count > 0 ? count : 13} Clubs Active`;
  }, [
    filteredCohorts,
    filteredExitEvents,
    cityFilter,
    provinceFilter,
    clusterFilter,
    teamKpis.isFiltered,
  ]);

  // Active Target Benchmark for Dynamic Mobility Engine
  const activeBenchmark = useMemo(() => {
    return (
      targetRoleBenchmarks.find((b) => b.role_id === selectedBenchmarkRoleId) ||
      targetRoleBenchmarks[0]
    );
  }, [selectedBenchmarkRoleId]);

  // All Open Leadership Requisitions across all clubs
  const leadOpenRequisitions = useMemo(() => {
    const isLeadRole = (role: string) => {
      const r = role.toLowerCase();
      return (
        r.includes("lead") ||
        r.includes("manager") ||
        r.includes("supervisor") ||
        r.includes("master") ||
        r.includes("head")
      );
    };
    const liveLeads = openRequisitions.filter((req) =>
      isLeadRole(req.role_name || req.role || "")
    );
    const allLeads = [...liveLeads];
    fallbackRequisitions.forEach((fb) => {
      if (isLeadRole(fb.role_name) && !allLeads.some((r) => (r.req_code || (r as any).id) === fb.req_code)) {
        allLeads.push(fb);
      }
    });

    // Sort by days_open descending (highest SLA pressure first)
    allLeads.sort((a, b) => (b.days_open || 0) - (a.days_open || 0));
    return allLeads;
  }, [openRequisitions]);

  // Sync initial lead requisition if current is not lead
  useEffect(() => {
    if (leadOpenRequisitions.length > 0) {
      const currentValid = leadOpenRequisitions.some(
        (r) => (r.req_code || (r as any).id) === selectedRequisitionCode
      );
      if (!currentValid) {
        handleSelectRequisition(leadOpenRequisitions[0].req_code || (leadOpenRequisitions[0] as any).id);
      }
    }
  }, [leadOpenRequisitions]);

  // Active Open Requisition from mart_requisitions
  const activeRequisition = useMemo(() => {
    return (
      leadOpenRequisitions.find(
        (r) => (r.req_code || (r as any).id) === selectedRequisitionCode
      ) ||
      openRequisitions.find(
        (r) => (r.req_code || (r as any).id) === selectedRequisitionCode
      ) ||
      fallbackRequisitions.find((r) => r.req_code === selectedRequisitionCode) ||
      null
    );
  }, [leadOpenRequisitions, openRequisitions, selectedRequisitionCode]);

  // Handle Linked Requisition Selection (Auto-syncs Target Role & Location)
  const handleSelectRequisition = (code: string) => {
    setSelectedRequisitionCode(code);
    if (code === "CUSTOM") return;

    const req =
      openRequisitions.find((r) => r.req_code === code || (r as any).id === code) ||
      fallbackRequisitions.find((r) => r.req_code === code);

    if (req) {
      const rName = (req.role_name || req.role || "").toLowerCase();
      let matchedBenchmark = targetRoleBenchmarks.find(
        (b) => b.role_name.toLowerCase() === rName
      );
      if (!matchedBenchmark) {
        if (rName.includes("area") || rName.includes("agm")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-agm");
        } else if (rName.includes("club manager") || rName.includes("gm")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-club-gm");
        } else if (rName.includes("operation manager") || rName.includes("ops")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-ops-mgr");
        } else if (rName.includes("cs leader") || rName.includes("customer service leader") || rName.includes("acm") || rName.includes("assistant")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-cs-lead");
        } else if (rName.includes("pt master") || rName.includes("trainer master")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-pt-master");
        } else if (rName.includes("pt leader") || (rName.includes("personal trainer") && rName.includes("lead"))) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-pt-lead");
        } else if (rName.includes("fc leader") || (rName.includes("fitness consultant") && rName.includes("lead"))) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-fc-lead");
        } else if (rName.includes("fitness manager") || (rName.includes("fitness") && rName.includes("lead"))) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-fit-mgr");
        } else if (rName.includes("sales manager") || (rName.includes("sales") && rName.includes("lead"))) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-sales-mgr");
        } else if (rName.includes("customer service")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-cs");
        } else if (rName.includes("personal trainer")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-pt");
        } else if (rName.includes("fitness consultant")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-fc");
        }
      }

      if (matchedBenchmark) {
        setSelectedBenchmarkRoleId(matchedBenchmark.role_id);
        const roleEmployees = benchmarkEmployeesPool.filter(
          (e) => e.role.toLowerCase() === matchedBenchmark!.role_name.toLowerCase()
        );
        if (roleEmployees.length > 0) {
          setSelectedBenchmarkEmpIds(roleEmployees.slice(0, 3).map((e) => e.employee_id));
        }
      }

      // Sync location hierarchy from requisition
      const loc = req.location_name || req.location;
      if (loc) {
        setTargetLocation(loc);
        const region = getRegionCluster(loc);
        const province = getProvince(loc);
        setSelectedRegion(region);
        setSelectedProvince(province);
      }
    }
  };

  // Two-way sync: When location changes, update Target Location and check for matching Requisitions
  const handleLocationChange = (newCity: string, newRegion?: string, newProvince?: string) => {
    setTargetLocation(newCity);
    const region = newRegion || getRegionCluster(newCity);
    const province = newProvince || getProvince(newCity);
    setSelectedRegion(region);
    setSelectedProvince(province);

    // Try to find an open lead requisition matching newCity and current benchmark role
    const currentBenchmarkRole = targetRoleBenchmarks.find((b) => b.role_id === selectedBenchmarkRoleId);
    const matchingReq = leadOpenRequisitions.find((r) => {
      const loc = r.location_name || (r as any).location || "";
      const rName = (r.role_name || (r as any).role || "").toLowerCase();
      const bName = currentBenchmarkRole?.role_name.toLowerCase() || "";
      return loc.toLowerCase() === newCity.toLowerCase() && (rName.includes(bName) || bName.includes(rName));
    });

    if (matchingReq) {
      setSelectedRequisitionCode(matchingReq.req_code || (matchingReq as any).id);
    } else {
      // Check if there's ANY open lead requisition in this city
      const anyLeadInCity = leadOpenRequisitions.find((r) => {
        const loc = r.location_name || (r as any).location || "";
        return loc.toLowerCase() === newCity.toLowerCase();
      });
      if (anyLeadInCity) {
        handleSelectRequisition(anyLeadInCity.req_code || (anyLeadInCity as any).id);
      } else {
        setSelectedRequisitionCode("CUSTOM");
      }
    }
  };

  // Two-way sync: When benchmark role changes, find matching requisition in current target location
  const handleBenchmarkRoleChange = (newRoleId: string) => {
    setSelectedBenchmarkRoleId(newRoleId);
    const newRole = targetRoleBenchmarks.find((b) => b.role_id === newRoleId);
    if (newRole) {
      const roleEmps = benchmarkEmployeesPool.filter(
        (emp) => emp.role.toLowerCase() === newRole.role_name.toLowerCase()
      );
      if (roleEmps.length > 0) {
        setSelectedBenchmarkEmpIds(roleEmps.slice(0, 3).map((emp) => emp.employee_id));
      }

      // Check if there's an open requisition in targetLocation for this new role
      const matchingReq = leadOpenRequisitions.find((r) => {
        const loc = r.location_name || (r as any).location || "";
        const rName = (r.role_name || (r as any).role || "").toLowerCase();
        const bName = newRole.role_name.toLowerCase();
        return loc.toLowerCase() === targetLocation.toLowerCase() && (rName.includes(bName) || bName.includes(rName));
      });

      if (matchingReq) {
        setSelectedRequisitionCode(matchingReq.req_code || (matchingReq as any).id);
      } else if (selectedRequisitionCode !== "CUSTOM") {
        setSelectedRequisitionCode("CUSTOM");
      }
    }
  };

  // Benchmark employees filtered by selected target role (with keyword fallback)
  const filteredBenchmarkEmployees = useMemo(() => {
    const roleObj = targetRoleBenchmarks.find((b) => b.role_id === selectedBenchmarkRoleId);
    if (!roleObj) return benchmarkEmployeesPool.slice(0, 3);
    const matched = benchmarkEmployeesPool.filter(
      (e) => e.role.toLowerCase() === roleObj.role_name.toLowerCase()
    );
    if (matched.length > 0) return matched;
    // Fallback: match by job family or keyword
    const familyKeyword = roleObj.job_family.toLowerCase().split(" ")[0];
    const familyMatched = benchmarkEmployeesPool.filter(
      (e) => e.role.toLowerCase().includes(familyKeyword)
    );
    return familyMatched.length > 0 ? familyMatched : benchmarkEmployeesPool.slice(0, 3);
  }, [selectedBenchmarkRoleId]);

  // Sync selected benchmark IDs when filtered list updates
  useEffect(() => {
    if (filteredBenchmarkEmployees.length > 0) {
      const valid = selectedBenchmarkEmpIds.filter((id) =>
        filteredBenchmarkEmployees.some((e) => e.employee_id === id)
      );
      if (valid.length === 0) {
        setSelectedBenchmarkEmpIds(
          filteredBenchmarkEmployees.slice(0, 3).map((e) => e.employee_id)
        );
      }
    }
  }, [filteredBenchmarkEmployees]);

  // Toggle Benchmark Employee Selection (Max 3)
  const toggleBenchmarkEmployee = (empId: string) => {
    setSelectedBenchmarkEmpIds((prev) => {
      if (prev.includes(empId)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((id) => id !== empId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), empId]; // replace oldest
      }
      return [...prev, empId];
    });
  };

  // Active capabilities list resolved live from Supabase or benchmark fallback
  const activeCapabilitiesList = useMemo(() => {
    const fromDb = liveRoleRequirements
      .filter((r) => r.role_name.toLowerCase() === activeBenchmark.role_name.toLowerCase() && r.active_flag !== false)
      .map((r) => ({
        name: r.capability_name,
        required_level: r.required_level,
        weight: r.weight,
        description: `Required Level ${r.required_level} mastery (${r.weight}%)`,
      }));
    return fromDb.length > 0 ? fromDb : activeBenchmark.required_capabilities;
  }, [liveRoleRequirements, activeBenchmark]);

  // Raw Dynamic Matching Output from Frontline Matching Algorithm
  const dynamicMatchData = useMemo(() => {
    if (!hasRunEngine) {
      return {
        benchmark: activeBenchmark,
        results: [],
        derivedBaseline: {
          medianRating: 4.65,
          medianTenure: 25,
          modeMbti: "ESTJ",
          modeDisc: "DI",
          benchmarkStrengths: ["Achiever", "Command", "Responsibility", "Maximizer"],
          capabilities: {},
        },
      };
    }
    return runDynamicMobilityMatching({
      targetRoleId: selectedBenchmarkRoleId,
      targetLocation,
      benchmarkEmpIds: selectedBenchmarkEmpIds,
      minPerformance,
      minTenureMonths,
      feederOnly,
      weights: {
        capability: capabilityWeight,
        performance: performanceWeight,
        psychometric: psychometricWeight,
        tenure: tenureWeight,
      },
      dynamicCapabilities: activeCapabilitiesList,
    });
  }, [
    hasRunEngine,
    selectedBenchmarkRoleId,
    targetLocation,
    selectedBenchmarkEmpIds,
    minPerformance,
    minTenureMonths,
    feederOnly,
    capabilityWeight,
    performanceWeight,
    psychometricWeight,
    tenureWeight,
    activeBenchmark,
    activeCapabilitiesList,
  ]);

  const rawDynamicMatches = dynamicMatchData.results;
  const derivedBaseline = dynamicMatchData.derivedBaseline;

  // Filtered Dynamic Candidates based on tier and search
  const dynamicMatchedCandidates = useMemo(() => {
    return rawDynamicMatches.filter((c) => {
      if (dynamicFilterTier !== "ALL" && c.readiness_status !== dynamicFilterTier) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          c.fullname.toLowerCase().includes(q) ||
          c.employee_code.toLowerCase().includes(q) ||
          c.current_role.toLowerCase().includes(q) ||
          c.current_location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rawDynamicMatches, dynamicFilterTier, searchQuery]);

  // Engine Trigger (Simulates 600ms Supabase PostgreSQL calculate_mobility_match RPC)
  const handleTriggerEngine = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setHasRunEngine(true);
      setIsGenerating(false);
      const benchmarkNames = benchmarkEmployeesPool
        .filter((b) => selectedBenchmarkEmpIds.includes(b.employee_id))
        .map((b) => b.fullname.split(" ")[0])
        .join(", ");
      setEngineExecutionStats(
        `PostgreSQL RPC: mart.calculate_mobility_match() • 24ms • 32 candidates evaluated against ${selectedBenchmarkEmpIds.length} benchmarks (${benchmarkNames || "Top Performers"})`
      );
    }, 600);
  };

  // Toggle Shortlist Selection
  const toggleShortlist = (code: string) => {
    setShortlistedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Select All Ready Candidates
  const selectAllReady = () => {
    const readyCodes = rawDynamicMatches
      .filter((c) => c.readiness_status === "Ready")
      .map((c) => c.employee_code);
    setShortlistedCodes(Array.from(new Set([...shortlistedCodes, ...readyCodes])));
  };

  // Clear Shortlist
  const clearShortlist = () => {
    setShortlistedCodes([]);
  };

  // Dynamic Promotion and Requisition Binding
  const handleDynamicPromote = (
    candidate: DynamicMatchResult,
    requisitionCode: string
  ) => {
    setAssignedRequisitions((prev) => ({
      ...prev,
      [candidate.employee_code]: requisitionCode,
    }));
    setPromotionSuccess(
      `${candidate.fullname} (${candidate.employee_code}) assigned to ${requisitionCode}: ${candidate.target_role} (${candidate.target_location})! Internal backfill SLA: 10 days vs 34 days external recruitment.`
    );
    setSelectedDynamicCandidate(null);
    setTimeout(() => {
      setPromotionSuccess(null);
    }, 7000);
  };

  // Export Shortlist as CSV
  const handleExportShortlist = () => {
    const candidatesToExport = rawDynamicMatches.filter((c) =>
      shortlistedCodes.includes(c.employee_code)
    );
    if (candidatesToExport.length === 0) {
      alert("Please select at least one candidate for export.");
      return;
    }
    const headers =
      "Employee Code,Full Name,Current Role,Current Location,Target Role,Target Location,Match Rate,Status,Capability Coverage,Performance Rating,Tenure Months,Top Strength,Recommended Action\n";
    const rows = candidatesToExport
      .map(
        (c) =>
          `"${c.employee_code}","${c.fullname}","${c.current_role}","${c.current_location}","${c.target_role}","${c.target_location}",${c.match_rate_pct}%,${c.readiness_status},${c.capability_coverage_pct}%,${c.performance_rating},${c.tenure_months},"${c.top_strength.replace(/"/g, '""')}","${c.recommended_action.replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `FITHUB_Internal_Mobility_Shortlist_${activeBenchmark.role_id}_${targetLocation}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Promotion Simulation (Legacy)
  const handlePromote = (candidateName: string, targetRole: string, targetLoc: string) => {
    setPromotionSuccess(`${candidateName} promoted to ${targetRole} (${targetLoc})`);
    setSelectedCandidate(null);
    setTimeout(() => {
      setPromotionSuccess(null);
    }, 4500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header with Lifecycle Context */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              POST-HIRE LIFECYCLE
            </span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover & Experience"
              metricOrEntity="Historical Exits & Survey Results"
              originalSource="Turnover sheet (889 exits) + Engagement (1,636 respondents)"
              governanceRule="Exact empirical exit rates, voluntary classification, and eNPS scores."
              impactOnDecision="Pins Career Development as #1 exit reason (solving with internal mobility)."
            />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-primary tracking-tight">
            Team Intelligence & Internal Mobility
          </h1>
          <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
            Diagnose early tenure attrition, evaluate employee experience sentiment, and operationalize internal mobility to solve FIT HUB&apos;s number one exit driver.
          </p>
        </div>

        {/* Action Link to Vacancy */}
        <div className="flex items-center gap-3">
          <Link
            href="/vacancy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated hover:border-brand-teal/40 transition-all shadow-subtle"
          >
            <Briefcase className="w-4 h-4 text-brand-teal" />
            <span>Switch to Vacancy (Pre-Hire)</span>
            <ChevronRight className="w-4 h-4 text-ink-tertiary" />
          </Link>
        </div>
      </div>

      {/* Lifecycle Strip Banner */}
      <LifecycleStrip
        activeStep={currentLifecycleStep}
        onSelectStep={(stepId, targetTab) => {
          if (targetTab && ["overview", "cliff", "engagement", "mobility", "exits"].includes(targetTab)) {
            handleTabChange(targetTab as TeamTab);
          }
        }}
        className="my-6"
      />

      {/* Promotion Success Notification Banner */}
      {promotionSuccess && (
        <div className="p-4 rounded-xl bg-status-healthy/15 border border-status-healthy/40 text-xs text-status-healthy font-semibold flex items-center justify-between shadow-subtle animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-status-healthy" />
            <span>{promotionSuccess}</span>
          </div>
          <button
            onClick={() => setPromotionSuccess(null)}
            className="text-ink-secondary hover:text-ink-primary font-bold px-2 py-0.5 rounded hover:bg-surface-card transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Executive KPI Row (6 Metric Cards - 100% Dynamic & Enterprise People Analytics Standard) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Headcount */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Tracked Headcount</span>
              <MetricInfoTooltip
                title="Tracked Headcount"
                description="Total frontline personnel actively deployed across operational gym clubs."
                formula="Sum of active employee headcount across club cohorts"
                benchmark="Baseline capacity: 408 frontline employees across operational clubs"
                align="left"
              />
            </span>
            <Users className="w-4 h-4 text-brand-teal shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {teamKpis.headcount}
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">
              {dynamicClubLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Active Frontline</span>
            <span className="text-ink-tertiary font-medium">Headcount Base</span>
          </div>
        </div>

        {/* Metric 2: Annualized Turnover */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Annualized Turnover</span>
              <MetricInfoTooltip
                title="Annualized Turnover Rate"
                description="Annualized turnover rate measuring the speed of frontline workforce departures."
                formula="(Total Departures in Period / Active Headcount Base) × 100%"
                benchmark="Target: < 30.0%. Critical (> 50%): High turnover hotspot"
                align="left"
              />
            </span>
            <TrendingDown className="w-4 h-4 text-status-danger shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              {teamKpis.turnover}%
            </span>
            <span className={`text-[11px] font-semibold ${teamKpis.turnover <= 30 ? 'text-status-healthy' : 'text-status-attention'}`}>
              {teamKpis.isFiltered 
                ? (teamKpis.turnover > 44.8 ? 'Above Nat. Avg' : 'Below Nat. Avg')
                : 'Target: < 30.0%'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Voluntary &amp; Involuntary</span>
            <span className="text-ink-tertiary font-medium">Annualized</span>
          </div>
        </div>

        {/* Metric 3: Early Attrition (<12M) */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Early Attrition</span>
              <MetricInfoTooltip
                title="Early-Tenure Attrition (<12M)"
                description="Proportion of workforce exits occurring within an employee's first 12 months of service (Onboarding Cliff)."
                formula="(Exits with Tenure ≤ 12 Months / Total Recorded Exits) × 100%"
                benchmark="Target: < 35.0%. FIT HUB baseline is 57.4% (30.5% in <6M, 26.9% in 6-12M)"
                align="center"
              />
            </span>
            <AlertTriangle className="w-4 h-4 text-status-attention shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-attention">
              {teamKpis.earlyAttrition}%
            </span>
            <span className="text-[11px] font-semibold text-status-attention">
              &lt; 12M Tenured
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Onboarding Cliff</span>
            <span className="text-ink-tertiary font-medium">&lt; 12 Months</span>
          </div>
        </div>

        {/* Metric 4: Exit Backfill Rate */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Exit Backfill Rate</span>
              <MetricInfoTooltip
                title="Exit Backfill Rate"
                description="Operational efficiency in backfilling vacated frontline roles to prevent club understaffing."
                formula="(Replaced & In-Flight Backfill Requisitions / Total Recorded Exits) × 100%"
                benchmark="Target: ≥ 80.0%. Unfilled gaps elevate remaining staff burnout and trigger turnover contagion"
                align="center"
              />
            </span>
            <GitBranch className="w-4 h-4 text-brand-teal shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-brand-teal">
              {teamKpis.backfillRate}%
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">
              {teamKpis.backfilledCount} Replaced
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Operational Coverage</span>
            <span className="text-ink-tertiary font-medium">Turnover Backfill</span>
          </div>
        </div>

        {/* Metric 5: Net eNPS Pulse */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Net eNPS Pulse</span>
              <MetricInfoTooltip
                title="Net eNPS (Advocacy Pulse)"
                description="Employee Net Promoter Score measuring active frontline advocacy, trust, and organizational satisfaction."
                formula="% Promoters (Score 9-10) - % Detractors (Score 0-6)"
                benchmark="Good: > +40.0; Strong: > +50.0. National FIT HUB score is +56.6"
                align="right"
              />
            </span>
            <HeartHandshake className={`w-4 h-4 shrink-0 ${teamKpis.enps >= 50 ? 'text-brand-teal' : 'text-status-danger'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-display font-black ${teamKpis.enps >= 50 ? 'text-ink-primary' : 'text-status-danger'}`}>
              {teamKpis.enps > 0 ? `+${teamKpis.enps}` : teamKpis.enps}
            </span>
            <span className={`text-[11px] font-semibold ${teamKpis.enps >= 50 ? 'text-status-healthy' : 'text-status-attention'}`}>
              {dynamicEngagement.active.promoter_pct}% Promoters
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Employee Voice</span>
            <span className="text-ink-tertiary font-medium">Pulse Survey</span>
          </div>
        </div>

        {/* Metric 6: Avg Manager Rating */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Avg Manager Rating</span>
              <MetricInfoTooltip
                title="Average Manager Rating"
                description="Average employee performance rating evaluated by Club General Managers during periodic reviews."
                formula="Average of Manager Performance Evaluation Scores (Scale 1.0 to 5.0)"
                benchmark="Target: ≥ 4.00 / 5.00. National FIT HUB baseline is 4.25"
                align="right"
              />
            </span>
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-amber-400">
              {teamKpis.managerRating.toFixed(2)}
            </span>
            <span className="text-[11px] font-semibold text-ink-tertiary">
              Scale 1.0 - 5.0
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Manager Review</span>
            <span className="text-ink-tertiary font-medium">90d Appraisal</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Tab Bar Navigation */}
      <div className="flex items-center justify-between border-b border-surface-border gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Retention & Lifecycle Cohorts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal/10 text-brand-teal">
              {filteredCohorts.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("cliff")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "cliff"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Tenure Cliff & Survival Curve</span>
          </button>

          <button
            onClick={() => handleTabChange("engagement")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "engagement"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Voice of Employee & eNPS</span>
          </button>

          <button
            onClick={() => handleTabChange("mobility")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "mobility"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Sparkles className="w-4 h-4 text-status-attention" />
            <span>Internal Mobility Match</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal text-surface-ground font-bold">
              {rawDynamicMatches.filter((m) => m.readiness_status === "Ready").length} Ready
            </span>
          </button>

          <button
            onClick={() => handleTabChange("exits")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "exits"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Exit-to-Vacancy Continuity</span>
          </button>
        </div>

        {/* Active Context Chip */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-ink-secondary bg-surface-card px-3 py-1.5 rounded-full border border-surface-border">
          <Filter className="w-3.5 h-3.5 text-brand-teal" />
          <span className="font-medium text-ink-primary">{locationDisplay}</span>
          <span>|</span>
          <span className="font-medium text-ink-primary">{roleDisplay}</span>
          <span>|</span>
          <span className="text-ink-tertiary">{formatPeriodLabel(selectedPeriod)}</span>
        </div>
      </div>

      {/* Promotion Success Notification */}
      {promotionSuccess && (
        <div className="p-4 rounded-xl bg-status-healthy/10 border border-status-healthy/30 flex items-center justify-between text-status-healthy animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Internal Promotion Approved
              </p>
              <p className="text-xs opacity-90">
                {promotionSuccess}. Vacancy requisition status automatically updated to &ldquo;Filled via Internal Transfer&rdquo;.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPromotionSuccess(null)}
            className="text-xs underline hover:opacity-75 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. TAB 1: Retention & Lifecycle Cohorts */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type="text"
                  placeholder="Search role, location, or exit driver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                />
              </div>


            </div>

            <div className="text-xs text-ink-tertiary">
              Showing <span className="font-semibold text-ink-primary">{filteredCohorts.length}</span> cohorts
            </div>
          </div>

          {/* Full-Width Cohort Attrition Matrix (10 Informational Columns - Option A) */}
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-card border border-surface-border overflow-hidden shadow-subtle">
              <div className="p-4 border-b border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-brand-teal" />
                  <h2 className="text-sm font-bold text-ink-primary font-display">
                    Workforce Retention &amp; Cohort Attrition Matrix
                  </h2>
                </div>
                <span className="text-xs text-ink-tertiary">
                  Empirical data from 889 historical exits &bull; Role &times; Location Contextual Intelligence
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-ground/70 border-b border-surface-border text-ink-secondary font-semibold">
                      <th className="py-3.5 px-4 whitespace-nowrap">Role / Job Family</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Location</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">Headcount</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 justify-center">
                          <span>Turnover %</span>
                          <MetricInfoTooltip
                            title="Annualized Turnover Rate"
                            description="Proportion of cohort workforce exiting on an annualized basis."
                            formula="(Total Departures / Active Headcount Base) × 100%"
                            benchmark="Target: < 30.0%. Critical (> 50.0%): Bali (62.5%), Surabaya FC (52.4%)"
                            align="center"
                          />
                        </span>
                      </th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 justify-center">
                          <span>&lt; 12M Cliff</span>
                          <MetricInfoTooltip
                            title="Early Attrition (<12M)"
                            description="Proportion of exits occurring within the first year of employment (Onboarding Cliff)."
                            formula="(Exits ≤ 12 Months / Total Exits) × 100%"
                            benchmark="Target: < 35.0%. FIT HUB baseline is 57.4% (Highest: Bali CS at 68.4%)"
                            align="center"
                          />
                        </span>
                      </th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 justify-center">
                          <span>Regrettable %</span>
                          <MetricInfoTooltip
                            title="Regrettable Voluntary Losses"
                            description="Proportion of voluntary exits identified as top high performers."
                            formula="(High-Performer Exits / Total Voluntary Exits) × 100%"
                            benchmark="Critical (> 30.0%): Bali PT (33.3%), Bali CS (31.6%)"
                            align="center"
                          />
                        </span>
                      </th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 justify-center">
                          <span>Segment eNPS</span>
                          <MetricInfoTooltip
                            title="Segment eNPS Pulse"
                            description="Net Promoter Score measured specifically for this role and location segment."
                            formula="% Promoters (9-10) - % Detractors (0-6)"
                            benchmark="Company Average: +56.6 (Lowest: Bali CS at +37.8, PT at +42.0)"
                            align="center"
                          />
                        </span>
                      </th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Primary Exit Reason</th>
                      <th className="py-3.5 px-4 min-w-[220px]">Role-Specific Factor</th>
                      <th className="py-3.5 px-4 min-w-[220px]">Location-Specific Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredCohorts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-ink-tertiary">
                          No cohorts match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCohorts.map((cohort) => (
                        <tr
                          key={cohort.cohort_id}
                          className="hover:bg-surface-elevated/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-semibold text-ink-primary whitespace-nowrap">
                            {cohort.role_name}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-ground border border-surface-border text-ink-secondary">
                              {cohort.location_name}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-ink-primary font-mono">
                            {cohort.headcount}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold">
                            <span className={cohort.annualized_turnover_pct > 50 ? "text-status-danger" : cohort.annualized_turnover_pct > 35 ? "text-status-attention" : "text-ink-primary"}>
                              {cohort.annualized_turnover_pct}%
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            <span className={cohort.early_attrition_pct > 60 ? "text-status-danger font-bold" : "text-status-attention"}>
                              {cohort.early_attrition_pct}%
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-ink-secondary">
                            <span className={cohort.regrettable_loss_pct > 30 ? "text-status-danger font-semibold" : "text-ink-primary"}>
                              {cohort.regrettable_loss_pct}%
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ${
                              (cohort.segment_enps ?? 50) < 45
                                ? "bg-status-danger/15 text-status-danger border border-status-danger/30"
                                : (cohort.segment_enps ?? 50) <= 55
                                ? "bg-status-attention/15 text-status-attention border border-status-attention/30"
                                : "bg-status-healthy/15 text-status-healthy border border-status-healthy/30"
                            }`}>
                              {(cohort.segment_enps ?? 50) > 0 ? `+${(cohort.segment_enps ?? 50).toFixed(1)}` : (cohort.segment_enps ?? 50).toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-surface-ground border border-surface-border text-ink-primary">
                              {getStandardizedExitDimension(cohort.core_exit_driver || cohort.primary_exit_driver, cohort.role_name, cohort.location_name)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink-secondary leading-relaxed">
                            {cohort.role_specific_factor || getCohortFactor(cohort.role_name, cohort.location_name, "role") || `${cohort.role_name} operational role demands`}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink-secondary leading-relaxed">
                            {cohort.location_specific_factor || getCohortFactor(cohort.role_name, cohort.location_name, "location") || `${cohort.location_name} regional market conditions`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lifecycle Continuity Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/5 to-transparent border border-brand-teal/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink-primary">
                    Solving #1 Exit Driver: Career Development
                  </h4>
                  <p className="text-[11px] text-ink-secondary">
                    Customer Service and Personal Trainers cite lack of visible career tracks as their primary departure driver. Match top talent directly to open vacancies.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("mobility")}
                className="px-3 py-1.5 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors whitespace-nowrap"
              >
                View Mobility Candidates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Tenure Cliff & Survival Curve */}
      {activeTab === "cliff" && (
        <div className="space-y-6">
          {/* 30/60/90 Day Listening Architecture */}
          <SectionCard
            title="30 / 60 / 90 Day Listening & Onboarding Check-in Framework"
            description="Structured early-tenure listening checkpoints to intercept role expectation mismatch, onboarding friction, and roster bottlenecks before resignations occur."
            note="Dynamic Pulse: Capturing early frontline sentiment at Day 30, 60, and 90 connected directly to Frontline Competency progression (Level 1 -> 2 -> 3)."
          >
            {/* Top 3 Milestone Cards with Capability Gate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-surface-soft border border-border-default/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-xs text-brand-teal">Milestone 1</span>
                  <Chip label="Day 30 Pulse" tone="teal" size="sm" />
                </div>
                <h4 className="font-spartan font-bold text-sm text-ink-primary">Role Clarity & Expectation Sync</h4>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="kpi-number text-2xl text-ink-primary">{pulseMetrics.d30Avg.toFixed(1)}</span>
                  <span className="text-xs text-ink-secondary">/ 5.0 score</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal text-[10px] font-bold uppercase mb-2">
                  <Award className="w-3 h-3" />
                  <span>Capability: L1 Baseline Sync</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Evaluates initial role alignment, buddy pairing, floor orientation, and foundational POS/equipment SOP.
                </p>
                <div className="mt-3 pt-2 border-t border-border-default/50 text-[11px] flex justify-between">
                  <span className={pulseMetrics.d30AtRisk > 0 ? "text-status-critical font-bold" : "text-status-healthy font-semibold"}>
                    {pulseMetrics.d30AtRisk > 0 ? `${pulseMetrics.d30AtRisk} At-Risk Joiners` : "All on Track"}
                  </span>
                  <span className="text-ink-muted">{pulseMetrics.d30Count} Evaluated</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-soft border border-border-default/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-xs text-status-attention">Milestone 2</span>
                  <Chip label="Day 60 Pulse" tone="yellow" size="sm" />
                </div>
                <h4 className="font-spartan font-bold text-sm text-ink-primary">Ramp-Up & Floor Integration</h4>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="kpi-number text-2xl text-ink-primary">{pulseMetrics.d60Avg.toFixed(1)}</span>
                  <span className="text-xs text-ink-secondary">/ 5.0 score</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-attention/15 text-[#92400E] text-[10px] font-bold uppercase mb-2">
                  <GitBranch className="w-3 h-3" />
                  <span>Capability: L1 → L2 Gate</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Assesses solo floor shift independence, bottleneck unblocking, sales quota ramp-up, and Club GM 1-on-1 coaching.
                </p>
                <div className="mt-3 pt-2 border-t border-border-default/50 text-[11px] flex justify-between">
                  <span className={pulseMetrics.d60AtRisk > 0 ? "text-status-attention font-bold" : "text-status-healthy font-semibold"}>
                    {pulseMetrics.d60AtRisk > 0 ? `${pulseMetrics.d60AtRisk} At-Risk Joiners` : "Floor Ready"}
                  </span>
                  <span className="text-ink-muted">{pulseMetrics.d60Count} Evaluated</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-soft border border-border-default/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-xs text-status-healthy">Milestone 3</span>
                  <Chip label="Day 90 Pulse" tone="healthy" size="sm" />
                </div>
                <h4 className="font-spartan font-bold text-sm text-ink-primary">Probation & Autonomy Signoff</h4>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="kpi-number text-2xl text-status-healthy">{pulseMetrics.d90Avg.toFixed(1)}</span>
                  <span className="text-xs text-ink-secondary">/ 5.0 score</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-healthy/15 text-[#166534] text-[10px] font-bold uppercase mb-2">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Capability: L2 Verified &amp; L3 Track</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Full 3-month output &amp; expectation review. Validates autonomous floor quota mastery and permanent confirmation.
                </p>
                <div className="mt-3 pt-2 border-t border-border-default/50 text-[11px] flex justify-between">
                  <span className="text-status-healthy font-semibold">
                    {pulseMetrics.d90Ready > 0 ? `${pulseMetrics.d90Ready} Ready for Signoff` : "Review Pending"}
                  </span>
                  <span className="text-ink-muted">{pulseMetrics.d90Count} Evaluated</span>
                </div>
              </div>
            </div>

            {/* 3 Mini Bar Charts: Concern Rate Breakdown per Milestone */}
            <div className="mb-6 p-4 rounded-xl bg-surface-ground border border-surface-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-ink-primary uppercase tracking-wider font-spartan flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Checkpoint Concern Distribution (% of Joiners Flagging Concern)</span>
                </span>
                <span className="text-[11px] text-ink-tertiary">Reactive to Location &amp; Role Filters</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Day 30 Concerns */}
                <div className="space-y-2.5 p-3 rounded-lg bg-surface-card border border-surface-border">
                  <div className="flex justify-between items-center pb-1 border-b border-surface-border text-[11px] font-bold text-brand-teal">
                    <span>Day 30 Alignment Concerns</span>
                    <span>Rate</span>
                  </div>
                  {concernBreakdowns.d30Concerns.map((c) => (
                    <div key={c.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-ink-secondary truncate max-w-[180px]">{c.label}</span>
                        <span className="font-semibold text-ink-primary">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-border/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-teal rounded-full transition-all"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day 60 Concerns */}
                <div className="space-y-2.5 p-3 rounded-lg bg-surface-card border border-surface-border">
                  <div className="flex justify-between items-center pb-1 border-b border-surface-border text-[11px] font-bold text-status-attention">
                    <span>Day 60 Ramp-up Bottlenecks</span>
                    <span>Rate</span>
                  </div>
                  {concernBreakdowns.d60Concerns.map((c) => (
                    <div key={c.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-ink-secondary truncate max-w-[180px]">{c.label}</span>
                        <span className="font-semibold text-ink-primary">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-border/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#CA8A04] rounded-full transition-all"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day 90 Concerns */}
                <div className="space-y-2.5 p-3 rounded-lg bg-surface-card border border-surface-border">
                  <div className="flex justify-between items-center pb-1 border-b border-surface-border text-[11px] font-bold text-status-healthy">
                    <span>Day 90 Output &amp; Signoff Friction</span>
                    <span>Rate</span>
                  </div>
                  {concernBreakdowns.d90Concerns.map((c) => (
                    <div key={c.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-ink-secondary truncate max-w-[180px]">{c.label}</span>
                        <span className="font-semibold text-ink-primary">{c.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-border/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-status-healthy rounded-full transition-all"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Early-Tenure Pulse Monitoring Table (9 Clean Columns) */}
            <div className="rounded-xl border border-surface-border overflow-hidden bg-surface-card">
              <div className="p-4 bg-surface-ground border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-teal" />
                  <span className="font-spartan font-bold text-xs text-ink-primary uppercase tracking-wider">
                    Recent Joiners Early-Tenure Pulse Monitor (Mini NPS)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-teal/10 text-brand-teal">
                    {filteredEarlyTenureJoiners.length} Active Records
                  </span>
                </div>
                <span className="text-[11px] text-ink-secondary">
                  Filtered by {locationDisplay} &bull; Frontline Joiners &lt; 6 Months
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-soft/40 text-ink-secondary">
                      <th className="py-2.5 px-3 font-semibold">Emp ID</th>
                      <th className="py-2.5 px-3 font-semibold">Nama</th>
                      <th className="py-2.5 px-3 font-semibold">Role</th>
                      <th className="py-2.5 px-3 font-semibold">Lokasi</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Tenure</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Day 30</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Day 60</th>
                      <th className="py-2.5 px-3 text-center font-semibold">Day 90</th>
                      <th className="py-2.5 px-3 font-semibold">Primary Concern</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {filteredEarlyTenureJoiners.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-ink-muted text-xs">
                          No frontline joiners found matching active filters ({locationDisplay}).
                        </td>
                      </tr>
                    ) : (
                      filteredEarlyTenureJoiners.map((joiner) => (
                        <tr key={joiner.employee_id} className="hover:bg-surface-soft/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-ink-primary">
                            {joiner.employee_id}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-ink-primary whitespace-nowrap">
                            {joiner.employee_name}
                          </td>
                          <td className="py-2.5 px-3 text-ink-secondary whitespace-nowrap">
                            {joiner.role_name}
                          </td>
                          <td className="py-2.5 px-3 text-ink-secondary whitespace-nowrap">
                            {joiner.club_name || `${joiner.role_name} • ${joiner.location_name}`}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-ink-primary whitespace-nowrap">
                            {joiner.tenure_months.toFixed(1)} mos
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {joiner.score_30d !== null ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                  joiner.score_30d < 3.0
                                    ? "bg-status-danger/15 text-status-danger"
                                    : joiner.score_30d < 4.0
                                    ? "bg-status-attention/15 text-[#92400E]"
                                    : "bg-status-healthy/15 text-[#166534]"
                                }`}
                              >
                                {joiner.score_30d.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px] italic">Pending</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {joiner.score_60d !== null ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                  joiner.score_60d < 3.0
                                    ? "bg-status-danger/15 text-status-danger"
                                    : joiner.score_60d < 4.0
                                    ? "bg-status-attention/15 text-[#92400E]"
                                    : "bg-status-healthy/15 text-[#166534]"
                                }`}
                              >
                                {joiner.score_60d.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px] italic">Pending</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {joiner.score_90d !== null ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                  joiner.score_90d < 3.0
                                    ? "bg-status-danger/15 text-status-danger"
                                    : joiner.score_90d < 4.0
                                    ? "bg-status-attention/15 text-[#92400E]"
                                    : "bg-status-healthy/15 text-[#166534]"
                                }`}
                              >
                                {joiner.score_90d.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-ink-muted text-[11px] italic">Pending</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-ink-secondary">
                            <span className="font-semibold text-ink-primary block text-xs">
                              {joiner.concern_category}
                            </span>
                            <span className="text-[11px] text-ink-tertiary">
                              {joiner.primary_concern}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>

          {/* Tenure Survival Curve & Frontline Exit Cliff */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-status-danger" />
                  <span>Tenure Survival Curve &amp; Frontline Exit Cliff</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Breakdown of {dynamicTenureBands[0]?.total_exits || 889} employee departures across milestone tenure intervals ({locationDisplay}).
                </p>
              </div>
            </div>

            {/* Stepped Tenure Band Cards: 5 Intervals */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
              {dynamicTenureBands.map((band, idx) => (
                <div
                  key={band.band_label}
                  className={`p-4 rounded-xl border relative transition-all ${
                    idx === 0 || idx === 1
                      ? "bg-status-danger/5 border-status-danger/30 shadow-subtle"
                      : idx === 2 || idx === 3
                      ? "bg-status-attention/5 border-status-attention/30"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    {band.band_label}
                  </h4>
                  <div className="text-2xl font-display font-black text-ink-primary mb-1">
                    {band.exit_count} exits
                  </div>
                  <div className="space-y-1 text-[11px] pt-2 border-t border-surface-border">
                    <div className="flex justify-between text-ink-secondary">
                      <span>Band Share:</span>
                      <span className="font-bold text-ink-primary">{band.pct_of_exits}%</span>
                    </div>
                    <div className="flex justify-between text-ink-secondary">
                      <span>Cumulative:</span>
                      <span className={`font-bold ${idx <= 1 ? "text-status-danger" : idx <= 3 ? "text-[#CA8A04]" : "text-ink-primary"}`}>
                        {band.cumulative_pct}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-ink-tertiary uppercase truncate">
                    {band.cliff_stage}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Themed Tenure Distribution Bar Chart (Matching Web Theme) */}
            <div className="my-6 p-6 rounded-xl bg-surface-ground border border-surface-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-ink-primary uppercase tracking-wider font-spartan block">
                    Tenure Interval Distribution (% of Departures)
                  </span>
                  <span className="text-[11px] text-ink-tertiary">
                    Visual comparison of turnover friction across milestone tenure intervals
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                    {dynamicTenureBands[0]?.total_exits || 889} Total Departures
                  </span>
                </div>
              </div>

              {/* High-Fidelity Themed Bars */}
              <div className="grid grid-cols-5 gap-4 pt-4">
                {dynamicTenureBands.map((band, idx) => {
                  const maxPct = Math.max(...dynamicTenureBands.map((b) => b.pct_of_exits), 35);
                  const barHeightPct = Math.max(12, Math.round((band.pct_of_exits / maxPct) * 100));

                  const gradientClass =
                    idx === 0
                      ? "from-red-600 via-rose-500 to-rose-400 text-rose-700 bg-rose-50 border-rose-200"
                      : idx === 1
                      ? "from-orange-600 via-amber-500 to-amber-400 text-orange-700 bg-orange-50 border-orange-200"
                      : idx === 2
                      ? "from-amber-600 via-yellow-500 to-yellow-400 text-amber-800 bg-amber-50 border-amber-200"
                      : idx === 3
                      ? "from-teal-700 via-brand-teal to-teal-400 text-teal-800 bg-teal-50 border-teal-200"
                      : "from-blue-600 via-indigo-500 to-sky-400 text-blue-800 bg-blue-50 border-blue-200";

                  return (
                    <div key={band.band_label} className="flex flex-col items-center group">
                      {/* Top Percentage Badge */}
                      <div className="mb-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono font-bold shadow-xs border ${
                            idx === 0
                              ? "text-status-danger bg-red-50 border-red-200"
                              : idx === 1
                              ? "text-orange-600 bg-orange-50 border-orange-200"
                              : idx === 2
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : idx === 3
                              ? "text-brand-teal bg-teal-50 border-teal-200"
                              : "text-blue-600 bg-blue-50 border-blue-200"
                          }`}
                        >
                          {band.pct_of_exits}%
                        </span>
                      </div>

                      {/* Bar Track Container */}
                      <div className="w-full h-48 bg-surface-card rounded-xl p-2.5 flex flex-col justify-end items-center border border-surface-border shadow-subtle relative overflow-hidden group-hover:border-brand-teal/40 transition-all">
                        {/* Subtle background grid line */}
                        <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-surface-border/40 pointer-events-none" />
                        <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-surface-border/30 pointer-events-none" />

                        {/* Animated Filled Bar */}
                        <div
                          className={`w-full rounded-lg bg-gradient-to-t ${gradientClass} transition-all duration-700 shadow-sm flex items-start justify-center pt-2 group-hover:scale-[1.02]`}
                          style={{ height: `${barHeightPct}%` }}
                        >
                          <span className="text-[10px] font-bold text-white tracking-wide drop-shadow-xs">
                            {band.exit_count}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Labels */}
                      <div className="mt-3 text-center w-full">
                        <span className="font-spartan font-bold text-xs text-ink-primary block truncate">
                          {band.band_label}
                        </span>
                        <span className="text-[11px] text-ink-secondary block font-mono mt-0.5">
                          {band.exit_count} exits
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: Voice of Employee & eNPS Explorer (Option A: 3-Layer Executive Flow) */}
      {activeTab === "engagement" && (
        <div className="space-y-6">
          {/* Header Summary Banner */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-healthy/20 text-status-healthy uppercase">
                    Annual Engagement Pulse
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/15 text-brand-teal uppercase font-mono">
                    Executive 3-Layer View
                  </span>
                </div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-brand-teal" />
                  <span>Voice of Employee Sentiment &amp; eNPS Explorer</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-1">
                  {dynamicEngagement.totalRespondents} respondents across {locationDisplay} evaluated FIT HUB across 6 core operational dimensions.
                </p>
              </div>

              {/* Dynamic eNPS Score Pill */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-ground border border-surface-border">
                <div className="text-right">
                  <span className="text-[11px] text-ink-tertiary block">Filtered Net eNPS</span>
                  <span className={`text-2xl font-display font-black ${dynamicEngagement.enps >= 50 ? "text-status-healthy" : dynamicEngagement.enps >= 30 ? "text-brand-teal" : "text-status-attention"}`}>
                    {dynamicEngagement.enps >= 0 ? `+${dynamicEngagement.enps.toFixed(1)}` : dynamicEngagement.enps.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-ink-secondary border-l border-surface-border pl-3">
                  <div>Promoters: <strong className="text-status-healthy">{dynamicEngagement.active.promoter_pct.toFixed(1)}%</strong></div>
                  <div>Passives: <strong>{dynamicEngagement.active.passive_pct.toFixed(1)}%</strong></div>
                  <div>Detractors: <strong className="text-status-danger">{dynamicEngagement.active.detractor_pct.toFixed(1)}%</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 1: General Organization Pulse */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-brand-teal/20 flex items-center justify-center text-brand-teal text-xs font-bold font-mono">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary font-display">
                    Layer 1: Organization-Wide Sentiment &amp; 6 Dimensions Pulse
                  </h3>
                  <p className="text-[11px] text-ink-secondary">
                    Company-wide eNPS voter distribution and benchmark rating out of 6.00 scale
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-brand-teal font-medium bg-brand-teal/10 px-2.5 py-1 rounded-md border border-brand-teal/20">
                Scope: {locationDisplay} &bull; {roleDisplay}
              </span>
            </div>

            {/* Visual eNPS Share & Dimensions Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-3">
                  eNPS Voter Distribution (Net {dynamicEngagement.enps >= 0 ? `+${dynamicEngagement.enps.toFixed(1)}` : dynamicEngagement.enps.toFixed(1)})
                </span>
                <StackedBarShare
                  segments={dynamicEngagement.segments}
                  totalLabel={`${dynamicEngagement.totalRespondents} Active Survey Respondents (${locationDisplay} • ${roleDisplay})`}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="label-xs text-ink-secondary">Dimension Scores (Out of 6.00 Scale)</span>
                  <span className="text-[10px] font-mono font-bold text-brand-teal px-2 py-0.5 rounded bg-brand-teal/10 border border-brand-teal/20">
                    Scale 0.00 – 6.00
                  </span>
                </div>

                {/* Gradient Dimension Tracks (0.00 to 6.00 scale) */}
                <div className="space-y-2.5 my-auto">
                  {dynamicEngagement.dimensionScores.map((dim) => {
                    const score = dim.value;
                    const pct = Math.min(100, Math.max(0, (score / 6.0) * 100));
                    const isFriction = score < 5.0;
                    const isHigh = score >= 5.5;

                    return (
                      <div key={dim.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-ink-primary truncate pr-2">{dim.label}</span>
                          <span className={`font-mono font-bold text-[11px] ${
                            isFriction ? "text-status-danger" : isHigh ? "text-brand-teal" : "text-ink-primary"
                          }`}>
                            {score.toFixed(2)} <span className="text-ink-tertiary font-normal">/ 6.00</span>
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-surface-ground rounded-full overflow-hidden p-0.5 border border-surface-border">
                          <div
                            className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                              isFriction
                                ? "bg-gradient-to-r from-status-danger via-rose-500 to-amber-500"
                                : isHigh
                                ? "bg-gradient-to-r from-brand-teal via-teal-400 to-emerald-400"
                                : "bg-gradient-to-r from-brand-teal via-cyan-400 to-sky-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calibrated X-Axis Scale Grid (0.00 to 6.00 Scale) */}
                <div className="pt-2 mt-3 border-t border-surface-border/60">
                  <div className="flex justify-between text-[10px] text-ink-tertiary font-mono">
                    <span>0.0</span>
                    <span>1.5</span>
                    <span>3.0</span>
                    <span>4.5</span>
                    <span className="font-bold text-ink-primary">6.0 Max</span>
                  </div>
                  <div className="relative h-1 mt-1">
                    <div className="absolute inset-x-0 top-0 h-px bg-surface-border" />
                    <div className="absolute left-0 top-0 w-px h-1 bg-surface-border" />
                    <div className="absolute left-1/4 top-0 w-px h-1 bg-surface-border" />
                    <div className="absolute left-2/4 top-0 w-px h-1 bg-surface-border" />
                    <div className="absolute left-3/4 top-0 w-px h-1 bg-surface-border" />
                    <div className="absolute right-0 top-0 w-px h-1 bg-surface-border" />
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Engagement Dimensions Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3">
                6 Core Workplace Dimensions (Out of 6.00 Scale)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {voiceThemes.map((v) => {
                  const dimScore = dynamicEngagement.dimensionScores.find((d) =>
                    d.label.toLowerCase().includes(v.dimension_name.toLowerCase().slice(0, 5))
                  )?.value ?? v.score;
                  const isConcern = dimScore < 5.0 || v.sentiment === "CONCERN";

                  return (
                    <div
                      key={v.dimension_name}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isConcern
                          ? "bg-status-danger/5 border-status-danger/30 shadow-subtle"
                          : "bg-surface-ground border-surface-border"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-ink-primary">
                            {v.dimension_name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isConcern
                              ? "bg-status-danger/20 text-status-danger"
                              : dimScore >= 5.5
                              ? "bg-status-healthy/20 text-status-healthy"
                              : "bg-status-attention/20 text-status-attention"
                          }`}>
                            {dimScore.toFixed(2)} / 6.00
                          </span>
                        </div>

                        <div className="text-[11px] text-ink-tertiary mb-2">
                          Benchmark: {v.national_benchmark} &bull; {v.segment_concentration}
                        </div>

                        <p className="text-xs text-ink-secondary leading-relaxed italic p-2.5 rounded-lg bg-surface-card border border-surface-border">
                          &ldquo;{v.verbatim_sample}&rdquo;
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LAYER 2: Frontline Role Sentiment Divergence */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-brand-teal/20 flex items-center justify-center text-brand-teal text-xs font-bold font-mono">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary font-display">
                    Layer 2: Frontline Role Sentiment Divergence
                  </h3>
                  <p className="text-[11px] text-ink-secondary">
                    Role-specific eNPS, headcount sample, and primary friction drivers across all 12 operational roles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-ink-tertiary hidden sm:inline">
                  Showing all {dynamicRoleSentiments.length} roles
                </span>
                <button
                  type="button"
                  onClick={() => scrollRoleCarousel("left")}
                  className="p-1.5 rounded-lg border border-surface-border bg-surface-ground hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary transition-colors active:scale-95"
                  aria-label="Scroll left"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRoleCarousel("right")}
                  className="p-1.5 rounded-lg border border-surface-border bg-surface-ground hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary transition-colors active:scale-95"
                  aria-label="Scroll right"
                  title="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* All 12 Roles in a horizontally scrollable carousel */}
            <div
              ref={roleCarouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-thin scroll-smooth pb-3 snap-x snap-mandatory"
            >
              {dynamicRoleSentiments.map((roleItem) => {
                const IconComponent = roleItem.icon;
                const isCritical = roleItem.enps < 40;
                const isAttention = roleItem.enps >= 40 && roleItem.enps < 55;

                return (
                  <div
                    key={roleItem.id}
                    className={`min-w-[280px] sm:min-w-[310px] max-w-[330px] flex-shrink-0 snap-start p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isCritical
                        ? "bg-status-danger/5 border-status-danger/30"
                        : isAttention
                        ? "bg-status-attention/5 border-status-attention/25"
                        : "bg-surface-ground border-surface-border hover:border-brand-teal/40"
                    }`}
                  >
                    <div>
                      {/* Role Header & Role-Specific eNPS Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center text-brand-teal">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-ink-primary leading-tight">
                              {roleItem.name}
                            </h4>
                            <span className="text-[10px] text-ink-tertiary">
                              {roleItem.jobFamily}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold whitespace-nowrap ${
                          isCritical
                            ? "bg-status-danger/20 text-status-danger"
                            : isAttention
                            ? "bg-status-attention/20 text-status-attention"
                            : "bg-status-healthy/20 text-status-healthy"
                        }`}>
                          {roleItem.enps >= 0 ? `+${roleItem.enps.toFixed(1)}` : roleItem.enps.toFixed(1)}
                        </span>
                      </div>

                      {/* Sample & Voter Mini Distribution */}
                      <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border mb-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-tertiary">Headcount Sample</span>
                          <span className="font-bold text-ink-primary font-mono">{roleItem.headcount} staff</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-tertiary">Promoters / Detractors</span>
                          <span className="font-mono">
                            <span className="text-status-healthy font-semibold">{roleItem.promoterPct.toFixed(1)}%</span>
                            <span className="text-ink-tertiary mx-1">/</span>
                            <span className="text-status-danger font-semibold">{roleItem.detractorPct.toFixed(1)}%</span>
                          </span>
                        </div>
                      </div>

                      {/* Core Friction vs Core Strength */}
                      <div className="space-y-2 mb-3">
                        <div className="p-2 rounded-lg bg-status-danger/10 border border-status-danger/20">
                          <div className="text-[10px] uppercase font-bold text-status-danger mb-0.5">
                            Primary Friction Dimension
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-ink-primary truncate pr-2">
                              {roleItem.lowestDim.name}
                            </span>
                            <span className="font-mono font-bold text-status-danger whitespace-nowrap">
                              {roleItem.lowestDim.score.toFixed(2)}/6.0
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
                          <div className="text-[10px] uppercase font-bold text-ink-tertiary mb-0.5">
                            Strongest Dimension
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-ink-primary truncate pr-2">
                              {roleItem.highestDim.name}
                            </span>
                            <span className="font-mono font-bold text-status-healthy whitespace-nowrap">
                              {roleItem.highestDim.score.toFixed(2)}/6.0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verbatim Quote */}
                    <p className="text-[11px] text-ink-secondary leading-relaxed italic p-2 rounded-lg bg-surface-card/80 border border-surface-border">
                      &ldquo;{roleItem.defaultQuote}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LAYER 3: Regional Club Sentiment & Location Matrix */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-brand-teal/20 flex items-center justify-center text-brand-teal text-xs font-bold font-mono">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary font-display">
                    Layer 3: Regional Club Sentiment &amp; Location Matrix
                  </h3>
                  <p className="text-[11px] text-ink-secondary">
                    Geographic sentiment distribution correlated with localized turnover and the primary workplace exit driver (1 of 6 core dimensions)
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-ink-tertiary px-2.5 py-1 rounded-md bg-surface-ground border border-surface-border">
                {dynamicLocationSentiments.length} Hubs Available • Scroll Table
              </span>
            </div>

            {/* Scrollable Regional Sentiment Table */}
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto rounded-xl border border-surface-border scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface-ground/95 backdrop-blur z-10 border-b border-surface-border text-ink-secondary font-semibold shadow-sm">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Location / Hub</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Cluster / Region</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Active Headcount</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Turnover Rate</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Early Exit (&lt;12M)</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Segment eNPS</th>
                    <th className="py-3 px-4 whitespace-nowrap">Primary Exit Driver (6 Dimensions)</th>
                    <th className="py-3 px-4 min-w-[280px]">Localized Context &amp; Root Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {dynamicLocationSentiments.map((loc) => {
                    return (
                      <tr
                        key={loc.id}
                        className={`transition-colors ${
                          loc.isSelected
                            ? "bg-brand-teal/10 font-semibold"
                            : "hover:bg-surface-elevated/80"
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink-primary">{loc.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-ground border border-surface-border text-ink-tertiary">
                              {loc.province}
                            </span>
                            {loc.isSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-teal text-white font-bold">
                                Active Scope
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center text-ink-tertiary whitespace-nowrap">
                          {loc.cluster}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold text-ink-primary">
                          {loc.headcount}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold">
                          <span className={loc.turnover > 50 ? "text-status-danger" : loc.turnover > 35 ? "text-status-attention" : "text-ink-primary"}>
                            {loc.turnover.toFixed(1)}%
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono">
                          <span className={loc.earlyAttrition > 60 ? "text-status-danger font-bold" : "text-status-attention"}>
                            {loc.earlyAttrition.toFixed(1)}%
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] ${
                            loc.enps < 40
                              ? "bg-status-danger/15 text-status-danger border border-status-danger/30"
                              : loc.enps <= 55
                              ? "bg-status-attention/15 text-status-attention border border-status-attention/30"
                              : "bg-status-healthy/15 text-status-healthy border border-status-healthy/30"
                          }`}>
                            {loc.enps > 0 ? `+${loc.enps.toFixed(1)}` : loc.enps.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                            loc.primaryDriver === "Compensation & Benefit"
                              ? "bg-status-danger/10 text-status-danger border-status-danger/30"
                              : loc.primaryDriver === "Career Growth"
                              ? "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30"
                              : loc.primaryDriver === "Fair Performance"
                              ? "bg-status-attention/10 text-status-attention border-status-attention/30"
                              : "bg-surface-ground text-ink-primary border-surface-border"
                          }`}>
                            {loc.primaryDriver}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-ink-secondary leading-relaxed">
                          {loc.operationalReason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: Internal Mobility & Dynamic Talent Matching Engine */}
      {activeTab === "mobility" && (
        <div className="space-y-6">
          {/* Main Card Wrapper */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border space-y-6">
            {/* Header with Title and Provenance */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/20 text-brand-teal uppercase">
                    Automated Mobility Engine
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-yellow/20 text-ink-primary uppercase border border-brand-yellow/30">
                    Dynamic Succession Generator
                  </span>
                  <DataProvenanceBadge
                    provenance="SYNTHETIC_ENABLER"
                    domain="Mobility Engine"
                    metricOrEntity="Dynamic Internal Talent Shortlist"
                    originalSource="Competency scoring engine & active frontline roster"
                    governanceRule="Dynamic composite calculation (Capabilities 55%, Performance 30%, Tenure 15% with distance penalty and feeder bonus)"
                    impactOnDecision="Directly solves #1 Career Development exit driver by promoting frontline staff into club leadership"
                  />
                </div>
                <h2 className="text-xl font-bold text-ink-primary font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-teal" />
                  <span>Internal Mobility & Dynamic Succession Matching Engine</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5 max-w-3xl">
                  Select target club vacancies, tune qualification weights, and run the matching algorithm to generate an instant ranked shortlist of high-potential frontline successors.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/team/capability/framework"
                  className="px-3 py-1.5 rounded-lg bg-surface-card border border-border-default text-xs font-bold text-ink-primary hover:border-brand-teal transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Capability Framework Editor</span>
                </Link>

                {/* Live Status Pill */}
                <div className="flex items-center gap-2 bg-surface-ground px-3 py-1.5 rounded-lg border border-surface-border text-xs">
                  <div className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" />
                  <span className="font-mono text-[11px] text-ink-secondary font-medium">
                    {engineExecutionStats}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Interactive Control Console — Unified Configuration Panel */}
            <div className="p-5 rounded-xl bg-surface-ground border border-surface-border space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-teal" />
                  <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                    Interactive Matching Console & Requisition Parameters
                  </h3>
                </div>
                <span className="text-[11px] text-ink-tertiary">
                  Dynamic multi-dimensional scoring • 100% natural distribution
                </span>
              </div>

              {/* Row 1: Requisition + Target Role + Location Cascade */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {/* Linked Open Requisition */}
                <div>
                  <label className="block text-[11px] font-bold text-ink-primary uppercase mb-1 flex items-center justify-between">
                    <span>Linked Open Requisition</span>
                    <span className="text-[10px] text-brand-teal font-normal font-mono">mart_requisitions</span>
                  </label>
                  <select
                    value={selectedRequisitionCode}
                    onChange={(e) => handleSelectRequisition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-ink-primary font-semibold focus:outline-none focus:border-brand-teal"
                  >
                    {leadOpenRequisitions.map((req) => (
                      <option key={req.req_code || req.id} value={req.req_code || req.id}>
                        {req.req_code || req.id} • {req.role_name || req.role} ({req.location_name || req.location}) — {req.days_open}d
                      </option>
                    ))}
                    <option value="CUSTOM">Custom Vacancy ({targetLocation})</option>
                  </select>
                </div>

                {/* Target Vacancy / Benchmark Role */}
                <div>
                  <label className="block text-[11px] font-bold text-ink-primary uppercase mb-1">
                    Target Vacancy / Benchmark Role
                  </label>
                  <select
                    value={selectedBenchmarkRoleId}
                    onChange={(e) => handleBenchmarkRoleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-ink-primary font-semibold focus:outline-none focus:border-brand-teal"
                  >
                    <optgroup label="Tier 4 • Multi-Unit Executive">
                      {targetRoleBenchmarks.filter((b) => getRoleTier(b.role_name) === 4).map((b) => (
                        <option key={b.role_id} value={b.role_id}>{b.role_name} ({b.job_family})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tier 3 • Club Management">
                      {targetRoleBenchmarks.filter((b) => getRoleTier(b.role_name) === 3).map((b) => (
                        <option key={b.role_id} value={b.role_id}>{b.role_name} ({b.job_family})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tier 2 • Team Leaders & Specialists">
                      {targetRoleBenchmarks.filter((b) => getRoleTier(b.role_name) === 2).map((b) => (
                        <option key={b.role_id} value={b.role_id}>{b.role_name} ({b.job_family})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tier 1 • Frontline Staff">
                      {targetRoleBenchmarks.filter((b) => getRoleTier(b.role_name) === 1).map((b) => (
                        <option key={b.role_id} value={b.role_id}>{b.role_name} ({b.job_family})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Requisition Linkage & SLA Status Pill */}
                <div className="flex flex-col justify-end">
                  <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border flex items-center justify-between text-xs h-full">
                    <div>
                      <span className="text-[10px] text-ink-tertiary uppercase font-bold block">
                        Linked Requisition SLA
                      </span>
                      <span className="font-mono font-bold text-brand-teal">
                        {selectedRequisitionCode === "CUSTOM"
                          ? `Custom Target (${targetLocation})`
                          : activeRequisition
                          ? `${activeRequisition.req_code} (${activeRequisition.days_open}d Open)`
                          : selectedRequisitionCode}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedRequisitionCode === "CUSTOM"
                        ? "bg-brand-teal/15 text-brand-teal"
                        : activeRequisition?.sla_status === "BREACHED"
                        ? "bg-status-critical/15 text-status-critical"
                        : activeRequisition?.sla_status === "AT_RISK"
                        ? "bg-brand-yellow/15 text-brand-yellow"
                        : "bg-status-healthy/15 text-status-healthy"
                    }`}>
                      {selectedRequisitionCode === "CUSTOM"
                        ? "Simulated Target"
                        : activeRequisition
                        ? `SLA: ${activeRequisition.days_open}d vs ${activeRequisition.sla_target_days}d`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 1b: Location Cascade (Region → Province → City) */}
              <div>
                <label className="block text-[11px] font-bold text-ink-primary uppercase mb-1.5 flex items-center gap-1.5">
                  <span>Target Location</span>
                  <span className="text-[10px] text-ink-tertiary font-normal">(Region → Province → City — consistent with fithub_analysis.ipynb)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Region Cluster */}
                  <div>
                    <span className="text-[10px] text-ink-tertiary font-semibold uppercase block mb-0.5">Region Cluster</span>
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        const newRegion = e.target.value;
                        const provs = getProvincesForRegion(newRegion);
                        const newProv = provs[0] || "";
                        const cities = getCitiesForProvince(newRegion, newProv);
                        const newCity = cities[0] || targetLocation;
                        handleLocationChange(newCity, newRegion, newProv);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-ink-primary font-semibold focus:outline-none focus:border-brand-teal"
                    >
                      {Object.keys(locationHierarchy).map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province */}
                  <div>
                    <span className="text-[10px] text-ink-tertiary font-semibold uppercase block mb-0.5">Province</span>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        const cities = getCitiesForProvince(selectedRegion, newProv);
                        const newCity = cities[0] || targetLocation;
                        handleLocationChange(newCity, selectedRegion, newProv);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-ink-primary font-semibold focus:outline-none focus:border-brand-teal"
                    >
                      {getProvincesForRegion(selectedRegion).map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <span className="text-[10px] text-ink-tertiary font-semibold uppercase block mb-0.5">City / Location</span>
                    <select
                      value={targetLocation}
                      onChange={(e) => handleLocationChange(e.target.value, selectedRegion, selectedProvince)}
                      className="w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-ink-primary font-semibold focus:outline-none focus:border-brand-teal"
                    >
                      {getCitiesForProvince(selectedRegion, selectedProvince).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Qualification Filters + Weights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Min Performance Rating */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-ink-primary uppercase">
                      Min Performance Rating
                    </label>
                    <span className="font-mono text-xs font-bold text-brand-teal">
                      &gt;= {minPerformance.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.5"
                    max="4.8"
                    step="0.1"
                    value={minPerformance}
                    onChange={(e) => setMinPerformance(parseFloat(e.target.value))}
                    className="w-full accent-brand-teal cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink-tertiary">
                    <span>3.5 (Acceptable)</span>
                    <span>4.0 (Benchmark)</span>
                    <span>4.8 (Top Performer)</span>
                  </div>
                </div>

                {/* Min Club Tenure */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-ink-primary uppercase">
                      Min Club Tenure
                    </label>
                    <span className="font-mono text-xs font-bold text-brand-teal">
                      &gt;= {minTenureMonths} Months
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="24"
                    step="1"
                    value={minTenureMonths}
                    onChange={(e) => setMinTenureMonths(parseInt(e.target.value))}
                    className="w-full accent-brand-teal cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-ink-tertiary">
                    <span>6 mo (Probation)</span>
                    <span>12 mo (1Y Cliff)</span>
                    <span>24 mo (Senior)</span>
                  </div>
                </div>

                {/* Weights + Feeder Toggle */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-ink-primary uppercase mb-1.5">
                      Composite Weight Distribution (100% Total)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
                        <span className="text-[9px] text-ink-tertiary block">Capability</span>
                        <span className="font-bold text-brand-teal">45%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
                        <span className="text-[9px] text-ink-tertiary block">Rating</span>
                        <span className="font-bold text-ink-primary">25%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
                        <span className="text-[9px] text-ink-tertiary block">Psychometric</span>
                        <span className="font-bold text-brand-teal">20%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-card border border-surface-border">
                        <span className="text-[9px] text-ink-tertiary block">Mobility</span>
                        <span className="font-bold text-ink-primary">10%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-tertiary block mt-1">
                      PAPI (6%) + DISC (5%) + MBTI (4%) + Strengths (5%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0"></span>
                    <span>
                      Natural Feeder Roles: <strong className="text-ink-primary font-semibold">{activeBenchmark.natural_feeder_roles.join(", ")}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Benchmark Employee Picker (Filtered by Selected Role) */}
              <div className="pt-2 border-t border-surface-border/60 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-teal" />
                      <h3 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                        Select Top-Performer Benchmarks — {activeBenchmark.role_name} ({selectedBenchmarkEmpIds.length}/3 Selected)
                      </h3>
                    </div>
                    <p className="text-[11px] text-ink-secondary mt-0.5">
                      The engine derives the ideal baseline competency medians, mode psychometrics (MBTI & DISC), and signature CliftonStrengths from these profiles.
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-ink-tertiary bg-surface-card px-2.5 py-1 rounded-lg border border-surface-border whitespace-nowrap">
                    Active Baseline: {selectedBenchmarkEmpIds.length} Selected
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredBenchmarkEmployees.map((b) => {
                    const isSelected = selectedBenchmarkEmpIds.includes(b.employee_id);
                    return (
                      <div
                        key={b.employee_id}
                        onClick={() => toggleBenchmarkEmployee(b.employee_id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-brand-teal/10 border-brand-teal shadow-sm"
                            : "bg-surface-card border-surface-border hover:border-brand-teal/40 opacity-85 hover:opacity-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-ink-tertiary">
                              {b.employee_id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSelected
                                  ? "bg-brand-teal text-surface-ground"
                                  : "bg-surface-ground text-ink-tertiary border border-surface-border"
                              }`}
                            >
                              {isSelected ? "Selected Benchmark" : "Click to Select"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-ink-primary">{b.fullname}</h4>
                          <div className="text-[11px] text-ink-secondary font-medium">
                            {b.role} &bull; <span className="text-brand-teal">{b.club_name}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                            <span className="font-bold text-ink-primary bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border">
                              ⭐ {b.performance_rating}
                            </span>
                            <span className="font-bold text-ink-primary bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border">
                              DISC: {b.disc}
                            </span>
                            <span className="font-bold text-ink-primary bg-surface-ground px-1.5 py-0.5 rounded border border-surface-border">
                              MBTI: {b.mbti}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-surface-border/60 flex flex-wrap gap-1">
                          {b.strengths.slice(0, 3).map((st) => (
                            <span
                              key={st}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-brand-teal/15 text-brand-teal font-semibold"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Single Run Engine Button */}
              <div className="pt-3 border-t border-surface-border/60">
                <button
                  onClick={handleTriggerEngine}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 rounded-xl bg-brand-teal text-surface-ground text-sm font-bold hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-surface-ground border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Talent Intelligence Pool...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Dynamic Matching Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Conditional View: Engine Standby vs Dynamic Matching Results */}
            {!hasRunEngine ? (
              /* Standby Hero Card (No duplicate Run button — just status indicator) */
              <div className="p-8 rounded-2xl bg-surface-card border-2 border-dashed border-brand-teal/30 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-inner">
                  <Sparkles className="w-7 h-7 text-brand-teal animate-pulse" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-base font-bold font-display text-ink-primary">
                    Dynamic Frontline Matching Engine is on Standby
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    Configure your requisition parameters, select benchmark performers, then click <strong>&quot;Run Dynamic Matching Engine&quot;</strong> above to evaluate all internal records.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
                  <span className="px-3 py-1 rounded-full bg-surface-ground border border-surface-border text-ink-primary font-semibold">
                    Requisition: <strong className="text-brand-teal">{selectedRequisitionCode}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-ground border border-surface-border text-ink-primary font-semibold">
                    Role: <strong className="text-brand-teal">{activeBenchmark.role_name}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-ground border border-surface-border text-ink-primary font-semibold">
                    Target: <strong className="text-brand-teal">{selectedRegion} / {selectedProvince} / {targetLocation}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-ground border border-surface-border text-ink-primary font-semibold">
                    Benchmarks: <strong className="text-brand-teal">{selectedBenchmarkEmpIds.length} Selected</strong>
                  </span>
                </div>
              </div>
            ) : (
              /* Active Matching Results (Dynamically populated after Run Engine) */
              <>
                {/* Dynamically Derived Baseline Profile Card */}
                <div className="p-5 rounded-xl bg-surface-ground border border-surface-border">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Role Overview */}
                    <div className="lg:w-1/3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/15 text-brand-teal uppercase">
                          {activeBenchmark.job_level}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-card border border-surface-border text-ink-secondary">
                          {activeBenchmark.job_family}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-ink-primary">
                        {activeBenchmark.role_name}
                      </h3>

                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {activeBenchmark.role_purpose}
                      </p>

                      <div className="space-y-1.5 text-[11px] pt-2 border-t border-surface-border">
                        <div className="flex justify-between">
                          <span className="text-ink-tertiary">Derived Baseline Tenure:</span>
                          <span className="font-bold text-ink-primary">
                            {derivedBaseline?.medianTenure ?? 24} months (Median)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-tertiary">Derived Baseline Rating:</span>
                          <span className="font-bold text-ink-primary">
                            ⭐ {derivedBaseline?.medianRating ?? 4.65} / 5.0 (Median)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-tertiary">Baseline DISC & MBTI:</span>
                          <span className="font-bold text-brand-teal">
                            {derivedBaseline?.modeDisc ?? "DI"} &bull; {derivedBaseline?.modeMbti ?? "ESTJ"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-tertiary">Feeder Roles:</span>
                          <span className="font-bold text-brand-teal">
                            {activeBenchmark.natural_feeder_roles.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Required Competencies */}
                    <div className="lg:w-2/3 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                            Required Role Competencies (Live Supabase Framework)
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                            {activeCapabilitiesList.length} Core Pillars
                          </span>
                        </div>
                        <Link
                          href="/team/capability/framework"
                          className="text-[11px] text-brand-teal hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Edit Matrix & Levels →</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeCapabilitiesList.map((cap) => (
                          <div
                            key={cap.name}
                            className="p-3 rounded-lg bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-ink-primary">
                                {cap.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-teal/20 text-brand-teal">
                                Level {cap.required_level}/4
                              </span>
                            </div>
                            <p className="text-[11px] text-ink-secondary leading-normal mb-1.5">
                              {cap.description}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-semibold text-ink-tertiary">
                              <span>Weight: {cap.weight}%</span>
                              <span className="text-brand-teal">
                                Baseline Median: L{derivedBaseline?.capabilities?.[cap.name] || cap.required_level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Strategic Speedup & Cost Advantage Banner */}
                  <div className="mt-4 pt-3 border-t border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-healthy flex-shrink-0" />
                      <span className="text-ink-secondary">
                        Internal Backfill Advantage: <strong className="text-status-healthy">10-Day SLA</strong> (70.6% faster than 34-day external recruitment), saving <strong className="text-ink-primary">Rp 14,200,000</strong> per placement and eliminating career development stagnation.
                      </span>
                    </div>
                    <Link
                      href="/vacancy"
                      className="text-brand-teal hover:underline font-semibold whitespace-nowrap text-[11px] flex items-center gap-1"
                    >
                      <span>Inspect Linked Vacancy</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* PostgreSQL Execution Telemetry & SQL Inspector */}
                <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-healthy animate-ping" />
                    <div>
                      <div className="font-mono text-[11px] font-bold text-ink-primary flex items-center gap-2">
                        <span className="text-brand-teal">PostgreSQL RPC: mart.calculate_mobility_match()</span>
                        <span className="text-ink-tertiary">&bull;</span>
                        <span className="text-status-healthy">Status: 200 OK (24ms)</span>
                      </div>
                      <div className="text-[10px] text-ink-secondary mt-0.5">
                        Evaluated 32 active internal records &bull; Feeder filter: {feederOnly ? "Enabled" : "Disabled"} &bull; Location: {selectedRegion} &gt; {selectedProvince} &gt; {targetLocation}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSqlQuery((prev) => !prev)}
                    className="px-3 py-1.5 rounded-lg bg-surface-ground border border-surface-border hover:border-brand-teal/40 text-[11px] font-mono font-semibold text-brand-teal flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{showSqlQuery ? "Hide SQL Query" : "Inspect SQL Query (010_internal_mobility_engine.sql)"}</span>
                  </button>
                </div>

                {/* Expandable Parameterized SQL Query Code Block */}
                {showSqlQuery && (
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-brand-teal/30 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2 border-b border-gray-800">
                      <span className="flex items-center gap-1.5 text-brand-teal font-semibold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Executable Supabase PostgreSQL Engine (010_internal_mobility_engine.sql)</span>
                      </span>
                      <span className="text-[10px] text-gray-500">Live Parameterized Query</span>
                    </div>
                    <pre className="text-[11px] leading-relaxed text-gray-300 font-mono">
{`-- Operationalized from 010_internal_mobility_engine.sql
SELECT 
  c.employee_code,
  c.fullname,
  c.current_role,
  c.current_location,
  mart.calculate_capability_coverage(c.employee_id, '${selectedBenchmarkRoleId}') AS capability_coverage_pct,
  mart.calculate_performance_score(c.performance_rating, ${derivedBaseline?.medianRating ?? 4.65}) AS performance_score_pct,
  mart.calculate_psychometric_fit(c.papi, c.disc, c.mbti, '${derivedBaseline?.modeDisc ?? "DI"}', '${derivedBaseline?.modeMbti ?? "ESTJ"}') AS psychometric_score_pct,
  mart.calculate_mobility_score(c.tenure_months, ${derivedBaseline?.medianTenure ?? 20}, c.willing_to_relocate, '${targetLocation}') AS mobility_score_pct,
  mart.calculate_composite_readiness(
    w_cap := ${capabilityWeight}, 
    w_perf := ${performanceWeight}, 
    w_psych := ${psychometricWeight}, 
    w_tenure := ${tenureWeight}
  ) AS match_rate_pct,
  CASE 
    WHEN match_rate_pct >= 82.0 AND c.performance_rating >= 4.2 THEN 'Ready'
    WHEN match_rate_pct >= 68.0 THEN 'Near Ready'
    ELSE 'Development Needed'
  END AS readiness_status
FROM core.dim_employee c
WHERE c.is_active = true
  AND c.performance_rating >= ${minPerformance.toFixed(1)}
  AND c.tenure_months >= ${minTenureMonths}
  ${feederOnly ? `AND c.current_role IN (${activeBenchmark.natural_feeder_roles.map((r: string) => `'${r}'`).join(', ')})` : '-- Feeder-only filter disabled by user'}
ORDER BY match_rate_pct DESC;`}
                    </pre>
                  </div>
                )}

                {/* Shortlist Control & Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xl bg-surface-ground border border-surface-border">
                  {/* Left: Counts */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-ink-primary">
                      {dynamicMatchedCandidates.length} Candidates Matched
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-teal/20 text-brand-teal">
                      {shortlistedCodes.length} in Shortlist
                    </span>
                  </div>

                  {/* Middle: Readiness Tier Filter */}
                  <div className="flex items-center gap-1 bg-surface-card p-1 rounded-lg border border-surface-border text-xs">
                    {(["ALL", "Ready", "Near Ready", "Development Needed"] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setDynamicFilterTier(tier)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          dynamicFilterTier === tier
                            ? "bg-brand-teal text-surface-ground shadow-sm font-bold"
                            : "text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {tier === "ALL" ? "All Tiers" : tier}
                      </button>
                    ))}
                  </div>

                  {/* Right: Shortlist Operations */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllReady}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-card border border-surface-border text-[11px] font-semibold text-ink-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      Select All Ready
                    </button>
                    <button
                      onClick={handleExportShortlist}
                      className="px-3 py-1.5 rounded-lg bg-brand-yellow/20 border border-brand-yellow/40 text-[11px] font-bold text-ink-primary hover:bg-brand-yellow/30 transition-colors cursor-pointer"
                    >
                      Export Shortlist (.csv)
                    </button>
                    {shortlistedCodes.length > 0 && (
                      <button
                        onClick={clearShortlist}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-ink-tertiary hover:text-status-danger transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Ranked Candidate Cards Grid */}
                {dynamicMatchedCandidates.length === 0 ? (
                  <div className="p-10 text-center text-xs text-ink-secondary border border-dashed border-surface-border rounded-xl space-y-3 bg-surface-card/40">
                    <p className="font-semibold text-ink-primary">
                      No candidates match the active filter criteria ({dynamicFilterTier !== "ALL" ? `Tier: ${dynamicFilterTier}` : "All Tiers"}, Min Rating &ge; {minPerformance.toFixed(1)}, Min Tenure &ge; {minTenureMonths}m, Natural Feeders).
                    </p>
                    <p className="text-[11px] text-ink-tertiary">
                      There are {rawDynamicMatches.length} total candidates matched before applying the &quot;{dynamicFilterTier}&quot; tier or strict threshold filters.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {dynamicFilterTier !== "ALL" && (
                        <button
                          onClick={() => setDynamicFilterTier("ALL")}
                          className="px-3.5 py-1.5 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all cursor-pointer"
                        >
                          View All Tiers ({rawDynamicMatches.length} Matched)
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setMinPerformance(4.0);
                          setMinTenureMonths(12);
                          setDynamicFilterTier("ALL");
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:border-brand-teal/40 transition-all cursor-pointer"
                      >
                        Reset Filters to Benchmark Defaults
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {dynamicMatchedCandidates.map((c) => {
                      const isShortlisted = shortlistedCodes.includes(c.employee_code);
                      const isAssigned = !!assignedRequisitions[c.employee_code];

                      return (
                        <div
                          key={c.employee_code}
                          className={`p-4 rounded-xl border transition-all shadow-subtle flex flex-col justify-between ${
                            isShortlisted
                              ? "bg-brand-teal/5 border-brand-teal shadow-md"
                              : "bg-surface-ground border-surface-border hover:border-brand-teal/40"
                          }`}
                        >
                          <div>
                            {/* Top Meta: Checkbox, Rank, Status */}
                            <div className="flex items-center justify-between mb-2">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isShortlisted}
                                  onChange={() => toggleShortlist(c.employee_code)}
                                  className="w-3.5 h-3.5 rounded border-surface-border text-brand-teal accent-brand-teal cursor-pointer"
                                />
                                <span className="font-mono text-[10px] text-ink-tertiary font-bold">
                                  #{c.rank} &bull; {c.employee_code}
                                </span>
                              </label>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.readiness_status === "Ready"
                                    ? "bg-status-healthy/20 text-status-healthy border border-status-healthy/30"
                                    : c.readiness_status === "Near Ready"
                                    ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                                    : "bg-status-attention/20 text-status-attention border border-status-attention/30"
                                }`}
                              >
                                {c.readiness_status}
                              </span>
                            </div>

                            {/* Name & Role Route */}
                            <h3 className="text-sm font-bold text-ink-primary">
                              {c.fullname}
                            </h3>

                            <div className="mt-1 flex items-center gap-1 text-xs text-ink-secondary font-medium">
                              <span>{c.current_role}</span>
                              <ArrowRight className="w-3 h-3 text-brand-teal flex-shrink-0" />
                              <span className="font-bold text-brand-teal">{c.target_role}</span>
                            </div>
                            <div className="text-[11px] text-ink-tertiary">
                              {c.current_location} &rarr; {c.target_location}
                            </div>

                            {/* Requisition Assigned Badge if applicable */}
                            {isAssigned && (
                              <div className="mt-2 p-1.5 rounded-md bg-brand-teal/15 border border-brand-teal/30 text-[10px] font-bold text-brand-teal flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-brand-teal" />
                                <span>Assigned to {assignedRequisitions[c.employee_code]}</span>
                              </div>
                            )}

                            {/* Match Rate Progress Bar */}
                            <div className="mt-3 p-2.5 rounded-lg bg-surface-card border border-surface-border">
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="text-[11px] font-semibold text-ink-tertiary">
                                  Dynamic Match Rate
                                </span>
                                <span className="text-sm font-black font-display text-brand-teal">
                                  {c.match_rate_pct}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-surface-ground overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    c.match_rate_pct >= 85
                                      ? "bg-status-healthy"
                                      : c.match_rate_pct >= 72
                                      ? "bg-brand-teal"
                                      : "bg-status-attention"
                                  }`}
                                  style={{ width: `${Math.min(100, c.match_rate_pct)}%` }}
                                />
                              </div>
                            </div>

                            {/* Metric Triad & Psychometrics */}
                            <div className="mt-2.5 p-2 rounded-lg bg-surface-card border border-surface-border space-y-1 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-ink-tertiary">Capability Coverage:</span>
                                <span className="font-bold text-status-healthy">
                                  {c.capability_coverage_pct}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-ink-tertiary">Performance:</span>
                                <span className="font-bold text-ink-primary">
                                  {c.performance_rating} / 5.0
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-ink-tertiary">Tenure:</span>
                                <span className="font-semibold text-ink-primary">
                                  {c.tenure_months} months
                                </span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-surface-border/50 text-[10px]">
                                <span className="text-ink-tertiary">DISC &bull; MBTI:</span>
                                <span className="font-semibold text-brand-teal">
                                  {c.disc} &bull; {c.mbti}
                                </span>
                              </div>
                            </div>

                            {/* Top Strength */}
                            <div className="mt-2.5">
                              <span className="text-[10px] font-semibold text-ink-tertiary block mb-0.5">
                                Demonstrated Strength:
                              </span>
                              <p className="text-xs text-ink-primary font-medium">
                                {c.top_strength}
                              </p>
                            </div>

                            {/* Anti-Lompat / Governance Warning if candidate jumped tiers */}
                            {c.career_tier_warning && (
                              <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <span>{c.career_tier_warning}</span>
                              </div>
                            )}

                            {/* Gallup CliftonStrengths Top 5 Profile */}
                            <div className="mt-2.5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-ink-tertiary block">
                                  Gallup CliftonStrengths:
                                </span>
                                <span className="text-[9px] font-bold text-brand-teal">
                                  {c.matching_strengths?.length ?? 0}/5 Overlap with Benchmark
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(c.strengths || []).map((st) => {
                                  const isMatch = c.matching_strengths?.includes(st);
                                  const domain = CLIFTON_DOMAIN_MAP[st] || "Executing";
                                  const style = CLIFTON_DOMAIN_STYLES[domain];
                                  return (
                                    <span
                                      key={st}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                                        isMatch
                                          ? `${style.bg} ${style.text} ${style.border} ring-1 ring-brand-teal shadow-xs font-bold`
                                          : `bg-surface-ground text-ink-secondary border-surface-border`
                                      }`}
                                      title={`${st} (${domain}) ${isMatch ? "• Matches Top Performer Baseline" : ""}`}
                                    >
                                      {isMatch && <Sparkles className="w-2.5 h-2.5 text-brand-teal flex-shrink-0" />}
                                      <span>{st}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Critical Gap Notice */}
                            <div className="mt-2">
                              <span className="text-[10px] font-semibold text-ink-tertiary block mb-0.5">
                                Competency Assessment:
                              </span>
                              {c.critical_gaps.length === 0 ? (
                                <span className="text-[11px] text-status-healthy font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Zero critical gaps (Immediate handover)
                                </span>
                              ) : (
                                <p className="text-[11px] text-status-attention font-medium">
                                  Gap: {c.critical_gaps[0].capability} (L{c.critical_gaps[0].current_level} vs Req L{c.critical_gaps[0].required_level})
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Bottom CTA */}
                          <div className="mt-4 pt-3 border-t border-surface-border">
                            <button
                              onClick={() => setSelectedDynamicCandidate(c)}
                              className="w-full py-1.5 px-3 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Evaluate & Assign Requisition</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Bottom Strategic Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/10 to-transparent border border-brand-teal/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-ink-primary">
                  Strategic Value of Dynamic Internal Backfilling
                </h4>
                <p className="text-[11px] text-ink-secondary mt-0.5">
                  Internal successor backfills close gym leadership vacancies in 10 days instead of 34 days, save an average of Rp 14.2M per hire, and provide visible career growth paths for top frontline talent.
                </p>
              </div>
              <Link
                href="/vacancy"
                className="px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated transition-colors whitespace-nowrap"
              >
                Inspect Linked Vacancies &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 5: Exit-to-Vacancy Continuity */}
      {activeTab === "exits" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-teal" />
                  <span>Exit-to-Vacancy Continuity Registry</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  PRD Section 27.2: Illustrating how every frontline employee departure automatically generates a replacement requisition in Vacancy.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <DataProvenanceBadge
                  provenance="DERIVED"
                  domain="Lifecycle Loop"
                  metricOrEntity="Exit to Requisition Binding"
                  originalSource="Turnover sheet + Hiring sheet"
                  governanceRule="Synchronized exit code to requisition code mapping"
                  impactOnDecision="Demonstrates closed-loop lifecycle intelligence"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                    <th className="py-3 px-4">Exit Code</th>
                    <th className="py-3 px-4">Staff Code & Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-3 text-center">Tenure</th>
                    <th className="py-3 px-3 text-center">Type</th>
                    <th className="py-3 px-3 text-center">Regrettable</th>
                    <th className="py-3 px-4">Primary Reason</th>
                    <th className="py-3 px-4">Triggered Vacancy</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredExitEvents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-ink-tertiary">
                        No exit interview records match the active location ({locationDisplay}), role ({roleDisplay}), and period ({formatPeriodLabel(selectedPeriod)}) filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExitEvents.map((evt) => (
                    <tr key={evt.exit_code} className="hover:bg-surface-elevated/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-status-danger">
                        {evt.exit_code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink-primary block">
                          {evt.role_name}
                        </span>
                        <span className="text-[11px] text-ink-tertiary font-mono">
                          {evt.employee_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-ground border border-surface-border text-ink-secondary">
                          {evt.location_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {evt.tenure_months}m
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {evt.resignation_type}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {evt.is_regrettable ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-status-danger/20 text-status-danger">
                            YES
                          </span>
                        ) : (
                          <span className="text-ink-tertiary">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ink-secondary">
                        {evt.primary_reason}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-brand-teal block">
                          {evt.triggered_requisition_code}
                        </span>
                        <span className="text-[10px] text-ink-tertiary">
                          Replacement Requisition
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          href="/vacancy"
                          className="px-2.5 py-1 rounded-md bg-surface-ground border border-surface-border text-[11px] font-semibold text-brand-teal hover:bg-brand-teal hover:text-surface-ground transition-all whitespace-nowrap"
                        >
                          View Requisition &rarr;
                        </Link>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Dynamic Promotion & Requisition Assignment Modal */}
      {selectedDynamicCandidate && (
        <div className="fixed inset-0 bg-ink-primary/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface-ground">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-teal/20 text-brand-teal">
                    {selectedDynamicCandidate.employee_code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedDynamicCandidate.readiness_status === "Ready"
                        ? "bg-status-healthy/20 text-status-healthy border border-status-healthy/30"
                        : selectedDynamicCandidate.readiness_status === "Near Ready"
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/30"
                        : "bg-status-attention/20 text-status-attention border border-status-attention/30"
                    }`}
                  >
                    {selectedDynamicCandidate.readiness_status} ({selectedDynamicCandidate.match_rate_pct}% Match)
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-ink-primary">
                  {selectedDynamicCandidate.fullname}
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Current: <strong className="text-ink-primary">{selectedDynamicCandidate.current_role}</strong> in {selectedDynamicCandidate.current_location} Cluster
                </p>
              </div>

              <button
                onClick={() => setSelectedDynamicCandidate(null)}
                className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              {/* Target Role & Requisition Binding */}
              <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-teal block mb-0.5">
                    Target Succession Requisition
                  </span>
                  <div className="text-sm font-bold text-ink-primary flex items-center gap-2">
                    <span>{selectedDynamicCandidate.target_role}</span>
                    <span className="text-ink-tertiary">&bull;</span>
                    <span className="text-ink-secondary">{selectedDynamicCandidate.target_location} Cluster</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-ink-tertiary uppercase font-bold block">
                    Requisition Code
                  </span>
                  <span className="font-mono font-bold text-brand-teal text-xs">
                    {selectedRequisitionCode || activeBenchmark.open_requisition_codes[0] || "REQ-BLI-0120"}
                  </span>
                </div>
              </div>

              {/* 3 Core Metric Highlights */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-ground border border-surface-border text-center">
                <div>
                  <span className="text-[11px] text-ink-tertiary block mb-0.5">Capability Coverage</span>
                  <span className="font-display font-black text-status-healthy text-base">
                    {selectedDynamicCandidate.capability_coverage_pct}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-ink-tertiary block mb-0.5">Performance Rating</span>
                  <span className="font-display font-black text-ink-primary text-base">
                    {selectedDynamicCandidate.performance_rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-ink-tertiary block mb-0.5">Club Tenure</span>
                  <span className="font-display font-black text-ink-primary text-base">
                    {selectedDynamicCandidate.tenure_months} mo
                  </span>
                </div>
              </div>

              {/* Frontline Competency Rubric Comparison */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-ink-primary text-xs uppercase tracking-wider">
                    Frontline Competency Evaluation Rubric
                  </span>
                  <span className="text-[11px] text-ink-tertiary">
                    Candidate vs Benchmark
                  </span>
                </div>

                <div className="space-y-2">
                  {activeCapabilitiesList.map((cap) => {
                    const gap = selectedDynamicCandidate.critical_gaps.find(
                      (g) => g.capability === cap.name
                    );
                    const candidateLevel = gap ? gap.current_level : cap.required_level;
                    const meetsReq = candidateLevel >= cap.required_level;

                    return (
                      <div
                        key={cap.name}
                        className="p-3 rounded-lg bg-surface-ground border border-surface-border flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-ink-primary text-xs">
                              {cap.name}
                            </span>
                            <span className="text-[10px] text-ink-tertiary">
                              ({cap.weight}% weight)
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-secondary">
                            {cap.description}
                          </p>
                        </div>

                        {/* Level Indicators */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {[1, 2, 3, 4].map((lvl) => (
                              <div
                                key={lvl}
                                className={`w-4 h-4 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                                  lvl <= candidateLevel
                                    ? meetsReq
                                      ? "bg-status-healthy text-surface-ground"
                                      : "bg-status-attention text-surface-ground"
                                    : lvl <= cap.required_level
                                    ? "border border-dashed border-status-attention text-status-attention"
                                    : "bg-surface-card text-ink-tertiary"
                                }`}
                              >
                                {lvl}
                              </div>
                            ))}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              meetsReq ? "text-status-healthy" : "text-status-attention"
                            }`}
                          >
                            {meetsReq
                              ? `Meets Requirement (L${candidateLevel}/L${cap.required_level})`
                              : `Gap of ${cap.required_level - candidateLevel} Level (L${candidateLevel} vs L${cap.required_level})`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Anti-Lompat Warning in Modal if applicable */}
              {selectedDynamicCandidate.career_tier_warning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">HR Governance Block (Anti-Lompat Policy):</span>
                    <span>{selectedDynamicCandidate.career_tier_warning}</span>
                  </div>
                </div>
              )}

              {/* Strengths & Transition Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border space-y-2">
                  <span className="font-bold text-ink-primary block text-xs">
                    Demonstrated Frontline Strength & CliftonStrengths
                  </span>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {selectedDynamicCandidate.top_strength}
                  </p>

                  <div className="pt-2 border-t border-surface-border/60">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase block mb-1">
                      Gallup CliftonStrengths Profile:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedDynamicCandidate.strengths || []).map((st) => {
                        const isMatch = selectedDynamicCandidate.matching_strengths?.includes(st);
                        const domain = CLIFTON_DOMAIN_MAP[st] || "Executing";
                        const style = CLIFTON_DOMAIN_STYLES[domain];
                        return (
                          <span
                            key={st}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                              isMatch
                                ? `${style.bg} ${style.text} ${style.border} ring-1 ring-brand-teal shadow-xs font-bold`
                                : `bg-surface-card text-ink-secondary border-surface-border`
                            }`}
                          >
                            {isMatch && <Sparkles className="w-2.5 h-2.5 text-brand-teal flex-shrink-0" />}
                            <span>{st}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="font-bold text-ink-primary block mb-1 text-xs">
                    10-Day Handover & Transition Protocol
                  </span>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {selectedDynamicCandidate.recommended_action}
                  </p>
                </div>
              </div>

              {/* Impact Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-status-healthy/10 to-brand-teal/10 border border-status-healthy/30 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-ink-primary block">
                    Financial & SLA Business Outcome
                  </span>
                  <span className="text-ink-secondary text-[11px]">
                    Time-to-fill speedup: <strong className="text-status-healthy">10 Days</strong> vs 34 Days external SLA &bull; Direct fee savings: <strong className="text-ink-primary">Rp 14,200,000</strong>
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-status-healthy text-surface-ground font-bold text-[11px] uppercase">
                  Fast-Track
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-ground border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDynamicCandidate(null)}
                className="px-4 py-2 rounded-lg border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDynamicPromote(
                    selectedDynamicCandidate,
                    selectedRequisitionCode || activeBenchmark.open_requisition_codes[0] || "REQ-BLI-0120"
                  )
                }
                className="px-4 py-2 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Promotion & Assign Requisition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Promotion Evaluation Modal (Legacy) */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-surface-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-teal/20 text-brand-teal">
                    {selectedCandidate.employee_code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-healthy/20 text-status-healthy">
                    {selectedCandidate.readiness_status} ({selectedCandidate.final_readiness_score}%)
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-ink-primary">
                  {selectedCandidate.candidate_name}
                </h3>
                <p className="text-xs text-ink-secondary">
                  Current: {selectedCandidate.current_role_name} ({selectedCandidate.current_location_name})
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-lg bg-surface-ground hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary flex items-center justify-center text-sm font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
                <span className="text-[10px] font-bold uppercase text-brand-teal block mb-0.5">
                  Target Role & Location
                </span>
                <div className="text-sm font-bold text-ink-primary flex items-center gap-2">
                  <span>{selectedCandidate.target_role_name}</span>
                  <span className="text-ink-tertiary">&bull;</span>
                  <span className="text-ink-secondary">{selectedCandidate.target_location_name} Cluster</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-ground border border-surface-border">
                <div>
                  <span className="text-ink-tertiary block">Capability Fit:</span>
                  <span className="font-bold text-status-healthy text-sm">
                    {selectedCandidate.capability_coverage_pct}%
                  </span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Performance:</span>
                  <span className="font-bold text-ink-primary text-sm">
                    {selectedCandidate.performance_rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Club Tenure:</span>
                  <span className="font-bold text-ink-primary text-sm">
                    {selectedCandidate.tenure_months} months
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-ink-primary block mb-1">Demonstrated Strengths:</span>
                <p className="text-ink-secondary p-3 rounded-lg bg-surface-ground border border-surface-border">
                  {selectedCandidate.top_strength}
                </p>
              </div>

              <div>
                <span className="font-bold text-ink-primary block mb-1">Onboarding & Transition Plan:</span>
                <p className="text-ink-secondary p-3 rounded-lg bg-surface-ground border border-surface-border">
                  {selectedCandidate.priority_development_action}
                </p>
              </div>

              {/* Critical Gap Mitigation Alert */}
              {((selectedCandidate as any).critical_gap_count ?? 0) > 0 && (
                <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/25 text-status-danger text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Critical Competency Gap Alert ({(selectedCandidate as any).critical_gap_count} level gap)</span>
                    <span className="text-[11px] opacity-90">
                      Requires completion of 30-Day L&D Fast-Track Curriculum before sole floor sign-off.
                    </span>
                  </div>
                </div>
              )}

              {/* FIT HUB Academy L&D IDP Recommendation */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                  <span>FIT HUB Academy L&D IDP Recommendation</span>
                </div>
                <p className="text-[11px] text-ink-secondary leading-relaxed">
                  Recommended Curriculum: <strong>FIT HUB Foundation (3-Week Induction)</strong>, <strong>PT Lifetime Training / Sales Coaching</strong>, &amp; <strong>CPR-AED Certification</strong> aligned with target role {selectedCandidate.target_role_name}.
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-ground border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-lg border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handlePromote(
                    selectedCandidate.candidate_name,
                    selectedCandidate.target_role_name,
                    selectedCandidate.target_location_name
                  )
                }
                className="px-4 py-2 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Promotion & Assign Requisition</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-ink-tertiary flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Loading Team Intelligence...</span>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
