// FIT HUB People Intelligence
// Local Typed Data Fixtures & Fallback Repository
// ponytail: Offline-resilient data layer. Ensures executive presentations never fail even without internet connectivity.

export interface VacancyKPI {
  kpi_id: string;
  role_name: string;
  location_name: string;
  open_requisitions: number;
  replacement_share_pct: number;
  beyond_sla_pct: number;
  median_ttf_days: number;
  pressure_level: "CRITICAL" | "ATTENTION" | "NORMAL";
  talent_pool_count: number;
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export interface RetentionCohort {
  cohort_id: string;
  role_name: string;
  location_name: string;
  headcount: number;
  annualized_turnover_pct: number;
  early_attrition_pct: number; // < 12 Months
  dip_tenure_pct: number; // 1Y to 1.5Y
  regrettable_loss_pct: number;
  primary_exit_driver: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export interface EngagementSummary {
  summary_id: string;
  role_name: string;
  location_name: string;
  enps_score: number;
  promoter_pct: number;
  passive_pct: number;
  detractor_pct: number;
  compensation_benefit_score: number;
  career_growth_score: number;
  supportive_workplace_score: number;
  work_clarity_score: number;
  organisation_alignment_score: number;
  fair_performance_score: number;
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export interface InternalMobilityMatch {
  match_id: string;
  candidate_name: string;
  employee_code: string;
  current_role_name: string;
  current_location_name: string;
  target_role_name: string;
  target_location_name: string;
  readiness_status: "Ready" | "Near Ready" | "Development Needed";
  final_readiness_score: number;
  capability_coverage_pct: number;
  performance_rating: number;
  tenure_months: number;
  critical_gap_count: number;
  top_strength: string;
  priority_development_action: string;
  data_provenance: "SYNTHETIC_ENABLER";
}

export interface ProvenanceRecord {
  domain: string;
  metric_or_entity: string;
  source_type: "Observed Historical Case" | "Synthetic Future-State";
  original_source_file: string;
  governance_rule: string;
  impact_on_decision: string;
}

// Fallback Fixtures (Pre-loaded from Cleaned Case Data + Synthetic Life-Cycle Engine)
export const fallbackVacancyKPIs: VacancyKPI[] = [
  {
    kpi_id: "vac-01",
    role_name: "Operation Specialist",
    location_name: "Bali",
    open_requisitions: 14,
    replacement_share_pct: 85.7,
    beyond_sla_pct: 42.9,
    median_ttf_days: 34.0,
    pressure_level: "CRITICAL",
    talent_pool_count: 8,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-02",
    role_name: "Personal Trainer",
    location_name: "Bali",
    open_requisitions: 9,
    replacement_share_pct: 77.8,
    beyond_sla_pct: 33.3,
    median_ttf_days: 31.5,
    pressure_level: "CRITICAL",
    talent_pool_count: 5,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-03",
    role_name: "Membership Consultant",
    location_name: "Bali",
    open_requisitions: 6,
    replacement_share_pct: 66.7,
    beyond_sla_pct: 33.3,
    median_ttf_days: 29.0,
    pressure_level: "ATTENTION",
    talent_pool_count: 4,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-04",
    role_name: "Operation Specialist",
    location_name: "Surabaya",
    open_requisitions: 18,
    replacement_share_pct: 72.2,
    beyond_sla_pct: 27.8,
    median_ttf_days: 28.0,
    pressure_level: "ATTENTION",
    talent_pool_count: 12,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-05",
    role_name: "Personal Trainer",
    location_name: "Surabaya",
    open_requisitions: 12,
    replacement_share_pct: 66.7,
    beyond_sla_pct: 25.0,
    median_ttf_days: 27.0,
    pressure_level: "NORMAL",
    talent_pool_count: 9,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-06",
    role_name: "Operation Specialist",
    location_name: "Jakarta Barat",
    open_requisitions: 22,
    replacement_share_pct: 68.2,
    beyond_sla_pct: 18.2,
    median_ttf_days: 25.5,
    pressure_level: "NORMAL",
    talent_pool_count: 16,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-07",
    role_name: "Membership Consultant",
    location_name: "Jakarta Barat",
    open_requisitions: 15,
    replacement_share_pct: 60.0,
    beyond_sla_pct: 20.0,
    median_ttf_days: 26.0,
    pressure_level: "NORMAL",
    talent_pool_count: 11,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-08",
    role_name: "Operation Specialist",
    location_name: "Tangerang",
    open_requisitions: 16,
    replacement_share_pct: 75.0,
    beyond_sla_pct: 25.0,
    median_ttf_days: 28.5,
    pressure_level: "ATTENTION",
    talent_pool_count: 10,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-09",
    role_name: "Personal Trainer",
    location_name: "Jakarta Selatan",
    open_requisitions: 14,
    replacement_share_pct: 64.3,
    beyond_sla_pct: 21.4,
    median_ttf_days: 26.0,
    pressure_level: "NORMAL",
    talent_pool_count: 14,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    kpi_id: "vac-10",
    role_name: "Operation Specialist",
    location_name: "Bandung",
    open_requisitions: 10,
    replacement_share_pct: 70.0,
    beyond_sla_pct: 20.0,
    median_ttf_days: 26.5,
    pressure_level: "NORMAL",
    talent_pool_count: 7,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackRetentionCohorts: RetentionCohort[] = [
  {
    cohort_id: "ret-01",
    role_name: "Operation Specialist",
    location_name: "Bali",
    headcount: 48,
    annualized_turnover_pct: 62.5,
    early_attrition_pct: 68.4,
    dip_tenure_pct: 21.1,
    regrettable_loss_pct: 31.6,
    primary_exit_driver: "Career Development",
    risk_level: "HIGH",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-02",
    role_name: "Personal Trainer",
    location_name: "Bali",
    headcount: 36,
    annualized_turnover_pct: 55.6,
    early_attrition_pct: 58.3,
    dip_tenure_pct: 25.0,
    regrettable_loss_pct: 33.3,
    primary_exit_driver: "Compensation & Commission Volatility",
    risk_level: "HIGH",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-03",
    role_name: "Operation Specialist",
    location_name: "Surabaya",
    headcount: 64,
    annualized_turnover_pct: 48.4,
    early_attrition_pct: 56.2,
    dip_tenure_pct: 21.9,
    regrettable_loss_pct: 28.1,
    primary_exit_driver: "Career Development",
    risk_level: "MEDIUM",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-04",
    role_name: "Membership Consultant",
    location_name: "Surabaya",
    headcount: 42,
    annualized_turnover_pct: 52.4,
    early_attrition_pct: 61.9,
    dip_tenure_pct: 19.0,
    regrettable_loss_pct: 23.8,
    primary_exit_driver: "Target Pressure & Work Life Balance",
    risk_level: "HIGH",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-05",
    role_name: "Operation Specialist",
    location_name: "Jakarta Barat",
    headcount: 82,
    annualized_turnover_pct: 42.7,
    early_attrition_pct: 52.4,
    dip_tenure_pct: 24.4,
    regrettable_loss_pct: 24.4,
    primary_exit_driver: "Career Development",
    risk_level: "MEDIUM",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-06",
    role_name: "Personal Trainer",
    location_name: "Jakarta Selatan",
    headcount: 58,
    annualized_turnover_pct: 44.8,
    early_attrition_pct: 51.7,
    dip_tenure_pct: 27.6,
    regrettable_loss_pct: 29.3,
    primary_exit_driver: "Career Development",
    risk_level: "MEDIUM",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-07",
    role_name: "Operation Specialist",
    location_name: "Tangerang",
    headcount: 54,
    annualized_turnover_pct: 50.0,
    early_attrition_pct: 59.3,
    dip_tenure_pct: 22.2,
    regrettable_loss_pct: 25.9,
    primary_exit_driver: "Working Environment & Facilities",
    risk_level: "HIGH",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    cohort_id: "ret-08",
    role_name: "Club Manager",
    location_name: "Jabodetabek Area",
    headcount: 24,
    annualized_turnover_pct: 20.8,
    early_attrition_pct: 20.0,
    dip_tenure_pct: 40.0,
    regrettable_loss_pct: 40.0,
    primary_exit_driver: "Relocation & Better Offer",
    risk_level: "LOW",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackEngagementSummaries: EngagementSummary[] = [
  {
    summary_id: "eng-01",
    role_name: "All Roles (Organization Benchmark)",
    location_name: "National Total",
    enps_score: 56.6,
    promoter_pct: 68.0,
    passive_pct: 20.6,
    detractor_pct: 11.4,
    compensation_benefit_score: 4.96,
    career_growth_score: 5.22,
    supportive_workplace_score: 5.58,
    work_clarity_score: 5.45,
    organisation_alignment_score: 5.62,
    fair_performance_score: 5.34,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-02",
    role_name: "Operation Specialist",
    location_name: "Bali",
    enps_score: 48.0,
    promoter_pct: 62.5,
    passive_pct: 23.0,
    detractor_pct: 14.5,
    compensation_benefit_score: 4.82,
    career_growth_score: 4.95,
    supportive_workplace_score: 5.4,
    work_clarity_score: 5.3,
    organisation_alignment_score: 5.5,
    fair_performance_score: 5.15,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-03",
    role_name: "Personal Trainer",
    location_name: "Bali",
    enps_score: 52.0,
    promoter_pct: 65.0,
    passive_pct: 22.0,
    detractor_pct: 13.0,
    compensation_benefit_score: 4.88,
    career_growth_score: 5.1,
    supportive_workplace_score: 5.48,
    work_clarity_score: 5.35,
    organisation_alignment_score: 5.55,
    fair_performance_score: 5.2,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-04",
    role_name: "Operation Specialist",
    location_name: "Jabodetabek",
    enps_score: 58.5,
    promoter_pct: 69.5,
    passive_pct: 19.5,
    detractor_pct: 11.0,
    compensation_benefit_score: 5.02,
    career_growth_score: 5.28,
    supportive_workplace_score: 5.62,
    work_clarity_score: 5.48,
    organisation_alignment_score: 5.65,
    fair_performance_score: 5.38,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackMobilityMatches: InternalMobilityMatch[] = [
  {
    match_id: "mob-01",
    candidate_name: "Dimas Arya Pratama",
    employee_code: "FH-EMP-1042",
    current_role_name: "Operation Specialist",
    current_location_name: "Surabaya",
    target_role_name: "Assistant Club Manager",
    target_location_name: "Bali",
    readiness_status: "Ready",
    final_readiness_score: 89.5,
    capability_coverage_pct: 92.0,
    performance_rating: 4.65,
    tenure_months: 22,
    critical_gap_count: 0,
    top_strength: "Floor Leadership & Safety Protocol",
    priority_development_action: "30-day shift shadow with Area Manager",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-02",
    candidate_name: "Siti Nurhaliza",
    employee_code: "FH-EMP-1088",
    current_role_name: "Operation Specialist",
    current_location_name: "Jakarta Barat",
    target_role_name: "Assistant Club Manager",
    target_location_name: "Tangerang",
    readiness_status: "Ready",
    final_readiness_score: 86.8,
    capability_coverage_pct: 88.0,
    performance_rating: 4.5,
    tenure_months: 18,
    critical_gap_count: 0,
    top_strength: "POS Resolution & Member Retention",
    priority_development_action: "Direct club operation delegation assignment",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-03",
    candidate_name: "Kevin Christian",
    employee_code: "FH-EMP-1120",
    current_role_name: "Personal Trainer",
    current_location_name: "Surabaya",
    target_role_name: "Fitness Lead",
    target_location_name: "Bali",
    readiness_status: "Near Ready",
    final_readiness_score: 78.4,
    capability_coverage_pct: 80.0,
    performance_rating: 4.25,
    tenure_months: 16,
    critical_gap_count: 1,
    top_strength: "Biomechanics & PT Revenue Coaching",
    priority_development_action: "Complete Level 2 supervisory coaching module",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-04",
    candidate_name: "Reza Fahlevi",
    employee_code: "FH-EMP-1154",
    current_role_name: "Membership Consultant",
    current_location_name: "Jakarta Selatan",
    target_role_name: "Sales Lead",
    target_location_name: "Bali",
    readiness_status: "Near Ready",
    final_readiness_score: 74.2,
    capability_coverage_pct: 75.0,
    performance_rating: 4.1,
    tenure_months: 14,
    critical_gap_count: 1,
    top_strength: "B2B Corporate Outreach & Closing",
    priority_development_action: "Shadow high-performing Sales Lead in Central Gym",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-05",
    candidate_name: "Agus Setiawan",
    employee_code: "FH-EMP-1205",
    current_role_name: "Operation Specialist",
    current_location_name: "Bali",
    target_role_name: "Assistant Club Manager",
    target_location_name: "Bali",
    readiness_status: "Development Needed",
    final_readiness_score: 65.0,
    capability_coverage_pct: 60.0,
    performance_rating: 3.85,
    tenure_months: 10,
    critical_gap_count: 2,
    top_strength: "Gym Floor Hygiene & Equipment SOP",
    priority_development_action: "Structured mentoring program on commercial conversions",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-06",
    candidate_name: "Nadia Safitri",
    employee_code: "FH-EMP-1240",
    current_role_name: "Personal Trainer",
    current_location_name: "Jakarta Barat",
    target_role_name: "Fitness Lead",
    target_location_name: "Jakarta Barat",
    readiness_status: "Ready",
    final_readiness_score: 88.0,
    capability_coverage_pct: 90.0,
    performance_rating: 4.7,
    tenure_months: 20,
    critical_gap_count: 0,
    top_strength: "PT Program Architecture & Client Retention",
    priority_development_action: "Lead trainer onboarding workshop",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-07",
    candidate_name: "Budi Santoso",
    employee_code: "FH-EMP-1277",
    current_role_name: "Operation Specialist",
    current_location_name: "Tangerang",
    target_role_name: "Assistant Club Manager",
    target_location_name: "Jakarta Barat",
    readiness_status: "Near Ready",
    final_readiness_score: 76.5,
    capability_coverage_pct: 78.0,
    performance_rating: 4.3,
    tenure_months: 15,
    critical_gap_count: 1,
    top_strength: "Member Inquiries & Front-Desk SOP",
    priority_development_action: "Financial administration & shift roster planning",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    match_id: "mob-08",
    candidate_name: "Fitri Handayani",
    employee_code: "FH-EMP-1312",
    current_role_name: "Membership Consultant",
    current_location_name: "Bandung",
    target_role_name: "Sales Lead",
    target_location_name: "Surabaya",
    readiness_status: "Ready",
    final_readiness_score: 87.2,
    capability_coverage_pct: 88.0,
    performance_rating: 4.6,
    tenure_months: 19,
    critical_gap_count: 0,
    top_strength: "Consistent Monthly Target Overachievement",
    priority_development_action: "Assigned regional new-club pre-sale project",
    data_provenance: "SYNTHETIC_ENABLER",
  },
];

export const dataProvenanceRegistry: ProvenanceRecord[] = [
  {
    domain: "Hiring",
    metric_or_entity: "Requisitions & Time-to-Fill (1,552 hires)",
    source_type: "Observed Historical Case",
    original_source_file: "Hiring sheet",
    governance_rule: "Exact historical extraction, no backfilled IDs inferred.",
    impact_on_decision: "Empirical SLA and replacement share baseline (68.4% replacement).",
  },
  {
    domain: "Turnover",
    metric_or_entity: "Exits & Early Tenure Cliff (888 departures)",
    source_type: "Observed Historical Case",
    original_source_file: "Turnover sheet",
    governance_rule: "Voluntary vs Involuntary and Regrettability preserved as documented.",
    impact_on_decision: "Pins <12M onboarding failure and 1Y to 1.5Y retention dip.",
  },
  {
    domain: "Experience",
    metric_or_entity: "eNPS (+56.6) & 6 Dimensions (1,234 respondents)",
    source_type: "Observed Historical Case",
    original_source_file: "Engagement sheet",
    governance_rule: "Subject to survivorship bias disclosure.",
    impact_on_decision: "Highlights Compensation & Benefit deficit (4.96) alongside high loyalty.",
  },
  {
    domain: "Mobility",
    metric_or_entity: "Mercer Capability Framework & Candidate Scoring",
    source_type: "Synthetic Future-State",
    original_source_file: "010_internal_mobility_engine.sql",
    governance_rule: "Illustrative weights for prototype demonstration only.",
    impact_on_decision: "Solves #1 exit driver (Career Development) by matching internal staff to vacancies.",
  },
];

export interface RequisitionItem {
  req_code: string;
  role_name: string;
  location_name: string;
  hiring_type: "Replacement" | "Expansion";
  openings: number;
  days_open: number;
  sla_target_days: number;
  sla_status: "WITHIN_SLA" | "AT_RISK" | "BREACHED";
  pipeline_size: number;
  bottleneck_stage: string;
  health: "Healthy" | "At Risk" | "Critical";
  hiring_manager: string;
  linked_exit_code?: string;
  urgency_reason: string;
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export interface SourcingChannelMetric {
  channel_name: string;
  applicants: number;
  hires: number;
  conversion_rate_pct: number;
  beyond_sla_rate_pct: number;
  median_ttf_days: number;
  offer_acceptance_pct: number;
  six_month_retention_pct: number;
  quality_rating: number; // 1 to 5 scale
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export interface FunnelStageMetric {
  stage_name: string;
  stage_order: number;
  candidate_count: number;
  conversion_from_top_pct: number;
  stage_conversion_pct: number;
  median_days_in_stage: number;
  is_bottleneck: boolean;
  bottleneck_note: string;
}

export interface TalentPoolCandidate {
  candidate_id: string;
  display_name: string;
  role_target: string;
  location_preference: string;
  readiness_status: "Interview Ready" | "Pre-qualified" | "Previous Finalist" | "Active Outreach";
  source_channel: string;
  fit_score: number;
  verified_competencies: string[];
  est_ttf_days: number;
  last_activity_date: string;
  notes: string;
  data_provenance: "SYNTHETIC_ENABLER";
}

export interface HiringOutcomeMetric {
  period_label: string;
  beyond_sla_pct: number;
  median_ttf_days: number;
  six_month_retention_pct: number;
  ramp_up_speed_pct: number;
  manager_rating_avg: number;
}

export const fallbackRequisitions: RequisitionItem[] = [
  {
    req_code: "REQ-BLI-0104",
    role_name: "Operation Specialist",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 4,
    days_open: 42,
    sla_target_days: 28,
    sla_status: "BREACHED",
    pipeline_size: 6,
    bottleneck_stage: "Manager Interview",
    health: "Critical",
    hiring_manager: "Bambang Wijaya (Club GM)",
    linked_exit_code: "EXT-BLI-0089",
    urgency_reason: "Front desk shift shortage causing overtime surge and member check-in delays",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-BLI-0109",
    role_name: "Personal Trainer",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 3,
    days_open: 36,
    sla_target_days: 28,
    sla_status: "BREACHED",
    pipeline_size: 5,
    bottleneck_stage: "Technical Audition",
    health: "Critical",
    hiring_manager: "Wayan Surya (Fitness Manager)",
    linked_exit_code: "EXT-BLI-0094",
    urgency_reason: "Client session backlog in Sunset Road branch following senior trainer resignations",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-BLI-0115",
    role_name: "Membership Consultant",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 2,
    days_open: 26,
    sla_target_days: 28,
    sla_status: "AT_RISK",
    pipeline_size: 7,
    bottleneck_stage: "HR Screening",
    health: "At Risk",
    hiring_manager: "Ni Made Sari (Commercial Lead)",
    linked_exit_code: "EXT-BLI-0102",
    urgency_reason: "Target coverage drop in Q3 high-season tourist conversion drive",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-SBY-0202",
    role_name: "Operation Specialist",
    location_name: "Surabaya",
    hiring_type: "Replacement",
    openings: 5,
    days_open: 31,
    sla_target_days: 28,
    sla_status: "BREACHED",
    pipeline_size: 11,
    bottleneck_stage: "HR Screening",
    health: "At Risk",
    hiring_manager: "Hendra Gunawan (Club GM)",
    linked_exit_code: "EXT-SBY-0144",
    urgency_reason: "East Java cluster cluster expansion backfill following internal promotion",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-SBY-0218",
    role_name: "Personal Trainer",
    location_name: "Surabaya",
    hiring_type: "Expansion",
    openings: 3,
    days_open: 22,
    sla_target_days: 28,
    sla_status: "WITHIN_SLA",
    pipeline_size: 9,
    bottleneck_stage: "Manager Interview",
    health: "Healthy",
    hiring_manager: "Arief Hidayat (Fitness Manager)",
    urgency_reason: "New PT studio line launch in Pakuwon Mall branch",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-JKB-0301",
    role_name: "Operation Specialist",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 6,
    days_open: 21,
    sla_target_days: 28,
    sla_status: "WITHIN_SLA",
    pipeline_size: 18,
    bottleneck_stage: "Final Offer",
    health: "Healthy",
    hiring_manager: "Rian Pratama (Area Operations Lead)",
    linked_exit_code: "EXT-JKB-0231",
    urgency_reason: "Routine turnover backfill in flagship West Jakarta hub",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-JKB-0312",
    role_name: "Membership Consultant",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 4,
    days_open: 24,
    sla_target_days: 28,
    sla_status: "WITHIN_SLA",
    pipeline_size: 12,
    bottleneck_stage: "Offer Acceptance",
    health: "Healthy",
    hiring_manager: "Dewi Anggraini (Regional Sales Lead)",
    linked_exit_code: "EXT-JKB-0245",
    urgency_reason: "Presale campaign demand for Q4 membership targets",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-JKS-0405",
    role_name: "Personal Trainer",
    location_name: "Jakarta Selatan",
    hiring_type: "Replacement",
    openings: 4,
    days_open: 25,
    sla_target_days: 28,
    sla_status: "WITHIN_SLA",
    pipeline_size: 14,
    bottleneck_stage: "Technical Audition",
    health: "Healthy",
    hiring_manager: "Farhan Mahendra (Fitness Lead)",
    linked_exit_code: "EXT-JKS-0198",
    urgency_reason: "VIP member coaching roster coverage",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-TNG-0502",
    role_name: "Operation Specialist",
    location_name: "Tangerang",
    hiring_type: "Replacement",
    openings: 4,
    days_open: 29,
    sla_target_days: 28,
    sla_status: "BREACHED",
    pipeline_size: 8,
    bottleneck_stage: "Candidate Sourcing",
    health: "At Risk",
    hiring_manager: "Eko Prasetyo (Club GM)",
    linked_exit_code: "EXT-TNG-0112",
    urgency_reason: "Weekend shift coverage shortfall in Bintaro and BSD clubs",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-BDG-0601",
    role_name: "Operation Specialist",
    location_name: "Bandung",
    hiring_type: "Expansion",
    openings: 2,
    days_open: 18,
    sla_target_days: 28,
    sla_status: "WITHIN_SLA",
    pipeline_size: 9,
    bottleneck_stage: "Manager Interview",
    health: "Healthy",
    hiring_manager: "Ilham Ramadhan (Club GM)",
    urgency_reason: "Extended operating hours initiative for university member demographic",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-BLI-0120",
    role_name: "Assistant Club Manager",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 38,
    sla_target_days: 35,
    sla_status: "BREACHED",
    pipeline_size: 4,
    bottleneck_stage: "Executive Panel",
    health: "Critical",
    hiring_manager: "Tri Purnomo (Regional VP)",
    linked_exit_code: "EXT-BLI-0077",
    urgency_reason: "Club leadership gap in Canggu branch, strong candidate for internal mobility fast-track",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-SBY-0224",
    role_name: "Membership Consultant",
    location_name: "Surabaya",
    hiring_type: "Replacement",
    openings: 3,
    days_open: 23,
    sla_target_days: 28,
    sla_status: "WITHIN_SLA",
    pipeline_size: 8,
    bottleneck_stage: "HR Screening",
    health: "Healthy",
    hiring_manager: "Hendra Gunawan (Club GM)",
    linked_exit_code: "EXT-SBY-0160",
    urgency_reason: "Mid-year corporate B2B sales push",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackSourcingChannels: SourcingChannelMetric[] = [
  {
    channel_name: "Employee Referral",
    applicants: 420,
    hires: 118,
    conversion_rate_pct: 28.1,
    beyond_sla_rate_pct: 12.0,
    median_ttf_days: 21.0,
    offer_acceptance_pct: 92.4,
    six_month_retention_pct: 84.5,
    quality_rating: 4.8,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    channel_name: "Direct Career Site",
    applicants: 640,
    hires: 94,
    conversion_rate_pct: 14.7,
    beyond_sla_rate_pct: 22.0,
    median_ttf_days: 26.0,
    offer_acceptance_pct: 88.0,
    six_month_retention_pct: 76.2,
    quality_rating: 4.2,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    channel_name: "Job Portal (Aggregator)",
    applicants: 1850,
    hires: 215,
    conversion_rate_pct: 11.6,
    beyond_sla_rate_pct: 26.5,
    median_ttf_days: 28.5,
    offer_acceptance_pct: 85.5,
    six_month_retention_pct: 72.0,
    quality_rating: 3.9,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    channel_name: "Social Media Ads",
    applicants: 980,
    hires: 82,
    conversion_rate_pct: 8.4,
    beyond_sla_rate_pct: 38.0,
    median_ttf_days: 33.0,
    offer_acceptance_pct: 78.0,
    six_month_retention_pct: 61.4,
    quality_rating: 3.2,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    channel_name: "Specialized Search / Agency",
    applicants: 95,
    hires: 22,
    conversion_rate_pct: 23.2,
    beyond_sla_rate_pct: 41.0,
    median_ttf_days: 36.0,
    offer_acceptance_pct: 91.0,
    six_month_retention_pct: 82.0,
    quality_rating: 4.4,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackFunnelStages: FunnelStageMetric[] = [
  {
    stage_name: "Applications Received",
    stage_order: 1,
    candidate_count: 3985,
    conversion_from_top_pct: 100.0,
    stage_conversion_pct: 100.0,
    median_days_in_stage: 3.2,
    is_bottleneck: false,
    bottleneck_note: "Top of funnel healthy, volume driven by digital aggregators",
  },
  {
    stage_name: "Initial HR Screening",
    stage_order: 2,
    candidate_count: 1840,
    conversion_from_top_pct: 46.2,
    stage_conversion_pct: 46.2,
    median_days_in_stage: 6.8,
    is_bottleneck: true,
    bottleneck_note: "High drop-off due to basic shift flexibility and location mismatch in Bali/Surabaya",
  },
  {
    stage_name: "Hiring Manager Interview",
    stage_order: 3,
    candidate_count: 920,
    conversion_from_top_pct: 23.1,
    stage_conversion_pct: 50.0,
    median_days_in_stage: 8.4,
    is_bottleneck: true,
    bottleneck_note: "Club GM scheduling congestion delays candidate turnaround by average 4.6 days beyond standard",
  },
  {
    stage_name: "Formal Offer Extended",
    stage_order: 4,
    candidate_count: 580,
    conversion_from_top_pct: 14.6,
    stage_conversion_pct: 63.0,
    median_days_in_stage: 4.1,
    is_bottleneck: false,
    bottleneck_note: "Standard offer generation cycle within SLA",
  },
  {
    stage_name: "Hired & Onboarded",
    stage_order: 5,
    candidate_count: 531,
    conversion_from_top_pct: 13.3,
    stage_conversion_pct: 91.6,
    median_days_in_stage: 5.0,
    is_bottleneck: false,
    bottleneck_note: "Final confirmation rate strong across frontline operations",
  },
];

export const fallbackTalentPool: TalentPoolCandidate[] = [
  {
    candidate_id: "CAN-BLI-041",
    display_name: "Made Dananjaya",
    role_target: "Operation Specialist",
    location_preference: "Bali",
    readiness_status: "Interview Ready",
    source_channel: "Ex-Finalist Pool",
    fit_score: 93,
    verified_competencies: ["Member Service SOP", "POS & Cashier Protocol", "Club Safety"],
    est_ttf_days: 9,
    last_activity_date: "2024-08-14",
    notes: "Top finalist from July batch, already passed HR screening, ready for immediate club GM signoff.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-BLI-045",
    display_name: "Ketut Arimbawa",
    role_target: "Personal Trainer",
    location_preference: "Bali",
    readiness_status: "Interview Ready",
    source_channel: "Referral Pipeline",
    fit_score: 90,
    verified_competencies: ["Strength Conditioning", "Client Assessment", "Nutrition Fundamentals"],
    est_ttf_days: 11,
    last_activity_date: "2024-08-18",
    notes: "Referred by Sunset Road Senior Trainer, certified national sports trainer, audition ready.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-BLI-052",
    display_name: "Putu Ayu Lestari",
    role_target: "Membership Consultant",
    location_preference: "Bali",
    readiness_status: "Pre-qualified",
    source_channel: "Alumni Network",
    fit_score: 86,
    verified_competencies: ["B2C Direct Sales", "Consultative Negotiation", "CRM Lead Tracking"],
    est_ttf_days: 12,
    last_activity_date: "2024-08-20",
    notes: "Ex-hospitality sales coordinator, high verbal fluency, completed asynchronous sales pitch test.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-SBY-078",
    display_name: "Rizky Bayu Prasetyo",
    role_target: "Operation Specialist",
    location_preference: "Surabaya",
    readiness_status: "Interview Ready",
    source_channel: "Ex-Finalist Pool",
    fit_score: 91,
    verified_competencies: ["Inventory & SOP", "Member Service SOP", "Incident Reporting"],
    est_ttf_days: 8,
    last_activity_date: "2024-08-12",
    notes: "Prior retail operations lead, ready to deploy immediately to Pakuwon or Merr branch.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-SBY-083",
    display_name: "Bayu Anggoro",
    role_target: "Personal Trainer",
    location_preference: "Surabaya",
    readiness_status: "Pre-qualified",
    source_channel: "Referral Pipeline",
    fit_score: 85,
    verified_competencies: ["Functional Movement", "Client Rapport", "Safety Standards"],
    est_ttf_days: 14,
    last_activity_date: "2024-08-16",
    notes: "Fitness enthusiast community referral, theoretical certification verified.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-JKB-102",
    display_name: "Anisa Rahmawati",
    role_target: "Operation Specialist",
    location_preference: "Jakarta Barat",
    readiness_status: "Interview Ready",
    source_channel: "Referral Pipeline",
    fit_score: 89,
    verified_competencies: ["Cash Management", "Member Service SOP", "Shift Coordination"],
    est_ttf_days: 7,
    last_activity_date: "2024-08-21",
    notes: "Internal staff sibling referral, verified background check completed.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-TNG-115",
    display_name: "Bagas Wicaksono",
    role_target: "Operation Specialist",
    location_preference: "Tangerang",
    readiness_status: "Previous Finalist",
    source_channel: "Ex-Finalist Pool",
    fit_score: 87,
    verified_competencies: ["Equipment Care", "Member Service SOP", "Front Desk Administration"],
    est_ttf_days: 10,
    last_activity_date: "2024-08-10",
    notes: "Runner-up for Q2 BSD requisition, expressed strong interest to fill current open slot.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    candidate_id: "CAN-BDG-128",
    display_name: "Deri Kurniawan",
    role_target: "Operation Specialist",
    location_preference: "Bandung",
    readiness_status: "Pre-qualified",
    source_channel: "Direct Career Site",
    fit_score: 84,
    verified_competencies: ["Member Service SOP", "Shift Flexibility", "Basic First Aid"],
    est_ttf_days: 13,
    last_activity_date: "2024-08-19",
    notes: "Strong operational background in student fitness clubs, ready for manager interview.",
    data_provenance: "SYNTHETIC_ENABLER",
  },
];

export const fallbackHiringOutcomes: HiringOutcomeMetric[] = [
  {
    period_label: "Q4 Previous Year",
    beyond_sla_pct: 34.2,
    median_ttf_days: 32.5,
    six_month_retention_pct: 68.5,
    ramp_up_speed_pct: 74.0,
    manager_rating_avg: 3.9,
  },
  {
    period_label: "Q1 Current Year",
    beyond_sla_pct: 30.1,
    median_ttf_days: 30.0,
    six_month_retention_pct: 71.0,
    ramp_up_speed_pct: 77.5,
    manager_rating_avg: 4.0,
  },
  {
    period_label: "Q2 Current Year",
    beyond_sla_pct: 27.4,
    median_ttf_days: 28.5,
    six_month_retention_pct: 73.8,
    ramp_up_speed_pct: 80.0,
    manager_rating_avg: 4.15,
  },
  {
    period_label: "Q3 Current Year (Active)",
    beyond_sla_pct: 25.0,
    median_ttf_days: 27.5,
    six_month_retention_pct: 75.4,
    ramp_up_speed_pct: 82.5,
    manager_rating_avg: 4.25,
  },
];
