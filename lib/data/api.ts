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
  return { data: fallbackSourcingChannels, isLive: false };
}

export async function getFunnelStages(): Promise<{ data: FunnelStageMetric[]; isLive: boolean }> {
  return { data: fallbackFunnelStages, isLive: false };
}

export async function getTalentPoolCandidates(): Promise<{ data: TalentPoolCandidate[]; isLive: boolean }> {
  return { data: fallbackTalentPool, isLive: false };
}

export async function getHiringOutcomes(): Promise<{ data: HiringOutcomeMetric[]; isLive: boolean }> {
  return { data: fallbackHiringOutcomes, isLive: false };
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

export async function getInternalMobilityMatches(): Promise<{ data: InternalMobilityMatch[]; isLive: boolean }> {
  if (!supabase) {
    return { data: fallbackMobilityMatches, isLive: false };
  }
  try {
    const { data, error } = await supabase.from("mart_internal_mobility_match").select("*");
    if (error || !data || data.length === 0) {
      return { data: fallbackMobilityMatches, isLive: false };
    }
    return { data: data as InternalMobilityMatch[], isLive: true };
  } catch {
    return { data: fallbackMobilityMatches, isLive: false };
  }
}

export function getDataProvenance(): ProvenanceRecord[] {
  return dataProvenanceRegistry;
}

export async function getExitEvents(): Promise<{ data: ExitEvent[]; isLive: boolean }> {
  return { data: fallbackExitEvents, isLive: false };
}

export async function getTenureBands(): Promise<{ data: TenureBand[]; isLive: boolean }> {
  return { data: fallbackTenureBands, isLive: false };
}

export async function getVoiceThemes(): Promise<{ data: VoiceTheme[]; isLive: boolean }> {
  return { data: fallbackVoiceThemes, isLive: false };
}

