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

