import { supabase } from "@/lib/supabaseClient";
import {
  VacancyKPI,
  RetentionCohort,
  EngagementSummary,
  InternalMobilityMatch,
  ProvenanceRecord,
  RequisitionItem,
  SourcingChannelMetric,
  FunnelStageMetric,
  TalentPoolCandidate,
  HiringOutcomeMetric,
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
  fallbackRequisitions,
  fallbackSourcingChannels,
  fallbackFunnelStages,
  fallbackTalentPool,
  fallbackHiringOutcomes,
  fallbackExitEvents,
  fallbackTenureBands,
  fallbackVoiceThemes,
  fallbackPipelineLayers,
  fallbackRoadmapHorizons,
  fallbackMetricDefinitions,
  dataProvenanceRegistry,
} from "./fixtures";

// ponytail: Unified data access with automatic fallback to pre-bundled typed fixtures.
// If Supabase is reachable, returns live PostgreSQL data; if offline or errored, returns fixtures seamlessly.

export async function getVacancyKPIs(): Promise<{ data: VacancyKPI[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackVacancyKPIs, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("mart_vacancy_kpi").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackVacancyKPIs, isLive: false };
    }
    return { data: data as VacancyKPI[], isLive: true };
  } catch {
    return { data: fallbackVacancyKPIs, isLive: false };
  }
}

export async function getRequisitions(): Promise<{ data: RequisitionItem[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackRequisitions, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("mart_requisitions").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackRequisitions, isLive: false };
    }
    return { data: data as RequisitionItem[], isLive: true };
  } catch {
    return { data: fallbackRequisitions, isLive: false };
  }
}

export async function getSourcingChannels(): Promise<{ data: SourcingChannelMetric[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackSourcingChannels, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("sourcing_channels").select("*");
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
    const { data, error } = await supabase.from("funnel_stages").select("*").order("stage_order", { ascending: true });
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
    const { data, error } = await supabase.from("synthetic_talent_pool").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackTalentPool, isLive: false };
    }
    return { data: data as TalentPoolCandidate[], isLive: true };
  } catch {
    return { data: fallbackTalentPool, isLive: false };
  }
}

export async function getHiringOutcomes(): Promise<{ data: HiringOutcomeMetric[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackHiringOutcomes, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("hiring_outcomes").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackHiringOutcomes, isLive: false };
    }
    return { data: data as HiringOutcomeMetric[], isLive: true };
  } catch {
    return { data: fallbackHiringOutcomes, isLive: false };
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
  targetRole: string = "Assistant Club Manager",
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



