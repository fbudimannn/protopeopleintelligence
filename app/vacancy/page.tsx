"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFilters, matchLocationHierarchy, matchRoleHierarchy, matchPeriod, formatPeriodLabel, PeriodOption } from "@/lib/context/FilterContext";
import DataProvenanceBadge from "@/components/DataProvenanceBadge";
import {
  getVacancyKPIs,
  getRequisitions,
  createRequisition,
  saveRequisitionSourcing,
  updateRequisitionStage,
  getSourcingChannels,
  getFunnelStages,
  getTalentPoolCandidates,
  getHiringOutcomes,
} from "@/lib/data/api";
import {
  VacancyKPI,
  RequisitionItem,
  CreateRequisitionPayload,
  RequisitionCandidateItem,
  RequisitionSourcingDetail,
  SourcingChannelMetric,
  FunnelStageMetric,
  TalentPoolCandidate,
  HiringOutcomeMetric,
  InternalMobilityMatch,
  fallbackMobilityMatches,
  getCandidatesForRequisition,
  SourcingMetadata,
  SourcingChannelCategory,
} from "@/lib/data/fixtures";
import { KpiCard, SectionCard, LifecycleStrip, Chip, MetricInfoTooltip } from "@/components/primitives";
import { SimpleBar, ColoredBar, SimpleLine, StackedBarShare, FunnelWaterfall } from "@/components/charts";
import {
  BarChart2,
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Users,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Info,
  Check,
  GraduationCap,
  Building2,
  ArrowRight,
  X,
  Inbox,
  FileSpreadsheet,
  UserCheck,
  RefreshCw,
  Eye,
  Globe,
  Plus,
  Database,
  Trash2,
  UserPlus,
  Phone,
  Link2,
  MapPin,
} from "lucide-react";

export interface ClusterDemandBreakdown {
  id: string;
  role_name: string;
  location_name: string;
  open_requisitions: number;
  openings_count: number;
  replacement_count: number;
  expansion_count: number;
  replacement_share_pct: number;
  beyond_sla_pct: number;
  median_ttf_days: number;
  pressure_level: "CRITICAL" | "ATTENTION" | "NORMAL";
  ready_pool_count: number;
  applied_count: number;
  internal_mobility_count: number;
  channel_mix: { channel: string; count: number; pct: number }[];
  stage_counts: { stage: string; count: number }[];
}

type VacancyTab = "overview" | "funnel" | "talent-pool" | "outcomes";

function VacancyContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as VacancyTab) || "overview";

  const [activeTab, setActiveTab] = useState<VacancyTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [kpis, setKpis] = useState<VacancyKPI[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([]);
  const [sourcingChannels, setSourcingChannels] = useState<SourcingChannelMetric[]>([]);
  const [funnelStages, setFunnelStages] = useState<FunnelStageMetric[]>([]);
  const [talentPool, setTalentPool] = useState<TalentPoolCandidate[]>([]);
  const [hiringOutcomes, setHiringOutcomes] = useState<HiringOutcomeMetric[]>([]);

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
  const [hiringTypeFilter, setHiringTypeFilter] = useState<"ALL" | "Replacement" | "Expansion">("ALL");
  const [slaFilter, setSlaFilter] = useState<"ALL" | "WITHIN_SLA" | "AT_RISK" | "BREACHED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-View Switcher for Stage 2 (Active Monitoring): Requisition List View vs Role x Location Matrix
  const [monitoringViewMode, setMonitoringViewMode] = useState<"LIST" | "MATRIX">("LIST");

  // Candidate Pipeline Source Sub-Filter for Requisition Detail Modal
  const [candidateSourceFilter, setCandidateSourceFilter] = useState<string>("ALL");

  // Funnel & Sourcing Local Source Channel Filter
  const [funnelSourceFilter, setFunnelSourceFilter] = useState<string>("ALL");

  // Fast-track notification
  const [fastTrackSuccess, setFastTrackSuccess] = useState<string | null>(null);

  // Stage Switcher State (1. Intake Assessment vs 2. Active Monitoring)
  const initialStage = (searchParams.get("stage") as "intake" | "active") || "active";
  const [stage, setStage] = useState<"intake" | "active">(initialStage);

  const handleStageChange = (newStage: "intake" | "active") => {
    setStage(newStage);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("stage", newStage);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Incoming Requisitions (Pending Sourcing Assessment)
  const [incomingRequisitions, setIncomingRequisitions] = useState<RequisitionItem[]>([]);
  const [intakeSearchQuery, setIntakeSearchQuery] = useState("");
  const [intakeTierFilter, setIntakeTierFilter] = useState<"ALL" | "TIER_1" | "TIER_2">("ALL");
  const [intakeLocationFilter, setIntakeLocationFilter] = useState<string>("ALL");
  const [selectedIntakeReq, setSelectedIntakeReq] = useState<RequisitionItem | null>(null);
  const [intakeSourcingChannel, setIntakeSourcingChannel] = useState<"READY_POOL" | "INTERNAL_MOBILITY" | "CONVENTIONAL">("READY_POOL");
  const [intakeSelectedCandidate, setIntakeSelectedCandidate] = useState<any | null>(null);
  const [intakeTrackerUrl, setIntakeTrackerUrl] = useState<string>("https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit");
  const [intakeApplicantCount, setIntakeApplicantCount] = useState<number>(14);
  const [intakeChannels, setIntakeChannels] = useState<string[]>(["LinkedIn", "JobStreet"]);
  const [allocating, setAllocating] = useState<boolean>(false);
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);

  // Conventional Sourcing Breakdown & Candidate Manual Entry States
  type ConventionalCategoryKey = "SOCIAL_MEDIA_ADS" | "EMPLOYEE_REFERRAL" | "JOB_PORTAL" | "CAREER_SITE" | "AGENCY";
  const [conventionalCategory, setConventionalCategory] = useState<ConventionalCategoryKey>("SOCIAL_MEDIA_ADS");
  const [conventionalSubChannel, setConventionalSubChannel] = useState<string>("Instagram Ads");
  const [conventionalCandidateName, setConventionalCandidateName] = useState<string>("");
  const [conventionalCandidatePhone, setConventionalCandidatePhone] = useState<string>("");
  const [conventionalCandidateUrl, setConventionalCandidateUrl] = useState<string>("");
  const [conventionalCandidateRole, setConventionalCandidateRole] = useState<string>("");
  const [conventionalCandidateNotes, setConventionalCandidateNotes] = useState<string>("");
  interface ConventionalCandidateListItem {
    id: string;
    person_id: string;
    candidate_id: string;
    requisition_id: string;
    name: string;
    phone: string;
    url: string;
    role: string;
    notes: string;
    category: ConventionalCategoryKey;
    sub_channel: string;
    parsed_from_sheet?: boolean;
  }

  const [conventionalCandidateList, setConventionalCandidateList] = useState<ConventionalCandidateListItem[]>([]);
  const [isParsingSheet, setIsParsingSheet] = useState<boolean>(false);
  const [sheetSyncMessage, setSheetSyncMessage] = useState<string | null>(null);
  const [sqlInsertPreview, setSqlInsertPreview] = useState<string[] | null>(null);
  const [allocatingReq, setAllocatingReq] = useState<RequisitionItem | null>(null);

  const CONVENTIONAL_CATEGORIES: Record<ConventionalCategoryKey, { label: string; icon: any; subChannels: string[]; description: string }> = {
    SOCIAL_MEDIA_ADS: {
      label: "Social Media Ads",
      icon: Sparkles,
      subChannels: ["Instagram Ads", "LinkedIn Sponsored Post", "TikTok Career Blitz", "Meta Paid Campaign"],
      description: "Direct targeted social campaigns (e.g. sponsored reels, feed ads for club trainers).",
    },
    EMPLOYEE_REFERRAL: {
      label: "Employee Referral",
      icon: Users,
      subChannels: ["Club Staff Referral", "Cluster Lead Referral", "HQ Referral", "Alumni Referral"],
      description: "Internal team referrals (highest 12-month retention channel in FIT HUB case dataset).",
    },
    JOB_PORTAL: {
      label: "Job Portal",
      icon: Globe,
      subChannels: ["JobStreet", "Glints", "Kalibrr", "Indeed", "LinkedIn Jobs"],
      description: "Standard public job board aggregators & external candidate pools.",
    },
    CAREER_SITE: {
      label: "Career Site",
      icon: Building2,
      subChannels: ["Official Careers Portal", "Club Walk-In Applicant", "Club QR Scan Application"],
      description: "Direct applications from FIT HUB company careers page and in-club walk-in drop-offs.",
    },
    AGENCY: {
      label: "Recruitment Agency",
      icon: Briefcase,
      subChannels: ["Frontline Placement Agency", "Executive Search Partner", "Specialized Fitness Recruiter"],
      description: "External recruitment partners and headhunters.",
    },
  };

  const handleAutoParseSheetInbound = () => {
    if (!selectedIntakeReq) return;
    setIsParsingSheet(true);
    setSheetSyncMessage(null);

    setTimeout(() => {
      const role = selectedIntakeReq.role_name;
      const loc = selectedIntakeReq.location_name;
      const reqCode = selectedIntakeReq.req_code;

      const sampleApplicants = [
        { name: "Rizky Ramadhan", phone: "+62 812-4455-6677", url: "linkedin.com/in/rizky-ramadhan", prev: `Senior ${role}` },
        { name: "Clarissa Amanda", phone: "+62 813-7788-9900", url: "instagram.com/clarissa.fit", prev: `${role} Specialist` },
        { name: "Bagus Wicaksono", phone: "+62 857-1122-3344", url: "glints.com/id/bagus-w", prev: `Junior ${role}` },
      ];

      const newParsed: ConventionalCandidateListItem[] = sampleApplicants.map((item, idx) => {
        const pNum = Math.floor(1000 + Math.random() * 9000);
        const cNum = Math.floor(2000 + Math.random() * 8000);
        return {
          id: `cand-sheet-${Date.now()}-${idx}`,
          person_id: `PRS-${pNum}`,
          candidate_id: `CND-${cNum}`,
          requisition_id: reqCode,
          name: item.name,
          phone: item.phone,
          url: item.url,
          role: item.prev,
          notes: `Parsed row #${idx + 14} from connected Sheet (${conventionalSubChannel} in ${loc})`,
          category: conventionalCategory,
          sub_channel: conventionalSubChannel,
          parsed_from_sheet: true,
        };
      });

      const sqlStatements = newParsed.flatMap((c) => [
        `INSERT INTO core.person (person_id, full_name, phone, created_at) VALUES ('${c.person_id}', '${c.name}', '${c.phone}', NOW());`,
        `INSERT INTO recruiting.candidate (candidate_id, person_id, source_channel, external_url) VALUES ('${c.candidate_id}', '${c.person_id}', '${c.sub_channel}', '${c.url}');`,
        `INSERT INTO recruiting.application (application_id, requisition_id, candidate_id, stage, status) VALUES ('APP-${Math.floor(10000 + Math.random() * 90000)}', '${c.requisition_id}', '${c.candidate_id}', 'HR Screening', 'ACTIVE');`,
      ]);

      setConventionalCandidateList((prev) => [...prev, ...newParsed]);
      setSqlInsertPreview(sqlStatements);
      setSheetSyncMessage(`✓ Successfully parsed ${newParsed.length} applicant rows from sheet and transacted into database.`);
      setIsParsingSheet(false);
      setTimeout(() => setSheetSyncMessage(null), 8000);
    }, 600);
  };

  const handleAddConventionalCandidate = () => {
    if (!conventionalCandidateName.trim() || !selectedIntakeReq) return;
    const pNum = Math.floor(1000 + Math.random() * 9000);
    const cNum = Math.floor(2000 + Math.random() * 8000);
    const newCand: ConventionalCandidateListItem = {
      id: `cand-ext-${Date.now()}`,
      person_id: `PRS-${pNum}`,
      candidate_id: `CND-${cNum}`,
      requisition_id: selectedIntakeReq.req_code,
      name: conventionalCandidateName.trim(),
      phone: conventionalCandidatePhone.trim() || "+62 812-xxxx-xxxx",
      url: conventionalCandidateUrl.trim(),
      role: conventionalCandidateRole.trim() || selectedIntakeReq.role_name,
      notes: conventionalCandidateNotes.trim() || `Manual entry via ${conventionalSubChannel}`,
      category: conventionalCategory,
      sub_channel: conventionalSubChannel,
      parsed_from_sheet: false,
    };

    const sqlStmt = [
      `INSERT INTO core.person (person_id, full_name, phone, created_at) VALUES ('${newCand.person_id}', '${newCand.name}', '${newCand.phone}', NOW());`,
      `INSERT INTO recruiting.candidate (candidate_id, person_id, source_channel, external_url) VALUES ('${newCand.candidate_id}', '${newCand.person_id}', '${newCand.sub_channel}', '${newCand.url || "N/A"}');`,
      `INSERT INTO recruiting.application (application_id, requisition_id, candidate_id, stage, status) VALUES ('APP-${Math.floor(10000 + Math.random() * 90000)}', '${newCand.requisition_id}', '${newCand.candidate_id}', 'HR Screening', 'ACTIVE');`,
    ];

    setConventionalCandidateList((prev) => [...prev, newCand]);
    setSqlInsertPreview(sqlStmt);
    setConventionalCandidateName("");
    setConventionalCandidatePhone("");
    setConventionalCandidateUrl("");
    setConventionalCandidateNotes("");
  };

  const handleRemoveConventionalCandidate = (id: string) => {
    setConventionalCandidateList((prev) => prev.filter((c) => c.id !== id));
  };

  // Create Requisition Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingRequisition, setCreatingRequisition] = useState(false);
  const [createSuccessMessage, setCreateSuccessMessage] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState({
    role_name: "Customer Service",
    job_family: "Fitness & Coaching",
    location_name: "Bali",
    club_name: "Sunset Road",
    hiring_type: "Replacement" as "Replacement" | "Expansion",
    urgency_reason: "",
    priority: "P2 - High",
    sla_target_days: 14,
    workflow_destination: "INTAKE_QUEUE" as "INTAKE_QUEUE" | "ACTIVE_MONITORING",
    sourcing_channel: "⚡ Frontline Ready Pool",
    external_tracker_url: "",
  });

  const handleOpenIntakeAllocation = (req: RequisitionItem) => {
    setSelectedIntakeReq(req);
    const isFrontline = ["customer service", "personal trainer", "fitness consultant", "housekeeping"].some(
      (r) => req.role_name.toLowerCase().includes(r)
    );
    if (isFrontline) {
      setIntakeSourcingChannel("READY_POOL");
    } else {
      setIntakeSourcingChannel("INTERNAL_MOBILITY");
    }
    // Initially unselected/empty as requested by user ("pertamanya kosong kecuali dari talent pool dan di internal mobility udah dipilih")
    setIntakeSelectedCandidate(null);
    setIntakeTrackerUrl(req.external_tracker_url || "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit");
    setConventionalCategory("SOCIAL_MEDIA_ADS");
    setConventionalSubChannel("Instagram Ads");
    setConventionalCandidateName("");
    setConventionalCandidatePhone("");
    setConventionalCandidateUrl("");
    setConventionalCandidateRole(req.role_name);
    setConventionalCandidateNotes("");
    setConventionalCandidateList([]);
  };

  const handleSaveIntakeAllocation = async () => {
    if (!selectedIntakeReq) return;
    setAllocating(true);
    try {
      let assignedCandidates: any[] = [];
      let sourcingChannelName = "⚡ Frontline Ready Pool";
      let currentStageName = "Manager Interview";

      if (intakeSourcingChannel === "READY_POOL") {
        sourcingChannelName = "⚡ Frontline Ready Pool";
        currentStageName = "Manager Interview";
        if (intakeSelectedCandidate) {
          const personId = intakeSelectedCandidate.person_id || `PRS-${Math.floor(1000 + Math.random() * 9000)}`;
          const candId = intakeSelectedCandidate.candidate_id || `CND-${Math.floor(1000 + Math.random() * 9000)}`;
          assignedCandidates = [
            {
              id: intakeSelectedCandidate.candidate_id || `cand-pool-${Date.now()}`,
              person_id: personId,
              candidate_id: candId,
              requisition_id: selectedIntakeReq.req_code,
              name: intakeSelectedCandidate.display_name,
              current_role: intakeSelectedCandidate.role_target || intakeSelectedCandidate.current_role || selectedIntakeReq.role_name,
              source_type: "TALENT_POOL",
              source_channel_name: "Frontline Ready Pool",
              stage: "Manager Interview",
              fit_score: intakeSelectedCandidate.fit_score || 92,
              contact: "+62 812-3456-7890",
              applied_at: new Date().toISOString().split("T")[0],
              notes: intakeSelectedCandidate.notes || "Selected from Frontline Ready Pool (FIT HUB Academy Bank)",
              sourcing_metadata: {
                internal_type: "TALENT_POOL",
                channel: "TALENT_POOL",
                talent_pool_program: "FIT HUB Frontline Fast-Track",
              },
            },
          ];
        }
      } else if (intakeSourcingChannel === "INTERNAL_MOBILITY") {
        sourcingChannelName = "✨ Internal Mobility";
        currentStageName = "IDP Transition";
        if (intakeSelectedCandidate) {
          const personId = intakeSelectedCandidate.person_id || `PRS-${Math.floor(1000 + Math.random() * 9000)}`;
          const candId = intakeSelectedCandidate.candidate_id || `CND-${Math.floor(1000 + Math.random() * 9000)}`;
          assignedCandidates = [
            {
              id: intakeSelectedCandidate.match_id || `cand-mob-${Date.now()}`,
              person_id: personId,
              candidate_id: candId,
              requisition_id: selectedIntakeReq.req_code,
              name: intakeSelectedCandidate.candidate_name || "Internal Candidate",
              current_role: intakeSelectedCandidate.current_role_name || "Club Lead",
              source_type: "INTERNAL_MOBILITY",
              source_channel_name: "Internal Mobility Engine",
              stage: "IDP Transition",
              fit_score: intakeSelectedCandidate.final_readiness_score || 90,
              contact: "+62 811-9876-5432",
              applied_at: new Date().toISOString().split("T")[0],
              notes: `Promoted from ${intakeSelectedCandidate.current_role_name || "Internal Team"} via IDP Benchmark`,
              sourcing_metadata: {
                internal_type: "INTERNAL_MOBILITY",
                channel: "INTERNAL_MOBILITY",
                mobility_employee_id: intakeSelectedCandidate.employee_code || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                mobility_current_role: intakeSelectedCandidate.current_role_name || "Club Lead",
                mobility_current_branch: intakeSelectedCandidate.current_location_name || selectedIntakeReq.location_name,
              },
            },
          ];
        }
      } else {
        sourcingChannelName = `💼 Conventional (${conventionalSubChannel})`;
        currentStageName = "HR Screening";
        if (conventionalCandidateList.length > 0) {
          assignedCandidates = conventionalCandidateList.map((c, idx) => ({
            id: c.id || `cand-ext-${Date.now()}-${idx}`,
            person_id: c.person_id || `PRS-${Math.floor(1000 + Math.random() * 9000)}`,
            candidate_id: c.candidate_id || `CND-${Math.floor(1000 + Math.random() * 9000)}`,
            requisition_id: selectedIntakeReq.req_code,
            name: c.name,
            current_role: c.role || selectedIntakeReq.role_name,
            source_type: c.category,
            source_channel_name: c.sub_channel,
            stage: "HR Screening",
            fit_score: 85,
            contact: c.phone || "+62 812-3344-5566",
            applied_at: new Date().toISOString().split("T")[0],
            notes: c.notes || `Sourced via ${c.sub_channel}`,
            parsed_from_sheet: c.parsed_from_sheet,
            sourcing_metadata: {
              channel: c.category,
              social_platform: c.sub_channel.includes("Instagram") ? "Instagram" : c.sub_channel.includes("LinkedIn") ? "LinkedIn" : c.sub_channel.includes("TikTok") ? "TikTok" : "Meta",
              social_post_campaign: "Regional Recruitment Campaign",
              portal_name: c.sub_channel,
              referrer_name: c.notes?.includes("Referral") ? c.name : "Employee Referral Network",
              profile_url: c.url || intakeTrackerUrl,
            },
          }));
        } else if (conventionalCandidateName.trim()) {
          const pId = `PRS-${Math.floor(1000 + Math.random() * 9000)}`;
          const cId = `CND-${Math.floor(1000 + Math.random() * 9000)}`;
          assignedCandidates = [
            {
              id: `cand-ext-${Date.now()}`,
              person_id: pId,
              candidate_id: cId,
              requisition_id: selectedIntakeReq.req_code,
              name: conventionalCandidateName.trim(),
              current_role: conventionalCandidateRole.trim() || selectedIntakeReq.role_name,
              source_type: conventionalCategory,
              source_channel_name: conventionalSubChannel,
              stage: "HR Screening",
              fit_score: 85,
              contact: conventionalCandidatePhone.trim() || "+62 812-3344-5566",
              applied_at: new Date().toISOString().split("T")[0],
              notes: conventionalCandidateNotes.trim() || `Sourced via ${conventionalSubChannel}`,
              sourcing_metadata: {
                channel: conventionalCategory,
                social_platform: conventionalSubChannel.includes("Instagram") ? "Instagram" : conventionalSubChannel.includes("LinkedIn") ? "LinkedIn" : "Meta",
                social_post_campaign: "Regional Sourcing Campaign",
                portal_name: conventionalSubChannel,
                referrer_name: conventionalCandidateNotes.includes("Referral") ? conventionalCandidateName : "Employee Referral Network",
                profile_url: conventionalCandidateUrl.trim() || intakeTrackerUrl,
              },
            },
          ];
        } else {
          const pId = `PRS-${Math.floor(1000 + Math.random() * 9000)}`;
          const cId = `CND-${Math.floor(1000 + Math.random() * 9000)}`;
          assignedCandidates = [
            {
              id: `cand-ext-${Date.now()}`,
              person_id: pId,
              candidate_id: cId,
              requisition_id: selectedIntakeReq.req_code,
              name: `Applicant (${conventionalSubChannel})`,
              current_role: selectedIntakeReq.role_name,
              source_type: conventionalCategory,
              source_channel_name: conventionalSubChannel,
              stage: "HR Screening",
              fit_score: 82,
              contact: "+62 812-0000-1111",
              applied_at: new Date().toISOString().split("T")[0],
              notes: `Inbound applicant logged via ${conventionalSubChannel}`,
              sourcing_metadata: {
                channel: conventionalCategory,
                portal_name: conventionalSubChannel,
                social_platform: conventionalSubChannel.includes("Instagram") ? "Instagram" : "External Portal",
                profile_url: intakeTrackerUrl,
              },
            },
          ];
        }
      }

      const res = await saveRequisitionSourcing(selectedIntakeReq.req_code, {
        sourcing_channel: sourcingChannelName,
        assigned_candidates: assignedCandidates,
        current_stage: currentStageName,
        external_tracker_url: intakeTrackerUrl,
        sourcing_details: [
          { channel: sourcingChannelName, url: intakeTrackerUrl, applicants: assignedCandidates.length || intakeApplicantCount },
        ],
      });

      if (res.success && res.data) {
        setIncomingRequisitions((prev) => prev.filter((r) => r.req_code !== selectedIntakeReq.req_code));
        setRequisitions((prev) => [res.data!, ...prev.filter((r) => r.req_code !== selectedIntakeReq.req_code)]);
        const candMsg = assignedCandidates.length > 0 && assignedCandidates[0].name ? ` with candidate ${assignedCandidates[0].name}` : "";
        setAllocationSuccess(`Requisition ${selectedIntakeReq.req_code} allocated to ${sourcingChannelName}${candMsg} and moved to Active Monitoring!`);
        setSelectedIntakeReq(null);
        handleStageChange("active");
        setTimeout(() => setAllocationSuccess(null), 5000);
      }
    } catch (err) {
      console.error("Failed to allocate sourcing:", err);
    } finally {
      setAllocating(false);
    }
  };

  const handleCreateRequisitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRequisition(true);
    try {
      const payload: CreateRequisitionPayload = {
        role_name: createFormData.role_name,
        job_family: createFormData.job_family,
        location_name: createFormData.location_name,
        club_name: createFormData.club_name,
        hiring_type: createFormData.hiring_type,
        urgency_reason: createFormData.urgency_reason || `Headcount demand for ${createFormData.role_name} at ${createFormData.club_name}`,
        priority: createFormData.priority,
        sla_target_days: Number(createFormData.sla_target_days) || 14,
        workflow_destination: createFormData.workflow_destination,
        sourcing_channel: createFormData.sourcing_channel,
        external_tracker_url: createFormData.external_tracker_url,
      };

      const res = await createRequisition(payload);
      if (res.success && res.data) {
        if (createFormData.workflow_destination === "INTAKE_QUEUE") {
          setIncomingRequisitions((prev) => [res.data!, ...prev]);
          handleStageChange("intake");
          setCreateSuccessMessage(`Requisition ${res.data.req_code} queued in Intake Assessment!`);
        } else {
          setRequisitions((prev) => [res.data!, ...prev]);
          handleStageChange("active");
          setCreateSuccessMessage(`Requisition ${res.data.req_code} created and live in Active Monitoring!`);
        }
        setIsCreateModalOpen(false);
        setCreateFormData({
          role_name: "Customer Service",
          job_family: "Fitness & Coaching",
          location_name: "Bali",
          club_name: "Sunset Road",
          hiring_type: "Replacement",
          urgency_reason: "",
          priority: "P2 - High",
          sla_target_days: 14,
          workflow_destination: "INTAKE_QUEUE",
          sourcing_channel: "⚡ Frontline Ready Pool",
          external_tracker_url: "",
        });
        setTimeout(() => setCreateSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error("Failed to create requisition:", err);
    } finally {
      setCreatingRequisition(false);
    }
  };

  // Detailed Pop-up Modal State
  const [detailModalReq, setDetailModalReq] = useState<RequisitionItem | null>(null);
  const [advancingStage, setAdvancingStage] = useState<boolean>(false);
  const [stageActionMessage, setStageActionMessage] = useState<string | null>(null);
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<ClusterDemandBreakdown | null>(null);

  const handleAdvanceStage = async (reqCode: string, newStage: string, candidateId?: string) => {
    setAdvancingStage(true);
    try {
      const isFulfilled = newStage === "Hired";
      await updateRequisitionStage(
        reqCode,
        newStage,
        candidateId,
        isFulfilled ? "Candidate Hired, Requisition Fulfilled" : `Stage advanced to ${newStage}`
      );

      let hiredEmpId = "";
      let hiredEmpyId = "";
      const updateReq = (req: RequisitionItem): RequisitionItem => {
        const baseCandidates = getCandidatesForRequisition(req);
        const updatedCandidates = baseCandidates.map((c) => {
          if (c.id === candidateId) {
            const empId = c.employee_id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
            const empyId = c.employment_id || `EMPY-${Math.floor(10000 + Math.random() * 90000)}`;
            if (isFulfilled) {
              hiredEmpId = empId;
              hiredEmpyId = empyId;
            }
            return {
              ...c,
              stage: newStage,
              ...(isFulfilled ? { employee_id: empId, employment_id: empyId } : {}),
            };
          }
          return c;
        });
        return {
          ...req,
          current_stage: newStage,
          requisition_status: isFulfilled ? "FULFILLED" : req.requisition_status,
          assigned_candidates: updatedCandidates,
        };
      };

      setRequisitions((prev) => prev.map((r) => (r.req_code === reqCode ? updateReq(r) : r)));

      if (detailModalReq && detailModalReq.req_code === reqCode) {
        setDetailModalReq((prev) => (prev ? updateReq(prev) : null));
      }

      if (isFulfilled) {
        setStageActionMessage(`🎉 Candidate successfully confirmed Hired! Requisition ${reqCode} is marked FULFILLED. Issued Employee ID: ${hiredEmpId || "EMP-2041"} & Employment Episode: ${hiredEmpyId || "EMPY-90142"}.`);
      } else {
        setStageActionMessage(`Candidate stage updated to: ${newStage}`);
      }
      setTimeout(() => setStageActionMessage(null), 6000);
    } catch (err) {
      console.error("Failed to advance stage:", err);
    } finally {
      setAdvancingStage(false);
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab") as VacancyTab;
    if (tabParam && ["overview", "funnel", "talent-pool", "outcomes"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if ((tabParam as any) === "matrix") {
      setActiveTab("overview");
      setMonitoringViewMode("MATRIX");
    }
    const stageParam = searchParams.get("stage") as "intake" | "active";
    if (stageParam && ["intake", "active"].includes(stageParam)) {
      setStage(stageParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: VacancyTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const currentLifecycleStep = useMemo(() => {
    if (activeTab === "overview") return "vacancy";
    if (activeTab === "funnel") return "sourcing";
    if (activeTab === "talent-pool") return "mobility";
    if (activeTab === "outcomes") return "exit";
    return "vacancy";
  }, [activeTab]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [kpiRes, reqRes, incomingRes, channelRes, funnelRes, poolRes, outcomesRes] = await Promise.all([
        getVacancyKPIs(),
        getRequisitions({ status: "ACTIVE_MONITORING" }),
        getRequisitions({ status: "PENDING_SOURCING" }),
        getSourcingChannels(),
        getFunnelStages(),
        getTalentPoolCandidates(),
        getHiringOutcomes(),
      ]);

      setKpis(kpiRes.data);
      setRequisitions(reqRes.data);
      setIncomingRequisitions(incomingRes.data);
      setSourcingChannels(channelRes.data);
      setFunnelStages(funnelRes.data);
      setTalentPool(poolRes.data);
      setHiringOutcomes(outcomesRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  // Helper for matching location with cascading hierarchy (Cluster -> Province -> City)
  const matchesLocationFilter = (itemLoc: string) => {
    return matchLocationHierarchy(itemLoc, clusterFilter, provinceFilter, cityFilter);
  };

  // Helper for matching role with cascading hierarchy (Job Family -> Specific Role)
  const matchesRoleFilter = (itemRole: string) => {
    return matchRoleHierarchy(itemRole, jobFamilyFilter, roleFilter);
  };

  // Filtered Requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((item) => {
      // Active monitoring only tracks in-flight requisitions (Fulfilled are archived)
      if (item.requisition_status === "FULFILLED" || item.requisition_status === "CANCELLED") {
        return false;
      }

      const loc = item.location_name || (item as any).location || "";
      const role = item.role_name || (item as any).role || "";
      const hiringType = item.hiring_type || (((item as any).demand_type || "").toUpperCase().includes("REPLACE") ? "Replacement" : "Expansion");
      const daysOpen = item.days_open ?? (item as any).current_days_open ?? 0;
      const slaTarget = item.sla_target_days ?? (item as any).sla_days ?? 28;
      const slaStat = item.sla_status || (daysOpen > slaTarget ? "BREACHED" : daysOpen > slaTarget - 5 ? "AT_RISK" : "WITHIN_SLA");

      // Global Location filter
      if (!matchesLocationFilter(loc)) {
        return false;
      }
      // Global Role filter (Job Family & Specific Role)
      if (!matchesRoleFilter(role)) {
        return false;
      }
      // Global Date/Period filter
      if (!matchPeriod((item as any).request_date || (item as any).created_at, selectedPeriod, item.req_code || (item as any).id)) {
        return false;
      }
      // Local Hiring Type filter
      if (hiringTypeFilter !== "ALL" && hiringType !== hiringTypeFilter) {
        return false;
      }
      // Local SLA filter
      if (slaFilter !== "ALL" && slaStat !== slaFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const code = (item.req_code || (item as any).id || "").toLowerCase();
        const rName = role.toLowerCase();
        const lName = loc.toLowerCase();
        const mgr = (item.hiring_manager || (item as any).replaces_employee_name || "").toLowerCase();
        const bStage = (item.bottleneck_stage || "").toLowerCase();
        return code.includes(query) || rName.includes(query) || lName.includes(query) || mgr.includes(query) || bStage.includes(query);
      }
      return true;
    });
  }, [requisitions, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod, hiringTypeFilter, slaFilter, searchQuery]);

  // Filtered Incoming Requisitions (Stage 1 Intake)
  const filteredIncomingRequisitions = useMemo(() => {
    return incomingRequisitions.filter((item) => {
      const q = intakeSearchQuery.toLowerCase();
      const code = (item.req_code || "").toLowerCase();
      const role = (item.role_name || "").toLowerCase();
      const loc = (item.location_name || "").toLowerCase();
      const club = (item.club_name || "").toLowerCase();
      const reason = (item.urgency_reason || "").toLowerCase();

      const matchesSearch = !q || code.includes(q) || role.includes(q) || loc.includes(q) || club.includes(q) || reason.includes(q);
      const matchesLoc = intakeLocationFilter === "ALL" || item.location_name === intakeLocationFilter;

      const isTier1 = ["customer service", "personal trainer", "fitness consultant", "housekeeping"].some((r) =>
        item.role_name.toLowerCase().includes(r)
      );
      const matchesTier =
        intakeTierFilter === "ALL" ||
        (intakeTierFilter === "TIER_1" ? isTier1 : !isTier1);

      return matchesSearch && matchesLoc && matchesTier;
    });
  }, [incomingRequisitions, intakeSearchQuery, intakeLocationFilter, intakeTierFilter]);

  const intakeTier1Count = useMemo(() => {
    return incomingRequisitions.filter((r) =>
      ["customer service", "personal trainer", "fitness consultant", "housekeeping"].some((role) =>
        r.role_name.toLowerCase().includes(role)
      )
    ).length;
  }, [incomingRequisitions]);

  const intakeTier2Count = incomingRequisitions.length - intakeTier1Count;

  // Aggregate KPI Calculations based on active filters
  const metrics = useMemo(() => {
    const totalOpenings = filteredRequisitions.reduce((acc, r) => acc + (r.openings || 1), 0);
    const replacementCount = filteredRequisitions.filter((r) => {
      const t = (r.hiring_type || (r as any).demand_type || "").toLowerCase();
      return t.includes("replace");
    }).length;
    const expansionCount = filteredRequisitions.length - replacementCount;

    const replacementPct = filteredRequisitions.length > 0
      ? (replacementCount / filteredRequisitions.length) * 100
      : (selectedLocation === "Bali" ? 85.7 : 70.7);

    const breachedCount = filteredRequisitions.filter((r) => {
      const stat = (r.sla_status || "").toUpperCase();
      const days = r.days_open ?? (r as any).current_days_open ?? 0;
      const target = r.sla_target_days ?? (r as any).sla_days ?? 28;
      return stat === "BREACHED" || days > target || (r as any).is_beyond_sla === true;
    }).length;

    const beyondSlaRate = filteredRequisitions.length > 0
      ? (breachedCount / filteredRequisitions.length) * 100
      : (selectedLocation === "Bali" ? 42.9 : 25.0);

    const validDays = filteredRequisitions
      .map((r) => r.days_open ?? (r as any).current_days_open)
      .filter((d): d is number => typeof d === "number" && !isNaN(d));

    const avgDaysOpen = validDays.length > 0
      ? validDays.reduce((acc, d) => acc + d, 0) / validDays.length
      : (selectedLocation === "Bali" ? 34.0 : 27.5);

    const totalPipeline = filteredRequisitions.reduce((acc, r) => acc + (r.pipeline_size || 0), 0);
    const pipelineCoverage = totalOpenings > 0
      ? Math.round((totalPipeline / totalOpenings) * 10) / 10
      : (selectedLocation === "Bali" ? 1.4 : 1.8);

    const filledPeriod = Math.round(totalOpenings * 3.7);

    return {
      openRequisitions: totalOpenings,
      replacementCount,
      expansionCount,
      replacementPct: Math.round(replacementPct * 10) / 10,
      expansionPct: Math.round((100 - replacementPct) * 10) / 10,
      beyondSlaRate: Math.round(beyondSlaRate * 10) / 10,
      medianTTF: Math.round(avgDaysOpen * 10) / 10,
      pipelineCoverage,
      filledPeriod,
    };
  }, [filteredRequisitions, selectedLocation]);

  // Period Comparison Info Helper (determines prior period for MoM / QoQ / YoY or All Time)
  const periodComp = useMemo(() => {
    if (selectedPeriod === "ALL_TIME") {
      return { prevPeriod: null as PeriodOption | null, label: "All Time", isAllTime: true };
    }
    if (selectedPeriod === "2025") {
      return { prevPeriod: "2024" as PeriodOption, label: "vs FY 2024", isAllTime: false };
    }
    if (selectedPeriod === "2024") {
      return { prevPeriod: null as PeriodOption | null, label: "FY 2024 Baseline", isAllTime: false };
    }
    if (selectedPeriod === "Q1_2025") {
      return { prevPeriod: "Q4_2024" as PeriodOption, label: "vs Q4 '24", isAllTime: false };
    }
    if (selectedPeriod === "Q2_2025") {
      return { prevPeriod: "Q1_2025" as PeriodOption, label: "vs Q1 '25", isAllTime: false };
    }
    if (selectedPeriod === "Q3_2025") {
      return { prevPeriod: "Q2_2025" as PeriodOption, label: "vs Q2 '25", isAllTime: false };
    }
    if (selectedPeriod === "Q4_2025") {
      return { prevPeriod: "Q3_2025" as PeriodOption, label: "vs Q3 '25", isAllTime: false };
    }
    if (selectedPeriod === "Q4_2024") {
      return { prevPeriod: "Q3_2024" as PeriodOption, label: "vs Q3 '24", isAllTime: false };
    }
    if (selectedPeriod === "Q3_2024") {
      return { prevPeriod: null as PeriodOption | null, label: "Q3 '24 Baseline", isAllTime: false };
    }
    if (selectedPeriod.includes("-")) {
      const [yrStr, moStr] = selectedPeriod.split("-");
      const yr = parseInt(yrStr, 10);
      const mo = parseInt(moStr, 10);
      let prevYr = yr;
      let prevMo = mo - 1;
      if (prevMo < 1) {
        prevYr = yr - 1;
        prevMo = 12;
      }
      const prevStr = `${prevYr}-${String(prevMo).padStart(2, "0")}` as PeriodOption;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const prevMoName = monthNames[prevMo - 1];
      if (yr === 2024 && mo <= 7) {
        return { prevPeriod: null as PeriodOption | null, label: "Jul '24 Baseline", isAllTime: false };
      }
      return { prevPeriod: prevStr, label: `vs ${prevMoName} '${String(prevYr).slice(2)}`, isAllTime: false };
    }
    return { prevPeriod: null as PeriodOption | null, label: selectedPeriod, isAllTime: false };
  }, [selectedPeriod]);

  // Compute previous period openings to calculate real delta
  const prevPeriodOpenings = useMemo(() => {
    if (!periodComp.prevPeriod) return null;
    const prevFiltered = requisitions.filter((item) => {
      if (item.requisition_status === "FULFILLED" || item.requisition_status === "CANCELLED") return false;
      const loc = item.location_name || (item as any).location || "";
      const role = item.role_name || (item as any).role || "";
      const hiringType = item.hiring_type || (((item as any).demand_type || "").toUpperCase().includes("REPLACE") ? "Replacement" : "Expansion");
      const daysOpen = item.days_open ?? (item as any).current_days_open ?? 0;
      const slaTarget = item.sla_target_days ?? (item as any).sla_days ?? 28;
      const slaStat = item.sla_status || (daysOpen > slaTarget ? "BREACHED" : daysOpen > slaTarget - 5 ? "AT_RISK" : "WITHIN_SLA");

      if (!matchesLocationFilter(loc)) return false;
      if (!matchesRoleFilter(role)) return false;
      if (!matchPeriod((item as any).request_date || (item as any).created_at, periodComp.prevPeriod!, item.req_code || (item as any).id)) return false;
      if (hiringTypeFilter !== "ALL" && hiringType !== hiringTypeFilter) return false;
      if (slaFilter !== "ALL" && slaStat !== slaFilter) return false;
      return true;
    });
    return prevFiltered.reduce((acc, r) => acc + (r.openings || 1), 0);
  }, [requisitions, periodComp, matchesLocationFilter, matchesRoleFilter, hiringTypeFilter, slaFilter]);

  // Dynamic Delta Labels for Open Requisitions & Filled Periods
  const reqDeltaLabel = useMemo(() => {
    if (periodComp.isAllTime) {
      return selectedLocation === "All Locations" ? "All Time Active" : selectedLocation;
    }
    if (prevPeriodOpenings === null) {
      return periodComp.label;
    }
    if (prevPeriodOpenings === 0) {
      return metrics.openRequisitions > 0 ? `+100% ${periodComp.label}` : `0% ${periodComp.label}`;
    }
    const delta = Math.round(((metrics.openRequisitions - prevPeriodOpenings) / prevPeriodOpenings) * 100);
    return `${delta >= 0 ? "+" : ""}${delta}% ${periodComp.label}`;
  }, [periodComp, prevPeriodOpenings, metrics.openRequisitions, selectedLocation]);

  const filledDeltaLabel = useMemo(() => {
    if (periodComp.isAllTime) {
      return "Cumulative Hires";
    }
    if (prevPeriodOpenings === null) {
      return periodComp.label;
    }
    const prevFilled = Math.round(prevPeriodOpenings * 3.7);
    if (prevFilled === 0) {
      return metrics.filledPeriod > 0 ? `+100% ${periodComp.label}` : `0% ${periodComp.label}`;
    }
    const delta = Math.round(((metrics.filledPeriod - prevFilled) / prevFilled) * 100);
    return `${delta >= 0 ? "+" : ""}${delta}% ${periodComp.label}`;
  }, [periodComp, prevPeriodOpenings, metrics.filledPeriod]);

  // Dynamic Non-Static KPI Matrix Computed Directly from Active Requisitions & Case Mart
  const dynamicMatrixKPIs = useMemo(() => {
    // 1. Group active requisitions by role + location
    const reqGroups = new Map<string, RequisitionItem[]>();
    requisitions.forEach((r) => {
      if (r.requisition_status === "FULFILLED" || r.requisition_status === "CANCELLED") return;
      const key = `${r.role_name}:::${r.location_name}`;
      if (!reqGroups.has(key)) reqGroups.set(key, []);
      reqGroups.get(key)!.push(r);
    });

    // 2. Base list of cells: from kpis + active requisitions
    const cellKeys = new Set<string>();
    const allCells: { role: string; loc: string; baseKpi?: VacancyKPI }[] = [];

    kpis.forEach((k) => {
      const key = `${k.role_name}:::${k.location_name}`;
      if (!cellKeys.has(key)) {
        cellKeys.add(key);
        allCells.push({ role: k.role_name, loc: k.location_name, baseKpi: k });
      }
    });

    reqGroups.forEach((_, key) => {
      if (!cellKeys.has(key)) {
        cellKeys.add(key);
        const [role, loc] = key.split(":::");
        allCells.push({ role, loc });
      }
    });

    // 3. Filter & compute dynamic metrics for each cell
    const results: ClusterDemandBreakdown[] = [];

    allCells.forEach((c) => {
      const { role, loc, baseKpi } = c;

      // Filter by global Location & Role hierarchy
      if (!matchesLocationFilter(loc)) return;
      if (!matchesRoleFilter(role)) return;

      const key = `${role}:::${loc}`;
      const groupReqs = reqGroups.get(key) || [];

      // Filter matching requisitions by local filters: hiringTypeFilter, slaFilter, searchQuery
      const matchingReqs = groupReqs.filter((r) => {
        const hiringType = r.hiring_type || (((r as any).demand_type || "").toUpperCase().includes("REPLACE") ? "Replacement" : "Expansion");
        if (hiringTypeFilter !== "ALL" && hiringType !== hiringTypeFilter) return false;
        
        const daysOpen = r.days_open ?? 0;
        const slaTarget = r.sla_target_days ?? 28;
        const slaStat = r.sla_status || (daysOpen > slaTarget ? "BREACHED" : daysOpen > slaTarget - 5 ? "AT_RISK" : "WITHIN_SLA");
        if (slaFilter !== "ALL" && slaStat !== slaFilter) return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matches = role.toLowerCase().includes(q) || loc.toLowerCase().includes(q) || (r.req_code || "").toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      });

      // Filter out if user selected a specific hiring type or SLA and this cell has no matching requisitions
      if (hiringTypeFilter !== "ALL" && matchingReqs.length === 0) {
        if (!baseKpi) return;
        if (hiringTypeFilter === "Replacement" && Number(baseKpi.replacement_share_pct) === 0) return;
        if (hiringTypeFilter === "Expansion" && Number(baseKpi.replacement_share_pct) === 100) return;
      }
      if (slaFilter !== "ALL" && matchingReqs.length === 0) {
        if (!baseKpi) return;
        if (slaFilter === "BREACHED" && Number(baseKpi.beyond_sla_pct) === 0) return;
        if (slaFilter === "WITHIN_SLA" && Number(baseKpi.beyond_sla_pct) > 0) return;
      }
      if (searchQuery.trim() !== "" && matchingReqs.length === 0) {
        const q = searchQuery.toLowerCase();
        if (!role.toLowerCase().includes(q) && !loc.toLowerCase().includes(q)) return;
      }

      // Compute dynamic metrics
      const openReqsCount = matchingReqs.length > 0
        ? matchingReqs.reduce((acc, r) => acc + (r.openings || 1), 0)
        : (baseKpi ? Number(baseKpi.open_requisitions) : 1);

      const replacementCount = matchingReqs.filter((r) => (r.hiring_type || "").toLowerCase().includes("replace")).length;
      const expansionCount = matchingReqs.length - replacementCount;

      let replacementPct = baseKpi ? Number(baseKpi.replacement_share_pct) : 70;
      if (matchingReqs.length > 0) {
        replacementPct = Math.round((replacementCount / matchingReqs.length) * 100);
      }
      if (hiringTypeFilter === "Replacement") replacementPct = 100;
      if (hiringTypeFilter === "Expansion") replacementPct = 0;

      const breachedCount = matchingReqs.filter((r) => (r.days_open ?? 0) > (r.sla_target_days ?? 28)).length;
      let beyondSlaPct = baseKpi ? Number(baseKpi.beyond_sla_pct) : 25;
      if (matchingReqs.length > 0) {
        beyondSlaPct = Math.round((breachedCount / matchingReqs.length) * 100);
      }
      if (slaFilter === "BREACHED") beyondSlaPct = 100;
      if (slaFilter === "WITHIN_SLA") beyondSlaPct = 0;

      const medianTtf = baseKpi ? Number(baseKpi.median_ttf_days) : 29;
      const pressureLevel: "CRITICAL" | "ATTENTION" | "NORMAL" =
        beyondSlaPct > 35 ? "CRITICAL" : beyondSlaPct >= 25 ? "ATTENTION" : "NORMAL";

      // Pool count
      const poolCandidates = talentPool.filter((p) => {
        const rMatch = p.role_target.toLowerCase().includes(role.toLowerCase()) || role.toLowerCase().includes(p.role_target.toLowerCase());
        const lMatch = p.location_preference.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(p.location_preference.toLowerCase());
        return rMatch && (lMatch || loc === "All Locations");
      });
      const readyPoolCount = baseKpi ? Number(baseKpi.talent_pool_count) : (poolCandidates.length || 4);

      // Internal Mobility matches
      const mobilityMatches = fallbackMobilityMatches.filter((m) =>
        m.target_role_name.toLowerCase().includes(role.toLowerCase()) &&
        (m.target_location_name.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(m.target_location_name.toLowerCase()))
      );
      const internalMobilityCount = mobilityMatches.length || Math.max(1, Math.round(openReqsCount * 0.4));

      // Candidates across matching requisitions
      const candidatesList: RequisitionCandidateItem[] = [];
      if (matchingReqs.length > 0) {
        matchingReqs.forEach((r) => {
          candidatesList.push(...getCandidatesForRequisition(r));
        });
      }

      const appliedCount = candidatesList.length > 0
        ? candidatesList.length
        : Math.round(openReqsCount * 6.2);

      // Sourcing Channel Mix
      const channelCounts: Record<string, number> = {
        "Employee Referral": 0,
        "Job Portal": 0,
        "Social Media Ads": 0,
        "Talent Pool": 0,
        "Internal Mobility": 0,
        "Employer Branding": 0,
        "Career Site": 0,
      };

      if (candidatesList.length > 0) {
        candidatesList.forEach((c) => {
          if (c.source_type === "TALENT_POOL" || c.sourcing_metadata?.internal_type === "TALENT_POOL") {
            channelCounts["Talent Pool"]++;
          } else if (c.source_type === "INTERNAL_MOBILITY" || c.sourcing_metadata?.internal_type === "INTERNAL_MOBILITY") {
            channelCounts["Internal Mobility"]++;
          } else if (c.source_type === "EMPLOYEE_REFERRAL" || c.sourcing_metadata?.channel === "EMPLOYEE_REFERRAL") {
            channelCounts["Employee Referral"]++;
          } else if (c.source_type === "JOB_PORTAL" || c.sourcing_metadata?.channel === "JOB_PORTAL") {
            channelCounts["Job Portal"]++;
          } else if (c.source_type === "SOCIAL_MEDIA_ADS" || c.sourcing_metadata?.channel === "SOCIAL_MEDIA_ADS") {
            channelCounts["Social Media Ads"]++;
          } else if (c.source_type === "EMPLOYER_BRANDING" || c.sourcing_metadata?.channel === "EMPLOYER_BRANDING") {
            channelCounts["Employer Branding"]++;
          } else {
            channelCounts["Career Site"]++;
          }
        });
      } else {
        channelCounts["Employee Referral"] = Math.round(appliedCount * 0.35);
        channelCounts["Career Site"] = Math.round(appliedCount * 0.16);
        channelCounts["Job Portal"] = Math.round(appliedCount * 0.16);
        channelCounts["Social Media Ads"] = Math.round(appliedCount * 0.11);
        channelCounts["Talent Pool"] = Math.round(appliedCount * 0.10);
        channelCounts["Employer Branding"] = Math.round(appliedCount * 0.07);
        channelCounts["Internal Mobility"] = Math.max(1, Math.round(appliedCount * 0.05));
      }

      const totalChannels = Object.values(channelCounts).reduce((a, b) => a + b, 0) || 1;
      const channel_mix = Object.entries(channelCounts)
        .map(([channel, count]) => ({
          channel,
          count,
          pct: Math.round((count / totalChannels) * 100),
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count);

      // Stage Funnel Distribution
      const stageRecord: Record<string, number> = {
        "HR Screening": 0,
        "Manager Interview": 0,
        "Technical Audition": 0,
        "Offering Stage": 0,
        "Hired": 0,
      };

      if (candidatesList.length > 0) {
        candidatesList.forEach((c) => {
          const st = c.stage || "HR Screening";
          if (stageRecord[st] !== undefined) stageRecord[st]++;
          else stageRecord["HR Screening"]++;
        });
      } else {
        stageRecord["HR Screening"] = Math.round(appliedCount * 0.45);
        stageRecord["Manager Interview"] = Math.round(appliedCount * 0.28);
        stageRecord["Technical Audition"] = Math.round(appliedCount * 0.15);
        stageRecord["Offering Stage"] = Math.round(appliedCount * 0.08);
        stageRecord["Hired"] = Math.round(appliedCount * 0.04);
      }

      const stage_counts = Object.entries(stageRecord).map(([stage, count]) => ({ stage, count }));

      results.push({
        id: `${role}-${loc}`,
        role_name: role,
        location_name: loc,
        open_requisitions: openReqsCount,
        openings_count: openReqsCount,
        replacement_count: replacementCount,
        expansion_count: expansionCount,
        replacement_share_pct: replacementPct,
        beyond_sla_pct: beyondSlaPct,
        median_ttf_days: medianTtf,
        pressure_level: pressureLevel,
        ready_pool_count: readyPoolCount,
        applied_count: appliedCount,
        internal_mobility_count: internalMobilityCount,
        channel_mix,
        stage_counts,
      });
    });

    return results;
  }, [requisitions, kpis, talentPool, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod, hiringTypeFilter, slaFilter, searchQuery]);

  // Dynamic Funnel Stages based on active filters (Location, Role, and Funnel Source Filter)
  const dynamicFunnelStages = useMemo(() => {
    let baseTopApplicants = Math.max(50, filteredRequisitions.length * 6);
    let stage2Rate = 0.462; // HR Screening
    let stage3Rate = 0.231; // Manager Interview
    let stage4Rate = 0.146; // Formal Offer
    let stage5Rate = 0.133; // Hired

    let stage1Days = 3.2;
    let stage2Days = 6.8;
    let stage3Days = 8.4;
    let stage4Days = 4.1;
    let stage5Days = 5.0;

    const isBali = cityFilter.toLowerCase().includes("bali") || provinceFilter.toLowerCase().includes("bali") || selectedLocation.toLowerCase().includes("bali");
    if (isBali) {
      stage2Days += 1.8;
      stage3Days += 2.2;
    }

    if (funnelSourceFilter === "Frontline Ready Pool") {
      baseTopApplicants = Math.max(16, Math.round(baseTopApplicants * 0.25));
      stage2Rate = 0.95; // Screening bypassed
      stage3Rate = 0.72;
      stage4Rate = 0.55;
      stage5Rate = 0.50;
      stage2Days = 1.0;
      stage3Days = 4.5;
    } else if (funnelSourceFilter === "Internal Mobility") {
      baseTopApplicants = Math.max(12, Math.round(baseTopApplicants * 0.15));
      stage2Rate = 0.90;
      stage3Rate = 0.78;
      stage4Rate = 0.65;
      stage5Rate = 0.62;
      stage2Days = 1.5;
      stage3Days = 5.0;
    } else if (funnelSourceFilter === "Employee Referral") {
      baseTopApplicants = Math.max(25, Math.round(baseTopApplicants * 0.35));
      stage2Rate = 0.74;
      stage3Rate = 0.52;
      stage4Rate = 0.37;
      stage5Rate = 0.34;
      stage2Days = 4.0;
      stage3Days = 6.0;
    } else if (funnelSourceFilter === "Social Media Ads") {
      baseTopApplicants = Math.max(60, Math.round(baseTopApplicants * 0.75));
      stage2Rate = 0.36;
      stage3Rate = 0.14;
      stage4Rate = 0.09;
      stage5Rate = 0.08;
      stage2Days = 8.5;
      stage3Days = 9.8;
    } else if (funnelSourceFilter === "Job Portal") {
      baseTopApplicants = Math.max(50, Math.round(baseTopApplicants * 0.65));
      stage2Rate = 0.42;
      stage3Rate = 0.20;
      stage4Rate = 0.13;
      stage5Rate = 0.11;
      stage2Days = 7.2;
      stage3Days = 8.8;
    } else if (funnelSourceFilter === "Direct Career Site") {
      baseTopApplicants = Math.max(35, Math.round(baseTopApplicants * 0.45));
      stage2Rate = 0.48;
      stage3Rate = 0.26;
      stage4Rate = 0.18;
      stage5Rate = 0.16;
      stage2Days = 5.5;
      stage3Days = 7.0;
    } else if (funnelSourceFilter === "Recruitment Agency") {
      baseTopApplicants = Math.max(10, Math.round(baseTopApplicants * 0.12));
      stage2Rate = 0.68;
      stage3Rate = 0.45;
      stage4Rate = 0.28;
      stage5Rate = 0.25;
      stage2Days = 7.5;
      stage3Days = 9.0;
    }

    const appCount = baseTopApplicants;
    const screenCount = Math.max(1, Math.round(appCount * stage2Rate));
    const interviewCount = Math.max(1, Math.round(appCount * stage3Rate));
    const offerCount = Math.max(1, Math.round(appCount * stage4Rate));
    const hiredCount = Math.max(1, Math.round(appCount * stage5Rate));

    return [
      {
        stage_name: "Applications Received",
        stage_order: 1,
        candidate_count: appCount,
        conversion_from_top_pct: 100,
        median_days_in_stage: stage1Days,
        is_bottleneck: false,
      },
      {
        stage_name: "Initial HR Screening",
        stage_order: 2,
        candidate_count: screenCount,
        conversion_from_top_pct: Number((stage2Rate * 100).toFixed(1)),
        median_days_in_stage: Number(stage2Days.toFixed(1)),
        is_bottleneck: false,
      },
      {
        stage_name: "Hiring Manager Interview",
        stage_order: 3,
        candidate_count: interviewCount,
        conversion_from_top_pct: Number((stage3Rate * 100).toFixed(1)),
        median_days_in_stage: Number(stage3Days.toFixed(1)),
        is_bottleneck: false,
      },
      {
        stage_name: "Formal Offer Extended",
        stage_order: 4,
        candidate_count: offerCount,
        conversion_from_top_pct: Number((stage4Rate * 100).toFixed(1)),
        median_days_in_stage: stage4Days,
        is_bottleneck: false,
      },
      {
        stage_name: "Hired & Onboarded",
        stage_order: 5,
        candidate_count: hiredCount,
        conversion_from_top_pct: Number((stage5Rate * 100).toFixed(1)),
        median_days_in_stage: stage5Days,
        is_bottleneck: false,
      },
    ];
  }, [filteredRequisitions, funnelSourceFilter, cityFilter, provinceFilter, selectedLocation]);

  // Dynamic Sourcing Channels scaled and calculated from active filtered requisitions and 7 standard channels
  const dynamicSourcingChannels = useMemo(() => {
    const baseChannels = [
      {
        channel_name: "Employee Referral",
        category: "Conventional",
        applicantShare: 0.16,
        convRate: 28.1,
        beyondSlaRate: 12.0,
        medianTtf: 21.0,
        offerAccept: 92.4,
        retention6M: 84.5,
        rating: 4.8,
        is_top_channel: true,
      },
      {
        channel_name: "Frontline Ready Pool",
        category: "Fast-Track",
        applicantShare: 0.10,
        convRate: 48.6,
        beyondSlaRate: 8.2,
        medianTtf: 11.0,
        offerAccept: 95.0,
        retention6M: 88.0,
        rating: 4.9,
        is_top_channel: true,
      },
      {
        channel_name: "Internal Mobility",
        category: "Succession",
        applicantShare: 0.08,
        convRate: 62.5,
        beyondSlaRate: 9.5,
        medianTtf: 14.0,
        offerAccept: 96.5,
        retention6M: 91.2,
        rating: 4.9,
        is_top_channel: false,
      },
      {
        channel_name: "Direct Career Site",
        category: "Conventional",
        applicantShare: 0.18,
        convRate: 14.7,
        beyondSlaRate: 22.0,
        medianTtf: 26.0,
        offerAccept: 88.0,
        retention6M: 76.2,
        rating: 4.2,
        is_top_channel: false,
      },
      {
        channel_name: "Job Portal",
        category: "Conventional",
        applicantShare: 0.30,
        convRate: 11.6,
        beyondSlaRate: 26.5,
        medianTtf: 28.5,
        offerAccept: 85.5,
        retention6M: 72.0,
        rating: 3.9,
        is_top_channel: false,
      },
      {
        channel_name: "Social Media Ads",
        category: "Conventional",
        applicantShare: 0.22,
        convRate: 8.4,
        beyondSlaRate: 38.0,
        medianTtf: 33.0,
        offerAccept: 78.0,
        retention6M: 61.4,
        rating: 3.2,
        is_top_channel: false,
      },
      {
        channel_name: "Recruitment Agency",
        category: "Conventional",
        applicantShare: 0.05,
        convRate: 23.2,
        beyondSlaRate: 41.0,
        medianTtf: 36.0,
        offerAccept: 91.0,
        retention6M: 82.0,
        rating: 4.4,
        is_top_channel: false,
      },
    ];

    const currentReqCount = filteredRequisitions.length;
    const isBali = cityFilter.toLowerCase().includes("bali") || provinceFilter.toLowerCase().includes("bali") || selectedLocation.toLowerCase().includes("bali");
    const isOutsideJava = clusterFilter === "Outside Java";

    const ttfAdjustment = isBali ? 5.0 : isOutsideJava ? 3.0 : 0;
    const slaPenalty = isBali ? 8.5 : isOutsideJava ? 4.0 : 0;
    const totalApplicants = Math.max(50, currentReqCount * 6);

    return baseChannels.map((c) => {
      const channelApplicants = Math.max(4, Math.round(totalApplicants * c.applicantShare));
      const channelHires = Math.max(1, Math.round(channelApplicants * (c.convRate / 100)));
      const adjustedConv = Number(((channelHires / channelApplicants) * 100).toFixed(1));
      const adjustedBeyondSla = Number(Math.min(65, c.beyondSlaRate + slaPenalty).toFixed(1));
      const adjustedTtf = Number((c.medianTtf + ttfAdjustment).toFixed(1));

      return {
        channel_name: c.channel_name,
        category: c.category,
        applicants: channelApplicants,
        hires: channelHires,
        conversion_rate_pct: adjustedConv,
        beyond_sla_rate_pct: adjustedBeyondSla,
        median_ttf_days: adjustedTtf,
        offer_acceptance_pct: c.offerAccept,
        six_month_retention_pct: c.retention6M,
        quality_rating: c.rating,
        is_top_channel: c.is_top_channel,
        data_provenance: "OBSERVED_CASE_STUDY" as const,
      };
    });
  }, [filteredRequisitions, cityFilter, provinceFilter, clusterFilter, selectedLocation]);

  // Dynamic Talent Pool filtered by active Location and Role
  const filteredTalentPool = useMemo(() => {
    return talentPool.filter((c) => {
      const locMatch = matchLocationHierarchy(c.location_preference, clusterFilter, provinceFilter, cityFilter);
      const roleMatch = matchRoleHierarchy(c.role_target, jobFamilyFilter, roleFilter);
      return locMatch && roleMatch;
    });
  }, [talentPool, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter]);

  // Dynamic Location Beyond-SLA Friction Heat computed from active requisitions
  const dynamicLocationSlaFriction = useMemo(() => {
    const locMap = new Map<string, { total: number; breached: number }>();
    requisitions.forEach((r) => {
      const loc = r.location_name || (r as any).location;
      if (!loc) return;
      const roleMatch = matchRoleHierarchy(r.role_name || (r as any).role, jobFamilyFilter, roleFilter);
      const periodMatch = matchPeriod((r as any).request_date, selectedPeriod, r.req_code);
      if (!roleMatch || !periodMatch) return;

      if (!locMap.has(loc)) locMap.set(loc, { total: 0, breached: 0 });
      const entry = locMap.get(loc)!;
      entry.total += 1;
      const days = r.days_open ?? (r as any).current_days_open ?? 0;
      const target = r.sla_target_days ?? (r as any).sla_days ?? 28;
      if (days > target || r.sla_status === "BREACHED") {
        entry.breached += 1;
      }
    });

    const result = Array.from(locMap.entries())
      .map(([loc, stats]) => {
        const rate = stats.total > 0 ? Math.round((stats.breached / stats.total) * 1000) / 10 : 0;
        return {
          label: loc,
          value: rate,
          color: rate > 35 ? "#C65353" : rate > 20 ? "#C99400" : "#23C9D3",
        };
      })
      .filter((item) => {
        return matchLocationHierarchy(item.label, clusterFilter, provinceFilter, cityFilter);
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return result.length > 0
      ? result
      : [
          { label: "Bali", value: metrics.beyondSlaRate, color: "#C65353" },
          { label: "Surabaya", value: 28.0, color: "#C99400" },
          { label: "Bandung", value: 20.5, color: "#23C9D3" },
        ];
  }, [requisitions, clusterFilter, provinceFilter, cityFilter, jobFamilyFilter, roleFilter, selectedPeriod, metrics.beyondSlaRate]);

  // Dynamic Hiring Outcomes adjusting current period to reflect active filters
  const dynamicHiringOutcomes = useMemo(() => {
    return hiringOutcomes.map((q, idx) => {
      if (idx === hiringOutcomes.length - 1 && filteredRequisitions.length > 0) {
        return {
          ...q,
          median_ttf_days: metrics.medianTTF,
          beyond_sla_pct: Math.round(metrics.beyondSlaRate * 10) / 10,
        };
      }
      return q;
    });
  }, [hiringOutcomes, filteredRequisitions, metrics.medianTTF, metrics.beyondSlaRate]);

  // Handle Talent Pool fast track simulation
  const handleFastTrack = (candidateName: string) => {
    setFastTrackSuccess(candidateName);
    setTimeout(() => {
      setFastTrackSuccess(null);
    }, 4000);
  };

  // Dynamic Priority TA Signals derived from active filtered requisitions
  const prioritySignals = useMemo(() => {
    const locStats: Record<string, { total: number; breached: number; openings: number }> = {};
    const roleStats: Record<string, { openings: number; breached: number }> = {};

    filteredRequisitions.forEach((r) => {
      const loc = r.location_name || "National";
      const role = r.role_name || "Role";
      const isBreached = r.sla_status === "BREACHED" || (r.days_open ?? 0) > (r.sla_target_days ?? 28);
      const ops = r.openings || 1;

      if (!locStats[loc]) locStats[loc] = { total: 0, breached: 0, openings: 0 };
      locStats[loc].total += 1;
      locStats[loc].openings += ops;
      if (isBreached) locStats[loc].breached += 1;

      if (!roleStats[role]) roleStats[role] = { openings: 0, breached: 0 };
      roleStats[role].openings += ops;
      if (isBreached) roleStats[role].breached += 1;
    });

    const isFilteredLoc = selectedLocation !== "All Locations" && selectedLocation !== "ALL";
    let topLoc = isFilteredLoc ? selectedLocation : "Bali";
    let topBreached = 0;
    let topOpenings = 0;

    if (isFilteredLoc) {
      topLoc = selectedLocation;
      topBreached = locStats[selectedLocation]?.breached || 0;
      topOpenings = locStats[selectedLocation]?.openings || filteredRequisitions.reduce((sum, r) => sum + (r.openings || 1), 0);
    } else {
      const sortedLocs = Object.entries(locStats).sort((a, b) => b[1].breached - a[1].breached || b[1].openings - a[1].openings);
      if (sortedLocs.length > 0) {
        topLoc = sortedLocs[0][0];
        topBreached = sortedLocs[0][1].breached;
        topOpenings = sortedLocs[0][1].openings;
      }
    }

    const matchingPool = talentPool.filter((c) => {
      const pref = (c.location_preference || "").toLowerCase();
      return pref.includes(topLoc.toLowerCase()) || topLoc === "All Locations";
    });

    const sortedRoles = Object.entries(roleStats).sort((a, b) => b[1].openings - a[1].openings);
    const topRoleName = sortedRoles[0] ? sortedRoles[0][0] : "Customer Service";
    const topRoleOpenings = sortedRoles[0] ? sortedRoles[0][1].openings : 4;
    const topRoleBreached = sortedRoles[0] ? sortedRoles[0][1].breached : 2;

    return {
      topLoc,
      topBreached,
      topOpenings: topOpenings || filteredRequisitions.length,
      matchingPoolCount: matchingPool.length > 0 ? matchingPool.length : 12,
      topRoleName,
      topRoleOpenings,
      topRoleBreached,
    };
  }, [filteredRequisitions, selectedLocation, talentPool]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Sub-Header with Lifecycle Context */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
              PRE-HIRE LIFECYCLE
            </span>
            <DataProvenanceBadge
              provenance="OBSERVED_CASE_STUDY"
              domain="Hiring Analysis"
              metricOrEntity="Historical Requisitions & SLAs"
              originalSource="Hiring sheet (1,552 records)"
              governanceRule="Exact empirical time-to-fill and replacement share values."
              impactOnDecision="Pins Bali as priority hotspot (34.0d TTF vs 27.5d national)."
            />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-ink-primary tracking-tight">
            Vacancy Intelligence & Sourcing
          </h1>
          <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
            Prioritize hiring demand by role, location, hiring type, and SLA pressure. Answer which hiring demand TA must focus on first.
          </p>
        </div>

        {/* Stage Switcher and Action Link */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-surface-card p-1 rounded-2xl border border-surface-border shadow-sm">
            <button
              type="button"
              onClick={() => handleStageChange("intake")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                stage === "intake"
                  ? "bg-brand-teal text-surface-ground font-bold shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-surface-ground"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>1. Intake Assessment</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  stage === "intake"
                    ? "bg-surface-ground/20 text-surface-ground"
                    : "bg-brand-teal/15 text-brand-teal"
                }`}
              >
                {incomingRequisitions.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleStageChange("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                stage === "active"
                  ? "bg-brand-teal text-surface-ground font-bold shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-surface-ground"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>2. Active Monitoring</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  stage === "active"
                    ? "bg-surface-ground/20 text-surface-ground"
                    : "bg-brand-teal/15 text-brand-teal"
                }`}
              >
                {filteredRequisitions.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-teal text-surface-ground font-bold text-xs hover:bg-brand-teal/90 transition-all shadow-subtle hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Requisition</span>
          </button>

          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated hover:border-brand-teal/40 transition-all shadow-subtle"
          >
            <Users className="w-4 h-4 text-brand-teal" />
            <span>Team (Post-Hire)</span>
            <ChevronRight className="w-3.5 h-3.5 text-ink-tertiary" />
          </Link>
        </div>
      </div>

      {/* Lifecycle Strip Banner */}
      <LifecycleStrip
        activeStep={currentLifecycleStep}
        onSelectStep={(stepId, targetTab) => {
          if (targetTab && ["overview", "matrix", "funnel", "talent-pool", "outcomes"].includes(targetTab)) {
            handleTabChange(targetTab as VacancyTab);
          }
        }}
        className="my-6"
      />

      {/* 2. Top Executive KPI Row (6 Metric Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Open Requisitions</span>
              <MetricInfoTooltip
                title="Open Requisitions"
                description="Total active headcount openings currently in recruitment across clubs and corporate."
                formula="Sum of openings across all in-flight requisitions"
                benchmark="Baseline capacity: 150–200 active roles nationwide"
                align="left"
              />
            </span>
            <Briefcase className="w-4 h-4 text-brand-teal shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {metrics.openRequisitions}
            </span>
            <span className="text-[11px] font-semibold text-brand-teal">
              {reqDeltaLabel}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Active Openings</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Replacement Share</span>
              <MetricInfoTooltip
                title="Replacement Share"
                description="Proportion of open requisitions created to backfill turnover vs new club expansion."
                formula="(Replacement Openings / Total Requisitions) × 100%"
                benchmark="Healthy: < 60%. Critical (> 70%): signals frontline revolving door churn"
                align="left"
              />
            </span>
            <AlertTriangle className="w-4 h-4 text-status-attention shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-attention">
              {metrics.replacementPct}%
            </span>
            <span className="text-[11px] font-semibold text-status-danger">High Churn</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Exit Backfill Rate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Beyond SLA Rate</span>
              <MetricInfoTooltip
                title="Beyond SLA Rate"
                description="Percentage of active requisitions open longer than the 28-day hiring SLA threshold."
                formula="(Requisitions Open > 28 Days / Total Requisitions) × 100%"
                benchmark="Target: ≤ 20%. Breaches highlight regional sourcing bottlenecks"
                align="center"
              />
            </span>
            <Clock className="w-4 h-4 text-status-danger shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-danger">
              {metrics.beyondSlaRate}%
            </span>
            {selectedLocation === "All Locations" ? (
              <span className="text-[11px] font-semibold text-status-attention">Target: ≤ 20%</span>
            ) : (
              <span className={`text-[11px] font-semibold ${metrics.beyondSlaRate === 0 ? 'text-status-healthy' : 'text-status-danger'}`}>
                {metrics.beyondSlaRate === 0 ? '0% Breached' : 'vs Nat. 27.5%'}
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Target &gt; 28 Days</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Median TTF</span>
              <MetricInfoTooltip
                title="Median Time-to-Fill"
                description="Median elapsed days from requisition opening date to final candidate hiring confirmation."
                formula="Median (Hire Confirmed Date - Requisition Opened Date)"
                benchmark="Target: ≤ 28.0 days (Historical FIT HUB national median is 27.9 days)"
                align="center"
              />
            </span>
            <Target className="w-4 h-4 text-brand-teal shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {metrics.medianTTF}d
            </span>
            {selectedLocation === "All Locations" ? (
              <span className="text-[11px] font-semibold text-brand-teal">Target: 28.0d</span>
            ) : (
              <span className="text-[11px] font-semibold text-brand-teal">Nat. Med: 27.9d</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>National Median</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Pipeline Coverage</span>
              <MetricInfoTooltip
                title="Pipeline Coverage Ratio"
                description="Candidate volume in active screening and interview stages per open headcount vacancy."
                formula="Total Active Candidates / Total Open Openings"
                benchmark="Target: 3.0x–5.0x. < 3.0x indicates talent shortage; > 10.0x signals screening backlog"
                align="right"
              />
            </span>
            <Users className="w-4 h-4 text-brand-teal shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-ink-primary">
              {metrics.pipelineCoverage}x
            </span>
            <span className="text-[11px] font-semibold text-ink-tertiary">Target: 3.0x</span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Active Candidates</span>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal/30 transition-all shadow-subtle relative group/card">
          <div className="flex items-center justify-between text-ink-tertiary text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span>Filled This Period</span>
              <MetricInfoTooltip
                title="Filled This Period"
                description="Total candidate hires confirmed and closed within the active filtered timeframe."
                formula="Count of requisitions transitioned to FULFILLED status"
                benchmark="Tracked against monthly/quarterly club headcount intake targets"
                align="right"
              />
            </span>
            <CheckCircle2 className="w-4 h-4 text-status-healthy shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-status-healthy">
              {metrics.filledPeriod}
            </span>
            <span className="text-[11px] font-semibold text-status-healthy">
              {filledDeltaLabel}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-ink-secondary">
            <span>Hires Complete</span>
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
            <Briefcase className="w-4 h-4" />
            <span>Requisition Health</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-teal/10 text-brand-teal font-mono font-bold">
              {filteredRequisitions.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("funnel")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "funnel"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sourcing & Funnel Intelligence</span>
          </button>

          <button
            onClick={() => handleTabChange("talent-pool")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "talent-pool"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Sparkles className="w-4 h-4 text-status-attention" />
            <span>Supply Talent Pools</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-status-attention/10 text-status-attention font-bold">
              {talentPool.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("outcomes")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "outcomes"
                ? "border-brand-teal text-brand-teal"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quality & Retention</span>
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

      {/* Success Notification for Talent Pool Fast-Track */}
      {fastTrackSuccess && (
        <div className="p-4 rounded-xl bg-status-healthy/10 border border-status-healthy/30 flex items-center justify-between text-status-healthy animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Candidate Fast-Tracked Successfully
              </p>
              <p className="text-xs opacity-90">
                {fastTrackSuccess} has been scheduled for Club GM interview. Projected time to fill reduced from 34 days to 9 days.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFastTrackSuccess(null)}
            className="text-xs underline hover:opacity-75 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. TAB CONTENT: Overview & Requisition Health (Stage 1 Intake & Stage 2 Active) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Action Notification Toasts */}
          {allocationSuccess && (
            <div className="p-4 rounded-xl bg-status-healthy/15 border border-status-healthy/30 flex items-center justify-between text-xs font-semibold text-status-healthy animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{allocationSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setAllocationSuccess(null)}
                className="text-status-healthy/70 hover:text-status-healthy cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {createSuccessMessage && (
            <div className="p-4 rounded-xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-between text-xs font-semibold text-brand-teal animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{createSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setCreateSuccessMessage(null)}
                className="text-brand-teal/70 hover:text-brand-teal cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 1: INTAKE ASSESSMENT (Pre-Monitoring Sourcing Allocation Queue)     */}
          {/* ========================================================================= */}
          {stage === "intake" ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Intake KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface-card border border-surface-border shadow-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-ink-secondary">Incoming Requisitions</span>
                    <Inbox className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div className="text-2xl font-bold font-display text-ink-primary">
                    {incomingRequisitions.length}
                  </div>
                  <div className="text-[11px] text-ink-tertiary mt-1">
                    Awaiting sourcing assessment & triage
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-card border border-surface-border shadow-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-ink-secondary">Tier-1 Ready Pool Eligible</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-display text-emerald-400">
                    {intakeTier1Count}
                  </div>
                  <div className="text-[11px] text-ink-tertiary mt-1">
                    Frontline roles (CS, PT, FC, Housekeeping)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-card border border-surface-border shadow-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-ink-secondary">Tier-2 Mobility Eligible</span>
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-display text-purple-400">
                    {intakeTier2Count}
                  </div>
                  <div className="text-[11px] text-ink-tertiary mt-1">
                    Leadership, Lead Trainer & Ops Managers
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-card border border-surface-border shadow-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-ink-secondary">Intake Allocation SLA</span>
                    <Clock className="w-4 h-4 text-brand-teal" />
                  </div>
                  <div className="text-2xl font-bold font-display text-brand-teal">
                    &lt; 24h
                  </div>
                  <div className="text-[11px] text-ink-tertiary mt-1">
                    Target time to assign sourcing channel
                  </div>
                </div>
              </div>

              {/* Triage Guidance Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/10 via-brand-teal/5 to-transparent border border-brand-teal/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-brand-teal/20 text-brand-teal flex-shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-primary font-display">
                      Strategic Sourcing Triage Engine
                    </h3>
                    <p className="text-xs text-ink-secondary mt-0.5 max-w-2xl leading-relaxed">
                      Every incoming requisition is assessed prior to public job posting. <strong>Tier 1 Staff roles</strong> tap into pre-vetted Frontline Ready Pools to bypass conventional recruitment delays. <strong>Tier 2 Leadership roles</strong> prioritize Internal Mobility and IDP graduates to protect operational context and cut external hiring spend.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-brand-teal text-surface-ground font-bold text-xs hover:bg-brand-teal/90 transition-all shadow-subtle flex items-center justify-center gap-1.5 whitespace-nowrap self-start md:self-auto cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Requisition</span>
                </button>
              </div>

              {/* Local Intake Filter Toolbar */}
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                      type="text"
                      placeholder="Search req code, role, club, or reason..."
                      value={intakeSearchQuery}
                      onChange={(e) => setIntakeSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                    />
                  </div>

                  {/* Tier Filter Pills */}
                  <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                    <button
                      type="button"
                      onClick={() => setIntakeTierFilter("ALL")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        intakeTierFilter === "ALL"
                          ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                          : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      All Tiers ({incomingRequisitions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntakeTierFilter("TIER_1")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        intakeTierFilter === "TIER_1"
                          ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                          : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      Tier-1 Staff ({intakeTier1Count})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntakeTierFilter("TIER_2")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        intakeTierFilter === "TIER_2"
                          ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                          : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      Tier-2 Leadership ({intakeTier2Count})
                    </button>
                  </div>

                  {/* Location Filter */}
                  <select
                    value={intakeLocationFilter}
                    onChange={(e) => setIntakeLocationFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                  >
                    <option value="ALL">All Locations</option>
                    <option value="Bali">Bali</option>
                    <option value="Jabodetabek">Jabodetabek</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Medan">Medan</option>
                  </select>
                </div>

                <div className="text-xs text-ink-tertiary">
                  Showing <span className="font-semibold text-ink-primary">{filteredIncomingRequisitions.length}</span> of {incomingRequisitions.length} pending requisitions
                </div>
              </div>

              {/* Incoming Requisitions Table */}
              <div className="rounded-xl bg-surface-card border border-surface-border overflow-hidden shadow-subtle">
                <div className="p-4 border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-brand-teal" />
                    <h2 className="text-sm font-bold text-ink-primary font-display">
                      Pending Intake Queue (Awaiting Sourcing Allocation)
                    </h2>
                  </div>
                  <span className="text-xs text-ink-tertiary">
                    Click Allocate Sourcing to assign fulfillment pathway
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-xs">
                    <thead>
                      <tr className="bg-surface-ground/70 border-b border-surface-border text-ink-secondary font-semibold">
                        <th className="py-3 px-3">Req Code</th>
                        <th className="py-3 px-3">Position & Job Family</th>
                        <th className="py-3 px-3">Location & Club</th>
                        <th className="py-3 px-3">Tier & Recommended Pathway</th>
                        <th className="py-3 px-3">Turnover / Demand Reason</th>
                        <th className="py-3 px-3 text-center">Openings</th>
                        <th className="py-3 px-3 text-center">Request Date</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {filteredIncomingRequisitions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-ink-tertiary">
                            <Inbox className="w-8 h-8 text-ink-tertiary/40 mx-auto mb-2" />
                            <p className="font-medium text-xs">No requisitions currently pending intake assessment.</p>
                            <p className="text-[11px] mt-0.5">Click &ldquo;Create Requisition&rdquo; above to submit a new headcount request.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredIncomingRequisitions.map((req) => {
                          const isFrontline = ["customer service", "personal trainer", "fitness consultant", "housekeeping"].some((r) =>
                            req.role_name.toLowerCase().includes(r)
                          );
                          const tier = req.tier_number || (isFrontline ? 1 : 2);
                          const isTier1 = tier === 1;

                          const jobFamily = req.job_family || (isFrontline ? "Fitness & Coaching" : "Club Operations");
                          const familyBadge =
                            jobFamily === "Fitness & Coaching"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : jobFamily === "Commercial & Sales"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/30";

                          const recommendedPathway = isTier1 ? "⚡ Frontline Ready Pool" : "✨ Internal Mobility";
                          const pathwayBadge = isTier1
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-purple-500/15 text-purple-400 border-purple-500/30";

                          return (
                            <tr
                              key={req.req_code}
                              className="hover:bg-surface-elevated/70 transition-colors"
                            >
                              <td className="py-3 px-3 font-mono font-bold text-brand-teal whitespace-nowrap">
                                {req.req_code}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-ink-primary text-xs">{req.role_name}</div>
                                <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold border mt-0.5 ${familyBadge}`}>
                                  {jobFamily}
                                </span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="font-semibold text-ink-primary block">{req.location_name}</span>
                                <span className="text-[10px] text-ink-tertiary">{req.club_name || "Central"}</span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-ground border border-surface-border text-ink-secondary">
                                    {isTier1 ? "Tier 1" : "Tier 2"}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pathwayBadge}`}>
                                    {recommendedPathway}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 max-w-[280px]">
                                <p className="text-ink-secondary text-xs truncate">
                                  {req.urgency_reason || "Standard headcount replacement"}
                                </p>
                                {req.linked_exit_code && (
                                  <span className="text-[10px] text-status-critical font-mono font-semibold block mt-0.5">
                                    Linked Exit: {req.linked_exit_code}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-ink-primary whitespace-nowrap">
                                {req.openings || 1}
                              </td>
                              <td className="py-3 px-3 text-center text-ink-tertiary whitespace-nowrap font-mono text-[11px]">
                                {req.request_date || "2026-03-01"}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenIntakeAllocation(req)}
                                  className="px-3 py-1.5 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all shadow-subtle inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <span>Allocate Sourcing</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STAGE 2: ACTIVE MONITORING (Requisition Health & SLA Aging Tracker)       */
            /* ========================================================================= */
            <div className="space-y-6 animate-fadeIn">
              {/* Demand Share Visualizer & SLA Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <SectionCard
                    title="Hiring Demand Composition: Replacement vs Expansion"
                    description="Breakdown of open requisitions generated by employee turnover versus new club expansion."
                    note="68.1% of requisitions backfill exited employees (fithub_analysis.ipynb Section 3 finding)."
                  >
                    <div className="pt-2">
                      <StackedBarShare
                        segments={[
                          {
                            label: "Replacement",
                            value: metrics.replacementCount,
                            pct: metrics.replacementPct,
                            color: "#1D3557",
                          },
                          {
                            label: "New Expansion",
                            value: metrics.expansionCount,
                            pct: metrics.expansionPct,
                            color: "#23C9D3",
                          },
                        ]}
                        totalLabel={`${filteredRequisitions.length} Filtered Requisitions`}
                      />
                    </div>
                  </SectionCard>
                </div>
                <div>
                  <SectionCard
                    title="SLA Compliance Split"
                    description="Proportion of requisitions currently within target SLA."
                    note="Target SLA: 28 days standard, 45 days in Bali."
                  >
                    <div className="pt-2">
                      <SimpleBar
                        data={[
                          { label: "Within SLA", value: Math.max(0, 100 - metrics.beyondSlaRate) },
                          { label: "Beyond SLA", value: metrics.beyondSlaRate },
                        ]}
                        barColor="#23C9D3"
                        height={160}
                        unit="%"
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* Local Filter Toolbar */}
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                      type="text"
                      placeholder="Search code, role, club, or GM..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                    />
                  </div>

                  {/* Hiring Type Pills */}
                  <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                    {(["ALL", "Replacement", "Expansion"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setHiringTypeFilter(type)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          hiringTypeFilter === type
                            ? "bg-surface-card text-brand-teal shadow-subtle font-semibold"
                            : "text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {type === "ALL" ? "All Types" : type}
                      </button>
                    ))}
                  </div>

                  {/* SLA Status Pills */}
                  <div className="flex items-center gap-1 bg-surface-ground p-1 rounded-lg border border-surface-border text-xs">
                    {(["ALL", "WITHIN_SLA", "AT_RISK", "BREACHED"] as const).map((sla) => (
                      <button
                        key={sla}
                        type="button"
                        onClick={() => setSlaFilter(sla)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                          slaFilter === sla
                            ? "bg-surface-card text-ink-primary shadow-subtle font-semibold"
                            : "text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {sla === "ALL"
                          ? "All SLAs"
                          : sla === "WITHIN_SLA"
                          ? "Within SLA"
                          : sla === "AT_RISK"
                          ? "At Risk"
                          : "Breached"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-View Switcher: List View vs Role x Location Matrix */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 p-1 bg-surface-ground rounded-xl border border-surface-border">
                    <button
                      type="button"
                      onClick={() => setMonitoringViewMode("LIST")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        monitoringViewMode === "LIST"
                          ? "bg-brand-teal text-surface-ground shadow-sm"
                          : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Requisition List View ({filteredRequisitions.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonitoringViewMode("MATRIX")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        monitoringViewMode === "MATRIX"
                          ? "bg-brand-teal text-surface-ground shadow-sm"
                          : "text-ink-secondary hover:text-ink-primary"
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Role × Location Heatmap Matrix ({dynamicMatrixKPIs.length})</span>
                    </button>
                  </div>

                  <div className="text-xs text-ink-tertiary">
                    {monitoringViewMode === "LIST" ? (
                      <>Showing <span className="font-semibold text-ink-primary">{filteredRequisitions.length}</span> active in-flight requisitions</>
                    ) : (
                      <>Showing <span className="font-semibold text-ink-primary">{dynamicMatrixKPIs.length}</span> aggregated demand matrix cells</>
                    )}
                  </div>
                </div>
              </div>

              {monitoringViewMode === "LIST" ? (
                /* Main 12-Column Layout */
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left 8 Columns: Requisitions Table */}
                <div className="xl:col-span-8 space-y-4">
                  <div className="rounded-xl bg-surface-card border border-surface-border overflow-hidden shadow-subtle">
                    <div className="p-4 border-b border-surface-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-brand-teal" />
                        <h2 className="text-sm font-bold text-ink-primary font-display">
                          Active Requisitions & SLA Aging
                        </h2>
                      </div>
                      <span className="text-xs text-ink-tertiary">
                        Click row to view full requisition details and linked exit
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[980px] text-left text-xs">
                        <thead>
                          <tr className="bg-surface-ground/70 border-b border-surface-border text-ink-secondary font-semibold">
                            <th className="py-3 px-3">Req Code</th>
                            <th className="py-3 px-3">Position & Job Family</th>
                            <th className="py-3 px-3">Location & Club</th>
                            <th className="py-3 px-3">Sourcing Pathway</th>
                            <th className="py-3 px-3">Candidate / Assignee</th>
                            <th className="py-3 px-3">Current Stage</th>
                            <th className="py-3 px-3 text-center">Days Open / SLA</th>
                            <th className="py-3 px-3 text-center">Health</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                          {filteredRequisitions.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-8 text-center text-ink-tertiary">
                                No active requisitions match the selected filters.
                              </td>
                            </tr>
                          ) : (
                            filteredRequisitions.map((req) => {
                              const code = req.req_code || (req as any).id || "REQ-0000";
                              const role = req.role_name || (req as any).role || "Frontline Role";
                              const loc = req.location_name || (req as any).location || "National";
                              const days = req.days_open ?? (req as any).current_days_open ?? 25;
                              const target = req.sla_target_days ?? (req as any).sla_days ?? 28;
                              const stat = (req.sla_status || (days > target ? "BREACHED" : days > target - 5 ? "AT_RISK" : "WITHIN_SLA")).toUpperCase();
                              const health = req.health || (stat === "BREACHED" ? "Critical" : stat === "AT_RISK" ? "At Risk" : "Healthy");
                              const stageName = req.current_stage || req.bottleneck_stage || "HR Screening";

                              const tier = req.tier_number || (["Customer Service", "Personal Trainer", "Fitness Consultant"].includes(role) ? 1 : 2);
                              const isTier1 = tier === 1;

                              const jobFamily = req.job_family || (
                                ["Customer Service", "Customer Service Leader", "Club Manager", "Operation Manager", "Area General Manager"].includes(role)
                                  ? "Club Operations"
                                  : ["Personal Trainer", "Personal Trainer Leader", "PT Team Leader", "Fitness Lead", "Fitness Manager", "Personal Trainer Master"].includes(role)
                                  ? "Fitness & Coaching"
                                  : "Commercial & Sales"
                              );

                              const familyBadge =
                                jobFamily === "Fitness & Coaching"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : jobFamily === "Commercial & Sales"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                  : "bg-sky-500/10 text-sky-400 border-sky-500/30";

                              const primarySource = req.sourcing_channel || (
                                isTier1
                                  ? "⚡ Frontline Ready Pool"
                                  : tier >= 2
                                  ? "✨ Internal Mobility"
                                  : "🌐 Conventional ATS"
                              );

                              const sourceBadge = primarySource.includes("Pool")
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : primarySource.includes("Mobility")
                                ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                : "bg-sky-500/15 text-sky-400 border-sky-500/30";

                              const assignedCandidate = req.assigned_candidates && req.assigned_candidates.length > 0
                                ? req.assigned_candidates[0]
                                : null;

                              return (
                                <tr
                                  key={code}
                                  onClick={() => setDetailModalReq(req)}
                                  className="hover:bg-surface-elevated/80 transition-colors cursor-pointer group"
                                >
                                  <td className="py-3 px-3 font-mono font-bold text-brand-teal group-hover:underline whitespace-nowrap">
                                    {code}
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-bold text-ink-primary text-xs">{role}</div>
                                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold border mt-0.5 ${familyBadge}`}>
                                      {jobFamily}
                                    </span>
                                  </td>

                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className="font-semibold text-ink-primary block">{loc}</span>
                                    <span className="text-[10px] text-ink-tertiary">{req.club_name || "Central"}</span>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sourceBadge}`}>
                                        {primarySource}
                                      </span>
                                      {req.external_tracker_url && (
                                        <a
                                          href={req.external_tracker_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="p-1 rounded bg-surface-ground hover:bg-surface-border text-brand-teal transition-colors"
                                          title="Open Google Sheet Tracker"
                                        >
                                          <FileSpreadsheet className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    {assignedCandidate ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-brand-teal/20 text-brand-teal font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                          {assignedCandidate.name.charAt(0)}
                                        </div>
                                        <div className="truncate max-w-[130px]">
                                          <div className="font-bold text-ink-primary text-xs truncate">
                                            {assignedCandidate.name}
                                          </div>
                                          {assignedCandidate.fit_score && (
                                            <span className="text-[9px] text-emerald-400 font-semibold block">
                                              {assignedCandidate.fit_score}% Fit
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <span className="text-ink-secondary text-xs font-semibold block">
                                          {req.pipeline_size || 8} Applicants
                                        </span>
                                        <span className="text-[10px] text-ink-tertiary">
                                          In Pipeline
                                        </span>
                                      </div>
                                    )}
                                  </td>

                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-ground border border-surface-border text-ink-primary">
                                      {stageName}
                                    </span>
                                  </td>

                                  <td className="py-3 px-3 text-center whitespace-nowrap">
                                    <span className={`font-mono font-bold block text-xs ${
                                      days > target
                                        ? "text-status-danger"
                                        : days > target - 5
                                        ? "text-status-attention"
                                        : "text-ink-primary"
                                    }`}>
                                      {days}d <span className="text-[10px] font-normal text-ink-tertiary">/ {target}d</span>
                                    </span>
                                    <div className="w-16 mx-auto bg-surface-ground h-1 rounded-full overflow-hidden mt-1 border border-surface-border/60">
                                      <div
                                        className={`h-full rounded-full ${
                                          days > target
                                            ? "bg-status-danger"
                                            : days > target - 5
                                            ? "bg-status-attention"
                                            : "bg-brand-teal"
                                        }`}
                                        style={{ width: `${Math.min(100, (days / target) * 100)}%` }}
                                      />
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 text-center whitespace-nowrap">
                                    {health === "Healthy" ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-healthy px-2 py-0.5 rounded-full bg-status-healthy/10 border border-status-healthy/20">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Healthy</span>
                                      </span>
                                    ) : health === "At Risk" ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-attention px-2 py-0.5 rounded-full bg-status-attention/10 border border-status-attention/20">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>At Risk</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-danger px-2 py-0.5 rounded-full bg-status-danger/10 border border-status-danger/20">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Critical</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3 px-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDetailModalReq(req);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg bg-surface-ground hover:bg-surface-card text-ink-primary border border-surface-border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                        title="View Requisition Details & Candidate Pipeline"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-brand-teal" />
                                        <span>Detail</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Lifecycle Continuity Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-brand-teal/5 to-transparent border border-brand-teal/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-teal/10 text-brand-teal">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink-primary">
                          Turnover-to-Requisition Continuity
                        </h4>
                        <p className="text-[11px] text-ink-secondary">
                          68.1% of active requisitions are triggered by employee exit signals. Integrating offboarding predictions reduces backfill latency by 18 days.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/team"
                      className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs font-bold text-ink-primary hover:bg-surface-elevated hover:border-brand-teal/40 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <span>Explore Turnover Signals</span>
                      <ArrowRight className="w-3 h-3 text-brand-teal" />
                    </Link>
                  </div>
                </div>

                {/* Right 4 Columns: Priority Signals & Action Directives */}
                <div className="xl:col-span-4 space-y-4">
                  {/* Priority Signal Card 1: Dynamic Top Location Pressure */}
                  <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/20 hover:border-status-danger/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-danger/20 text-status-danger uppercase">
                        CRITICAL CLUSTER PRESSURE
                      </span>
                      <span className="text-[11px] text-ink-tertiary font-semibold">{prioritySignals.topLoc} Cluster</span>
                    </div>
                    <h4 className="text-sm font-bold text-ink-primary mb-1">
                      {prioritySignals.topLoc} Cluster SLA Defense
                    </h4>
                    <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                      {prioritySignals.topBreached > 0
                        ? `In ${prioritySignals.topLoc}, ${prioritySignals.topBreached} open requisitions are past or near SLA target. Fast-track activation reduces median time-to-fill from 34d to 9-12d.`
                        : `In ${prioritySignals.topLoc}, ${prioritySignals.topOpenings} active open requisitions are monitored. Proactive candidate banks protect shift continuity.`}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 p-2 bg-surface-ground rounded-lg border border-surface-border">
                      <div>
                        <span className="text-ink-tertiary block">Open Reqs:</span>
                        <span className="font-bold text-ink-primary">{prioritySignals.topOpenings} Openings</span>
                      </div>
                      <div>
                        <span className="text-ink-tertiary block">Ready Pool:</span>
                        <span className="font-bold text-brand-teal">{prioritySignals.matchingPoolCount} Verified Candidates</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("talent-pool")}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-status-danger text-surface-ground text-xs font-bold hover:bg-status-danger/90 transition-colors text-center cursor-pointer"
                      >
                        Activate {prioritySignals.topLoc} Pool
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("funnel")}
                        className="py-1.5 px-3 rounded-lg bg-surface-ground border border-surface-border text-ink-primary text-xs font-medium hover:bg-surface-elevated transition-colors cursor-pointer"
                      >
                        Funnel
                      </button>
                    </div>
                  </div>

                  {/* Priority Signal Card 2: Dynamic Top Role */}
                  <div className="p-4 rounded-xl bg-status-attention/5 border border-status-attention/20 hover:border-status-attention/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-attention/20 text-status-attention uppercase">
                        SYSTEMIC SIGNAL #2
                      </span>
                      <span className="text-[11px] text-ink-tertiary font-semibold">{prioritySignals.topRoleName}</span>
                    </div>
                    <h4 className="text-sm font-bold text-ink-primary mb-1">
                      {prioritySignals.topRoleName} Turnover & Shift Churn
                    </h4>
                    <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                      {prioritySignals.topRoleOpenings} open positions for {prioritySignals.topRoleName}. Pre-screening shift expectations and deploying from verified Ready Pool cuts early onboarding drop-off.
                    </p>
                    <div className="p-2.5 rounded-lg bg-surface-ground border border-surface-border mb-3 text-[11px]">
                      <span className="font-semibold text-ink-primary block mb-0.5">
                        Recommended Intervention:
                      </span>
                      <span className="text-ink-secondary">
                        Pre-screen shift expectations asynchronously and fast-track ex-finalists to bypass 6.8 days screening bottleneck.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("funnel")}
                      className="w-full py-1.5 px-3 rounded-lg bg-surface-card border border-surface-border text-ink-primary text-xs font-bold hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Inspect Screening Bottlenecks</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-teal" />
                    </button>
                  </div>

                </div>
              </div>
              ) : (
                /* Sub-View: Role x Location Hiring Demand & SLA Matrix */
                <div className="rounded-xl bg-surface-card border border-surface-border p-4 space-y-4 shadow-subtle animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                      <h2 className="text-sm font-bold text-ink-primary font-display flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand-teal" />
                        <span>Role × Location Hiring Demand & SLA Heatmap Matrix</span>
                      </h2>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        Cross-tabulation of open headcount, replacement pressure, and SLA compliance aggregated by operational cluster.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-status-danger font-medium">
                        <span className="w-2.5 h-2.5 rounded bg-status-danger" /> Critical (&gt; 35% breach)
                      </span>
                      <span className="flex items-center gap-1 text-status-attention font-medium">
                        <span className="w-2.5 h-2.5 rounded bg-status-attention" /> Attention (25-35%)
                      </span>
                      <span className="flex items-center gap-1 text-status-healthy font-medium">
                        <span className="w-2.5 h-2.5 rounded bg-status-healthy" /> Normal (&lt; 25%)
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                          <th className="py-3 px-4">Role / Job Family</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-3 text-center">Open Reqs</th>
                          <th className="py-3 px-3 text-center">Replacement Share</th>
                          <th className="py-3 px-3 text-center">Beyond SLA Rate</th>
                          <th className="py-3 px-3 text-center">Median TTF</th>
                          <th className="py-3 px-4 text-center">Pressure Tier</th>
                          <th className="py-3 px-4">Ready Pool</th>
                          <th className="py-3 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-border">
                        {dynamicMatrixKPIs.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-ink-tertiary">
                              No demand matrix records match the active filters ({hiringTypeFilter !== "ALL" ? `Type: ${hiringTypeFilter}, ` : ""}{slaFilter !== "ALL" ? `SLA: ${slaFilter}, ` : ""}Location: {locationDisplay}, Role: {roleDisplay}).
                            </td>
                          </tr>
                        ) : (
                          dynamicMatrixKPIs.map((cell) => (
                            <tr
                              key={cell.id}
                              className={`hover:bg-surface-elevated/70 transition-colors ${
                                cell.pressure_level === "CRITICAL"
                                  ? "bg-status-danger/5"
                                  : cell.pressure_level === "ATTENTION"
                                  ? "bg-status-attention/5"
                                  : ""
                              }`}
                            >
                              <td className="py-3 px-4 font-semibold text-ink-primary">
                                {cell.role_name}
                              </td>
                              <td className="py-3 px-4 font-medium text-ink-secondary">
                                {cell.location_name}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-ink-primary">
                                {cell.open_requisitions}
                              </td>
                              <td className="py-3 px-3 text-center font-mono">
                                <span className={cell.replacement_share_pct > 75 ? "text-status-danger font-bold" : "text-ink-primary"}>
                                  {cell.replacement_share_pct}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-mono">
                                <span className={cell.beyond_sla_pct > 30 ? "text-status-danger font-bold" : "text-ink-primary"}>
                                  {cell.beyond_sla_pct}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-medium">
                                {cell.median_ttf_days} days
                              </td>
                              <td className="py-3 px-4 text-center">
                                {cell.pressure_level === "CRITICAL" ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-danger/20 text-status-danger border border-status-danger/30">
                                    CRITICAL
                                  </span>
                                ) : cell.pressure_level === "ATTENTION" ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-attention/20 text-status-attention border border-status-attention/30">
                                    ATTENTION
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-healthy/20 text-status-healthy border border-status-healthy/30">
                                    NORMAL
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-brand-teal">{cell.ready_pool_count} ready</span>
                                  <span className="text-[10px] text-ink-tertiary">
                                    ({cell.open_requisitions > 0 ? Math.round((cell.ready_pool_count / cell.open_requisitions) * 100) : 100}% cov)
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMatrixCell(cell)}
                                  className="px-2.5 py-1 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/30 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                                >
                                  <BarChart2 className="w-3.5 h-3.5" />
                                  <span>View Breakdown</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Strategic Takeaway Box */}
                  <div className="mt-4 p-4 rounded-xl bg-surface-ground border border-surface-border">
                    <h4 className="text-xs font-bold text-ink-primary mb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Cluster Demand Takeaway</span>
                    </h4>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Operational replacement crunch is concentrated in regional expansion hubs (Bali & Surabaya). TA capacity must prioritize local ready pool allocation over generic external postings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB CONTENT: Sourcing & Funnel Diagnosis */}
      {activeTab === "funnel" && (
        <div className="space-y-6">
          {/* Funnel Local Filter Bar */}
          <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-wrap items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-teal" />
              <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                Funnel Slice Filters:
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Sourcing Channel Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-ink-secondary">Source Channel:</span>
                <select
                  value={funnelSourceFilter}
                  onChange={(e) => setFunnelSourceFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-ground border border-surface-border text-xs font-semibold text-ink-primary focus:outline-none focus:border-brand-teal cursor-pointer"
                >
                  <option value="ALL">All Sources (Aggregated)</option>
                  <option value="Employee Referral">Employee Referral (High Retention)</option>
                  <option value="Frontline Ready Pool">Frontline Ready Pool (Fast-Track)</option>
                  <option value="Internal Mobility">Internal Mobility (Succession)</option>
                  <option value="Direct Career Site">Direct Career Site</option>
                  <option value="Job Portal">Job Portal (Aggregator)</option>
                  <option value="Social Media Ads">Social Media Ads (IG / TikTok)</option>
                  <option value="Recruitment Agency">Recruitment Agency</option>
                </select>
              </div>

              {/* Active Location Indicator Pill */}
              <div className="px-2.5 py-1 rounded-lg bg-surface-ground border border-surface-border text-xs text-ink-secondary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                <span className="font-semibold text-ink-primary">{locationDisplay}</span>
              </div>

              {/* Active Role Indicator Pill */}
              <div className="px-2.5 py-1 rounded-lg bg-surface-ground border border-surface-border text-xs text-ink-secondary flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-teal" />
                <span className="font-semibold text-ink-primary">{roleDisplay}</span>
              </div>

              {/* Reset filter button if not ALL */}
              {funnelSourceFilter !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setFunnelSourceFilter("ALL")}
                  className="px-2.5 py-1 rounded-lg bg-surface-ground hover:bg-surface-elevated text-xs font-semibold text-brand-teal border border-brand-teal/40 cursor-pointer transition-colors"
                >
                  Reset Source
                </button>
              )}
            </div>
          </div>

          {/* Funnel Stepped Visualization */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-teal" />
                  <span>Recruitment Funnel Conversion Analysis</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Tracking candidate progression and attrition from initial application to signed offer across active requisitions.
                </p>
              </div>
            </div>

            {/* Visual Recharts Funnel Waterfall */}
            <div className="mb-6 p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <div className="flex items-center justify-between mb-2">
                <span className="label-xs text-ink-secondary">Funnel Stage Progression &amp; Conversion</span>
                {funnelSourceFilter !== "ALL" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                    Filtered: {funnelSourceFilter}
                  </span>
                )}
              </div>
              <FunnelWaterfall
                stages={dynamicFunnelStages.map((s) => ({
                  stage: s.stage_name,
                  count: s.candidate_count,
                  ratePct: s.conversion_from_top_pct,
                }))}
              />
            </div>

            {/* Visual Funnel Bars */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-4">
              {dynamicFunnelStages.map((stage) => (
                <div
                  key={stage.stage_name}
                  className="p-4 rounded-xl border border-surface-border bg-surface-ground hover:border-brand-teal/40 transition-all"
                >
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase">
                    Stage {stage.stage_order}
                  </span>
                  <h4 className="text-xs font-bold text-ink-primary mt-0.5 mb-2 line-clamp-1">
                    {stage.stage_name}
                  </h4>
                  <div className="text-xl font-display font-black text-ink-primary mb-1">
                    {stage.candidate_count.toLocaleString()}
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-ink-secondary">
                      <span>Top Conversion:</span>
                      <span className="font-bold text-ink-primary">{stage.conversion_from_top_pct}%</span>
                    </div>
                    <div className="flex justify-between text-ink-secondary">
                      <span>Time in Stage:</span>
                      <span className="font-semibold text-ink-primary">
                        {stage.median_days_in_stage} days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sourcing Channel Effectiveness Table */}
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink-primary font-display flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-teal" />
                  <span>Sourcing Channel Quality &amp; Downstream Retention</span>
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Dynamic performance breakdown across all 7 operational sourcing pathways.
                </p>
              </div>
            </div>

            {/* Visual Recharts Sourcing Mix */}
            <div className="mb-6 p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <span className="label-xs text-ink-secondary block mb-3">Hire Volume Contribution by Channel</span>
              <ColoredBar
                data={dynamicSourcingChannels.map((c) => ({
                  label: c.channel_name,
                  value: c.hires,
                  color: c.channel_name === "Employee Referral" ? "#23C9D3" : c.channel_name === "Frontline Ready Pool" ? "#10B981" : c.channel_name === "Internal Mobility" ? "#A855F7" : "#1D3557",
                }))}
                dataKey="value"
                categoryKey="label"
                horizontal={true}
                height={230}
                unit="hires"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-ground border-b border-surface-border text-ink-secondary font-semibold">
                    <th className="py-3 px-4">Sourcing Channel</th>
                    <th className="py-3 px-3 text-center">Category</th>
                    <th className="py-3 px-3 text-center">Applicants</th>
                    <th className="py-3 px-3 text-center">Hires</th>
                    <th className="py-3 px-3 text-center">Hire Conversion</th>
                    <th className="py-3 px-3 text-center">Delayed Hires (Abs)</th>
                    <th className="py-3 px-3 text-center">Beyond SLA Rate (%)</th>
                    <th className="py-3 px-3 text-center">Median TTF</th>
                    <th className="py-3 px-3 text-center">Offer Acceptance</th>
                    <th className="py-3 px-3 text-center">6M Retention</th>
                    <th className="py-3 px-3 text-center">Quality Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {dynamicSourcingChannels.map((channel) => {
                    const delayedCount = Math.round(channel.hires * (channel.beyond_sla_rate_pct / 100));
                    const isSelectedInFilter = funnelSourceFilter === channel.channel_name;
                    return (
                      <tr
                        key={channel.channel_name}
                        onClick={() => setFunnelSourceFilter(isSelectedInFilter ? "ALL" : channel.channel_name)}
                        className={`hover:bg-surface-elevated/70 transition-colors cursor-pointer ${
                          isSelectedInFilter
                            ? "bg-brand-teal/15 font-bold"
                            : channel.channel_name === "Employee Referral"
                            ? "bg-brand-teal/5 font-medium"
                            : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink-primary">
                              {channel.channel_name}
                            </span>
                            {channel.is_top_channel && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-teal text-surface-ground">
                                TOP CHANNEL
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            channel.category === "Fast-Track"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : channel.category === "Succession"
                              ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              : "bg-surface-ground text-ink-tertiary border border-surface-border"
                          }`}>
                            {channel.category || "Conventional"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-ink-secondary">
                          {channel.applicants}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-ink-primary">
                          {channel.hires}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={channel.conversion_rate_pct > 25 ? "text-status-healthy font-bold" : "text-ink-primary"}>
                            {channel.conversion_rate_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-status-danger">
                          {delayedCount} hires
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={channel.beyond_sla_rate_pct > 30 ? "text-status-danger font-bold" : "text-ink-primary"}>
                            {channel.beyond_sla_rate_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium">
                          {channel.median_ttf_days}d
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {channel.offer_acceptance_pct}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={channel.six_month_retention_pct >= 80 ? "text-status-healthy font-bold" : channel.six_month_retention_pct < 65 ? "text-status-danger font-bold" : "text-ink-primary"}>
                            {channel.six_month_retention_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-ink-primary">
                            <span className="text-status-attention">&#9733;</span>
                            <span>{channel.quality_rating}</span>
                          </div>
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

      {/* 7. TAB CONTENT: Frontline Ready Pool */}
      {activeTab === "talent-pool" && (
        <div className="space-y-6">
          {/* Allocation Mode Banner if navigated from Stage 1 Intake Triage */}
          {allocatingReq && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                      {allocatingReq.req_code}
                    </span>
                    <span className="text-xs font-bold text-ink-primary">
                      Requisition Allocation Mode
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Select any pre-screened candidate below to allocate directly to <strong>{allocatingReq.role_name}</strong> in {allocatingReq.location_name} ({allocatingReq.club_name || "Central"}).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedIntakeReq(allocatingReq);
                  setAllocatingReq(null);
                  setActiveTab("overview");
                  setStage("intake");
                }}
                className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors whitespace-nowrap cursor-pointer"
              >
                Return to Allocation Drawer
              </button>
            </div>
          )}

          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-attention/20 text-status-attention uppercase">
                    Recommendation 3 Enabler
                  </span>
                  <DataProvenanceBadge
                    provenance="SYNTHETIC_ENABLER"
                    domain="Talent Pool"
                    metricOrEntity="Ready Frontline Roster"
                    originalSource="010_internal_mobility_engine.sql"
                    governanceRule="Illustrative verified candidates for agile backfilling"
                    impactOnDecision="Cuts TTF from 34 days to under 14 days"
                  />
                </div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-status-attention" />
                  <span>Proactive Frontline Talent Pool</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Pre-qualified candidates and previous high-score finalists ready for immediate deployment when vacancies occur.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-ink-tertiary block">Average Time to Deploy:</span>
                  <span className="text-sm font-bold text-status-healthy font-mono">&lt; 12 Days (vs 34d standard)</span>
                </div>
              </div>
            </div>

            {/* Talent Pool Candidates Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
              {filteredTalentPool.length === 0 ? (
                <div className="col-span-full p-8 text-center text-ink-tertiary bg-surface-ground rounded-xl border border-surface-border">
                  No pre-screened talent pool candidates match the selected location ({locationDisplay}) and role ({roleDisplay}) filters.
                </div>
              ) : (
                filteredTalentPool.map((c) => (
                <div
                  key={c.candidate_id}
                  className="p-4 rounded-xl bg-surface-ground border border-surface-border hover:border-brand-teal/40 transition-all shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-ink-tertiary">
                        {c.candidate_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.readiness_status === "Interview Ready"
                          ? "bg-status-healthy/10 text-status-healthy border border-status-healthy/30"
                          : c.readiness_status === "Pre-qualified"
                          ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/30"
                          : "bg-status-attention/10 text-status-attention border border-status-attention/30"
                      }`}>
                        {c.readiness_status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink-primary">
                      {c.display_name}
                    </h3>
                    <div className="text-xs text-brand-teal font-semibold mt-0.5">
                      {c.role_target} &bull; {c.location_preference}
                    </div>

                    <div className="mt-3 p-2 rounded-lg bg-surface-card border border-surface-border space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Fit Score:</span>
                        <span className="font-bold text-status-healthy">{c.fit_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Source:</span>
                        <span className="font-medium text-ink-primary">{c.source_channel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-tertiary">Est. Fill Time:</span>
                        <span className="font-bold text-brand-teal">{c.est_ttf_days} days</span>
                      </div>
                    </div>

                    {/* Competency Tags */}
                    <div className="mt-3">
                      <span className="text-[10px] font-semibold text-ink-tertiary block mb-1">
                        Verified Core Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {c.verified_competencies.map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-surface-card border border-surface-border text-ink-secondary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-ink-secondary mt-3 italic line-clamp-2">
                      &ldquo;{c.notes}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border">
                    {allocatingReq ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIntakeSelectedCandidate(c);
                          setSelectedIntakeReq(allocatingReq);
                          setAllocatingReq(null);
                          setActiveTab("overview");
                          setStage("intake");
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 text-surface-ground text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Allocate to {allocatingReq.req_code}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleFastTrack(c.display_name)}
                        className="w-full py-1.5 px-3 rounded-lg bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Fast-Track to Interview</span>
                      </button>
                    )}
                  </div>
                </div>
              )))}
            </div>

            {/* Talent Pool Business Value Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-status-attention/10 to-transparent border border-status-attention/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-ink-primary">
                  Operational Impact of Frontline Talent Pools
                </h4>
                <p className="text-[11px] text-ink-secondary mt-0.5">
                  Maintaining a pre-screened pool of ex-finalists and referrals reduces median TTF from 34.0 days to 9.5 days in Bali, protecting club revenue continuity.
                </p>
              </div>
              <Link
                href="/team#mobility"
                className="px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-elevated transition-colors whitespace-nowrap"
              >
                Inspect Internal Staff Mobility &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: Quality & SLA Outcomes */}
      {activeTab === "outcomes" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-ink-primary font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-teal" />
                  <span>Hiring Outcomes & Quality of Hire Trajectory</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Section 19: Long-term measurement of SLA compliance, fill velocity, and downstream employee retention.
                </p>
              </div>
              <DataProvenanceBadge
                provenance="DERIVED"
                domain="Hiring Performance"
                metricOrEntity="Quarterly Trajectory"
                originalSource="Hiring sheet + Retention Mart"
                governanceRule="Derived quarter-over-quarter trend"
                impactOnDecision="Proves efficacy of proactive sourcing and buddy onboarding"
              />
            </div>

            {/* Recharts Visual Trajectory Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-2">Time-to-Fill (TTF) Trajectory (Days)</span>
                <SimpleLine
                  data={dynamicHiringOutcomes.map((q) => ({
                    label: q.period_label,
                    value: q.median_ttf_days,
                  }))}
                  unit="days"
                  strokeColor="#23C9D3"
                  height={220}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
                <span className="label-xs text-ink-secondary block mb-2">Location Beyond-SLA Friction Heat</span>
                <ColoredBar
                  data={dynamicLocationSlaFriction}
                  dataKey="value"
                  categoryKey="label"
                  unit="%"
                  height={220}
                />
              </div>
            </div>

            {/* Quarterly Trend Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
              {dynamicHiringOutcomes.map((q, idx) => (
                <div
                  key={q.period_label}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === hiringOutcomes.length - 1
                      ? "bg-brand-teal/5 border-brand-teal/30 shadow-subtle"
                      : "bg-surface-ground border-surface-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-ink-primary">
                      {q.period_label}
                    </span>
                    {idx === hiringOutcomes.length - 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-teal text-surface-ground">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-ink-tertiary block text-[11px]">Beyond SLA Rate:</span>
                      <span className="text-lg font-display font-black text-status-danger">
                        {q.beyond_sla_pct}%
                      </span>
                    </div>

                    <div>
                      <span className="text-ink-tertiary block text-[11px]">Median TTF:</span>
                      <span className="text-base font-display font-bold text-ink-primary">
                        {q.median_ttf_days} days
                      </span>
                    </div>

                    <div className="pt-2 border-t border-surface-border space-y-1 text-[11px]">
                      <div className="flex justify-between text-ink-secondary">
                        <span>6M Retention:</span>
                        <span className="font-bold text-status-healthy">{q.six_month_retention_pct}%</span>
                      </div>
                      <div className="flex justify-between text-ink-secondary">
                        <span>Ramp-up Speed:</span>
                        <span className="font-semibold text-ink-primary">{q.ramp_up_speed_pct}%</span>
                      </div>
                      <div className="flex justify-between text-ink-secondary">
                        <span>Manager Appraisal:</span>
                        <span className="font-bold text-status-attention">{q.manager_rating_avg} / 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-Component Quality Breakdown */}
            <div className="p-4 rounded-xl bg-surface-ground border border-surface-border">
              <h3 className="text-xs font-bold text-ink-primary mb-2">
                Quality of Hire Framework (PRD Section 19.4)
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                Rather than relying on a single composite score, FIT HUB evaluates hire quality through 3 objective lifecycle pillars:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <span className="font-bold text-brand-teal block mb-1">1. 90-Day Ramp-Up Speed</span>
                  <p className="text-ink-secondary text-[11px]">
                    Time for a new Customer Service officer or PT to reach standard floor autonomy and revenue quota without supervision. Currently at 82.5%.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <span className="font-bold text-brand-teal block mb-1">2. 6-Month Retention Rate</span>
                  <p className="text-ink-secondary text-[11px]">
                    Proportion of hires remaining past the 6-month cliff. Improved from 68.5% to 75.4% through buddy onboarding.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <span className="font-bold text-brand-teal block mb-1">3. Hiring Manager Rating</span>
                  <p className="text-ink-secondary text-[11px]">
                    Direct operational evaluation of job competency and culture alignment after 90 days (4.25 / 5.0 national average).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Interactive Cluster Demand & Sourcing Breakdown Modal */}
      {selectedMatrixCell && (
        <div className="fixed inset-0 bg-ink-primary/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-slideUp my-8 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-surface-border flex items-start justify-between bg-surface-ground/70">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                    Cluster Demand Breakdown
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      selectedMatrixCell.pressure_level === "CRITICAL"
                        ? "bg-status-danger/15 text-status-danger border-status-danger/30"
                        : selectedMatrixCell.pressure_level === "ATTENTION"
                        ? "bg-status-attention/15 text-status-attention border-status-attention/30"
                        : "bg-status-healthy/15 text-status-healthy border-status-healthy/30"
                    }`}
                  >
                    {selectedMatrixCell.pressure_level} SLA PRESSURE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-ink-primary font-display">
                  {selectedMatrixCell.role_name} — {selectedMatrixCell.location_name} Cluster
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Deep-dive operational metrics, sourcing channel inflow, and pipeline distribution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatrixCell(null)}
                className="p-1.5 rounded-lg hover:bg-surface-ground text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 4 Cluster KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="text-[10px] text-ink-tertiary uppercase font-bold block">Open Openings</span>
                  <span className="text-xl font-display font-black text-ink-primary mt-1 block">
                    {selectedMatrixCell.open_requisitions}
                  </span>
                  <span className="text-[10px] text-ink-secondary">
                    {selectedMatrixCell.replacement_share_pct}% Replacement
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="text-[10px] text-ink-tertiary uppercase font-bold block">Total Pipeline</span>
                  <span className="text-xl font-display font-black text-brand-teal mt-1 block">
                    {selectedMatrixCell.applied_count}
                  </span>
                  <span className="text-[10px] text-ink-secondary">
                    Active Inflow Candidates
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="text-[10px] text-ink-tertiary uppercase font-bold block">Beyond SLA Rate</span>
                  <span className={`text-xl font-display font-black mt-1 block ${
                    selectedMatrixCell.beyond_sla_pct > 30 ? "text-status-danger" : "text-ink-primary"
                  }`}>
                    {selectedMatrixCell.beyond_sla_pct}%
                  </span>
                  <span className="text-[10px] text-ink-secondary">
                    Target: {selectedMatrixCell.median_ttf_days}d SLA
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-ground border border-surface-border">
                  <span className="text-[10px] text-ink-tertiary uppercase font-bold block">Internal Mobility</span>
                  <span className="text-xl font-display font-black text-purple-400 mt-1 block">
                    {selectedMatrixCell.internal_mobility_count}
                  </span>
                  <span className="text-[10px] text-ink-secondary">
                    Succession Profiles
                  </span>
                </div>
              </div>

              {/* Sourcing Channel Mix Horizontal Bar Chart */}
              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-brand-teal" />
                    <span>Sourcing Channel Volume & Mix Breakdown</span>
                  </h4>
                  <span className="text-xs font-mono text-ink-tertiary">
                    {selectedMatrixCell.applied_count} Total Inflow
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedMatrixCell.channel_mix.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-ink-primary">
                        <span className="font-semibold">{item.channel}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold">{item.count} candidates</span>
                          <span className="text-ink-tertiary">({item.pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-card border border-surface-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.channel.includes("Referral")
                              ? "bg-blue-400"
                              : item.channel.includes("Portal")
                              ? "bg-emerald-400"
                              : item.channel.includes("Social")
                              ? "bg-pink-400"
                              : item.channel.includes("Pool")
                              ? "bg-brand-teal"
                              : item.channel.includes("Mobility")
                              ? "bg-purple-400"
                              : item.channel.includes("Branding")
                              ? "bg-amber-400"
                              : "bg-indigo-400"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, item.pct))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Stage Funnel Stepper */}
              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-teal" />
                  <span>Current Funnel Stage Distribution for this Cluster</span>
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {selectedMatrixCell.stage_counts.map((st, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                      <span className="text-[10px] text-ink-tertiary block truncate">{st.stage}</span>
                      <span className="font-bold text-base text-ink-primary font-display mt-0.5 block">
                        {st.count}
                      </span>
                      <span className="text-[9px] text-ink-secondary block">In Pipeline</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-ground/70 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(selectedMatrixCell.role_name);
                    setMonitoringViewMode("LIST");
                    setSelectedMatrixCell(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs font-bold text-ink-primary hover:bg-surface-elevated transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Inspect in Requisition List View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("talent-pool");
                    setSelectedMatrixCell(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-teal/15 text-brand-teal border border-brand-teal/30 text-xs font-bold hover:bg-brand-teal/25 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>View Ready Pool ({selectedMatrixCell.ready_pool_count})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMatrixCell(null)}
                className="px-4 py-1.5 rounded-xl bg-surface-card border border-surface-border font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Multi-Channel Sourcing & Candidate Pipeline Modal (100% English) */}
      {detailModalReq && (() => {
        const allCandidates = getCandidatesForRequisition(detailModalReq);
        const activeCandidates = detailModalReq.assigned_candidates && detailModalReq.assigned_candidates.length > 0 
          ? detailModalReq.assigned_candidates 
          : allCandidates;

        // Channel filter counts
        const countBySource = (src: string) => {
          if (src === "ALL") return activeCandidates.length;
          if (src === "TALENT_POOL") {
            return activeCandidates.filter(c => c.sourcing_metadata?.internal_type === "TALENT_POOL" || c.source_type === "TALENT_POOL").length;
          }
          if (src === "INTERNAL_MOBILITY") {
            return activeCandidates.filter(c => c.sourcing_metadata?.internal_type === "INTERNAL_MOBILITY" || c.source_type === "INTERNAL_MOBILITY").length;
          }
          return activeCandidates.filter(c => c.sourcing_metadata?.channel === src || c.source_type === src).length;
        };

        const filteredCandidates = activeCandidates.filter(c => {
          if (candidateSourceFilter === "ALL") return true;
          if (candidateSourceFilter === "TALENT_POOL") {
            return c.sourcing_metadata?.internal_type === "TALENT_POOL" || c.source_type === "TALENT_POOL";
          }
          if (candidateSourceFilter === "INTERNAL_MOBILITY") {
            return c.sourcing_metadata?.internal_type === "INTERNAL_MOBILITY" || c.source_type === "INTERNAL_MOBILITY";
          }
          return c.sourcing_metadata?.channel === candidateSourceFilter || c.source_type === candidateSourceFilter;
        });

        const isFulfilled = detailModalReq.requisition_status === "FULFILLED" || detailModalReq.current_stage === "Hired";

        return (
          <div className="fixed inset-0 bg-ink-primary/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slideUp my-8 flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-surface-border flex items-start justify-between bg-surface-ground/70">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                      {detailModalReq.req_code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        isFulfilled
                          ? "bg-status-healthy/15 text-status-healthy border-status-healthy/30"
                          : detailModalReq.sla_status === "WITHIN_SLA"
                          ? "bg-status-healthy/15 text-status-healthy border-status-healthy/30"
                          : detailModalReq.sla_status === "AT_RISK"
                          ? "bg-status-attention/15 text-status-attention border-status-attention/30"
                          : "bg-status-danger/15 text-status-danger border-status-danger/30"
                      }`}
                    >
                      {isFulfilled
                        ? "FULFILLED"
                        : detailModalReq.sla_status === "WITHIN_SLA"
                        ? "Within SLA"
                        : detailModalReq.sla_status === "AT_RISK"
                        ? "At Risk"
                        : "SLA Breached"}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-tertiary">
                      {detailModalReq.hiring_type} • {detailModalReq.days_open} Days Open (Target: {detailModalReq.sla_target_days}d SLA)
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-ink-primary font-display">
                    Multi-Channel Sourcing Pipeline: {detailModalReq.role_name}
                  </h3>
                  <p className="text-xs text-ink-secondary mt-1">
                    Club Location: <strong className="text-ink-primary">{detailModalReq.location_name} ({detailModalReq.club_name || "Central"})</strong> • Hiring Manager: {detailModalReq.hiring_manager} • Openings: <strong className="text-ink-primary">{detailModalReq.openings}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModalReq(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-ground text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toast / Notification inside modal */}
              {stageActionMessage && (
                <div className="px-5 py-2.5 bg-status-healthy/15 border-b border-status-healthy/30 text-xs font-semibold text-status-healthy flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{stageActionMessage}</span>
                </div>
              )}

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Demand & Operational Context */}
                <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                          Requisition Demand Context
                        </span>
                        {detailModalReq.linked_exit_code && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-status-danger/15 text-status-danger border border-status-danger/30">
                            Linked Turnover Exit: {detailModalReq.linked_exit_code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {detailModalReq.urgency_reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-center">
                      <div className="p-2 rounded-lg bg-surface-card border border-surface-border min-w-[80px]">
                        <span className="text-[10px] text-ink-tertiary block">Openings</span>
                        <span className="text-sm font-bold text-ink-primary">{detailModalReq.openings}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-card border border-surface-border min-w-[110px]">
                        <span className="text-[10px] text-ink-tertiary block">Latest Stage</span>
                        <span className="text-xs font-bold text-brand-teal truncate block mt-0.5">
                          {detailModalReq.current_stage || detailModalReq.bottleneck_stage || "HR Screening"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connected Tracker Link */}
                  {detailModalReq.external_tracker_url && (
                    <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-xs">
                      <span className="text-ink-secondary flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Connected Operational Spreadsheet / ATS Tracker</span>
                      </span>
                      <a
                        href={detailModalReq.external_tracker_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/30 flex items-center gap-1 transition-colors"
                      >
                        <span>Open Live Sheet</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Sourcing Channel Sub-Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-brand-teal" />
                        <span>Multi-Channel Sourcing Pipeline</span>
                      </h4>
                      <p className="text-[11px] text-ink-secondary mt-0.5">
                        Candidates enter simultaneously across all 9 talent channels grounded in FIT HUB historical intelligence.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-ground border border-surface-border text-ink-primary">
                      {activeCandidates.length} Candidates in Funnel
                    </span>
                  </div>

                  {/* Sub-Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {[
                      { id: "ALL", label: "All Sources", count: countBySource("ALL"), icon: Layers },
                      { id: "TALENT_POOL", label: "Talent Pool", count: countBySource("TALENT_POOL"), icon: Zap, color: "text-brand-teal" },
                      { id: "INTERNAL_MOBILITY", label: "Internal Mobility", count: countBySource("INTERNAL_MOBILITY"), icon: ArrowUpRight, color: "text-purple-400" },
                      { id: "EMPLOYEE_REFERRAL", label: "Employee Referral", count: countBySource("EMPLOYEE_REFERRAL"), icon: Users, color: "text-blue-400" },
                      { id: "JOB_PORTAL", label: "Job Portal", count: countBySource("JOB_PORTAL"), icon: Globe, color: "text-emerald-400" },
                      { id: "SOCIAL_MEDIA_ADS", label: "Social Media", count: countBySource("SOCIAL_MEDIA_ADS"), icon: Sparkles, color: "text-pink-400" },
                      { id: "EMPLOYER_BRANDING", label: "Employer Branding", count: countBySource("EMPLOYER_BRANDING"), icon: GraduationCap, color: "text-amber-400" },
                    ].map((tab) => {
                      const IconComp = tab.icon;
                      const isSelected = candidateSourceFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCandidateSourceFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                            isSelected
                              ? "bg-brand-teal text-surface-ground border-brand-teal shadow-sm font-bold"
                              : "bg-surface-ground text-ink-secondary border-surface-border hover:border-brand-teal/40 hover:text-ink-primary"
                          }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-surface-ground" : (tab.color || "text-ink-tertiary")}`} />
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isSelected ? "bg-black/20 text-surface-ground" : "bg-surface-card text-ink-primary"
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Candidate Pipeline Cards */}
                <div className="space-y-3">
                  {filteredCandidates.length === 0 ? (
                    <div className="p-6 rounded-xl bg-surface-ground border border-surface-border text-center space-y-2">
                      <p className="text-xs text-ink-secondary">
                        No candidates currently active under this sourcing channel.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCandidateSourceFilter("ALL")}
                        className="text-xs font-bold text-brand-teal hover:underline cursor-pointer"
                      >
                        View All Sources ({activeCandidates.length})
                      </button>
                    </div>
                  ) : (
                    filteredCandidates.map((cand) => {
                      const meta = cand.sourcing_metadata;
                      const isPool = meta?.internal_type === "TALENT_POOL" || cand.source_type === "TALENT_POOL";
                      const isMobility = meta?.internal_type === "INTERNAL_MOBILITY" || cand.source_type === "INTERNAL_MOBILITY";
                      const isReferral = meta?.channel === "EMPLOYEE_REFERRAL" || cand.source_type === "EMPLOYEE_REFERRAL";
                      const isJobPortal = meta?.channel === "JOB_PORTAL" || cand.source_type === "JOB_PORTAL";
                      const isSocial = meta?.channel === "SOCIAL_MEDIA_ADS" || cand.source_type === "SOCIAL_MEDIA_ADS";
                      const isBranding = meta?.channel === "EMPLOYER_BRANDING" || cand.source_type === "EMPLOYER_BRANDING";
                      const isHired = cand.stage === "Hired";

                      return (
                        <div
                          key={cand.id}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            isHired
                              ? "bg-status-healthy/10 border-status-healthy/40"
                              : "bg-surface-card border-surface-border hover:border-brand-teal/40"
                          }`}
                        >
                          {/* Top Row: Candidate Identity & Stage */}
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center ${
                                isHired
                                  ? "bg-status-healthy text-surface-ground"
                                  : isPool
                                  ? "bg-brand-teal/20 text-brand-teal"
                                  : isMobility
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-surface-elevated text-ink-primary"
                              }`}>
                                {cand.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-ink-primary">
                                    {cand.name}
                                  </span>
                                  {cand.fit_score && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                                      {cand.fit_score}% Fit Benchmark
                                    </span>
                                  )}
                                  {isHired && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-healthy text-surface-ground">
                                      ✓ HIRED
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-ink-tertiary mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>Role: {cand.current_role || detailModalReq.role_name}</span>
                                  {cand.applied_at && <span>• Applied: {cand.applied_at}</span>}
                                  {cand.contact && <span>• Contact: {cand.contact}</span>}
                                </div>

                                {/* Identifier Spine Hierarchy Badge */}
                                <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono mt-2">
                                  <span className="px-2 py-0.5 rounded bg-surface-ground text-ink-primary font-semibold border border-surface-border flex items-center gap-1">
                                    <span className="text-ink-tertiary">Req:</span>
                                    <span className="text-brand-teal font-bold">{cand.requisition_id || detailModalReq.req_code}</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-surface-ground text-ink-primary font-semibold border border-surface-border flex items-center gap-1">
                                    <span className="text-ink-tertiary">Person ID:</span>
                                    <span className="text-sky-400 font-bold">{cand.person_id || `PRS-${8200 + Math.floor(Math.random() * 800)}`}</span>
                                  </span>
                                  {cand.candidate_id && (
                                    <span className="px-2 py-0.5 rounded bg-surface-ground text-ink-tertiary border border-surface-border">
                                      Cand: {cand.candidate_id}
                                    </span>
                                  )}
                                  {cand.source_channel_name && (
                                    <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 font-sans font-semibold border border-sky-500/30">
                                      {cand.source_channel_name}
                                    </span>
                                  )}
                                  {cand.parsed_from_sheet && (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-sans font-semibold border border-purple-500/30">
                                      Sheet Inbound
                                    </span>
                                  )}
                                  {isHired && (
                                    <>
                                      <span className="px-2 py-0.5 rounded bg-status-healthy/20 text-status-healthy font-bold border border-status-healthy/40 flex items-center gap-1">
                                        <span>Employee ID:</span>
                                        <span>{cand.employee_id || "EMP-2041"}</span>
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-status-healthy/20 text-status-healthy font-bold border border-status-healthy/40 flex items-center gap-1">
                                        <span>Employment ID:</span>
                                        <span>{cand.employment_id || "EMPY-90142"}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Current Stage Pill */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-ink-tertiary">Current Stage:</span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                isHired
                                  ? "bg-status-healthy text-surface-ground border-status-healthy font-mono"
                                  : cand.stage === "Offering Stage"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  : cand.stage === "Manager Interview"
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                  : "bg-surface-ground text-ink-primary border-surface-border"
                              }`}>
                                {cand.stage}
                              </span>
                            </div>
                          </div>

                          {/* One Identifier Spine Sealed Banner if Hired */}
                          {isHired && (
                            <div className="p-2.5 rounded-lg bg-status-healthy/10 border border-status-healthy/30 text-[11px] text-status-healthy flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block">One Identifier Spine Sealed:</span>
                                <span>
                                  Candidate successfully integrated into core workforce database: Person ID (<strong>{cand.person_id || "PRS-8412"}</strong>) &rarr; Requisition (<strong>{cand.requisition_id || detailModalReq.req_code}</strong>) &rarr; Employment Episode (<strong>{cand.employment_id || "EMPY-90142"}</strong>) &rarr; Employee Badge (<strong>{cand.employee_id || "EMP-2041"}</strong>).
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Sourcing Channel Hierarchy Card */}
                          <div className="p-3 rounded-lg bg-surface-ground border border-surface-border text-xs space-y-1.5">
                            {/* 1. Talent Pool */}
                            {isPool && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-brand-teal flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Frontline Ready Pool (FIT HUB Academy Bank)</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab("talent-pool");
                                      setDetailModalReq(null);
                                    }}
                                    className="text-[11px] font-bold text-brand-teal hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Deep-Dive in Talent Pool Tab</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-ink-secondary">
                                  <div>
                                    <span className="text-ink-tertiary">Program: </span>
                                    <span className="font-semibold text-ink-primary">
                                      {meta?.talent_pool_program || "FIT HUB Academy Fast-Track Cohort"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">TTF Advantage: </span>
                                    <span className="font-semibold text-brand-teal">
                                      Compresses TTF from 34d to 9d (HR screening bypassed)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 2. Internal Mobility */}
                            {isMobility && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Internal Mobility / Succession Program</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab("talent-pool");
                                      setDetailModalReq(null);
                                    }}
                                    className="text-[11px] font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>View Mobility Matrix</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px] text-ink-secondary">
                                  <div>
                                    <span className="text-ink-tertiary">Employee ID: </span>
                                    <span className="font-mono font-semibold text-ink-primary">
                                      {meta?.mobility_employee_id || "EMP-INT"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Current Role: </span>
                                    <span className="font-semibold text-ink-primary">
                                      {meta?.mobility_current_role || "Associate"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Current Branch: </span>
                                    <span className="font-semibold text-ink-primary">
                                      {meta?.mobility_current_branch || detailModalReq.location_name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 3. Employee Referral */}
                            {isReferral && (
                              <div className="space-y-1">
                                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>Employee Referral Channel</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px] text-ink-secondary">
                                  <div>
                                    <span className="text-ink-tertiary">Referrer Name: </span>
                                    <strong className="text-ink-primary">
                                      {meta?.referrer_name || "Budi Santoso"}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Referrer ID: </span>
                                    <span className="font-mono font-semibold text-ink-primary">
                                      {meta?.referrer_employee_id || "EMP-1048"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Designation: </span>
                                    <span className="text-ink-primary">
                                      {meta?.referrer_role || "Staff"}, {meta?.referrer_branch || detailModalReq.location_name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 4. Job Portal */}
                            {isJobPortal && (
                              <div className="space-y-1">
                                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                  <Globe className="w-3.5 h-3.5" />
                                  <span>Public Job Portal Inbound</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-ink-secondary">
                                  <div>
                                    <span className="text-ink-tertiary">Portal Platform: </span>
                                    <strong className="text-ink-primary">
                                      {meta?.portal_name || "JobStreet"}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">External Posting ID: </span>
                                    <span className="font-mono font-semibold text-ink-primary">
                                      {meta?.portal_posting_id || "JS-" + detailModalReq.req_code}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 5. Social Media Ads */}
                            {isSocial && (
                              <div className="space-y-1">
                                <span className="font-bold text-pink-400 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Social Media Recruitment Ads</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px] text-ink-secondary">
                                  <div>
                                    <span className="text-ink-tertiary">Platform: </span>
                                    <strong className="text-ink-primary">
                                      {meta?.social_platform || "Instagram"}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Campaign: </span>
                                    <span className="text-ink-primary">
                                      {meta?.social_post_campaign || "Reels Sourcing Blitz"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Ad Identifier: </span>
                                    <span className="font-mono text-ink-primary">
                                      {meta?.social_ad_id || "IG-AD-01"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 6. Employer Branding */}
                            {isBranding && (
                              <div className="space-y-1">
                                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>Employer Branding & Campus Outreach</span>
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-ink-secondary">
                                  <div>
                                    <span className="text-ink-tertiary">Event Type: </span>
                                    <strong className="text-ink-primary">
                                      {meta?.branding_event_type || "Campus Career Fair"}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-ink-tertiary">Partner Institution: </span>
                                    <span className="text-ink-primary">
                                      {meta?.branding_institution || "Universitas Udayana Bali"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Candidate Notes */}
                          {cand.notes && (
                            <p className="text-xs text-ink-secondary leading-relaxed bg-surface-ground/60 p-2.5 rounded-lg border border-surface-border/50">
                              {cand.notes}
                            </p>
                          )}

                          {/* Interactive Stage Advancer Actions */}
                          <div className="pt-2 border-t border-surface-border flex items-center justify-between flex-wrap gap-2 text-xs">
                            <span className="text-[11px] text-ink-tertiary">
                              Recruitment Funnel Actions:
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {cand.stage !== "Manager Interview" && cand.stage !== "Offering Stage" && !isHired && (
                                <button
                                  type="button"
                                  disabled={advancingStage}
                                  onClick={() => handleAdvanceStage(detailModalReq.req_code, "Manager Interview", cand.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-surface-ground hover:bg-surface-elevated text-ink-primary text-xs font-semibold border border-surface-border transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  ➔ Advance to Manager Interview
                                </button>
                              )}

                              {cand.stage !== "Offering Stage" && !isHired && (
                                <button
                                  type="button"
                                  disabled={advancingStage}
                                  onClick={() => handleAdvanceStage(detailModalReq.req_code, "Offering Stage", cand.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  ➔ Advance to Offering Stage
                                </button>
                              )}

                              {!isHired && (
                                <button
                                  type="button"
                                  disabled={advancingStage}
                                  onClick={() => handleAdvanceStage(detailModalReq.req_code, "Hired", cand.id)}
                                  className="px-3 py-1.5 rounded-lg bg-status-healthy text-surface-ground text-xs font-bold hover:bg-status-healthy/90 transition-colors cursor-pointer disabled:opacity-50 shadow-sm flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Confirm Hired</span>
                                </button>
                              )}

                              {isHired && (
                                <span className="text-xs font-bold text-status-healthy flex items-center gap-1 bg-status-healthy/10 px-3 py-1 rounded-lg border border-status-healthy/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Candidate Confirmed Hired</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 5-Stage Stepper */}
                <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-2.5">
                  <span className="text-xs font-bold text-ink-primary uppercase tracking-wider block">
                    Requisition Lifecycle Stage Stepper
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-semibold">
                    {[
                      { label: "1. Intake Queued", active: true },
                      { label: "2. Active Sourcing", active: true },
                      { label: "3. Manager Interview", active: activeCandidates.some(c => ["Manager Interview", "Offering Stage", "Hired"].includes(c.stage)) },
                      { label: "4. Offering Stage", active: activeCandidates.some(c => ["Offering Stage", "Hired"].includes(c.stage)) },
                      { label: "5. Hired / Fulfilled", active: isFulfilled },
                    ].map((st, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border transition-all ${
                          st.active
                            ? "bg-brand-teal/15 border-brand-teal/50 text-brand-teal"
                            : "bg-surface-card border-surface-border text-ink-tertiary"
                        }`}
                      >
                        <span className="text-[10px] block">{st.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-surface-border bg-surface-ground/70 flex items-center justify-between text-xs">
                <span className="text-ink-tertiary">
                  All candidate actions synchronized directly with FIT HUB People Analytics Mart.
                </span>
                <button
                  type="button"
                  onClick={() => setDetailModalReq(null)}
                  className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 11. Create New Requisition Modal (100% English, Supabase Sync) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-ink-primary/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp my-8">
            <div className="p-5 border-b border-surface-border flex items-start justify-between bg-surface-ground/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-brand-teal/15 text-brand-teal">
                    <Plus className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-ink-primary font-display">
                    Create New Requisition
                  </h3>
                </div>
                <p className="text-xs text-ink-secondary">
                  Initiate a new headcount requisition and route directly to the appropriate workflow stage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-ground text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisitionSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Role & Family */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Job Role Name *
                  </label>
                  <select
                    value={createFormData.role_name}
                    onChange={(e) => {
                      const role = e.target.value;
                      const isFrontline = ["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(role);
                      const family = isFrontline ? "Fitness & Coaching" : "Club Operations";
                      setCreateFormData((prev) => ({
                        ...prev,
                        role_name: role,
                        job_family: family,
                        sourcing_channel: isFrontline ? "⚡ Frontline Ready Pool" : "✨ Internal Mobility",
                        sla_target_days: isFrontline ? 14 : 21,
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                    required
                  >
                    <option value="Customer Service">Customer Service (Staff)</option>
                    <option value="Personal Trainer">Personal Trainer (Staff)</option>
                    <option value="Fitness Consultant">Fitness Consultant (Staff)</option>
                    <option value="Housekeeping">Housekeeping (Staff)</option>
                    <option value="Customer Service Leader">Customer Service Leader (Lead)</option>
                    <option value="Personal Trainer Leader">Personal Trainer Leader (Lead)</option>
                    <option value="Club Manager">Club Manager (Management)</option>
                    <option value="Operation Manager">Operation Manager (Management)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Job Family
                  </label>
                  <select
                    value={createFormData.job_family}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, job_family: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                  >
                    <option value="Fitness & Coaching">Fitness & Coaching</option>
                    <option value="Club Operations">Club Operations</option>
                    <option value="Commercial & Sales">Commercial & Sales</option>
                    <option value="Corporate Support">Corporate Support</option>
                  </select>
                </div>
              </div>

              {/* Location & Club */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Location Cluster *
                  </label>
                  <select
                    value={createFormData.location_name}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, location_name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                    required
                  >
                    <option value="Bali">Bali (High Expansion)</option>
                    <option value="Jabodetabek">Jabodetabek</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Medan">Medan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Club Branch
                  </label>
                  <input
                    type="text"
                    value={createFormData.club_name}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, club_name: e.target.value }))}
                    placeholder="e.g. Sunset Road, Canggu, Senayan"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                  />
                </div>
              </div>

              {/* Hiring Type, Priority & SLA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Demand Type
                  </label>
                  <select
                    value={createFormData.hiring_type}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, hiring_type: e.target.value as "Replacement" | "Expansion" }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                  >
                    <option value="Replacement">Turnover Replacement</option>
                    <option value="Expansion">New Club Expansion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={createFormData.priority}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                  >
                    <option value="P1 - Urgent">P1 - Urgent (Shift Critical)</option>
                    <option value="P2 - High">P2 - High Demand</option>
                    <option value="P3 - Normal">P3 - Standard Headcount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Target SLA (Days)
                  </label>
                  <input
                    type="number"
                    min={7}
                    max={60}
                    value={createFormData.sla_target_days}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, sla_target_days: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60"
                  />
                </div>
              </div>

              {/* Urgency Reason */}
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Demand Rationale & Turnover Context
                </label>
                <textarea
                  rows={2}
                  value={createFormData.urgency_reason}
                  onChange={(e) => setCreateFormData((prev) => ({ ...prev, urgency_reason: e.target.value }))}
                  placeholder="e.g. Backfill for resigned CS morning shift or Pre-opening hiring for Canggu club"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-ground border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60 resize-none"
                />
              </div>

              {/* Workflow Destination Selector (Seamless Integration) */}
              <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-2.5">
                <label className="block text-xs font-bold text-ink-primary">
                  Workflow Routing Destination *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setCreateFormData((prev) => ({ ...prev, workflow_destination: "INTAKE_QUEUE" }))}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      createFormData.workflow_destination === "INTAKE_QUEUE"
                        ? "bg-brand-teal/10 border-brand-teal ring-1 ring-brand-teal"
                        : "bg-surface-card border-surface-border hover:border-ink-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-brand-teal mb-1">
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Queue for Intake Assessment</span>
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-tight">
                      Recommended. Enters Stage 1 for channel allocation & talent pool check before public posting.
                    </p>
                  </div>

                  <div
                    onClick={() => setCreateFormData((prev) => ({ ...prev, workflow_destination: "ACTIVE_MONITORING" }))}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      createFormData.workflow_destination === "ACTIVE_MONITORING"
                        ? "bg-purple-500/10 border-purple-500 ring-1 ring-purple-500"
                        : "bg-surface-card border-surface-border hover:border-ink-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Fast-Track to Active Monitoring</span>
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-tight">
                      Bypasses intake queue. Requisition immediately goes live in Stage 2 SLA Aging Tracker.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast-Track Details if selected */}
              {createFormData.workflow_destination === "ACTIVE_MONITORING" && (
                <div className="p-3.5 rounded-xl bg-surface-ground border border-surface-border space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        Initial Sourcing Pathway
                      </label>
                      <select
                        value={createFormData.sourcing_channel}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, sourcing_channel: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary focus:outline-none focus:border-brand-teal/60 cursor-pointer"
                      >
                        <option value="⚡ Frontline Ready Pool">⚡ Frontline Ready Pool</option>
                        <option value="✨ Internal Mobility">✨ Internal Mobility</option>
                        <option value="🌐 Conventional ATS">🌐 Conventional ATS</option>
                        <option value="💼 Job Portal (LinkedIn / JobStreet)">💼 Job Portal (LinkedIn / JobStreet)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-primary mb-1">
                        External Tracker URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={createFormData.external_tracker_url}
                        onChange={(e) => setCreateFormData((prev) => ({ ...prev, external_tracker_url: e.target.value }))}
                        placeholder="https://docs.google.com/spreadsheets/..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-brand-teal/60"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-[11px] text-ink-tertiary">
                  Saves directly to Supabase PostgreSQL mart_requisitions.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-ground hover:bg-surface-elevated border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingRequisition}
                    className="px-5 py-2 rounded-xl bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all shadow-subtle flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {creatingRequisition ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Create Requisition</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. Sourcing Assessment Drawer (Stage 1 Intake Triage - 100% English) */}
      {selectedIntakeReq && (
        <div className="fixed inset-0 bg-ink-primary/70 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
          <div className="bg-surface-card border-l border-surface-border w-full max-w-xl h-full shadow-2xl overflow-hidden flex flex-col animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-5 border-b border-surface-border flex items-start justify-between bg-surface-ground/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    {selectedIntakeReq.req_code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-attention/15 text-status-attention border border-status-attention/30">
                    Pending Sourcing
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink-primary font-display">
                  Sourcing Channel Assessment
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {selectedIntakeReq.role_name} • {selectedIntakeReq.location_name} ({selectedIntakeReq.club_name || "Central"})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIntakeReq(null)}
                className="p-1.5 rounded-lg hover:bg-surface-ground text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Context Summary */}
              <div className="p-3.5 rounded-xl bg-surface-ground border border-surface-border space-y-1.5 text-xs">
                <span className="font-bold text-ink-primary block">Requisition Demand Rationale:</span>
                <p className="text-ink-secondary leading-relaxed">
                  {selectedIntakeReq.urgency_reason || "Turnover replacement headcount required for operational continuity."}
                </p>
                {selectedIntakeReq.linked_exit_code && (
                  <span className="text-[10px] text-status-critical font-mono font-semibold block pt-1">
                    Linked Turnover Exit Code: {selectedIntakeReq.linked_exit_code}
                  </span>
                )}
              </div>

              {/* Sourcing Channel Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-ink-primary uppercase tracking-wider">
                  Select Sourcing Pathway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIntakeSourcingChannel("READY_POOL")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      intakeSourcingChannel === "READY_POOL"
                        ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500"
                        : "bg-surface-ground border-surface-border hover:border-ink-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs text-emerald-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Ready Pool</span>
                    </div>
                    <span className="text-[10px] text-ink-tertiary block">
                      Staff / Frontline (CS, PT, FC)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntakeSourcingChannel("INTERNAL_MOBILITY")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      intakeSourcingChannel === "INTERNAL_MOBILITY"
                        ? "bg-purple-500/10 border-purple-500 ring-1 ring-purple-500"
                        : "bg-surface-ground border-surface-border hover:border-ink-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs text-purple-400 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Mobility</span>
                    </div>
                    <span className="text-[10px] text-ink-tertiary block">
                      Tier 2 Leads & GMs (IDP)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntakeSourcingChannel("CONVENTIONAL")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      intakeSourcingChannel === "CONVENTIONAL"
                        ? "bg-sky-500/10 border-sky-500 ring-1 ring-sky-500"
                        : "bg-surface-ground border-surface-border hover:border-ink-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs text-sky-400 mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Conventional</span>
                    </div>
                    <span className="text-[10px] text-ink-tertiary block">
                      ATS, Portals & Referral
                    </span>
                  </button>
                </div>
              </div>

              {/* Pathway Details: Ready Pool */}
              {intakeSourcingChannel === "READY_POOL" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Banner directing user to the dedicated menu */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Frontline Ready Pool Assessment</span>
                        </span>
                        <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                          Candidate technical auditions, shift availability, and coach certifications are vetted directly in the <strong>Frontline Ready Pool</strong> roster.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                        Bypasses HR Screening
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAllocatingReq(selectedIntakeReq);
                        setSelectedIntakeReq(null);
                        setActiveTab("talent-pool");
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500 text-surface-ground text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Open Frontline Ready Pool Tab to Assess & Allocate Candidates →</span>
                    </button>
                  </div>

                  {/* Candidate Selection Status */}
                  <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-primary">
                        Candidate Allocation Status:
                      </span>
                      {intakeSelectedCandidate ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Candidate Selected
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-ink-tertiary">
                          Unselected (Starts Empty)
                        </span>
                      )}
                    </div>

                    {intakeSelectedCandidate ? (
                      /* Highlighted Selected Candidate Card */
                      <div className="p-3.5 rounded-xl border border-emerald-500 bg-emerald-500/10 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-ink-primary flex items-center gap-2">
                              <span>{intakeSelectedCandidate.display_name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                {intakeSelectedCandidate.fit_score}% Fit Benchmark
                              </span>
                            </div>
                            <div className="text-[11px] text-ink-secondary mt-0.5">
                              {intakeSelectedCandidate.role_target} • Pref: {intakeSelectedCandidate.location_preference}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIntakeSelectedCandidate(null)}
                            className="text-[10px] font-bold text-status-danger hover:underline cursor-pointer"
                          >
                            Remove / Deselect
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(intakeSelectedCandidate.verified_competencies || []).map((skill: string) => (
                            <span key={skill} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-card border border-surface-border text-ink-secondary">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-emerald-400 block pt-1 font-medium">
                          ✓ Fast-tracks directly to Manager Interview upon allocation.
                        </span>
                      </div>
                    ) : (
                      /* Clean Empty State - Candidate Selection strictly in Dedicated Tab */
                      <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-ink-primary">
                            No Frontline Candidate Selected (Starts Empty)
                          </p>
                          <p className="text-[11px] text-ink-secondary max-w-sm mx-auto leading-relaxed">
                            Per recruitment governance, candidates must be assessed and allocated inside the <strong>Frontline Ready Pool</strong> tab. Click below to inspect benchmark fit and allocate to this requisition.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAllocatingReq(selectedIntakeReq);
                            setSelectedIntakeReq(null);
                            setActiveTab("talent-pool");
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 text-surface-ground text-xs font-bold hover:bg-emerald-600 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Assess & Allocate Candidate in Frontline Ready Pool Tab &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pathway Details: Internal Mobility */}
              {intakeSourcingChannel === "INTERNAL_MOBILITY" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Banner directing user to the dedicated menu */}
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>Internal Mobility & Succession Matching</span>
                        </span>
                        <p className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                          Tenure benchmarks, capability mastery scores, and IDP promotion readiness are evaluated inside the <strong>Internal Mobility Engine</strong>.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0">
                        Fast-Track IDP
                      </span>
                    </div>

                    <a
                      href={`/team?tab=mobility&allocating_req=${selectedIntakeReq.req_code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-purple-600 text-surface-ground text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Open Internal Mobility Match Tab (/team?tab=mobility) ↗</span>
                    </a>
                  </div>

                  {/* Candidate Selection Status */}
                  <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-primary">
                        Succession Candidate Status:
                      </span>
                      {intakeSelectedCandidate ? (
                        <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Candidate Selected
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-ink-tertiary">
                          Unselected (Starts Empty)
                        </span>
                      )}
                    </div>

                    {intakeSelectedCandidate ? (
                      /* Highlighted Selected Candidate Card */
                      <div className="p-3.5 rounded-xl border border-purple-500 bg-purple-500/10 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-ink-primary flex items-center gap-2">
                              <span>{intakeSelectedCandidate.candidate_name || intakeSelectedCandidate.display_name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                {intakeSelectedCandidate.readiness_status || "Ready Now"} ({intakeSelectedCandidate.final_readiness_score || intakeSelectedCandidate.fit_score || 90}%)
                              </span>
                            </div>
                            <div className="text-[11px] text-ink-secondary mt-0.5">
                              Current: {intakeSelectedCandidate.current_role_name || "Internal Team"} • {intakeSelectedCandidate.current_location_name || selectedIntakeReq.location_name}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIntakeSelectedCandidate(null)}
                            className="text-[10px] font-bold text-status-danger hover:underline cursor-pointer"
                          >
                            Remove / Deselect
                          </button>
                        </div>
                        <span className="text-[10px] text-purple-300 block pt-1 font-medium">
                          ✓ Direct promotion via IDP transition upon allocation.
                        </span>
                      </div>
                    ) : (
                      /* Clean Empty State - Selection strictly in Mobility Engine */
                      <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-ink-primary">
                            No Succession Candidate Selected (Starts Empty)
                          </p>
                          <p className="text-[11px] text-ink-secondary max-w-sm mx-auto leading-relaxed">
                            Succession matching and IDP readiness appraisals must be evaluated inside the <strong>Internal Mobility Engine</strong>. Open the tab below to review candidates against this demand slot.
                          </p>
                        </div>
                        <a
                          href={`/team?tab=mobility&allocating_req=${selectedIntakeReq.req_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 text-surface-ground text-xs font-bold hover:bg-purple-700 transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Open Internal Mobility Match Tab (/team?tab=mobility) &rarr;</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pathway Details: Conventional Sourcing (Excel Grounded + Manual DB Entry) */}
              {intakeSourcingChannel === "CONVENTIONAL" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Step 1: Channel Category Selector */}
                  <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-ink-primary uppercase tracking-wider mb-1">
                        1. Sourcing Channel Category
                      </label>
                      <p className="text-[11px] text-ink-secondary">
                        Select recruitment channel grounded in FIT HUB historical hiring dataset:
                      </p>
                    </div>

                    {/* Category Selector Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(CONVENTIONAL_CATEGORIES) as ConventionalCategoryKey[]).map((catKey) => {
                        const cat = CONVENTIONAL_CATEGORIES[catKey];
                        const IconComp = cat.icon;
                        const isCatSelected = conventionalCategory === catKey;
                        return (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => {
                              setConventionalCategory(catKey);
                              setConventionalSubChannel(cat.subChannels[0]);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isCatSelected
                                ? "bg-sky-500/15 border-sky-500 ring-1 ring-sky-500"
                                : "bg-surface-card border-surface-border hover:border-ink-secondary"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs text-ink-primary mb-1">
                              <IconComp className={`w-3.5 h-3.5 ${isCatSelected ? "text-sky-400" : "text-ink-tertiary"}`} />
                              <span>{cat.label}</span>
                            </div>
                            <span className="text-[9px] text-ink-tertiary line-clamp-1">
                              {cat.subChannels[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Sub-channel pills */}
                    <div className="pt-2 border-t border-surface-border/60">
                      <span className="text-[11px] font-semibold text-ink-primary block mb-1.5">
                        Specific Sub-Channel Platform:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CONVENTIONAL_CATEGORIES[conventionalCategory].subChannels.map((sub) => {
                          const isSubSelected = conventionalSubChannel === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setConventionalSubChannel(sub)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isSubSelected
                                  ? "bg-sky-500 text-surface-ground border-sky-500 font-bold shadow-sm"
                                  : "bg-surface-card text-ink-secondary border-surface-border hover:text-ink-primary"
                              }`}
                            >
                              {isSubSelected ? "✓ " : ""}
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Automated Sheet Inbound Sync & Ingestion Engine */}
                  <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                            2. Connected Sheet Inbound Sync &amp; Database Ingestion
                          </h4>
                        </div>
                        <p className="text-[11px] text-ink-secondary mt-0.5">
                          Parse inbound applicants from external recruitment sheet and execute <code className="text-sky-400 font-mono">INSERT INTO</code> core database:
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-card border border-surface-border text-ink-primary">
                        {conventionalCandidateList.length} In Queue
                      </span>
                    </div>

                    {/* Google Sheet URL Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-ink-secondary">
                        Connected External Sheet / Tracker URL:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={intakeTrackerUrl}
                          onChange={(e) => setIntakeTrackerUrl(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary font-mono text-[11px] placeholder-ink-tertiary focus:outline-none focus:border-sky-500"
                        />
                        <a
                          href={intakeTrackerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-surface-card hover:bg-surface-elevated border border-surface-border text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                          title="Open Sheet in New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Action Button: Auto-Parse & Sync Inbound from Sheet */}
                    <button
                      type="button"
                      disabled={isParsingSheet}
                      onClick={handleAutoParseSheetInbound}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-brand-teal text-surface-ground text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isParsingSheet ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Parsing Rows &amp; Ingesting into Database...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>⚡ Auto-Parse &amp; Sync Applicants from Sheet (INSERT INTO Database)</span>
                        </>
                      )}
                    </button>

                    {/* Success Message Alert */}
                    {sheetSyncMessage && (
                      <div className="p-3 rounded-xl bg-status-healthy/15 border border-status-healthy/30 text-xs text-status-healthy flex items-start gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">{sheetSyncMessage}</span>
                          <span className="text-[11px] text-ink-secondary">
                            Each applicant is assigned a persistent <code className="text-sky-400 font-mono">person_id</code> and linked to requisition <code className="text-brand-teal font-mono">{selectedIntakeReq.req_code}</code>.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Database Ingestion Preview (SQL Log) */}
                    {sqlInsertPreview && sqlInsertPreview.length > 0 && (
                      <div className="p-3 rounded-xl bg-surface-card border border-surface-border space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-ink-primary flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-sky-400" />
                            <span>Database Transaction Log (PostgreSQL Ingestion Spine)</span>
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-ground text-sky-300 border border-surface-border font-bold">
                            {sqlInsertPreview.length} SQL Statements
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface-ground border border-surface-border/60 font-mono text-[10px] text-sky-300 overflow-x-auto space-y-1 max-h-32">
                          {sqlInsertPreview.map((stmt, sIdx) => (
                            <div key={sIdx} className="leading-relaxed whitespace-pre font-mono">
                              {stmt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Manual Single Entry (Optional Fallback) */}
                  <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-ink-primary" />
                          <h4 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
                            3. Manual Single Candidate Entry (Ad-Hoc)
                          </h4>
                        </div>
                        <p className="text-[11px] text-ink-secondary mt-0.5">
                          Or add an ad-hoc applicant manually from <strong>{conventionalSubChannel}</strong>:
                        </p>
                      </div>
                    </div>

                    {/* Candidate Input Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink-primary mb-1">
                          Candidate Full Name *
                        </label>
                        <input
                          type="text"
                          value={conventionalCandidateName}
                          onChange={(e) => setConventionalCandidateName(e.target.value)}
                          placeholder="e.g. Dimas Wicaksono"
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-primary mb-1">
                          Contact Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={conventionalCandidatePhone}
                          onChange={(e) => setConventionalCandidatePhone(e.target.value)}
                          placeholder="e.g. +62 812-3456-7890"
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-primary mb-1">
                          Source URL / Profile Handle / CV Link
                        </label>
                        <input
                          type="text"
                          value={conventionalCandidateUrl}
                          onChange={(e) => setConventionalCandidateUrl(e.target.value)}
                          placeholder="e.g. instagram.com/dimas_pt or linkedin.com/in/..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-primary mb-1">
                          Current Role / Background
                        </label>
                        <input
                          type="text"
                          value={conventionalCandidateRole}
                          onChange={(e) => setConventionalCandidateRole(e.target.value)}
                          placeholder={`Default: ${selectedIntakeReq.role_name}`}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-ink-primary mb-1">
                          Initial Screening Notes / Application Remarks
                        </label>
                        <input
                          type="text"
                          value={conventionalCandidateNotes}
                          onChange={(e) => setConventionalCandidateNotes(e.target.value)}
                          placeholder="e.g. APKI certified trainer with 2 years studio coaching experience."
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-surface-card border border-surface-border text-ink-primary placeholder-ink-tertiary focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-ink-tertiary">
                        Candidate will be registered under <strong>HR Screening</strong> stage.
                      </span>
                      <button
                        type="button"
                        disabled={!conventionalCandidateName.trim()}
                        onClick={handleAddConventionalCandidate}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-surface-ground text-xs font-bold hover:bg-sky-600 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Candidate to Requisition</span>
                      </button>
                    </div>

                    {/* Queued Candidates List with Identifier Spine */}
                    {conventionalCandidateList.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-surface-border/60">
                        <span className="text-xs font-bold text-ink-primary block">
                          Registered Candidates for this Requisition ({conventionalCandidateList.length}):
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {conventionalCandidateList.map((cand) => (
                            <div
                              key={cand.id}
                              className="p-2.5 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="font-bold text-ink-primary flex items-center gap-2 flex-wrap">
                                  <span>{cand.name}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400">
                                    {cand.sub_channel}
                                  </span>
                                  {cand.parsed_from_sheet ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                                      📄 Sheet Parsed
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-surface-ground text-ink-tertiary border border-surface-border">
                                      ✍️ Manual Entry
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-ink-tertiary flex items-center gap-2 flex-wrap font-mono">
                                  <span className="text-sky-400 font-bold">Person: {cand.person_id}</span>
                                  <span>•</span>
                                  <span className="text-brand-teal">Req: {cand.requisition_id}</span>
                                  <span>•</span>
                                  <span className="text-ink-secondary font-sans">Role: {cand.role}</span>
                                  {cand.phone && <span className="font-sans">• Tel: {cand.phone}</span>}
                                  {cand.url && (
                                    <span className="text-brand-teal truncate max-w-[150px] font-sans">
                                      • {cand.url}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveConventionalCandidate(cand.id)}
                                className="p-1 rounded text-ink-tertiary hover:text-status-danger transition-colors cursor-pointer"
                                title="Remove candidate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-ground/70 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedIntakeReq(null)}
                className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={allocating}
                onClick={handleSaveIntakeAllocation}
                className="px-5 py-2 rounded-xl bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all shadow-subtle flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {allocating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Allocating...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Allocation & Move to Active</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VacancyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-ink-tertiary flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span>Loading Vacancy Intelligence...</span>
        </div>
      }
    >
      <VacancyContent />
    </Suspense>
  );
}
