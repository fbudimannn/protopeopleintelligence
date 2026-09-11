"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
} from "@/lib/data/fixtures";
import { KpiCard, SectionCard, LifecycleStrip, Chip } from "@/components/primitives";
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
} from "@/lib/data/mobilityEngine";
import {
  Users,
  GitBranch,
  TrendingDown,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
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
} from "lucide-react";

type TeamTab = "overview" | "cliff" | "engagement" | "mobility" | "exits";

function TeamContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TeamTab) || "overview";

  const [activeTab, setActiveTab] = useState<TeamTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [cohorts, setCohorts] = useState<RetentionCohort[]>([]);
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [mobilityMatches, setMobilityMatches] = useState<InternalMobilityMatch[]>([]);
  const [exitEvents, setExitEvents] = useState<ExitEvent[]>([]);
  const [tenureBands, setTenureBands] = useState<TenureBand[]>([]);
  const [voiceThemes, setVoiceThemes] = useState<VoiceTheme[]>([]);

  // Global & Local page filters
  const {
    clusterFilter,
    provinceFilter,
    cityFilter,
    locationFilter,
    jobFamilyFilter,
    roleFilter,
    period: selectedPeriod,
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
  const [riskFilter, setRiskFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
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
  const [feederOnly, setFeederOnly] = useState<boolean>(true);
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

  const handleTabChange = (tab: TeamTab) => {
    setActiveTab(tab);
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
      const [cohortRes, engRes, mobRes, exitRes, bandRes, voiceRes, reqRes] = await Promise.all([
        getRetentionCohorts(),
        getEngagementSummaries(),
        getInternalMobilityMatches(),
        getExitEvents(),
        getTenureBands(),
        getVoiceThemes(),
        getMartRequisitions(),
      ]);

      setCohorts(cohortRes.data);
      setEngagements(engRes.data);
      setMobilityMatches(mobRes.data);
      setExitEvents(exitRes.data);
      setTenureBands(bandRes.data);
      setVoiceThemes(voiceRes.data);
      setOpenRequisitions(reqRes.data);
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
      if (riskFilter !== "ALL" && c.risk_level !== riskFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          c.role_name.toLowerCase().includes(q) ||
          c.location_name.toLowerCase().includes(q) ||
          c.primary_exit_driver.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cohorts, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod, riskFilter, searchQuery]);

  // Filtered Exit Events based on active Location, Role, and Date
  const filteredExitEvents = useMemo(() => {
    return exitEvents.filter((evt) => {
      const locMatch = matchLocationHierarchy(evt.location_name, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(evt.role_name, jobFamilyFilter, roleFilter);
      const periodMatch = matchPeriod(evt.exit_date, selectedPeriod, evt.exit_code);
      return locMatch && roleMatch && periodMatch;
    });
  }, [exitEvents, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod]);

  // Dynamic Tenure Bands computed directly from filtered exit events
  const dynamicTenureBands = useMemo(() => {
    if (filteredExitEvents.length === 0) return tenureBands;

    const b1 = filteredExitEvents.filter((e) => e.tenure_months <= 3).length;
    const b2 = filteredExitEvents.filter((e) => e.tenure_months > 3 && e.tenure_months <= 6).length;
    const b3 = filteredExitEvents.filter((e) => e.tenure_months > 6 && e.tenure_months <= 12).length;
    const b4 = filteredExitEvents.filter((e) => e.tenure_months > 12 && e.tenure_months <= 18).length;
    const b5 = filteredExitEvents.filter((e) => e.tenure_months > 18).length;
    const total = filteredExitEvents.length;

    const counts = [b1, b2, b3, b4, b5];
    let cumulative = 0;
    return tenureBands.map((band, idx) => {
      const count = counts[idx] ?? band.exit_count;
      const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : band.pct_of_exits;
      cumulative += pct;
      return {
        ...band,
        exit_count: count,
        pct_of_exits: pct,
        cumulative_pct: Math.min(100, Math.round(cumulative * 10) / 10),
      };
    });
  }, [tenureBands, filteredExitEvents]);

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

  // Dynamic Team KPIs based on active location & role filters
  const teamKpis = useMemo(() => {
    const isFiltered =
      clusterFilter !== "ALL" ||
      provinceFilter !== "ALL" ||
      cityFilter !== "ALL" ||
      jobFamilyFilter !== "ALL" ||
      roleFilter !== "ALL" ||
      selectedPeriod !== "ALL_TIME";

    const headcount = isFiltered
      ? Math.max(14, Math.round(filteredCohorts.reduce((acc, c) => acc + c.headcount, 0) * 0.8))
      : 408;

    const turnover = filteredCohorts.length > 0
      ? filteredCohorts.reduce((acc, c) => acc + c.annualized_turnover_pct, 0) / filteredCohorts.length
      : 44.8;

    const earlyAttrition = filteredCohorts.length > 0
      ? filteredCohorts.reduce((acc, c) => acc + c.early_attrition_pct, 0) / filteredCohorts.length
      : 57.4;

    return {
      headcount,
      turnover: Math.round(turnover * 10) / 10,
      earlyAttrition: Math.round(earlyAttrition * 10) / 10,
      isFiltered,
    };
  }, [filteredCohorts, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod]);

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

  // Active Target Benchmark for Dynamic Mobility Engine
  const activeBenchmark = useMemo(() => {
    return (
      targetRoleBenchmarks.find((b) => b.role_id === selectedBenchmarkRoleId) ||
      targetRoleBenchmarks[0]
    );
  }, [selectedBenchmarkRoleId]);

  // Filter for Lead-Level Open Requisitions Only (ACM, Club Manager, Fitness Lead, Sales Lead, Team Leaders)
  const leadOpenRequisitions = useMemo(() => {
    const isLeadRole = (role: string) => {
      const r = role.toLowerCase();
      return (
        r.includes("lead") ||
        r.includes("manager") ||
        r.includes("supervisor") ||
        r.includes("head") ||
        r.includes("acm")
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

    const matchedLeads = allLeads.filter((r) => {
      const loc = r.location_name || (r as any).location || "";
      const locMatch = matchLocationHierarchy(loc, clusterFilter, provinceFilter, cityFilter);
      return locMatch;
    });

    return matchedLeads.length > 0 ? matchedLeads : allLeads;
  }, [openRequisitions, clusterFilter, provinceFilter, cityFilter]);

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
        if (rName.includes("assistant") || rName.includes("acm")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-acm");
        } else if (rName.includes("pt") && rName.includes("leader")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-pt-lead");
        } else if (rName.includes("fc") && rName.includes("leader")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-fc-lead");
        } else if (rName.includes("fitness") && rName.includes("lead")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-fit-lead");
        } else if (rName.includes("sales") && rName.includes("lead")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-sales-lead");
        } else if (rName.includes("club manager") || rName.includes("gm")) {
          matchedBenchmark = targetRoleBenchmarks.find((b) => b.role_id === "role-club-gm");
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

      {/* 2. Executive KPI Row (6 Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Headcount */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Tracked Headcount</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {teamKpis.headcount}
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">
              {teamKpis.isFiltered ? selectedLocation : "13 Clubs"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Active Frontline</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Headcount"
              metricOrEntity="Club Employees"
              originalSource="Turnover sheet"
              governanceRule="Empirical club baseline"
              impactOnDecision="Operational baseline"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 2: Annualized Turnover */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Annualized Turnover</span>
            <TrendingDown className="w-4 h-4 text-status-danger" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              {teamKpis.turnover}%
            </span>
            {teamKpis.isFiltered ? (
              <span className="text-[11px] font-semibold text-brand-teal">vs Nat. 44.8%</span>
            ) : (
              <span className="text-[11px] font-semibold text-status-danger">Bali: 62.5%</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Voluntary Rate</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover"
              metricOrEntity="Annualized Exits"
              originalSource="Turnover sheet"
              governanceRule="Empirical calculation"
              impactOnDecision="Identifies hotspot clubs"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 3: Early Attrition (<12M) */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Early Attrition</span>
            <AlertTriangle className="w-4 h-4 text-status-attention" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-attention">
              {teamKpis.earlyAttrition}%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">
              {teamKpis.isFiltered ? `< 12M (${selectedLocation})` : "< 12 Months"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Onboarding Cliff</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Tenure"
              metricOrEntity="First-Year Exits"
              originalSource="Turnover sheet"
              governanceRule="Empirical tenure cutoff"
              impactOnDecision="Justifies buddy onboarding"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 4: Mid-Tenure Dip (13-18M) */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Mid-Tenure Dip</span>
            <Clock className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              21.9%
            </span>
            <span className="text-[11px] font-semibold text-status-attention">1Y to 1.5Y</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Career Plateau</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Retention"
              metricOrEntity="Tenure Dip Rate"
              originalSource="Turnover sheet"
              governanceRule="Empirical tenure distribution"
              impactOnDecision="Signals need for promotion"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 5: Regrettable Loss */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Regrettable Loss</span>
            <AlertTriangle className="w-4 h-4 text-status-danger" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              27.8%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">247 Top Staff</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>High Performer Exits</span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Turnover"
              metricOrEntity="Regrettable Losses"
              originalSource="Turnover sheet"
              governanceRule="Empirical HR tag"
              impactOnDecision="Proves cost of attrition"
              showLabel={false}
            />
          </div>
        </div>

        {/* Metric 6: Ready Mobility Matches */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span>Ready Successors</span>
            <Sparkles className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-brand-teal">
              4
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">Score &gt;= 85%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
            <span>Ready for Promotion</span>
            <DataProvenanceBadge
              provenance="SYNTHETIC_ENABLER"
              domain="Mobility"
              metricOrEntity="Scored Candidates"
              originalSource="Competency scoring model"
              governanceRule="FIT HUB frontline competency scoring"
              impactOnDecision="Bypasses external hiring delay"
              showLabel={false}
            />
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

              {/* Risk Level Filter */}
              <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      riskFilter === r
                        ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {r === "ALL" ? "All Risk" : `${r} Risk`}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-ink-tertiary">
              Showing <span className="font-semibold text-ink-primary">{filteredCohorts.length}</span> cohorts
            </div>
          </div>

          {/* 12-Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left 8 Columns: Cohort Table */}
            <div className="xl:col-span-8 space-y-4">
              <div className="rounded-xl bg-surface-card border border-surface-border overflow-hidden shadow-subtle">
                <div className="p-4 border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-brand-teal" />
                    <h2 className="text-sm font-bold text-ink-primary font-display">
                      Workforce Retention & Cohort Attrition Matrix
                    </h2>
                  </div>
                  <span className="text-xs text-ink-tertiary">
                    Empirical data from 889 historical exits
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-ground/70 border-b border-surface-border text-ink-secondary font-semibold">
                        <th className="py-3 px-4">Role / Job Family</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-3 text-center">Headcount</th>
                        <th className="py-3 px-3 text-center">Turnover %</th>
                        <th className="py-3 px-3 text-center">&lt; 12M Cliff</th>
                        <th className="py-3 px-3 text-center">1Y to 1.5Y Dip</th>
                        <th className="py-3 px-3 text-center">Regrettable %</th>
                        <th className="py-3 px-4">Primary Exit Reason</th>
                        <th className="py-3 px-3 text-center">Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {filteredCohorts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-ink-tertiary">
                            No cohorts match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredCohorts.map((cohort) => (
                          <tr
                            key={cohort.cohort_id}
                            className={`hover:bg-surface-elevated/80 transition-colors ${
                              cohort.risk_level === "HIGH" ? "bg-status-danger/5" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-semibold text-ink-primary">
                              {cohort.role_name}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-ground border border-surface-border text-ink-secondary">
                                {cohort.location_name}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-ink-primary">
                              {cohort.headcount}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold">
                              <span className={cohort.annualized_turnover_pct > 50 ? "text-status-danger" : "text-ink-primary"}>
                                {cohort.annualized_turnover_pct}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className={cohort.early_attrition_pct > 60 ? "text-status-danger font-bold" : "text-status-attention"}>
                                {cohort.early_attrition_pct}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              {cohort.dip_tenure_pct}%
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className={cohort.regrettable_loss_pct > 30 ? "text-status-danger font-semibold" : "text-ink-primary"}>
                                {cohort.regrettable_loss_pct}%
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-ink-secondary">
                              {cohort.primary_exit_driver}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {cohort.risk_level === "HIGH" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-danger/20 text-status-danger border border-status-danger/30">
                                  HIGH RISK
                                </span>
                              ) : cohort.risk_level === "MEDIUM" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-attention/20 text-status-attention border border-status-attention/30">
                                  MEDIUM
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-healthy/20 text-status-healthy border border-status-healthy/30">
                                  LOW
                                </span>
                              )}
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

            {/* Right 4 Columns: Systemic Diagnostics */}
            <div className="xl:col-span-4 space-y-4">
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3 flex items-center justify-between">
                  <span>Executive Retention Signals</span>
                  <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
                </h3>

                {/* Diagnostic 1: Early Attrition */}
                <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 mb-4 hover:border-status-danger/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-danger/20 text-status-danger">
                      SYSTEMIC CLIFF #1
                    </span>
                    <span className="text-[11px] text-ink-tertiary">Months 0 to 12</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    Frontline 90-Day Ramp-Up Cliff
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    57.4% of all departures occur before month 12. Customer Service in Bali reaches 68.4% early attrition, driven by intense shift rosters and lack of floor mentoring.
                  </p>
                  <div className="p-2.5 rounded-lg bg-surface-ground border border-surface-border mb-3 text-[11px]">
                    <span className="font-semibold text-ink-primary block mb-0.5">
                      Recommendation 4 Action:
                    </span>
                    <span className="text-ink-secondary">
                      Deploy 30-day dedicated shift buddies and formalize 60-day check-in milestones with Area Managers.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("cliff")}
                    className="w-full py-1.5 px-3 rounded-lg bg-surface-card border border-surface-border text-ink-primary text-xs font-bold hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Inspect Tenure Survival Curve</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-brand-teal" />
                  </button>
                </div>

                {/* Diagnostic 2: Mid-Tenure Plateau */}
                <div className="p-4 rounded-xl bg-status-attention/5 border border-status-attention/20 hover:border-status-attention/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-attention/20 text-status-attention">
                      RETENTION DIP #2
                    </span>
                    <span className="text-[11px] text-ink-tertiary">Months 13 to 18</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary mb-1">
                    Mid-Tenure Seniority Plateau
                  </h4>
                  <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                    High performers who successfully survive Year 1 face a second attrition spike (21.9% dip) when external hires take managerial slots instead of internal staff.
                  </p>
                  <button
                    onClick={() => setActiveTab("mobility")}
                    className="w-full py-1.5 px-3 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Internal Mobility Engine</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: Tenure Cliff & Survival Curve */}
      {activeTab === "cliff" && (
        <div className="space-y-6">
          {/* 30/60/90 Day Listening Architecture (Notebook Section 5.2 Action 1) */}
          <SectionCard
            title="30 / 60 / 90 Day Listening & Onboarding Check-in Framework"
            description="Structured early-tenure listening checkpoints to intercept role expectation mismatch and roster friction before resignations occur."
            note="Actionable Solve: 57.4% of turnover happens in <12M tenure. Capturing sentiment at Day 30 and 60 identifies at-risk frontline staff before month 6 exit cliff."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-surface-soft border border-border-default/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-xs text-brand-teal">Milestone 1</span>
                  <Chip label="Day 30 Pulse" tone="teal" size="sm" />
                </div>
                <h4 className="font-spartan font-bold text-sm text-ink-primary">Role Clarity & Expectation Sync</h4>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="kpi-number text-2xl text-ink-primary">3.4</span>
                  <span className="text-xs text-ink-secondary">/ 5.0 score</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Measures floor orientation, manager 1-on-1 check-in, and clarity on personal training commission split.
                </p>
                <div className="mt-3 pt-2 border-t border-border-default/50 text-[11px] flex justify-between">
                  <span className="text-status-attention font-semibold">4 At-Risk Joiners</span>
                  <span className="text-ink-muted">94% Completion</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-soft border border-border-default/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-xs text-status-attention">Milestone 2</span>
                  <Chip label="Day 60 Pulse" tone="yellow" size="sm" />
                </div>
                <h4 className="font-spartan font-bold text-sm text-ink-primary">Ramp-Up & Floor Integration</h4>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="kpi-number text-2xl text-ink-primary">3.6</span>
                  <span className="text-xs text-ink-secondary">/ 5.0 score</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Evaluates club GM coaching, member consultation workflow, and peak shift fatigue management.
                </p>
                <div className="mt-3 pt-2 border-t border-border-default/50 text-[11px] flex justify-between">
                  <span className="text-status-attention font-semibold">2 At-Risk Joiners</span>
                  <span className="text-ink-muted">88% Completion</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-soft border border-border-default/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-xs text-status-healthy">Milestone 3</span>
                  <Chip label="Day 90 Pulse" tone="healthy" size="sm" />
                </div>
                <h4 className="font-spartan font-bold text-sm text-ink-primary">Probation & Autonomy Signoff</h4>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="kpi-number text-2xl text-status-healthy">3.9</span>
                  <span className="text-xs text-ink-secondary">/ 5.0 score</span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Readiness for autonomous floor quota, permanent staff confirmation, and initial capability baseline review.
                </p>
                <div className="mt-3 pt-2 border-t border-border-default/50 text-[11px] flex justify-between">
                  <span className="text-status-healthy font-semibold">Ready for Confirmation</span>
                  <span className="text-ink-muted">82% Completion</span>
                </div>
              </div>
            </div>

            {/* At-Risk Joiners Intervention Table */}
            <div className="p-4 rounded-xl bg-[#FFF8E6] border border-[#CA8A04]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-attention" />
                  <span className="font-spartan font-bold text-xs text-ink-primary uppercase tracking-wider">
                    Recent Joiners Flagged for Proactive Intervention
                  </span>
                </div>
                <span className="text-[11px] text-ink-secondary">Tenure &lt; 6 months</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#CA8A04]/20 text-ink-secondary">
                      <th className="py-2 px-3">Joiner Name</th>
                      <th className="py-2 px-3">Role &amp; Club</th>
                      <th className="py-2 px-3 text-center">Tenure</th>
                      <th className="py-2 px-3 text-center">30D Score</th>
                      <th className="py-2 px-3 text-center">60D Score</th>
                      <th className="py-2 px-3">Primary Concern</th>
                      <th className="py-2 px-3 text-right">Action Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CA8A04]/10">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-ink-primary">Farhan Siregar</td>
                      <td className="py-2.5 px-3 text-ink-secondary">Fitness Consultant &bull; FIT HUB Canggu (Bali)</td>
                      <td className="py-2.5 px-3 text-center font-bold">2.5 mos</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-status-critical">2.8</td>
                      <td className="py-2.5 px-3 text-center font-mono text-status-attention">3.1</td>
                      <td className="py-2.5 px-3 text-ink-secondary">Shift schedule roster fatigue</td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="px-2.5 py-1 rounded bg-brand-teal text-white text-[11px] font-semibold hover:bg-brand-teal/90 transition-all">
                          Schedule GM 1-on-1
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-ink-primary">Dewi Wulan</td>
                      <td className="py-2.5 px-3 text-ink-secondary">Personal Trainer &bull; FIT HUB Sunset Road (Bali)</td>
                      <td className="py-2.5 px-3 text-center font-bold">1.8 mos</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-status-critical">3.0</td>
                      <td className="py-2.5 px-3 text-center font-mono text-ink-muted">Pending</td>
                      <td className="py-2.5 px-3 text-ink-secondary">Commission structure clarity</td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="px-2.5 py-1 rounded bg-brand-teal text-white text-[11px] font-semibold hover:bg-brand-teal/90 transition-all">
                          Assign Buddy Mentor
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-status-danger" />
                  <span>Tenure Survival Curve & Frontline Exit Cliff</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Breakdown of 889 employee departures across milestone tenure intervals. Over half of all losses occur within the first year.
                </p>
              </div>
              <DataProvenanceBadge
                provenance="OBSERVED_CASE_STUDY"
                domain="Tenure Milestones"
                metricOrEntity="Tenure Interval Breakdown"
                originalSource="Turnover sheet (889 departures)"
                governanceRule="Exact tenure in months categorized by milestone bands"
                impactOnDecision="Pins onboarding failure and 1Y-1.5Y promotion ceiling"
              />
            </div>

            {/* Stepped Tenure Band Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-6">
              {dynamicTenureBands.map((band, idx) => (
                <div
                  key={band.band_label}
                  className={`p-4 rounded-xl border relative transition-all ${
                    idx === 0 || idx === 1
                      ? "bg-status-danger/5 border-status-danger/30 shadow-subtle"
                      : idx === 3
                      ? "bg-status-attention/5 border-status-attention/30"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase">
                    Stage {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-ink-primary mt-0.5 mb-1">
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
                      <span className={`font-bold ${idx <= 2 ? "text-status-danger" : "text-ink-primary"}`}>
                        {band.cumulative_pct}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-ink-tertiary uppercase">
                    {band.cliff_stage}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Recharts Tenure Distribution */}
            <div className="my-6 p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <span className="label-xs text-ink-secondary block mb-3">Tenure Interval Distribution (% of Exits)</span>
              <ColoredBar
                data={dynamicTenureBands.map((band, idx) => ({
                  label: band.band_label,
                  value: band.pct_of_exits,
                  color: idx <= 1 ? "#C65353" : idx === 3 ? "#C99400" : "#23C9D3",
                }))}
                dataKey="value"
                categoryKey="label"
                height={200}
                unit="%"
              />
            </div>

            {/* Root Cause & Action Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
                <h4 className="text-xs font-bold text-status-danger mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Early Cliff (0 to 6 Months: {earlyCliffPct.toFixed(1)}% of all Exits)</span>
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  First 6 months account for {earlyCliffCount} exits across FIT HUB clubs. Frontline Fitness Consultants and Trainers transition from initial onboarding into solo shift rosters and sales quotas without structured peer accompaniment, driving peak voluntary departures in months 3 to 6.
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-surface-card border border-surface-border text-[11px] text-ink-primary font-medium">
                  Recommendation 4: Deploy structured buddy pairing during days 1 to 30 and formalize Day 60 check-in milestones before solitary shift sign-off.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
                <h4 className="text-xs font-bold text-status-attention mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>The Mid-Tenure Plateau (13 to 18 Months: {midTenurePct.toFixed(1)}% of Exits)</span>
                </h4>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {midTenureCount} departures occur among seasoned frontline staff who master gym operations but hit a career advancement ceiling. When leadership and ACM openings are sourced externally without a transparent internal qualification rubric, high performers depart.
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-surface-card border border-surface-border text-[11px] text-ink-primary font-medium">
                  Recommendation 5: Operationalize FIT HUB Frontline Competency Architecture (Levels 1 to 5) to qualify internal candidates for promotion.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: Voice of Employee & eNPS Explorer */}
      {activeTab === "engagement" && (
        <div className="space-y-6">
          {/* World-Class eNPS with Survivorship Bias Warning */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-healthy/20 text-status-healthy uppercase">
                    Annual Engagement Survey
                  </span>
                  <DataProvenanceBadge
                    provenance="OBSERVED_CASE_STUDY"
                    domain="Engagement"
                    metricOrEntity="eNPS & 6 Core Dimensions"
                    originalSource="Engagement sheet (1,636 respondents)"
                    governanceRule="Calculated from Promoter (68.0%) minus Detractor (11.4%)"
                    impactOnDecision="Subject to mandatory survivorship bias disclosure"
                  />
                </div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-brand-teal" />
                  <span>Voice of Employee Sentiment & eNPS Explorer</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {dynamicEngagement.totalRespondents} respondents across {locationDisplay} evaluated FIT HUB across 6 operational dimensions.
                </p>
              </div>

              {/* eNPS Badge & Builder Button */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/team/engagement/survey"
                  className="px-3 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Survey Simulator</span>
                </Link>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <div className="text-right">
                    <span className="text-[11px] text-ink-tertiary block">Net eNPS Score</span>
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

            {/* Critical Survivorship Bias Warning Banner */}
            <div className="p-4 rounded-xl bg-status-attention/10 border border-status-attention/30 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-attention flex-shrink-0 mt-0.5" />
              <div className="text-xs text-ink-secondary leading-relaxed">
                <strong className="text-ink-primary block mb-0.5">
                  Analytical Governance Disclosure: Survivorship Bias in eNPS
                </strong>
                While a {dynamicEngagement.enps >= 0 ? `+${dynamicEngagement.enps.toFixed(1)}` : dynamicEngagement.enps.toFixed(1)} net eNPS reflects high brand pride and camaraderie, the survey was administered only to active employees. Dissatisfied frontline staff departed prior to survey rollout (57.4% exiting in Year 1). True organizational sentiment must be interpreted in conjunction with turnover data.
              </div>
            </div>

            {/* Visual Recharts eNPS Share & Dimensions Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-3">
                  eNPS Voter Distribution (Net {dynamicEngagement.enps >= 0 ? `+${dynamicEngagement.enps.toFixed(1)}` : dynamicEngagement.enps.toFixed(1)})
                </span>
                <StackedBarShare
                  segments={dynamicEngagement.segments}
                  totalLabel={`${dynamicEngagement.totalRespondents} Active Survey Respondents (${locationDisplay} • ${roleDisplay})`}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-3">Dimension Scores (Out of 6.00 Scale)</span>
                <ColoredBar
                  data={dynamicEngagement.dimensionScores}
                  dataKey="value"
                  categoryKey="label"
                  horizontal={true}
                  height={180}
                  unit="/ 6.0"
                />
              </div>
            </div>

            {/* 6 Engagement Dimensions Grid */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary mb-3">
              6 Core Workplace Dimensions (Out of 6.00 Scale)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
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

                    <p className="text-xs text-ink-secondary leading-relaxed italic mb-3 p-2.5 rounded-lg bg-surface-card border border-surface-border">
                      &ldquo;{v.verbatim_sample}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-border text-[11px] text-brand-teal font-medium">
                    <span className="text-ink-tertiary block text-[10px] uppercase font-bold">Action:</span>
                    {v.strategic_action}
                  </div>
                </div>
              );
            })}
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
                    {targetRoleBenchmarks.map((b) => (
                      <option key={b.role_id} value={b.role_id}>
                        {b.role_name} ({b.job_family})
                      </option>
                    ))}
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

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={feederOnly}
                      onChange={(e) => setFeederOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-surface-border text-brand-teal accent-brand-teal cursor-pointer"
                    />
                    <span className="text-xs font-medium text-ink-primary">
                      Natural feeder pathways only ({activeBenchmark.natural_feeder_roles.join(", ")})
                    </span>
                  </label>
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
                        <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                          Required Role Competencies (Derived vs Framework Target)
                        </span>
                        <span className="text-[11px] text-ink-tertiary">
                          4 Core Pillars Evaluated
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeBenchmark.required_capabilities.map((cap) => (
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
                            <div className="text-[10px] font-semibold text-ink-tertiary">
                              Weight: {cap.weight}%
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
                      No candidates match the active filter criteria ({dynamicFilterTier !== "ALL" ? `Tier: ${dynamicFilterTier}` : "All Tiers"}, Min Rating &ge; {minPerformance.toFixed(1)}, Min Tenure &ge; {minTenureMonths}m{feederOnly ? ", Natural Feeders Only" : ""}).
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
                          setFeederOnly(false);
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
                <Link
                  href="/team/exit-survey"
                  className="px-3.5 py-2 rounded-xl bg-status-critical text-white text-xs font-bold hover:bg-status-critical/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Exit Interview</span>
                </Link>

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
                  {activeBenchmark.required_capabilities.map((cap) => {
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

              {/* Strengths & Transition Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="font-bold text-ink-primary block mb-1">
                    Demonstrated Frontline Strength
                  </span>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {selectedDynamicCandidate.top_strength}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="font-bold text-ink-primary block mb-1">
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
