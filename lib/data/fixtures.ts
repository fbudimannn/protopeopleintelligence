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
