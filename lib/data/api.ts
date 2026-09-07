import { supabase } from "@/lib/supabaseClient";
import {
  VacancyKPI,
  RetentionCohort,
  EngagementSummary,
  InternalMobilityMatch,
  ProvenanceRecord,
  fallbackVacancyKPIs,
  fallbackRetentionCohorts,
  fallbackEngagementSummaries,
  fallbackMobilityMatches,
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
