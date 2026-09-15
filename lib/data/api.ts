import { supabase } from "@/lib/supabaseClient";
import {
  VacancyKPI,
  RetentionCohort,
  EngagementSummary,
  InternalMobilityMatch,
  ProvenanceRecord,
  RequisitionItem,
  RequisitionCandidateItem,
  CreateRequisitionPayload,
  SourcingChannelMetric,
  FunnelStageMetric,
  TalentPoolCandidate,
  HiringOutcomeMetric,
  SourcingChannelQualityMetric,
  ExitEvent,
  TenureBand,
  VoiceTheme,
  PipelineLayer,
  RoadmapHorizon,
  MetricDefinition,
  CliftonStrength,
  fallbackCliftonStrengths,
  CapabilityItem,
  fallbackCapabilities,
  CapabilityLevelRoadmap,
  fallbackCapabilityRoadmaps,
  RoleCapabilityRequirement,
  fallbackRoleCapabilityRequirements,
  fallbackVacancyKPIs,
  fallbackRetentionCohorts,
  fallbackEngagementSummaries,
  fallbackMobilityMatches,
  fallbackIncomingRequisitions,
  fallbackRequisitions,
  fallbackSourcingChannels,
  fallbackFunnelStages,
  fallbackTalentPool,
  fallbackHiringOutcomes,
  fallbackSourcingChannelQuality,
  fallbackExitEvents,
  fallbackTenureBands,
  fallbackVoiceThemes,
  fallbackPipelineLayers,
  fallbackRoadmapHorizons,
  fallbackMetricDefinitions,
  dataProvenanceRegistry,
} from "./fixtures";

// ponytail: Unified data access with automatic fallback to pre-bundled typed fixtures.
// If Supabase is reachable within 1500ms, returns live PostgreSQL data; if offline, errored or timing out, returns fixtures seamlessly.

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 1500): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase network timeout")), timeoutMs)
    ),
  ]);
}

export async function getVacancyKPIs(): Promise<{ data: VacancyKPI[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackVacancyKPIs, isLive: false };
  }
  try {
    const { data, error } = await withTimeout(supabase.from("mart_vacancy_kpi").select("*"), 1500);
    if (error || !data || data.length === 0) {
      return { data: fallbackVacancyKPIs, isLive: false };
    }
    return { data: data as VacancyKPI[], isLive: true };
  } catch {
    return { data: fallbackVacancyKPIs, isLive: false };
  }
}

export async function getRequisitions(filter?: {
  status?: 'PENDING_SOURCING' | 'ACTIVE_MONITORING' | 'ALL';
}): Promise<{ data: RequisitionItem[]; isLive: boolean }> {
  const status = filter?.status || 'ACTIVE_MONITORING';
  if (!supabase) {
    if (status === 'PENDING_SOURCING') {
      return { data: fallbackIncomingRequisitions, isLive: false };
    }
    if (status === 'ALL') {
      return { data: [...fallbackIncomingRequisitions, ...fallbackRequisitions], isLive: false };
    }
    return { data: fallbackRequisitions, isLive: false };
  }
  try {
    let query = supabase.from("mart_requisitions").select("*");
    if (status !== 'ALL') {
      query = query.eq("requisition_status", status);
    }
    const { data, error } = await withTimeout(query, 1500);
    if (error || !data || data.length === 0) {
      if (status === 'PENDING_SOURCING') {
        return { data: fallbackIncomingRequisitions, isLive: false };
      }
      return { data: fallbackRequisitions, isLive: false };
    }
    return { data: data as RequisitionItem[], isLive: true };
  } catch {
    if (status === 'PENDING_SOURCING') {
      return { data: fallbackIncomingRequisitions, isLive: false };
    }
    return { data: fallbackRequisitions, isLive: false };
  }
}

export async function saveRequisitionSourcing(
  reqCode: string,
  payload: {
    sourcing_channel: string;
    sourcing_details?: any[];
    assigned_candidates?: any[];
    current_stage?: string;
    external_tracker_url?: string;
  }
): Promise<{ success: boolean; data?: RequisitionItem; error?: string }> {
  if (!supabase) {
    return { success: true };
  }
  try {
    const updateData = {
      ...payload,
      requisition_status: 'ACTIVE_MONITORING',
    };
    const { data, error } = await supabase
      .from("mart_requisitions")
      .update(updateData)
      .eq("req_code", reqCode)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as RequisitionItem };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update requisition' };
  }
}

export async function updateRequisitionStage(
  reqCode: string,
  newStage: string,
  candidateId?: string,
  note?: string
): Promise<{ success: boolean; data?: RequisitionItem; error?: string }> {
  if (!supabase) {
    return { success: true };
  }
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from("mart_requisitions")
      .select("*")
      .eq("req_code", reqCode)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: fetchErr?.message || 'Requisition not found' };
    }

    let assignedCandidates = existing.assigned_candidates || [];
    if (candidateId) {
      assignedCandidates = assignedCandidates.map((c: any) =>
        c.id === candidateId ? { ...c, stage: newStage, notes: note || c.notes } : c
      );
    } else if (assignedCandidates.length > 0) {
      assignedCandidates = assignedCandidates.map((c: any) => ({
        ...c,
        stage: newStage,
      }));
    }

    const history = existing.stage_history || [];
    history.push({
      stage: newStage,
      timestamp: new Date().toISOString(),
      note: note || `Stage updated to ${newStage}`,
    });

    const isHired = newStage.toLowerCase().includes('hired');
    const updatePayload: any = {
      current_stage: newStage,
      assigned_candidates: assignedCandidates,
      stage_history: history,
      requisition_status: isHired ? 'FULFILLED' : existing.requisition_status,
    };

    const { data, error } = await supabase
      .from("mart_requisitions")
      .update(updatePayload)
      .eq("req_code", reqCode)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as RequisitionItem };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to advance stage' };
  }
}

export async function createRequisition(
  payload: CreateRequisitionPayload
): Promise<{ success: boolean; data?: RequisitionItem; error?: string }> {
  const isFrontline = [
    "customer service",
    "personal trainer",
    "fitness consultant",
    "housekeeping",
  ].some((r) => payload.role_name.toLowerCase().includes(r));

  const tierNumber = isFrontline ? 1 : 2;
  const recommendedFulfillment = isFrontline ? "READY_POOL" : "INTERNAL_MOBILITY";
  const defaultSla = payload.sla_target_days || (isFrontline ? 14 : 21);
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const reqCode = `REQ-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const isFastTrack = payload.workflow_destination === "ACTIVE_MONITORING";
  const initialStatus = isFastTrack ? "ACTIVE_MONITORING" : "PENDING_SOURCING";
  const initialStage = isFastTrack
    ? payload.assigned_candidates && payload.assigned_candidates.length > 0
      ? payload.assigned_candidates[0].stage || "HR Screening"
      : "HR Screening"
    : "Awaiting Sourcing";

  const newRecord: Partial<RequisitionItem> & Record<string, any> = {
    req_code: reqCode,
    id: reqCode,
    role_name: payload.role_name,
    role: payload.role_name,
    job_family: payload.job_family || (isFrontline ? "Fitness & Coaching" : "Club Operations"),
    tier_number: tierNumber,
    recommended_fulfillment: recommendedFulfillment,
    requisition_status: initialStatus,
    location_name: payload.location_name,
    location: payload.location_name,
    club_name: payload.club_name,
    hiring_type: payload.hiring_type,
    demand_type: payload.hiring_type,
    openings: 1,
    days_open: 0,
    current_days_open: 0,
    sla_target_days: defaultSla,
    sla_days: defaultSla,
    sla_status: "WITHIN_SLA",
    pipeline_size: payload.assigned_candidates ? payload.assigned_candidates.length : (isFastTrack ? 3 : 0),
    bottleneck_stage: "None",
    health: "Healthy",
    priority: payload.priority || "P2 - High",
    hiring_manager: "Talent Acquisition Lead",
    urgency_reason: payload.urgency_reason || `Urgent headcount requirement for ${payload.location_name}`,
    linked_exit_code: payload.linked_exit_code,
    data_provenance: "OBSERVED_CASE_STUDY",
    sourcing_channel: payload.sourcing_channel || (isFrontline ? "⚡ Frontline Ready Pool" : "✨ Internal Mobility"),
    sourcing_details: payload.sourcing_details || [],
    assigned_candidates: payload.assigned_candidates || [],
    current_stage: initialStage,
    external_tracker_url: payload.external_tracker_url || "",
    stage_history: [
      {
        stage: initialStage,
        timestamp: now.toISOString(),
        note: `Requisition created via ${payload.workflow_destination}`,
      },
    ],
    request_date: dateStr,
    created_at: now.toISOString(),
  };

  if (!supabase) {
    if (initialStatus === "PENDING_SOURCING") {
      fallbackIncomingRequisitions.unshift(newRecord as RequisitionItem);
    } else {
      fallbackRequisitions.unshift(newRecord as RequisitionItem);
    }
    return { success: true, data: newRecord as RequisitionItem };
  }

  try {
    const { data, error } = await supabase
      .from("mart_requisitions")
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      if (initialStatus === "PENDING_SOURCING") {
        fallbackIncomingRequisitions.unshift(newRecord as RequisitionItem);
      } else {
        fallbackRequisitions.unshift(newRecord as RequisitionItem);
      }
      return { success: true, data: newRecord as RequisitionItem };
    }
    return { success: true, data: data as RequisitionItem };
  } catch {
    if (initialStatus === "PENDING_SOURCING") {
      fallbackIncomingRequisitions.unshift(newRecord as RequisitionItem);
    } else {
      fallbackRequisitions.unshift(newRecord as RequisitionItem);
    }
    return { success: true, data: newRecord as RequisitionItem };
  }
}

export async function getSourcingChannels(): Promise<{ data: SourcingChannelMetric[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackSourcingChannels, isLive: false };
  }
  try {
    const { data, error } = await withTimeout(supabase.from("sourcing_channels").select("*"), 1500);
    if (error || !data || data.length === 0) {
      return { data: fallbackSourcingChannels, isLive: false };
    }
    return { data: data as SourcingChannelMetric[], isLive: true };
  } catch {
    return { data: fallbackSourcingChannels, isLive: false };
  }
}

export async function getFunnelStages(): Promise<{ data: FunnelStageMetric[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackFunnelStages, isLive: false };
  }
  try {
    const { data, error } = await withTimeout(supabase.from("funnel_stages").select("*").order("stage_order", { ascending: true }), 1500);
    if (error || !data || data.length === 0) {
      return { data: fallbackFunnelStages, isLive: false };
    }
    return { data: data as FunnelStageMetric[], isLive: true };
  } catch {
    return { data: fallbackFunnelStages, isLive: false };
  }
}

export async function getTalentPoolCandidates(): Promise<{ data: TalentPoolCandidate[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackTalentPool, isLive: false };
  }
  try {
    const { data, error } = await withTimeout(supabase.from("synthetic_talent_pool").select("*"), 1500);
    if (error || !data || data.length === 0) {
      return { data: fallbackTalentPool, isLive: false };
    }
    return { data: data as TalentPoolCandidate[], isLive: true };
  } catch {
    return { data: fallbackTalentPool, isLive: false };
  }
}

export interface FitScoreBreakdown {
  total: number;
  locationScore: number;
  locationMax: number;
  experienceScore: number;
  experienceMax: number;
  certificationScore: number;
  certificationMax: number;
  availabilityScore: number;
  availabilityMax: number;
  sourceBonusScore: number;
  sourceBonusMax: number;
  roleMatch: boolean;
  notes: string;
}

export function calculateTalentPoolFitScore(
  candidate: TalentPoolCandidate,
  targetReq?: RequisitionItem | null
): FitScoreBreakdown {
  if (!targetReq) {
    const baseline = candidate.fit_score ?? 85;
    return {
      total: baseline,
      locationScore: 25,
      locationMax: 30,
      experienceScore: candidate.gym_experience_level === "Gym Experienced" ? 25 : 18,
      experienceMax: 25,
      certificationScore: candidate.certifications && candidate.certifications.length > 0 ? 22 : 15,
      certificationMax: 25,
      availabilityScore: candidate.availability_status === "Immediate" ? 15 : 10,
      availabilityMax: 15,
      sourceBonusScore: 5,
      sourceBonusMax: 5,
      roleMatch: true,
      notes: "Baseline form qualification score across standard criteria",
    };
  }

  // 1. Location Matching (Max 30 pts)
  let locationScore = 0;
  const candLoc = (candidate.location_preference || "").trim().toLowerCase();
  const reqLoc = (targetReq.location_name || (targetReq as any).location || "").trim().toLowerCase();

  if (candLoc && reqLoc && (candLoc === reqLoc || candLoc.includes(reqLoc) || reqLoc.includes(candLoc))) {
    locationScore = 30; // Exact location match
  } else if (
    (candLoc.includes("jakarta") && reqLoc.includes("jakarta")) ||
    (candLoc.includes("tangerang") && reqLoc.includes("jakarta")) ||
    (candLoc.includes("jakarta") && reqLoc.includes("tangerang")) ||
    (candLoc.includes("surabaya") && reqLoc.includes("jawa timur"))
  ) {
    locationScore = 20; // Same broader cluster
  } else if (candidate.willing_to_relocate) {
    locationScore = 12; // Cross-island willing to relocate
  } else {
    locationScore = 0; // Cross-island without relocation
  }

  // 2. Gym / Frontline Experience (Max 25 pts)
  let experienceScore = 10;
  const expLevel = candidate.gym_experience_level || "Gym Experienced";
  const years = candidate.experience_years ?? 1.5;
  if (expLevel === "Gym Experienced") {
    experienceScore = years >= 2 ? 25 : 20;
  } else if (expLevel === "Non-Gym Frontline") {
    experienceScore = years >= 2 ? 18 : 14;
  } else {
    experienceScore = 10;
  }

  // 3. Certifications & Background (Max 25 pts)
  let certScore = 8;
  const certs = candidate.certifications || candidate.verified_competencies || [];
  const reqRole = (targetReq.role_name || (targetReq as any).role || "").toLowerCase();

  if (reqRole.includes("personal trainer") || reqRole.includes("fitness coach")) {
    const hasPtCert = certs.some((c) =>
      c.toLowerCase().includes("apki") ||
      c.toLowerCase().includes("rai") ||
      c.toLowerCase().includes("cscs") ||
      c.toLowerCase().includes("sports science") ||
      c.toLowerCase().includes("conditioning")
    );
    certScore = hasPtCert ? 25 : certs.length > 0 ? 15 : 5;
  } else if (reqRole.includes("customer service") || reqRole.includes("operations")) {
    const hasServiceCert = certs.some((c) =>
      c.toLowerCase().includes("service") ||
      c.toLowerCase().includes("pos") ||
      c.toLowerCase().includes("cashier") ||
      c.toLowerCase().includes("hospitality") ||
      c.toLowerCase().includes("protocol")
    );
    certScore = hasServiceCert ? 25 : certs.length > 0 ? 18 : 8;
  } else {
    // Fitness Consultant / Sales
    const hasSalesCert = certs.some((c) =>
      c.toLowerCase().includes("sales") ||
      c.toLowerCase().includes("negotiation") ||
      c.toLowerCase().includes("crm") ||
      c.toLowerCase().includes("b2c")
    );
    certScore = hasSalesCert ? 25 : certs.length > 0 ? 18 : 8;
  }

  // 4. Availability (Max 15 pts)
  let availabilityScore = 5;
  const avail = (candidate.availability_status || "").toLowerCase();
  if (avail.includes("immediate")) {
    availabilityScore = 15;
  } else if (avail.includes("2 weeks") || avail.includes("14")) {
    availabilityScore = 10;
  } else {
    availabilityScore = 5;
  }

  // 5. Source Channel Bonus (Max 5 pts)
  let sourceBonus = 2;
  const src = (candidate.source_channel || "").toLowerCase();
  if (src.includes("ex-finalist") || src.includes("referral")) {
    sourceBonus = 5;
  } else if (src.includes("alumni") || src.includes("career")) {
    sourceBonus = 3;
  } else {
    sourceBonus = 2;
  }

  // Role Match check
  const candRole = (candidate.role_target || "").toLowerCase();
  const isRoleMatch =
    candRole === reqRole ||
    reqRole.includes(candRole) ||
    candRole.includes(reqRole) ||
    (reqRole.includes("trainer") && candRole.includes("trainer")) ||
    (reqRole.includes("service") && candRole.includes("service")) ||
    (reqRole.includes("consultant") && candRole.includes("consultant"));

  let rawTotal = locationScore + experienceScore + certScore + availabilityScore + sourceBonus;
  if (!isRoleMatch) {
    rawTotal = Math.max(30, rawTotal - 22); // Significant discount for different role target
  }

  const finalScore = Math.min(99, Math.max(15, Math.round(rawTotal)));

  return {
    total: finalScore,
    locationScore,
    locationMax: 30,
    experienceScore,
    experienceMax: 25,
    certificationScore: certScore,
    certificationMax: 25,
    availabilityScore,
    availabilityMax: 15,
    sourceBonusScore: sourceBonus,
    sourceBonusMax: 5,
    roleMatch: isRoleMatch,
    notes: isRoleMatch
      ? `High-fidelity candidate match for ${targetReq.role_name} in ${targetReq.location_name}`
      : `Cross-role candidate: targeted ${candidate.role_target} vs requisition ${targetReq.role_name}`,
  };
}

export async function assignTalentPoolToRequisition(
  reqCode: string,
  candidate: TalentPoolCandidate,
  targetStage: string = "HR Screening"
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: true };
  }
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from("mart_requisitions")
      .select("*")
      .eq("req_code", reqCode)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: fetchErr?.message || "Requisition not found" };
    }

    const assigned = existing.assigned_candidates || [];
    const newCandidateItem: RequisitionCandidateItem = {
      id: candidate.candidate_id,
      name: candidate.display_name,
      source_type: "TALENT_POOL",
      stage: targetStage as any,
      contact: candidate.phone || candidate.email || "+62 812-xxxx",
      applied_at: candidate.application_date || new Date().toISOString().split("T")[0],
      fit_score: candidate.fit_score,
      notes: candidate.profile_summary || candidate.notes || "Assigned from Frontline Talent Pool",
      sourcing_metadata: {
        channel: "TALENT_POOL",
        portal_name: candidate.source_channel || "Talent Pool",
        profile_url: candidate.email ? `mailto:${candidate.email}` : undefined,
      },
    };

    const updatedAssigned = [...assigned, newCandidateItem];
    const history = existing.stage_history || [];
    history.push({
      stage: targetStage,
      timestamp: new Date().toISOString(),
      note: `Candidate ${candidate.display_name} allocated from Talent Pool (${candidate.candidate_id})`,
    });

    const updatePayload: any = {
      assigned_candidates: updatedAssigned,
      pipeline_size: (existing.pipeline_size || 0) + 1,
      requisition_status: existing.requisition_status === "PENDING_SOURCING" ? "ACTIVE_MONITORING" : existing.requisition_status,
      current_stage: targetStage,
      stage_history: history,
      sourcing_channel: existing.sourcing_channel || "Talent Pool",
    };

    const { error: updateErr } = await supabase
      .from("mart_requisitions")
      .update(updatePayload)
      .eq("req_code", reqCode);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to assign candidate" };
  }
}

export async function getHiringOutcomes(): Promise<{ data: HiringOutcomeMetric[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackHiringOutcomes, isLive: false };
  }
  try {
    const { data, error } = await withTimeout(supabase.from("hiring_outcomes").select("*"), 1500);
    if (error || !data || data.length === 0) {
      return { data: fallbackHiringOutcomes, isLive: false };
    }
    return { data: data as HiringOutcomeMetric[], isLive: true };
  } catch {
    return { data: fallbackHiringOutcomes, isLive: false };
  }
}

export async function getSourcingChannelQuality(): Promise<{ data: SourcingChannelQualityMetric[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackSourcingChannelQuality, isLive: false };
  }
  try {
    const { data, error } = await withTimeout(
      supabase.from("mart_sourcing_channel_retention_quality").select("*").order("six_month_retention_pct", { ascending: false }),
      1500
    );
    if (error || !data || data.length === 0) {
      return { data: fallbackSourcingChannelQuality, isLive: false };
    }
    return { data: data as SourcingChannelQualityMetric[], isLive: true };
  } catch {
    return { data: fallbackSourcingChannelQuality, isLive: false };
  }
}

export async function getRetentionCohorts(): Promise<{ data: RetentionCohort[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackRetentionCohorts, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("mart_retention_cohort").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackRetentionCohorts, isLive: false };
    }
    return { data: data as RetentionCohort[], isLive: true };
  } catch {
    return { data: fallbackRetentionCohorts, isLive: false };
  }
}

export async function getEngagementSummaries(): Promise<{ data: EngagementSummary[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackEngagementSummaries, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("mart_engagement_summary").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackEngagementSummaries, isLive: false };
    }
    return { data: data as EngagementSummary[], isLive: true };
  } catch {
    return { data: fallbackEngagementSummaries, isLive: false };
  }
}

export async function getInternalMobilityMatches(
  targetRole: string = "Customer Service Leader",
  targetLocation: string = "ALL",
  benchmarkEmpIds: string[] = [],
  minPerformance: number = 3.5,
  minTenure: number = 6,
  feederOnly: boolean = false
): Promise<{ data: InternalMobilityMatch[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackMobilityMatches, isLive: false };
  }
  try {
    // 1. Primary: Run live PostgreSQL SQL Matching Engine via Supabase RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc("calculate_mobility_match", {
      p_target_role: targetRole,
      p_target_location: targetLocation,
      p_benchmark_emp_ids: benchmarkEmpIds,
      p_min_performance: minPerformance,
      p_min_tenure: minTenure,
      p_feeder_only: feederOnly,
    });
    if (!rpcError && rpcData && rpcData.length > 0) {
      return { data: rpcData as InternalMobilityMatch[], isLive: true };
    }
    // 2. Secondary fallback: check mart table
    const { data, error } = await supabase.from("mart_internal_mobility_match").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackMobilityMatches, isLive: false };
    }
    return { data: data as InternalMobilityMatch[], isLive: true };
  } catch {
    return { data: fallbackMobilityMatches, isLive: false };
  }
}

export async function getMartRequisitions(): Promise<{ data: RequisitionItem[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackRequisitions, isLive: false };
  }
  try {
    const { data, error } = await supabase
      .from("mart_requisitions")
      .select("*")
      .order("days_open", { ascending: false });
    if (error || !data || data.length === 0) {
      return { data: fallbackRequisitions, isLive: false };
    }
    return { data: data as RequisitionItem[], isLive: true };
  } catch {
    return { data: fallbackRequisitions, isLive: false };
  }
}

export async function getSyntheticEmployees(limit: number = 300): Promise<{ data: any[]; isLive: boolean }> {
  if (!supabase) {
    return { data: [], isLive: false };
  }
  try {
    const { data, error } = await supabase.from("synthetic_employees").select("*").limit(limit);
    if (error || !data || data.length === 0) {
      return { data: [], isLive: false };
    }
    return { data, isLive: true };
  } catch {
    return { data: [], isLive: false };
  }
}

export function getDataProvenance(): ProvenanceRecord[] {
  return dataProvenanceRegistry;
}

export async function getExitEvents(): Promise<{ data: ExitEvent[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackExitEvents, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("exit_events").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackExitEvents, isLive: false };
    }
    return { data: data as ExitEvent[], isLive: true };
  } catch {
    return { data: fallbackExitEvents, isLive: false };
  }
}

export async function getTenureBands(): Promise<{ data: TenureBand[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackTenureBands, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("tenure_bands").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackTenureBands, isLive: false };
    }
    return { data: data as TenureBand[], isLive: true };
  } catch {
    return { data: fallbackTenureBands, isLive: false };
  }
}

export async function getVoiceThemes(): Promise<{ data: VoiceTheme[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackVoiceThemes, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("voice_themes").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackVoiceThemes, isLive: false };
    }
    return { data: data as VoiceTheme[], isLive: true };
  } catch {
    return { data: fallbackVoiceThemes, isLive: false };
  }
}

export async function getPipelineLayers(): Promise<{ data: PipelineLayer[]; isLive: boolean }> {
  return { data: fallbackPipelineLayers, isLive: false };
}

export async function getRoadmapHorizons(): Promise<{ data: RoadmapHorizon[]; isLive: boolean }> {
  return { data: fallbackRoadmapHorizons, isLive: false };
}

export async function getMetricDefinitions(): Promise<{ data: MetricDefinition[]; isLive: boolean }> {
  return { data: fallbackMetricDefinitions, isLive: false };
}

// ═══════════════════════════════════════════════════════════════
// Live Database CRUD: CliftonStrengths & Frontline Capability Framework
// ═══════════════════════════════════════════════════════════════

export async function getCliftonStrengths(): Promise<{ data: CliftonStrength[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackCliftonStrengths, isLive: false };
  }
  try {
    const { data, error } = await supabase
      .from("dim_clifton_strength")
      .select("*")
      .order("domain", { ascending: true })
      .order("strength_name", { ascending: true });
    if (error || !data || data.length === 0) {
      return { data: fallbackCliftonStrengths, isLive: false };
    }
    return { data: data as CliftonStrength[], isLive: true };
  } catch {
    return { data: fallbackCliftonStrengths, isLive: false };
  }
}

export async function getCapabilities(): Promise<{ data: CapabilityItem[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackCapabilities, isLive: false };
  }
  try {
    const { data, error } = await supabase
      .from("dim_capability")
      .select("*")
      .order("capability_code", { ascending: true });
    if (error || !data || data.length === 0) {
      return { data: fallbackCapabilities, isLive: false };
    }
    return { data: data as CapabilityItem[], isLive: true };
  } catch {
    return { data: fallbackCapabilities, isLive: false };
  }
}

export async function getRoleCapabilityRequirements(roleName?: string): Promise<{ data: RoleCapabilityRequirement[]; isLive: boolean }> {
  if (!supabase) {
    const filtered = roleName
      ? fallbackRoleCapabilityRequirements.filter((r) => r.role_name.toLowerCase() === roleName.toLowerCase())
      : fallbackRoleCapabilityRequirements;
    return { data: filtered, isLive: false };
  }
  try {
    let query = supabase.from("role_capability_requirement").select("*").eq("active_flag", true);
    if (roleName) {
      query = query.eq("role_name", roleName);
    }
    const { data, error } = await query.order("role_name", { ascending: true }).order("criticality_rank", { ascending: true });
    if (error || !data || data.length === 0) {
      const filtered = roleName
        ? fallbackRoleCapabilityRequirements.filter((r) => r.role_name.toLowerCase() === roleName.toLowerCase())
        : fallbackRoleCapabilityRequirements;
      return { data: filtered, isLive: false };
    }
    return { data: data as RoleCapabilityRequirement[], isLive: true };
  } catch {
    const filtered = roleName
      ? fallbackRoleCapabilityRequirements.filter((r) => r.role_name.toLowerCase() === roleName.toLowerCase())
      : fallbackRoleCapabilityRequirements;
    return { data: filtered, isLive: false };
  }
}

export async function createCapability(payload: {
  capability_code: string;
  capability_name: string;
  domain: string;
  description: string;
}): Promise<{ success: boolean; data?: CapabilityItem; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }
  try {
    const { data, error } = await supabase
      .from("dim_capability")
      .insert([payload])
      .select()
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as CapabilityItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create capability" };
  }
}

export async function updateCapability(
  capabilityId: string,
  payload: Partial<CapabilityItem>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }
  try {
    const { error } = await supabase
      .from("dim_capability")
      .update(payload)
      .eq("capability_id", capabilityId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update capability" };
  }
}

export async function deleteCapability(capabilityId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }
  try {
    const { error } = await supabase
      .from("dim_capability")
      .delete()
      .eq("capability_id", capabilityId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete capability" };
  }
}

export async function saveRoleCapabilityRequirements(
  requirements: Array<{
    role_name: string;
    capability_code: string;
    capability_name: string;
    required_level: number;
    weight: number;
  }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }
  try {
    const { data, error } = await supabase
      .from("role_capability_requirement")
      .upsert(
        requirements.map((r) => ({
          role_name: r.role_name,
          capability_code: r.capability_code,
          capability_name: r.capability_name,
          required_level: r.required_level,
          weight: r.weight,
          active_flag: true,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "role_name,capability_code" }
      )
      .select();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, count: data?.length || requirements.length };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save requirements" };
  }
}

export async function getCapabilityRoadmaps(
  capabilityCode?: string
): Promise<{ data: CapabilityLevelRoadmap[]; isLive: boolean }> {
  if (!supabase) {
    const filtered = capabilityCode
      ? fallbackCapabilityRoadmaps.filter((r) => r.capability_code === capabilityCode)
      : fallbackCapabilityRoadmaps;
    return { data: filtered, isLive: false };
  }
  try {
    let query = supabase
      .from("capability_level_roadmap")
      .select("*")
      .order("level_number", { ascending: true });
    if (capabilityCode) {
      query = query.eq("capability_code", capabilityCode);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const filtered = capabilityCode
        ? fallbackCapabilityRoadmaps.filter((r) => r.capability_code === capabilityCode)
        : fallbackCapabilityRoadmaps;
      return { data: filtered, isLive: false };
    }
    return { data: data as CapabilityLevelRoadmap[], isLive: true };
  } catch {
    const filtered = capabilityCode
      ? fallbackCapabilityRoadmaps.filter((r) => r.capability_code === capabilityCode)
      : fallbackCapabilityRoadmaps;
    return { data: filtered, isLive: false };
  }
}

export async function saveCapabilityRoadmaps(
  roadmaps: Array<{
    capability_code: string;
    level_number: number;
    behavioral_anchor: string;
    prerequisite_course: string;
    required_certification?: string | null;
    delivery_method: string;
    verification_criteria: string;
  }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Database client unavailable" };
  }
  try {
    const { data, error } = await supabase
      .from("capability_level_roadmap")
      .upsert(
        roadmaps.map((r) => ({
          capability_code: r.capability_code,
          level_number: r.level_number,
          behavioral_anchor: r.behavioral_anchor,
          prerequisite_course: r.prerequisite_course,
          required_certification: r.required_certification || null,
          delivery_method: r.delivery_method,
          verification_criteria: r.verification_criteria,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "capability_code,level_number" }
      )
      .select();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, count: data?.length || roadmaps.length };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save roadmaps" };
  }
}



