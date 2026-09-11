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
    role_name: "Customer Service",
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
    role_name: "Fitness Consultant",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Fitness Consultant",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Fitness Consultant",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
    location_name: "National Total",
    enps_score: 49.0,
    promoter_pct: 56.8,
    passive_pct: 35.4,
    detractor_pct: 7.8,
    compensation_benefit_score: 4.88,
    career_growth_score: 5.02,
    supportive_workplace_score: 4.81,
    work_clarity_score: 5.32,
    organisation_alignment_score: 5.48,
    fair_performance_score: 5.08,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-03",
    role_name: "Personal Trainer",
    location_name: "National Total",
    enps_score: 54.5,
    promoter_pct: 61.9,
    passive_pct: 30.7,
    detractor_pct: 7.4,
    compensation_benefit_score: 4.81,
    career_growth_score: 5.41,
    supportive_workplace_score: 5.06,
    work_clarity_score: 5.45,
    organisation_alignment_score: 5.60,
    fair_performance_score: 5.00,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-04",
    role_name: "Fitness Consultant",
    location_name: "National Total",
    enps_score: 52.9,
    promoter_pct: 59.3,
    passive_pct: 34.3,
    detractor_pct: 6.4,
    compensation_benefit_score: 4.86,
    career_growth_score: 5.34,
    supportive_workplace_score: 5.15,
    work_clarity_score: 5.46,
    organisation_alignment_score: 5.58,
    fair_performance_score: 5.03,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-05",
    role_name: "Housekeeping",
    location_name: "National Total",
    enps_score: 73.6,
    promoter_pct: 75.6,
    passive_pct: 22.4,
    detractor_pct: 2.0,
    compensation_benefit_score: 5.28,
    career_growth_score: 5.57,
    supportive_workplace_score: 5.29,
    work_clarity_score: 5.57,
    organisation_alignment_score: 5.70,
    fair_performance_score: 5.16,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-06",
    role_name: "Manajerial Club",
    location_name: "National Total",
    enps_score: 56.7,
    promoter_pct: 59.6,
    passive_pct: 37.5,
    detractor_pct: 2.9,
    compensation_benefit_score: 5.05,
    career_growth_score: 5.18,
    supportive_workplace_score: 5.00,
    work_clarity_score: 5.12,
    organisation_alignment_score: 5.62,
    fair_performance_score: 4.99,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-07",
    role_name: "Customer Service",
    location_name: "Bali",
    enps_score: 28.0,
    promoter_pct: 40.0,
    passive_pct: 48.0,
    detractor_pct: 12.0,
    compensation_benefit_score: 4.36,
    career_growth_score: 4.80,
    supportive_workplace_score: 4.28,
    work_clarity_score: 5.24,
    organisation_alignment_score: 5.40,
    fair_performance_score: 3.96,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-08",
    role_name: "Personal Trainer",
    location_name: "Bali",
    enps_score: 28.0,
    promoter_pct: 36.0,
    passive_pct: 56.0,
    detractor_pct: 8.0,
    compensation_benefit_score: 4.72,
    career_growth_score: 5.28,
    supportive_workplace_score: 4.80,
    work_clarity_score: 5.24,
    organisation_alignment_score: 5.44,
    fair_performance_score: 4.68,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-09",
    role_name: "Fitness Consultant",
    location_name: "Bali",
    enps_score: 55.0,
    promoter_pct: 55.0,
    passive_pct: 45.0,
    detractor_pct: 0.0,
    compensation_benefit_score: 4.80,
    career_growth_score: 5.25,
    supportive_workplace_score: 5.00,
    work_clarity_score: 5.35,
    organisation_alignment_score: 5.50,
    fair_performance_score: 5.15,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-10",
    role_name: "Housekeeping",
    location_name: "Bali",
    enps_score: 50.0,
    promoter_pct: 64.3,
    passive_pct: 21.4,
    detractor_pct: 14.3,
    compensation_benefit_score: 4.79,
    career_growth_score: 5.36,
    supportive_workplace_score: 4.93,
    work_clarity_score: 5.43,
    organisation_alignment_score: 5.57,
    fair_performance_score: 4.86,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-11",
    role_name: "Customer Service",
    location_name: "Jabodetabek",
    enps_score: 52.7,
    promoter_pct: 61.3,
    passive_pct: 30.2,
    detractor_pct: 8.6,
    compensation_benefit_score: 5.09,
    career_growth_score: 5.23,
    supportive_workplace_score: 4.84,
    work_clarity_score: 5.35,
    organisation_alignment_score: 5.50,
    fair_performance_score: 4.80,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-12",
    role_name: "Personal Trainer",
    location_name: "Jabodetabek",
    enps_score: 55.1,
    promoter_pct: 62.3,
    passive_pct: 30.5,
    detractor_pct: 7.2,
    compensation_benefit_score: 4.76,
    career_growth_score: 5.42,
    supportive_workplace_score: 5.10,
    work_clarity_score: 5.48,
    organisation_alignment_score: 5.62,
    fair_performance_score: 5.01,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-13",
    role_name: "Fitness Consultant",
    location_name: "Jabodetabek",
    enps_score: 54.8,
    promoter_pct: 60.2,
    passive_pct: 34.4,
    detractor_pct: 5.4,
    compensation_benefit_score: 4.85,
    career_growth_score: 5.35,
    supportive_workplace_score: 5.18,
    work_clarity_score: 5.48,
    organisation_alignment_score: 5.60,
    fair_performance_score: 5.02,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    summary_id: "eng-14",
    role_name: "Housekeeping",
    location_name: "Jabodetabek",
    enps_score: 76.7,
    promoter_pct: 78.3,
    passive_pct: 20.1,
    detractor_pct: 1.6,
    compensation_benefit_score: 5.31,
    career_growth_score: 5.54,
    supportive_workplace_score: 5.32,
    work_clarity_score: 5.58,
    organisation_alignment_score: 5.72,
    fair_performance_score: 5.14,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackMobilityMatches: InternalMobilityMatch[] = [
  {
    match_id: "mob-01",
    candidate_name: "Dimas Arya Pratama",
    employee_code: "FH-EMP-1042",
    current_role_name: "Customer Service",
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
    current_role_name: "Customer Service",
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
    current_role_name: "Fitness Consultant",
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
    current_role_name: "Customer Service",
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
    current_role_name: "Customer Service",
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
    current_role_name: "Fitness Consultant",
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
    metric_or_entity: "FIT HUB Capability Framework & Candidate Scoring",
    source_type: "Synthetic Future-State",
    original_source_file: "010_internal_mobility_engine.sql",
    governance_rule: "Illustrative weights for prototype demonstration only.",
    impact_on_decision: "Solves #1 exit driver (Career Development) by matching internal staff to vacancies.",
  },
  {
    domain: "Job Architecture",
    metric_or_entity: "Job Families & 4-Level Capability Hierarchy",
    source_type: "Synthetic Future-State",
    original_source_file: "FIT_HUB_People_Intelligence_PRD_Design_TechSpec_v3.md",
    governance_rule: "Structured competencies tailored for gym club operations.",
    impact_on_decision: "Defines transparent promotion tracks for frontline club staff.",
  },
  {
    domain: "Master Data",
    metric_or_entity: "Centralized Employee Master ID (FH-EMP-xxxx)",
    source_type: "Synthetic Future-State",
    original_source_file: "core.dim_employee / core.dim_person",
    governance_rule: "Synthetic entity linking to demonstrate relational lifecycle intelligence.",
    impact_on_decision: "Eliminates departmental data silos between HR, Operations, and Sales.",
  },
  {
    domain: "Pipeline Sourcing",
    metric_or_entity: "Frontline Pre-Qualified Candidate Pool",
    source_type: "Synthetic Future-State",
    original_source_file: "mart.talent_pool",
    governance_rule: "Proactive candidate bank for agile replacement staffing.",
    impact_on_decision: "Compresses future vacancy time-to-fill from 34 days to under 12 days in Bali.",
  },
  {
    domain: "Continuity",
    metric_or_entity: "Departure to Requisition Binding (EXT -> REQ)",
    source_type: "Observed Historical Case",
    original_source_file: "PRD Section 27.2 Life-Cycle Mapping",
    governance_rule: "Derived mapping from historical replacement share facts.",
    impact_on_decision: "Proves that 70.7% of all open requisitions stem directly from employee turnover.",
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
    role_name: "Customer Service",
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
    role_name: "Fitness Consultant",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Fitness Consultant",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service",
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
    role_name: "Customer Service Leader",
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
    urgency_reason: "Front desk shift supervision and CS team coaching in Canggu hub",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-SBY-0224",
    role_name: "Fitness Consultant",
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
  {
    req_code: "REQ-BTM-0701",
    role_name: "Operation Manager",
    location_name: "Batam",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 34,
    sla_target_days: 35,
    sla_status: "AT_RISK",
    pipeline_size: 5,
    bottleneck_stage: "Manager Interview",
    health: "At Risk",
    hiring_manager: "Hendra Wijaya (Club GM)",
    urgency_reason: "Branch floor operations and facility leadership backfill in Batam Hub",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-SBY-0210",
    role_name: "Customer Service Leader",
    location_name: "Surabaya",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 29,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 6,
    bottleneck_stage: "Executive Panel",
    health: "Healthy",
    hiring_manager: "Arief Hidayat (Regional VP)",
    urgency_reason: "East Java customer service leadership succession",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-JKS-0401",
    role_name: "Fitness Lead",
    location_name: "Jakarta Selatan",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 26,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 7,
    bottleneck_stage: "Technical Audition",
    health: "Healthy",
    hiring_manager: "Farhan Mahendra (Fitness Director)",
    urgency_reason: "Flagship Senopati PT team supervision and client conversion leadership",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-JKB-0305",
    role_name: "Sales Lead",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 22,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 8,
    bottleneck_stage: "Final Interview",
    health: "Healthy",
    hiring_manager: "Dewi Anggraini (Commercial Lead)",
    urgency_reason: "Presale quarterly target drive leadership in West Jakarta hub",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-5005",
    role_name: "PT Team Leader",
    location_name: "Jakarta Selatan",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 27,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 6,
    bottleneck_stage: "Technical Audition",
    health: "Healthy",
    hiring_manager: "Wayan Surya (Fitness Manager)",
    urgency_reason: "Supervising PT biomechanics and session renewal delivery",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-5035",
    role_name: "PT Team Leader",
    location_name: "Denpasar",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 35,
    sla_target_days: 35,
    sla_status: "BREACHED",
    pipeline_size: 4,
    bottleneck_stage: "Manager Interview",
    health: "Critical",
    hiring_manager: "Bambang Wijaya (Club GM)",
    urgency_reason: "Bali PT floor supervision and coach retention driver",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-5028",
    role_name: "FC Team Leader",
    location_name: "Semarang",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 30,
    sla_target_days: 35,
    sla_status: "AT_RISK",
    pipeline_size: 5,
    bottleneck_stage: "HR Screening",
    health: "At Risk",
    hiring_manager: "Ni Made Sari (Commercial Lead)",
    urgency_reason: "Central Java sales blitz and lead conversion pacing",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-5060",
    role_name: "FC Team Leader",
    location_name: "Palembang",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 33,
    sla_target_days: 35,
    sla_status: "AT_RISK",
    pipeline_size: 4,
    bottleneck_stage: "Final Offer",
    health: "At Risk",
    hiring_manager: "Tri Purnomo (Regional VP)",
    urgency_reason: "Palembang Sumatra regional commercial sales management",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-BDG-0610",
    role_name: "Club Manager",
    location_name: "Bandung",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 31,
    sla_target_days: 42,
    sla_status: "WITHIN_SLA",
    pipeline_size: 5,
    bottleneck_stage: "Executive Panel",
    health: "Healthy",
    hiring_manager: "Tri Purnomo (Regional VP)",
    urgency_reason: "Full P&L and operational accountability for Dago Bandung flagship hub",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-TNG-0504",
    role_name: "Sales Lead",
    location_name: "Tangerang",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 24,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 7,
    bottleneck_stage: "Offer Acceptance",
    health: "Healthy",
    hiring_manager: "Dewi Anggraini (Commercial Lead)",
    urgency_reason: "Bintaro and BSD membership presale campaign lead",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-PTL-0101",
    role_name: "PT Team Leader",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 28,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 6,
    bottleneck_stage: "Technical Audition",
    health: "Healthy",
    hiring_manager: "Faris Pratama (Fitness Director)",
    urgency_reason: "PT floor supervision and session revenue pacing",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-PTL-0102",
    role_name: "PT Team Leader",
    location_name: "Jakarta Selatan",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 32,
    sla_target_days: 35,
    sla_status: "AT_RISK",
    pipeline_size: 5,
    bottleneck_stage: "Technical Audition",
    health: "At Risk",
    hiring_manager: "Wayan Surya (Fitness Manager)",
    urgency_reason: "Senopati trainer biomechanics coaching",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-PTL-0103",
    role_name: "PT Team Leader",
    location_name: "Surabaya",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 19,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 7,
    bottleneck_stage: "Manager Interview",
    health: "Healthy",
    hiring_manager: "Danang Kusuma (Fitness Lead)",
    urgency_reason: "East Java PT squad leader",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-FCL-0201",
    role_name: "FC Team Leader",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 31,
    sla_target_days: 35,
    sla_status: "AT_RISK",
    pipeline_size: 4,
    bottleneck_stage: "HR Screening",
    health: "At Risk",
    hiring_manager: "Dewi Anggraini (Commercial Lead)",
    urgency_reason: "West Jakarta membership sales blitz lead",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-FCL-0202",
    role_name: "FC Team Leader",
    location_name: "Jakarta Timur",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 26,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 6,
    bottleneck_stage: "Manager Interview",
    health: "Healthy",
    hiring_manager: "Nita Anggraini (Sales Lead)",
    urgency_reason: "East Jakarta membership acquisition driver",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-FCL-0203",
    role_name: "FC Team Leader",
    location_name: "Semarang",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 36,
    sla_target_days: 35,
    sla_status: "BREACHED",
    pipeline_size: 3,
    bottleneck_stage: "Final Offer",
    health: "Critical",
    hiring_manager: "Ni Made Sari (Commercial Lead)",
    urgency_reason: "Central Java sales conversion pacing",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-CM-0301",
    role_name: "Club Manager",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 38,
    sla_target_days: 42,
    sla_status: "AT_RISK",
    pipeline_size: 5,
    bottleneck_stage: "Executive Panel",
    health: "At Risk",
    hiring_manager: "Tri Purnomo (Regional VP)",
    urgency_reason: "Puri Indah flagship club general management",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-CM-0302",
    role_name: "Club Manager",
    location_name: "Bandung",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 31,
    sla_target_days: 42,
    sla_status: "WITHIN_SLA",
    pipeline_size: 6,
    bottleneck_stage: "Executive Panel",
    health: "Healthy",
    hiring_manager: "Tri Purnomo (Regional VP)",
    urgency_reason: "Dago Bandung club general management and EBITDA delivery",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-SLL-0401",
    role_name: "Sales Lead",
    location_name: "Jakarta Barat",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 22,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 8,
    bottleneck_stage: "Final Interview",
    health: "Healthy",
    hiring_manager: "Dewi Anggraini (Commercial Lead)",
    urgency_reason: "Presale quarterly campaign lead",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-SLL-0402",
    role_name: "Sales Lead",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 39,
    sla_target_days: 35,
    sla_status: "BREACHED",
    pipeline_size: 4,
    bottleneck_stage: "Manager Interview",
    health: "Critical",
    hiring_manager: "Bambang Wijaya (Club GM)",
    urgency_reason: "Bali regional membership drive",
    data_provenance: "SYNTHETIC_ENABLER",
  },
  {
    req_code: "REQ-PTL-0104",
    role_name: "Personal Trainer Leader",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 28,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 5,
    bottleneck_stage: "Technical Audition",
    health: "Healthy",
    hiring_manager: "Wayan Surya (Fitness Manager)",
    urgency_reason: "Sunset Road PT floor supervision and coach retention driver",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-FCL-0204",
    role_name: "Fitness Consultant Leader",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 31,
    sla_target_days: 35,
    sla_status: "WITHIN_SLA",
    pipeline_size: 4,
    bottleneck_stage: "Manager Interview",
    health: "Healthy",
    hiring_manager: "Ni Made Sari (Sales Manager)",
    urgency_reason: "Canggu commercial membership sales blitz leader",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-CM-0303",
    role_name: "Club Manager",
    location_name: "Bali",
    hiring_type: "Replacement",
    openings: 1,
    days_open: 39,
    sla_target_days: 42,
    sla_status: "WITHIN_SLA",
    pipeline_size: 5,
    bottleneck_stage: "Executive Panel",
    health: "Healthy",
    hiring_manager: "Tri Purnomo (Area GM)",
    urgency_reason: "Flagship Canggu gym club full P&L accountability",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    req_code: "REQ-AGM-0501",
    role_name: "Area General Manager",
    location_name: "Bali",
    hiring_type: "Expansion",
    openings: 1,
    days_open: 35,
    sla_target_days: 45,
    sla_status: "WITHIN_SLA",
    pipeline_size: 4,
    bottleneck_stage: "Board Interview",
    health: "Healthy",
    hiring_manager: "Board of Directors",
    urgency_reason: "Regional cluster oversight for Bali and East Java clubs",
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
    role_target: "Customer Service",
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
    role_target: "Fitness Consultant",
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
    role_target: "Customer Service",
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
    role_target: "Customer Service",
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
    role_target: "Customer Service",
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
    role_target: "Customer Service",
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

export interface ExitEvent {
  exit_code: string;
  employee_code: string;
  role_name: string;
  location_name: string;
  exit_date: string;
  tenure_months: number;
  resignation_type: "Voluntary" | "Involuntary";
  is_regrettable: boolean;
  primary_reason: string;
  secondary_reason: string;
  triggered_requisition_code: string;
  performance_rating: number;
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export interface TenureBand {
  band_label: string;
  exit_count: number;
  pct_of_exits: number;
  cumulative_pct: number;
  cliff_stage: string;
  primary_stressor: string;
}

export interface VoiceTheme {
  dimension_name: string;
  score: number;
  national_benchmark: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "CONCERN";
  verbatim_sample: string;
  segment_concentration: string;
  strategic_action: string;
}

export const fallbackExitEvents: ExitEvent[] = [
  {
    exit_code: "EXT-BLI-0089",
    employee_code: "FH-EMP-0988",
    role_name: "Customer Service",
    location_name: "Bali",
    exit_date: "2024-07-02",
    tenure_months: 5,
    resignation_type: "Voluntary",
    is_regrettable: true,
    primary_reason: "Career Development",
    secondary_reason: "Shift Roster Fatigue",
    triggered_requisition_code: "REQ-BLI-0104",
    performance_rating: 4.5,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-BLI-0094",
    employee_code: "FH-EMP-0912",
    role_name: "Personal Trainer",
    location_name: "Bali",
    exit_date: "2024-07-08",
    tenure_months: 14,
    resignation_type: "Voluntary",
    is_regrettable: true,
    primary_reason: "Compensation & Commission Volatility",
    secondary_reason: "Lack of Senior Promotion Track",
    triggered_requisition_code: "REQ-BLI-0109",
    performance_rating: 4.6,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-BLI-0102",
    employee_code: "FH-EMP-0845",
    role_name: "Fitness Consultant",
    location_name: "Bali",
    exit_date: "2024-07-15",
    tenure_months: 4,
    resignation_type: "Voluntary",
    is_regrettable: false,
    primary_reason: "Sales Target Pressure",
    secondary_reason: "Unclear Onboarding Goals",
    triggered_requisition_code: "REQ-BLI-0115",
    performance_rating: 3.4,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-SBY-0144",
    employee_code: "FH-EMP-0792",
    role_name: "Customer Service",
    location_name: "Surabaya",
    exit_date: "2024-07-20",
    tenure_months: 8,
    resignation_type: "Voluntary",
    is_regrettable: true,
    primary_reason: "Career Development",
    secondary_reason: "Commute Distance",
    triggered_requisition_code: "REQ-SBY-0202",
    performance_rating: 4.2,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-JKB-0231",
    employee_code: "FH-EMP-0610",
    role_name: "Customer Service",
    location_name: "Jakarta Barat",
    exit_date: "2024-07-28",
    tenure_months: 11,
    resignation_type: "Voluntary",
    is_regrettable: false,
    primary_reason: "Career Development",
    secondary_reason: "Better Offer",
    triggered_requisition_code: "REQ-JKB-0301",
    performance_rating: 3.8,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-JKB-0245",
    employee_code: "FH-EMP-0554",
    role_name: "Fitness Consultant",
    location_name: "Jakarta Barat",
    exit_date: "2024-08-01",
    tenure_months: 15,
    resignation_type: "Voluntary",
    is_regrettable: true,
    primary_reason: "Career Development",
    secondary_reason: "Commission Cap Expectations",
    triggered_requisition_code: "REQ-JKB-0312",
    performance_rating: 4.4,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-JKS-0198",
    employee_code: "FH-EMP-0489",
    role_name: "Personal Trainer",
    location_name: "Jakarta Selatan",
    exit_date: "2024-08-04",
    tenure_months: 9,
    resignation_type: "Voluntary",
    is_regrettable: true,
    primary_reason: "Compensation & Commission Volatility",
    secondary_reason: "Studio Floor Split",
    triggered_requisition_code: "REQ-JKS-0405",
    performance_rating: 4.3,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    exit_code: "EXT-TNG-0112",
    employee_code: "FH-EMP-0412",
    role_name: "Customer Service",
    location_name: "Tangerang",
    exit_date: "2024-08-09",
    tenure_months: 6,
    resignation_type: "Voluntary",
    is_regrettable: false,
    primary_reason: "Working Environment & Facilities",
    secondary_reason: "Shift Scheduling",
    triggered_requisition_code: "REQ-TNG-0502",
    performance_rating: 3.6,
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export const fallbackTenureBands: TenureBand[] = [
  {
    band_label: "0 to 3 Months",
    exit_count: 218,
    pct_of_exits: 24.5,
    cumulative_pct: 24.5,
    cliff_stage: "Early Onboarding Shock",
    primary_stressor: "Immediate shift roster realities, POS SOP steepness, and lack of dedicated floor buddy",
  },
  {
    band_label: "4 to 6 Months",
    exit_count: 162,
    pct_of_exits: 18.2,
    cumulative_pct: 42.7,
    cliff_stage: "Ramp-Up Performance Pressure",
    primary_stressor: "Transition from onboarding grace period to full solo shift and member retention targets",
  },
  {
    band_label: "7 to 12 Months",
    exit_count: 130,
    pct_of_exits: 14.7,
    cumulative_pct: 57.4,
    cliff_stage: "Year 1 Cliff Threshold",
    primary_stressor: "Cumulative fatigue without visible career roadmap or progression discussion with Area Manager",
  },
  {
    band_label: "13 to 18 Months",
    exit_count: 195,
    pct_of_exits: 21.9,
    cumulative_pct: 79.3,
    cliff_stage: "Mid-Tenure Growth Plateau",
    primary_stressor: "High performers ready for Lead or ACM roles feel blocked by external hiring for managerial slots",
  },
  {
    band_label: "19+ Months",
    exit_count: 184,
    pct_of_exits: 20.7,
    cumulative_pct: 100.0,
    cliff_stage: "Mature Staff Transition",
    primary_stressor: "Relocation, life events, or external corporate recruitment",
  },
];

export const fallbackVoiceThemes: VoiceTheme[] = [
  {
    dimension_name: "Compensation & Benefit",
    score: 4.96,
    national_benchmark: 5.5,
    sentiment: "CONCERN",
    verbatim_sample: "Base salary follows UMK, but when member PT sessions drop during low months, take-home pay is too volatile to sustain living costs in Bali and South Jakarta.",
    segment_concentration: "Personal Trainers & Fitness Consultants in Bali",
    strategic_action: "Introduce base commission floor during low season to stabilize income security",
  },
  {
    dimension_name: "Career Growth",
    score: 5.22,
    national_benchmark: 5.4,
    sentiment: "CONCERN",
    verbatim_sample: "I have been an Customer Service for over 18 months with top ratings, but when Assistant Club Manager opened, headquarters hired externally instead of promoting from within.",
    segment_concentration: "Customer Services with 12 to 24 months tenure",
    strategic_action: "Operationalize internal mobility matching engine with transparent qualification gates",
  },
  {
    dimension_name: "Supportive Workplace",
    score: 5.58,
    national_benchmark: 5.5,
    sentiment: "POSITIVE",
    verbatim_sample: "The club floor team feels like family. Shift colleagues always step up to help when member traffic peaks or during event days.",
    segment_concentration: "Club-level frontline staff nationally",
    strategic_action: "Leverage team solidarity through peer onboarding buddy system",
  },
  {
    dimension_name: "Organisation Alignment",
    score: 5.62,
    national_benchmark: 5.5,
    sentiment: "POSITIVE",
    verbatim_sample: "FIT HUB has a strong mission to democratize fitness in Indonesia. Members appreciate our accessible facilities and energy.",
    segment_concentration: "All roles, corporate and frontline",
    strategic_action: "Reinforce brand purpose during 30-day onboarding milestones",
  },
  {
    dimension_name: "Work Clarity",
    score: 5.45,
    national_benchmark: 5.4,
    sentiment: "NEUTRAL",
    verbatim_sample: "Daily opening and closing checklists are clear, but cross-shift handover notes between morning and evening shifts are often missed.",
    segment_concentration: "Front desk and facility maintenance shifts",
    strategic_action: "Standardize digital shift handover checklist on mobile POS",
  },
  {
    dimension_name: "Fair Performance",
    score: 5.34,
    national_benchmark: 5.3,
    sentiment: "NEUTRAL",
    verbatim_sample: "Performance reviews occur, but constructive feedback on how to prepare for club management responsibilities is rarely provided.",
    segment_concentration: "Junior frontline looking to advance",
    strategic_action: "Implement quarterly capability development discussions using frontline competency rubric",
  },
];

export interface PipelineLayer {
  layer_id: string;
  layer_number: number;
  layer_name: string;
  schema_or_system: string;
  description: string;
  entities_or_tables: string[];
  governance_status: "PRODUCED_EMPIRICAL" | "GOVERNED_TRANSFORMATION" | "FUTURE_STATE_ENABLER";
  record_count: string;
  latency: string;
}

export interface RoadmapHorizon {
  horizon_number: number;
  title: string;
  timeframe: string;
  business_capability: string;
  technical_prerequisites: string[];
  key_deliverables: string[];
  status: "CURRENT_BASELINE" | "DELIVERED_IN_PROTOTYPE" | "FUTURE_SCALE";
}

export interface MetricDefinition {
  metric_name: string;
  domain: string;
  formula: string;
  target_benchmark: string;
  business_interpretation: string;
  data_provenance: "OBSERVED_CASE_STUDY" | "SYNTHETIC_ENABLER";
}

export const fallbackPipelineLayers: PipelineLayer[] = [
  {
    layer_id: "layer-1",
    layer_number: 1,
    layer_name: "Source Tier",
    schema_or_system: "Operational Silos (ATS, HRIS, Typeform)",
    description: "Original Excel case study exports. Disconnected departments with zero shared employee identification keys.",
    entities_or_tables: ["Hiring Sheet (1,552 records)", "Turnover Sheet (889 records)", "Engagement Sheet (1,636 records)"],
    governance_status: "PRODUCED_EMPIRICAL",
    record_count: "4,077 raw rows",
    latency: "Ad-hoc / Quarterly exports",
  },
  {
    layer_id: "layer-2",
    layer_number: 2,
    layer_name: "Raw Landing Tier",
    schema_or_system: "PostgreSQL schema: raw",
    description: "Immutable landing zone preserving exact historical field types, values, and audit timestamps.",
    entities_or_tables: ["raw.raw_hiring", "raw.raw_turnover", "raw.raw_engagement"],
    governance_status: "PRODUCED_EMPIRICAL",
    record_count: "4,077 ingested rows",
    latency: "Automated ingestion pipeline",
  },
  {
    layer_id: "layer-3",
    layer_number: 3,
    layer_name: "Staging & Cleaning Tier",
    schema_or_system: "Data Pipeline scripts / Views",
    description: "Deduplication, date parsing, column type normalization, and validation rules adhering to Python EDA logic.",
    entities_or_tables: ["stg_hiring_normalized", "stg_turnover_validated", "stg_engagement_scored"],
    governance_status: "GOVERNED_TRANSFORMATION",
    record_count: "100% clean data pass",
    latency: "Deterministic batch transform",
  },
  {
    layer_id: "layer-4",
    layer_number: 4,
    layer_name: "Core Domain Tier",
    schema_or_system: "PostgreSQL schemas: core, talent, recruiting, retention, experience",
    description: "Normalized dimensional model linking people, jobs, locations, and frontline capability frameworks.",
    entities_or_tables: ["core.dim_person", "core.dim_employee", "core.dim_job_role", "core.dim_location", "talent.dim_capability", "talent.role_capability_requirement"],
    governance_status: "FUTURE_STATE_ENABLER",
    record_count: "13 clubs, 7 roles, 6 capabilities",
    latency: "Single Source of Truth",
  },
  {
    layer_id: "layer-5",
    layer_number: 5,
    layer_name: "Analytical Mart Tier",
    schema_or_system: "PostgreSQL schema: mart",
    description: "Pre-aggregated decision models and scoring algorithms (010_internal_mobility_engine.sql).",
    entities_or_tables: ["mart.mart_vacancy_kpi", "mart.mart_retention_cohort", "mart.mart_engagement_summary", "mart.internal_mobility_match"],
    governance_status: "GOVERNED_TRANSFORMATION",
    record_count: "Real-time query performance",
    latency: "Instant sub-10ms response",
  },
  {
    layer_id: "layer-6",
    layer_number: 6,
    layer_name: "Executive Application Tier",
    schema_or_system: "Next.js 14 App Router + PostgREST Client",
    description: "Executive decision prototype featuring reactive filters, transparent provenance badges, and offline fallback.",
    entities_or_tables: ["lib/data/api.ts", "lib/data/fixtures.ts", "FilterContext", "DataProvenanceBadge"],
    governance_status: "FUTURE_STATE_ENABLER",
    record_count: "Full prototype web application",
    latency: "Under 100ms client interaction",
  },
];

export const fallbackRoadmapHorizons: RoadmapHorizon[] = [
  {
    horizon_number: 1,
    title: "Descriptive Operational Silos (Baseline State)",
    timeframe: "Historical Case Baseline (2023 - 2024)",
    business_capability: "Reactive headcount reporting, manual turnover calculations, and isolated post-mortem exit reviews.",
    technical_prerequisites: ["Separate Excel spreadsheets in recruiting, turnover, and engagement", "No standardized employee ID keys", "Manual presentation assembly for executive reviews"],
    key_deliverables: ["8-step Python cleaning pipeline", "Historical EDA analysis identifying 68.4% replacement lock and 90-day onboarding cliff", "Executive PowerPoint and PDF reports"],
    status: "CURRENT_BASELINE",
  },
  {
    horizon_number: 2,
    title: "Unified Relational Workforce Warehouse (Prototype State)",
    timeframe: "Current Delivery (Phase 1 to Phase 6)",
    business_capability: "Governed end-to-end employee lifecycle intelligence connecting Vacancy demand directly to Team retention outcomes.",
    technical_prerequisites: ["PostgreSQL database schemas on Supabase", "Public view abstraction with security invoker", "TypeScript data layer with offline fallback fixtures"],
    key_deliverables: ["Interactive Next.js 14 decision prototype", "Role x Location SLA Heatmap and Recruitment Funnel diagnosis", "FIT HUB Frontline Competency Framework & candidate readiness engine", "Data Readiness Hub and governance provenance disclosure"],
    status: "DELIVERED_IN_PROTOTYPE",
  },
  {
    horizon_number: 3,
    title: "Predictive & Prescriptive People Intelligence (Target State)",
    timeframe: "Enterprise Production Scale (Months 6+)",
    business_capability: "Proactive attrition prevention, ML-driven candidate flight risk alerts, and automated succession planning.",
    technical_prerequisites: ["Real-time CDC pipeline from Darwinbox/Workday and ATS", "Automated monthly pulse survey integration", "Machine learning inference pipeline for early departure risk"],
    key_deliverables: ["Automated buddy onboarding tracking in mobile app", "Live compensation benchmark alerts for Bali/East Java clubs", "Executive automated weekly digest and early alert triggers"],
    status: "FUTURE_SCALE",
  },
];

export const fallbackMetricDefinitions: MetricDefinition[] = [
  {
    metric_name: "Time-to-Fill (TTF)",
    domain: "Recruiting",
    formula: "Date Requisition Filled minus Date Requisition Approved (in calendar days)",
    target_benchmark: "National standard: <= 28 days (SLA target)",
    business_interpretation: "Measures hiring velocity. Bali median is 34.0 days, indicating severe local candidate supply constraints.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    metric_name: "Beyond SLA Rate",
    domain: "Recruiting",
    formula: "(Count of Hires with TTF > 28 Days / Total Hires) * 100",
    target_benchmark: "< 20.0% of all requisitions",
    business_interpretation: "Identifies delayed operational backfilling. Bali reaches 42.9%, driving club floor overtime and shift shortages.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    metric_name: "Replacement Share",
    domain: "Recruiting",
    formula: "(Replacement Requisitions / Total Open Requisitions) * 100",
    target_benchmark: "< 40.0% for healthy expansion",
    business_interpretation: "Indicates whether recruitment functions as expansion or reactive backfill. 70.7% national share proves acute turnover treadmill.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    metric_name: "Early Attrition Rate (< 12M)",
    domain: "Retention",
    formula: "(Departures with Tenure < 12 Months / Total Departures) * 100",
    target_benchmark: "< 25.0% of total exits",
    business_interpretation: "Identifies onboarding and ramp-up failure. At 57.4% nationally, over half of all departures occur before Year 1.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    metric_name: "Mid-Tenure Dip (13-18M)",
    domain: "Retention",
    formula: "(Departures with Tenure between 13 and 18 Months / Total Departures) * 100",
    target_benchmark: "< 15.0% of total exits",
    business_interpretation: "Reflects career stagnation plateau. Staff ready for promotion exit when external hires take managerial openings.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    metric_name: "Regrettable Loss Rate",
    domain: "Retention",
    formula: "(Voluntary Exits of High-Performing Staff / Total Exits) * 100",
    target_benchmark: "< 15.0% of total exits",
    business_interpretation: "Measures loss of top club performers. 27.8% (247 staff) represents high organizational brain drain.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
  {
    metric_name: "Net Employee Net Promoter Score (eNPS)",
    domain: "Experience",
    formula: "% Promoters (Score 9-10) minus % Detractors (Score 0-6)",
    target_benchmark: "> +30.0 (World-class threshold)",
    business_interpretation: "Measures overall employee loyalty (+56.6). Must be evaluated alongside Survivorship Bias disclosure.",
    data_provenance: "OBSERVED_CASE_STUDY",
  },
];

export interface CliftonStrength {
  strength_id?: string;
  strength_code: string;
  strength_name: string;
  domain: "Executing" | "Influencing" | "Relationship Building" | "Strategic Thinking";
  description: string;
}

export const fallbackCliftonStrengths: CliftonStrength[] = [
  { strength_code: "STR-ACH", strength_name: "Achiever", domain: "Executing", description: "Have a great deal of stamina and work hard. Take immense satisfaction in being busy and productive." },
  { strength_code: "STR-ARR", strength_name: "Arranger", domain: "Executing", description: "Can organize, but also have a flexibility that complements this ability. Determine how all pieces fit." },
  { strength_code: "STR-BEL", strength_name: "Belief", domain: "Executing", description: "Have certain core values that are unchanging, giving life a defined purpose." },
  { strength_code: "STR-CON", strength_name: "Consistency", domain: "Executing", description: "Keenly aware of the need to treat people the same. Crave stable routines and clear rules." },
  { strength_code: "STR-DEL", strength_name: "Deliberative", domain: "Executing", description: "Anticipate obstacles and take serious care when making decisions or choices." },
  { strength_code: "STR-DIS", strength_name: "Discipline", domain: "Executing", description: "Enjoy routine and structure. Their world is best described by the order they create." },
  { strength_code: "STR-FOC", strength_name: "Focus", domain: "Executing", description: "Can take a direction, follow through and make corrections to stay on track." },
  { strength_code: "STR-RES", strength_name: "Responsibility", domain: "Executing", description: "Take psychological ownership of commitments and hold honest, loyal values." },
  { strength_code: "STR-RST", strength_name: "Restorative", domain: "Executing", description: "Adept at dealing with problems. Good at figuring out what is wrong and resolving it." },
  { strength_code: "STR-ACT", strength_name: "Activator", domain: "Influencing", description: "Can make things happen by turning thoughts into action. Want to act now." },
  { strength_code: "STR-CMD", strength_name: "Command", domain: "Influencing", description: "Have presence. Can take control of a situation and make decisions with conviction." },
  { strength_code: "STR-COM", strength_name: "Communication", domain: "Influencing", description: "Find it easy to put thoughts into words. Good conversationalists and presenters." },
  { strength_code: "STR-CMP", strength_name: "Competition", domain: "Influencing", description: "Measure progress against the performance of others. Strive to win first place." },
  { strength_code: "STR-MAX", strength_name: "Maximizer", domain: "Influencing", description: "Focus on strengths as a way to stimulate personal and group excellence." },
  { strength_code: "STR-SAS", strength_name: "Self-Assurance", domain: "Influencing", description: "Feel confident in ability to manage own lives. Possess an inner compass." },
  { strength_code: "STR-SIG", strength_name: "Significance", domain: "Influencing", description: "Want to be very important in others eyes. Long to make meaningful impact." },
  { strength_code: "STR-WOO", strength_name: "Woo", domain: "Influencing", description: "Love the challenge of meeting new people and winning them over." },
  { strength_code: "STR-ADP", strength_name: "Adaptability", domain: "Relationship Building", description: "Prefer to go with the flow. Now people who discover the future one day at a time." },
  { strength_code: "STR-CND", strength_name: "Connectedness", domain: "Relationship Building", description: "Have faith in the links among all things. Believe almost every event has meaning." },
  { strength_code: "STR-DEV", strength_name: "Developer", domain: "Relationship Building", description: "Recognize and cultivate potential in others. Spot signs of small improvement." },
  { strength_code: "STR-EMP", strength_name: "Empathy", domain: "Relationship Building", description: "Can sense other peoples feelings by imagining themselves in others situations." },
  { strength_code: "STR-HAR", strength_name: "Harmony", domain: "Relationship Building", description: "Look for consensus. Dont enjoy conflict; rather, seek areas of agreement." },
  { strength_code: "STR-INC", strength_name: "Includer", domain: "Relationship Building", description: "Accept others. Show awareness of those who feel left out and include them." },
  { strength_code: "STR-IND", strength_name: "Individualization", domain: "Relationship Building", description: "Intrigued with the unique qualities of each person and how they work together." },
  { strength_code: "STR-POS", strength_name: "Positivity", domain: "Relationship Building", description: "Have an enthusiasm that is contagious. Upbeat and get others excited." },
  { strength_code: "STR-REL", strength_name: "Relator", domain: "Relationship Building", description: "Enjoy close relationships with others. Find deep satisfaction in working together." },
  { strength_code: "STR-ANA", strength_name: "Analytical", domain: "Strategic Thinking", description: "Search for reasons and causes. Think about factors affecting a situation." },
  { strength_code: "STR-CTX", strength_name: "Context", domain: "Strategic Thinking", description: "Enjoy thinking about the past to understand the present by researching history." },
  { strength_code: "STR-FUT", strength_name: "Futuristic", domain: "Strategic Thinking", description: "Inspired by the future and what could be. Energize others with visions." },
  { strength_code: "STR-IDE", strength_name: "Ideation", domain: "Strategic Thinking", description: "Fascinated by ideas. Able to find connections between disparate phenomena." },
  { strength_code: "STR-INP", strength_name: "Input", domain: "Strategic Thinking", description: "Have a need to collect and archive information, ideas, and knowledge." },
  { strength_code: "STR-INT", strength_name: "Intellection", domain: "Strategic Thinking", description: "Characterized by intellectual activity. Appreciate introspective discussions." },
  { strength_code: "STR-LRN", strength_name: "Learner", domain: "Strategic Thinking", description: "Have a great desire to learn and want to continuously improve." },
  { strength_code: "STR-STG", strength_name: "Strategic", domain: "Strategic Thinking", description: "Create alternative ways to proceed. Spot relevant patterns and issues quickly." },
];

export interface CapabilityItem {
  capability_id?: string;
  capability_code: string;
  capability_name: string;
  domain: string;
  description: string;
}

export const fallbackCapabilities: CapabilityItem[] = [
  // Fitness Domain
  {
    capability_code: "CAP-FIT-01",
    capability_name: "Biomechanics & PT Session Programming",
    domain: "Fitness",
    description: "Designing safe, goal-oriented progressive resistance and cardiovascular workout programs.",
  },
  {
    capability_code: "CAP-FIT-02",
    capability_name: "Movement Screening, Posture & Injury Prevention",
    domain: "Fitness",
    description: "Functional movement assessment, muscle imbalance screening, and exercise injury risk mitigation.",
  },
  {
    capability_code: "CAP-FIT-03",
    capability_name: "Nutrition Basics & Dietary Habit Coaching",
    domain: "Fitness",
    description: "Advising members on balanced macronutrients, hydration, and positive lifestyle dietary habits.",
  },
  {
    capability_code: "CAP-FIT-04",
    capability_name: "Group Fitness Class & Studio Energy",
    domain: "Fitness",
    description: "Leading group workout classes with high-energy coaching, musical rhythm, and inclusive motivation.",
  },

  // Commercial / Sales Domain
  {
    capability_code: "CAP-COMM-01",
    capability_name: "Walk-in Trial Pitch & Value Presentation",
    domain: "Commercial",
    description: "Presenting club facilities, value propositions, and trial onboarding for prospect conversion.",
  },
  {
    capability_code: "CAP-COMM-02",
    capability_name: "Sales Objection Handling & Contract Closing",
    domain: "Commercial",
    description: "Overcoming prospect hesitation on pricing/commitment and securing membership agreements.",
  },
  {
    capability_code: "CAP-COMM-03",
    capability_name: "B2B Corporate Gym Partnership & Community Outreach",
    domain: "Commercial",
    description: "Negotiating corporate wellness partnerships, B2B gym bulk enrollments, and external events.",
  },
  {
    capability_code: "CAP-COMM-04",
    capability_name: "Digital Lead Nurturing & WhatsApp Follow-up",
    domain: "Commercial",
    description: "Rapid omnichannel outreach, qualification of incoming leads, and scheduling facility tours.",
  },

  // Operational Domain
  {
    capability_code: "CAP-OPS-01",
    capability_name: "Gym Floor Maintenance & Safety Inspection",
    domain: "Operational",
    description: "Ensuring gym equipment uptime, hygiene compliance, safety protocols, and SOP adherence.",
  },
  {
    capability_code: "CAP-OPS-02",
    capability_name: "POS & Front-Desk Cash Reconciliation",
    domain: "Operational",
    description: "Mastery of club point-of-sale systems, check-in flow, daily cash register closing, and shift balancing.",
  },
  {
    capability_code: "CAP-OPS-03",
    capability_name: "Emergency First Aid, CPR & Incident Response",
    domain: "Operational",
    description: "Frontline certified medical first-response, automated external defibrillator (AED) readiness, and crisis handling.",
  },
  {
    capability_code: "CAP-OPS-04",
    capability_name: "Equipment Asset Tracking & Preventive Maintenance",
    domain: "Operational",
    description: "Managing machine maintenance logs, technician servicing schedules, and spare parts inventory.",
  },

  // Retention Domain
  {
    capability_code: "CAP-RET-01",
    capability_name: "Member Attrition Risk Detection & Check-in Care",
    domain: "Retention",
    description: "Proactive engagement with low-frequency gym attendees to maximize workout habits and renewals.",
  },
  {
    capability_code: "CAP-RET-02",
    capability_name: "Member Complaint De-escalation & Incident Resolution",
    domain: "Retention",
    description: "Handling front-desk friction, customer dissatisfaction, and membership disputes with composure.",
  },
  {
    capability_code: "CAP-RET-03",
    capability_name: "Loyalty Activation & Member Community Building",
    domain: "Retention",
    description: "Organizing member challenges, referral campaigns, and social fitness milestones to drive sense of belonging.",
  },

  // Leadership Domain
  {
    capability_code: "CAP-LEAD-01",
    capability_name: "Shift Supervision & Operational Roster Scheduling",
    domain: "Leadership",
    description: "Managing shift rotations, daily handover briefing, frontline role execution, and opening/closing checklists.",
  },
  {
    capability_code: "CAP-LEAD-02",
    capability_name: "Staff 1-on-1 Coaching & Performance KPI Review",
    domain: "Leadership",
    description: "Mentoring subordinates, evaluating monthly conversion/PT delivery targets, and performance coaching.",
  },
  {
    capability_code: "CAP-LEAD-03",
    capability_name: "Club P&L Financial Awareness & Opex Control",
    domain: "Leadership",
    description: "Monitoring club operating expenditures, utility conservation, petty cash, and EBITDA margin contribution.",
  },
];

export interface RoleCapabilityRequirement {
  requirement_id?: string;
  role_name: string;
  capability_id?: string;
  capability_code: string;
  capability_name: string;
  required_level: number; // 1 to 4
  weight: number; // percentage
  criticality_rank?: number;
  active_flag?: boolean;
}

export const fallbackRoleCapabilityRequirements: RoleCapabilityRequirement[] = [
  // Club Manager (100%)
  { role_name: "Club Manager", capability_code: "CAP-LEAD-01", capability_name: "Shift Supervision & Operational Roster Scheduling", required_level: 4, weight: 30 },
  { role_name: "Club Manager", capability_code: "CAP-LEAD-03", capability_name: "Club P&L Financial Awareness & Opex Control", required_level: 3, weight: 25 },
  { role_name: "Club Manager", capability_code: "CAP-RET-01", capability_name: "Member Attrition Risk Detection & Check-in Care", required_level: 4, weight: 25 },
  { role_name: "Club Manager", capability_code: "CAP-COMM-01", capability_name: "Walk-in Trial Pitch & Value Presentation", required_level: 3, weight: 20 },

  // Area General Manager (100%)
  { role_name: "Area General Manager", capability_code: "CAP-LEAD-01", capability_name: "Shift Supervision & Operational Roster Scheduling", required_level: 4, weight: 25 },
  { role_name: "Area General Manager", capability_code: "CAP-LEAD-03", capability_name: "Club P&L Financial Awareness & Opex Control", required_level: 4, weight: 35 },
  { role_name: "Area General Manager", capability_code: "CAP-COMM-03", capability_name: "B2B Corporate Gym Partnership & Community Outreach", required_level: 4, weight: 25 },
  { role_name: "Area General Manager", capability_code: "CAP-RET-03", capability_name: "Loyalty Activation & Member Community Building", required_level: 4, weight: 15 },

  // Operation Manager (100%)
  { role_name: "Operation Manager", capability_code: "CAP-OPS-01", capability_name: "Gym Floor Maintenance & Safety Inspection", required_level: 4, weight: 30 },
  { role_name: "Operation Manager", capability_code: "CAP-OPS-02", capability_name: "POS & Front-Desk Cash Reconciliation", required_level: 4, weight: 25 },
  { role_name: "Operation Manager", capability_code: "CAP-OPS-04", capability_name: "Equipment Asset Tracking & Preventive Maintenance", required_level: 4, weight: 25 },
  { role_name: "Operation Manager", capability_code: "CAP-OPS-03", capability_name: "Emergency First Aid, CPR & Incident Response", required_level: 3, weight: 20 },

  // Customer Service Leader (100%)
  { role_name: "Customer Service Leader", capability_code: "CAP-OPS-02", capability_name: "POS & Front-Desk Cash Reconciliation", required_level: 4, weight: 35 },
  { role_name: "Customer Service Leader", capability_code: "CAP-RET-02", capability_name: "Member Complaint De-escalation & Incident Resolution", required_level: 4, weight: 30 },
  { role_name: "Customer Service Leader", capability_code: "CAP-LEAD-01", capability_name: "Shift Supervision & Operational Roster Scheduling", required_level: 3, weight: 20 },
  { role_name: "Customer Service Leader", capability_code: "CAP-OPS-03", capability_name: "Emergency First Aid, CPR & Incident Response", required_level: 3, weight: 15 },

  // Customer Service (100%)
  { role_name: "Customer Service", capability_code: "CAP-OPS-02", capability_name: "POS & Front-Desk Cash Reconciliation", required_level: 3, weight: 35 },
  { role_name: "Customer Service", capability_code: "CAP-RET-01", capability_name: "Member Attrition Risk Detection & Check-in Care", required_level: 3, weight: 25 },
  { role_name: "Customer Service", capability_code: "CAP-RET-02", capability_name: "Member Complaint De-escalation & Incident Resolution", required_level: 3, weight: 25 },
  { role_name: "Customer Service", capability_code: "CAP-COMM-01", capability_name: "Walk-in Trial Pitch & Value Presentation", required_level: 2, weight: 15 },

  // Personal Trainer Leader (100%)
  { role_name: "Personal Trainer Leader", capability_code: "CAP-FIT-01", capability_name: "Biomechanics & PT Session Programming", required_level: 4, weight: 35 },
  { role_name: "Personal Trainer Leader", capability_code: "CAP-FIT-02", capability_name: "Movement Screening, Posture & Injury Prevention", required_level: 4, weight: 25 },
  { role_name: "Personal Trainer Leader", capability_code: "CAP-LEAD-02", capability_name: "Staff 1-on-1 Coaching & Performance KPI Review", required_level: 3, weight: 25 },
  { role_name: "Personal Trainer Leader", capability_code: "CAP-OPS-03", capability_name: "Emergency First Aid, CPR & Incident Response", required_level: 3, weight: 15 },

  // Personal Trainer Master (100%)
  { role_name: "Personal Trainer Master", capability_code: "CAP-FIT-01", capability_name: "Biomechanics & PT Session Programming", required_level: 4, weight: 40 },
  { role_name: "Personal Trainer Master", capability_code: "CAP-FIT-02", capability_name: "Movement Screening, Posture & Injury Prevention", required_level: 4, weight: 30 },
  { role_name: "Personal Trainer Master", capability_code: "CAP-FIT-03", capability_name: "Nutrition Basics & Dietary Habit Coaching", required_level: 3, weight: 20 },
  { role_name: "Personal Trainer Master", capability_code: "CAP-RET-01", capability_name: "Member Attrition Risk Detection & Check-in Care", required_level: 3, weight: 10 },

  // Personal Trainer (100%)
  { role_name: "Personal Trainer", capability_code: "CAP-FIT-01", capability_name: "Biomechanics & PT Session Programming", required_level: 3, weight: 40 },
  { role_name: "Personal Trainer", capability_code: "CAP-FIT-02", capability_name: "Movement Screening, Posture & Injury Prevention", required_level: 3, weight: 25 },
  { role_name: "Personal Trainer", capability_code: "CAP-RET-01", capability_name: "Member Attrition Risk Detection & Check-in Care", required_level: 2, weight: 20 },
  { role_name: "Personal Trainer", capability_code: "CAP-COMM-01", capability_name: "Walk-in Trial Pitch & Value Presentation", required_level: 2, weight: 15 },

  // Fitness Consultant Leader (100%)
  { role_name: "Fitness Consultant Leader", capability_code: "CAP-COMM-01", capability_name: "Walk-in Trial Pitch & Value Presentation", required_level: 4, weight: 35 },
  { role_name: "Fitness Consultant Leader", capability_code: "CAP-COMM-02", capability_name: "Sales Objection Handling & Contract Closing", required_level: 4, weight: 30 },
  { role_name: "Fitness Consultant Leader", capability_code: "CAP-LEAD-02", capability_name: "Staff 1-on-1 Coaching & Performance KPI Review", required_level: 3, weight: 20 },
  { role_name: "Fitness Consultant Leader", capability_code: "CAP-COMM-04", capability_name: "Digital Lead Nurturing & WhatsApp Follow-up", required_level: 3, weight: 15 },

  // Fitness Consultant (100%)
  { role_name: "Fitness Consultant", capability_code: "CAP-COMM-01", capability_name: "Walk-in Trial Pitch & Value Presentation", required_level: 3, weight: 35 },
  { role_name: "Fitness Consultant", capability_code: "CAP-COMM-02", capability_name: "Sales Objection Handling & Contract Closing", required_level: 3, weight: 30 },
  { role_name: "Fitness Consultant", capability_code: "CAP-COMM-04", capability_name: "Digital Lead Nurturing & WhatsApp Follow-up", required_level: 3, weight: 20 },
  { role_name: "Fitness Consultant", capability_code: "CAP-OPS-02", capability_name: "POS & Front-Desk Cash Reconciliation", required_level: 2, weight: 15 },

  // Fitness Manager (100%)
  { role_name: "Fitness Manager", capability_code: "CAP-FIT-01", capability_name: "Biomechanics & PT Session Programming", required_level: 4, weight: 30 },
  { role_name: "Fitness Manager", capability_code: "CAP-LEAD-01", capability_name: "Shift Supervision & Operational Roster Scheduling", required_level: 4, weight: 25 },
  { role_name: "Fitness Manager", capability_code: "CAP-LEAD-02", capability_name: "Staff 1-on-1 Coaching & Performance KPI Review", required_level: 4, weight: 25 },
  { role_name: "Fitness Manager", capability_code: "CAP-FIT-04", capability_name: "Group Fitness Class & Studio Energy", required_level: 3, weight: 20 },

  // Sales Manager (100%)
  { role_name: "Sales Manager", capability_code: "CAP-COMM-01", capability_name: "Walk-in Trial Pitch & Value Presentation", required_level: 4, weight: 30 },
  { role_name: "Sales Manager", capability_code: "CAP-COMM-02", capability_name: "Sales Objection Handling & Contract Closing", required_level: 4, weight: 30 },
  { role_name: "Sales Manager", capability_code: "CAP-COMM-03", capability_name: "B2B Corporate Gym Partnership & Community Outreach", required_level: 4, weight: 25 },
  { role_name: "Sales Manager", capability_code: "CAP-LEAD-02", capability_name: "Staff 1-on-1 Coaching & Performance KPI Review", required_level: 4, weight: 15 },
];

