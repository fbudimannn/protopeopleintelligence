// FIT HUB People Intelligence
// Dynamic Internal Mobility & Talent Matching Engine
// Operationalizing FIT HUB Frontline Capability Scoring, CliftonStrengths Overlap & Succession Matching

export interface TargetCapabilityRequirement {
  name: string;
  required_level: number; // 1 to 4
  weight: number; // percentage weight
  description: string;
}

export interface TargetRoleBenchmark {
  role_id: string;
  role_name: string;
  job_level: "Staff" | "Lead / Supervisor" | "Assistant Manager" | "Manager" | "Senior Staff" | "Area Executive";
  job_family: "Club Operations" | "Fitness & Coaching" | "Commercial & Sales";
  role_purpose: string;
  benchmark_tenure_months: number;
  benchmark_min_rating: number;
  natural_feeder_roles: string[];
  required_capabilities: TargetCapabilityRequirement[];
  open_requisition_codes: string[];
}

export interface BenchmarkEmployeeProfile {
  employee_id: string;
  employee_code: string;
  fullname: string;
  role: string;
  club_name: string;
  cluster_location: string;
  performance_rating: number;
  tenure_months: number;
  mbti: string;
  disc: string;
  strengths: string[]; // 5 CliftonStrengths
  capabilities: Record<string, number>;
  papi?: Record<string, number>;
}

export interface ActiveEmployeeCandidate {
  employee_id: string;
  employee_code: string;
  fullname: string;
  current_role: string;
  current_location: string;
  current_club: string;
  tenure_months: number;
  performance_rating: number; // 1.0 to 5.0
  capability_scores: Record<string, number>; // 1 to 4
  mbti: string;
  disc: string;
  papi: Record<string, number>;
  strengths: string[]; // 5 CliftonStrengths
  top_strength: string;
  development_priority: string;
  willing_to_relocate: boolean;
  preferred_locations: string[];
}

export interface DynamicMatchResult {
  rank: number;
  employee_code: string;
  fullname: string;
  current_role: string;
  current_location: string;
  current_club: string;
  target_role: string;
  target_location: string;
  match_rate_pct: number;
  readiness_status: "Ready" | "Near Ready" | "Development Needed";
  capability_coverage_pct: number;
  performance_score_pct: number;
  psychometric_score_pct: number;
  tenure_score_pct: number;
  performance_rating: number;
  tenure_months: number;
  mbti: string;
  disc: string;
  critical_gaps: Array<{
    capability: string;
    current_level: number;
    required_level: number;
  }>;
  strengths: string[]; // 5 candidate CliftonStrengths
  matching_strengths: string[]; // Overlapping CliftonStrengths with benchmark pool
  top_strength: string;
  recommended_action: string;
  is_feeder_role: boolean;
  career_tier_warning?: string;
}

// ═══════════════════════════════════════════════════════════════
// Gallup CliftonStrengths Domain Taxonomy & Style Helpers
// ═══════════════════════════════════════════════════════════════
export type CliftonDomain = "Executing" | "Influencing" | "Relationship Building" | "Strategic Thinking";

export const CLIFTON_DOMAIN_MAP: Record<string, CliftonDomain> = {
  // Executing (Purple)
  "Achiever": "Executing",
  "Arranger": "Executing",
  "Belief": "Executing",
  "Consistency": "Executing",
  "Deliberative": "Executing",
  "Discipline": "Executing",
  "Focus": "Executing",
  "Responsibility": "Executing",
  "Restorative": "Executing",
  // Influencing (Amber / Orange)
  "Activator": "Influencing",
  "Command": "Influencing",
  "Communication": "Influencing",
  "Competition": "Influencing",
  "Maximizer": "Influencing",
  "Self-Assurance": "Influencing",
  "Significance": "Influencing",
  "Woo": "Influencing",
  // Relationship Building (Blue)
  "Adaptability": "Relationship Building",
  "Connectedness": "Relationship Building",
  "Developer": "Relationship Building",
  "Empathy": "Relationship Building",
  "Harmony": "Relationship Building",
  "Includer": "Relationship Building",
  "Individualization": "Relationship Building",
  "Positivity": "Relationship Building",
  "Relator": "Relationship Building",
  // Strategic Thinking (Emerald / Green)
  "Analytical": "Strategic Thinking",
  "Context": "Strategic Thinking",
  "Futuristic": "Strategic Thinking",
  "Ideation": "Strategic Thinking",
  "Input": "Strategic Thinking",
  "Intellection": "Strategic Thinking",
  "Learner": "Strategic Thinking",
  "Strategic": "Strategic Thinking",
};

export const CLIFTON_DOMAIN_STYLES: Record<CliftonDomain, { bg: string; text: string; border: string }> = {
  "Executing": { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
  "Influencing": { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
  "Relationship Building": { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-500/30" },
  "Strategic Thinking": { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
};

// ═══════════════════════════════════════════════════════════════
// Location Hierarchy (Consistent with fithub_analysis.ipynb)
// 3-Tier: Region Cluster → Province → City
// ═══════════════════════════════════════════════════════════════
export interface LocationNode {
  provinces: Record<string, string[]>;
}

export const locationHierarchy: Record<string, LocationNode> = {
  "Jabodetabek": {
    provinces: {
      "DKI Jakarta": ["Jakarta Selatan", "Jakarta Barat", "Jakarta Utara", "Jakarta Timur", "Jakarta Pusat"],
      "Jawa Barat": ["Bekasi", "Bogor", "Depok", "Karawang", "Cileungsi"],
      "Banten": ["Tangerang", "Cilegon"],
    },
  },
  "Jawa & Bali": {
    provinces: {
      "Jawa Barat": ["Bandung", "Cirebon"],
      "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik"],
      "Jawa Tengah": ["Semarang", "Surakarta"],
      "DI Yogyakarta": ["Yogyakarta"],
      "Bali": ["Bali"],
    },
  },
  "Luar Jawa": {
    provinces: {
      "Kepulauan Riau": ["Batam"],
      "Kalimantan Timur": ["Balikpapan", "Samarinda"],
      "Sulawesi Selatan": ["Makassar"],
      "Sumatera Selatan": ["Palembang"],
    },
  },
};

export function getAllCities(): string[] {
  const cities: string[] = [];
  Object.values(locationHierarchy).forEach((region) => {
    Object.values(region.provinces).forEach((cityList) => {
      cities.push(...cityList);
    });
  });
  return cities;
}

export function getRegionCluster(city: string): string {
  for (const [regionName, region] of Object.entries(locationHierarchy)) {
    for (const cityList of Object.values(region.provinces)) {
      if (cityList.includes(city)) return regionName;
    }
  }
  return "Luar Jawa";
}

export function getProvince(city: string): string {
  for (const region of Object.values(locationHierarchy)) {
    for (const [prov, cityList] of Object.entries(region.provinces)) {
      if (cityList.includes(city)) return prov;
    }
  }
  return "Other";
}

export function getProvincesForRegion(regionName: string): string[] {
  const region = locationHierarchy[regionName];
  return region ? Object.keys(region.provinces) : [];
}

export function getCitiesForProvince(regionName: string, provinceName: string): string[] {
  const region = locationHierarchy[regionName];
  if (!region) return [];
  return region.provinces[provinceName] || [];
}

// ═══════════════════════════════════════════════════════════════
// Ground-Truth Target Role Benchmarks (All Roles Except Housekeeping)
// ═══════════════════════════════════════════════════════════════
export const targetRoleBenchmarks: TargetRoleBenchmark[] = [
  {
    role_id: "role-club-gm",
    role_name: "Club Manager",
    job_level: "Manager",
    job_family: "Club Operations",
    role_purpose: "Full P&L and operational accountability for club branch, including local commercial growth, staff retention, member Net Promoter Score, and EBITDA delivery.",
    benchmark_tenure_months: 24,
    benchmark_min_rating: 4.4,
    natural_feeder_roles: [
      "Customer Service Leader",
      "Operation Manager",
      "Fitness Consultant Leader",
      "Personal Trainer Leader",
      "Personal Trainer Master",
      "Fitness Manager",
      "Sales Manager",
    ],
    open_requisition_codes: ["REQ-CM-0303", "REQ-BLI-0104", "REQ-BDG-0610"],
    required_capabilities: [
      { name: "Shift Supervision & Operational Leadership", required_level: 4, weight: 30, description: "Develop club successor bench and foster high-performance club culture." },
      { name: "Member Retention & Onboarding Care", required_level: 4, weight: 30, description: "Maintain club renewal rate > 75% and minimize monthly member churn." },
      { name: "Member Acquisition & Conversion", required_level: 3, weight: 20, description: "Oversee regional brand partnerships and commercial acquisition targets." },
      { name: "Gym Floor Maintenance & Safety", required_level: 3, weight: 20, description: "Manage monthly club P&L, budget compliance, and facilities audits." },
    ],
  },
  {
    role_id: "role-agm",
    role_name: "Area General Manager",
    job_level: "Area Executive",
    job_family: "Club Operations",
    role_purpose: "Multi-unit operational leadership across 6-12 clubs in a regional cluster. Accountable for cluster P&L, expansion readiness, club manager bench strength, and operational audit consistency.",
    benchmark_tenure_months: 30,
    benchmark_min_rating: 4.6,
    natural_feeder_roles: [
      "Club Manager",
      "Operation Manager",
      "Fitness Manager",
      "Sales Manager",
    ],
    open_requisition_codes: ["REQ-AGM-0501"],
    required_capabilities: [
      { name: "Shift Supervision & Operational Leadership", required_level: 4, weight: 30, description: "Scale executive succession pipeline, mentor club managers, and govern regional SOP audits." },
      { name: "Member Acquisition & Conversion", required_level: 4, weight: 30, description: "Drive regional commercial presales, multi-club marketing, and corporate B2B contracts." },
      { name: "Member Retention & Onboarding Care", required_level: 4, weight: 20, description: "Govern regional churn mitigation strategies and member lifecycle NPS metrics." },
      { name: "Gym Floor Maintenance & Safety", required_level: 3, weight: 20, description: "Audit multi-club preventative equipment maintenance and vendor SLA contracts." },
    ],
  },
  {
    role_id: "role-ops-mgr",
    role_name: "Operation Manager",
    job_level: "Manager",
    job_family: "Club Operations",
    role_purpose: "Oversee facility maintenance, front-desk service excellence, procurement compliance, and health & safety audits across the club operations footprint.",
    benchmark_tenure_months: 20,
    benchmark_min_rating: 4.3,
    natural_feeder_roles: ["Customer Service Leader", "Customer Service", "Fitness Consultant Leader"],
    open_requisition_codes: ["REQ-JKP-0101", "REQ-5074", "REQ-5060"],
    required_capabilities: [
      { name: "Gym Floor Maintenance & Safety", required_level: 4, weight: 30, description: "Manage emergency protocols, equipment uptime, and safety audits." },
      { name: "POS & Front-Desk Service Excellence", required_level: 4, weight: 30, description: "Oversee front-desk SOP compliance, cash floats, and member onboarding speed." },
      { name: "Shift Supervision & Operational Leadership", required_level: 3, weight: 20, description: "Lead operational teams, coordinate shift rosters, and handle staff escalations." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 20, description: "Drive member check-in experience and resolve club escalations." },
    ],
  },
  {
    role_id: "role-cs-lead",
    role_name: "Customer Service Leader",
    job_level: "Lead / Supervisor",
    job_family: "Club Operations",
    role_purpose: "Direct frontline customer service team, monitor member check-in NPS, manage shift handovers, resolve complex POS disputes, and ensure front desk SLA compliance.",
    benchmark_tenure_months: 16,
    benchmark_min_rating: 4.2,
    natural_feeder_roles: ["Customer Service", "Fitness Consultant"],
    open_requisition_codes: ["REQ-BLI-0120", "REQ-5028", "REQ-5058"],
    required_capabilities: [
      { name: "POS & Front-Desk Service Excellence", required_level: 4, weight: 35, description: "Handle complex billing disputes, refund authorizations, and audit POS SOPs." },
      { name: "Member Retention & Onboarding Care", required_level: 4, weight: 30, description: "Supervise member onboarding and execute proactive retention interventions." },
      { name: "Shift Supervision & Operational Leadership", required_level: 3, weight: 20, description: "Supervise floor roster, resolve staff shortages, and lead daily team huddles." },
      { name: "Gym Floor Maintenance & Safety", required_level: 2, weight: 15, description: "Maintain front lobby hygiene and incident reporting standards." },
    ],
  },
  {
    role_id: "role-pt-lead",
    role_name: "Personal Trainer Leader",
    job_level: "Lead / Supervisor",
    job_family: "Fitness & Coaching",
    role_purpose: "Supervise personal trainers, monitor individual trainer session delivery, run technical movement audits, coach trainers on consultative renewals, and maintain safety.",
    benchmark_tenure_months: 16,
    benchmark_min_rating: 4.2,
    natural_feeder_roles: ["Personal Trainer", "Personal Trainer Master"],
    open_requisition_codes: ["REQ-PTL-0104", "REQ-5005", "REQ-5035", "REQ-5069", "REQ-5072", "REQ-5075"],
    required_capabilities: [
      { name: "Biomechanics & PT Session Programming", required_level: 4, weight: 35, description: "Advanced kinesiology coaching, trainer movement drills, and VIP client escalations." },
      { name: "Shift Supervision & Operational Leadership", required_level: 3, weight: 30, description: "Coordinate PT floor schedules, shift allocations, and technical onboarding." },
      { name: "Gym Floor Maintenance & Safety", required_level: 3, weight: 20, description: "Audit equipment cleanliness, free-weight safety, and incident tracking." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 15, description: "Drive client training adherence and renewal pacing across the PT bench." },
    ],
  },
  {
    role_id: "role-pt-master",
    role_name: "Personal Trainer Master",
    job_level: "Lead / Supervisor",
    job_family: "Fitness & Coaching",
    role_purpose: "Senior master practitioner delivering premium training architectures, mentoring junior coaches on VIP clientele handling, and designing clinical corrective protocols.",
    benchmark_tenure_months: 24,
    benchmark_min_rating: 4.5,
    natural_feeder_roles: ["Personal Trainer", "Personal Trainer Leader"],
    open_requisition_codes: ["REQ-PTL-0104"],
    required_capabilities: [
      { name: "Biomechanics & PT Session Programming", required_level: 4, weight: 40, description: "Mastery of advanced athletic periodization, injury rehabilitation, and VIP programming." },
      { name: "Member Retention & Onboarding Care", required_level: 4, weight: 30, description: "Deliver exceptional client transformation journeys and long-term client retention." },
      { name: "Gym Floor Maintenance & Safety", required_level: 3, weight: 20, description: "Enforce elite gym floor lifting safety and equipment ergonomics." },
      { name: "Shift Supervision & Operational Leadership", required_level: 2, weight: 10, description: "Mentor apprentice personal trainers on practical coaching skills." },
    ],
  },
  {
    role_id: "role-fc-lead",
    role_name: "Fitness Consultant Leader",
    job_level: "Lead / Supervisor",
    job_family: "Commercial & Sales",
    role_purpose: "Coach membership consultants on consultative sales scripts, supervise corporate outreach blitzes, audit POS contract entries, and hit club weekly sales quotas.",
    benchmark_tenure_months: 15,
    benchmark_min_rating: 4.1,
    natural_feeder_roles: ["Fitness Consultant", "Customer Service"],
    open_requisition_codes: ["REQ-FCL-0204", "REQ-5028", "REQ-5058", "REQ-5060", "REQ-5074"],
    required_capabilities: [
      { name: "Member Acquisition & Conversion", required_level: 4, weight: 40, description: "Closing trial walk-ins, leading telephone follow-ups, and corporate B2B lead gen." },
      { name: "Shift Supervision & Operational Leadership", required_level: 3, weight: 25, description: "Daily sales huddle coaching, consultant activity pacing, and shift coverage." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 20, description: "Member onboarding touchpoints and post-purchase member engagement." },
      { name: "POS & Front-Desk Service Excellence", required_level: 2, weight: 15, description: "Audit member agreements, membership freeze requests, and refund gates." },
    ],
  },
  {
    role_id: "role-fit-mgr",
    role_name: "Fitness Manager",
    job_level: "Manager",
    job_family: "Fitness & Coaching",
    role_purpose: "Head of club coaching department. Lead PT revenue targets, audit training quality, retain high-performing trainers, and ensure studio safety benchmarks.",
    benchmark_tenure_months: 22,
    benchmark_min_rating: 4.3,
    natural_feeder_roles: ["Personal Trainer Leader", "Personal Trainer Master", "Personal Trainer"],
    open_requisition_codes: ["REQ-PTL-0104"],
    required_capabilities: [
      { name: "Biomechanics & PT Session Programming", required_level: 4, weight: 35, description: "Design club training standards, lead PT certification academies, and resolve client disputes." },
      { name: "Shift Supervision & Operational Leadership", required_level: 4, weight: 35, description: "Manage trainer headcount, commission structures, and performance coaching." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 15, description: "Monitor PT client retention and programmatic renewal campaigns." },
      { name: "Gym Floor Maintenance & Safety", required_level: 3, weight: 15, description: "Zero-tolerance equipment hazard audits and CPR/AED emergency readiness." },
    ],
  },
  {
    role_id: "role-sales-mgr",
    role_name: "Sales Manager",
    job_level: "Manager",
    job_family: "Commercial & Sales",
    role_purpose: "Direct club membership revenue, manage marketing lead funnels, train consultant cohorts on objection handling, and partner with local corporates for B2B contracts.",
    benchmark_tenure_months: 20,
    benchmark_min_rating: 4.2,
    natural_feeder_roles: ["Fitness Consultant Leader", "Fitness Consultant", "Customer Service Leader"],
    open_requisition_codes: ["REQ-FCL-0204"],
    required_capabilities: [
      { name: "Member Acquisition & Conversion", required_level: 4, weight: 40, description: "Lead generation, consultative sales scripts, corporate B2B partnerships, and presale blitzes." },
      { name: "Shift Supervision & Operational Leadership", required_level: 4, weight: 30, description: "Manage sales team KPIs, monthly commercial commissions, and daily activity tracking." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 20, description: "First-30-day member onboarding and lapse prevention campaigns." },
      { name: "POS & Front-Desk Service Excellence", required_level: 3, weight: 10, description: "Ensure sales contract legal compliance, discount authorization, and audit trail." },
    ],
  },
  {
    role_id: "role-cs",
    role_name: "Customer Service",
    job_level: "Staff",
    job_family: "Club Operations",
    role_purpose: "Deliver welcoming frontline member experience, execute check-in & POS transactions, log gym floor safety observations, and resolve member inquiries.",
    benchmark_tenure_months: 14,
    benchmark_min_rating: 4.0,
    natural_feeder_roles: ["Customer Service"],
    open_requisition_codes: ["REQ-BLI-0104", "REQ-SBY-0202", "REQ-JKB-0301"],
    required_capabilities: [
      { name: "POS & Front-Desk Service Excellence", required_level: 3, weight: 35, description: "Fast check-in processing, retail shake POS entry, and cash reconciliation." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 30, description: "Warm member greetings, resolving facility inquiries, and logging feedback." },
      { name: "Gym Floor Maintenance & Safety", required_level: 2, weight: 20, description: "AED checklist verification, turnstile inspection, and incident logging." },
      { name: "Member Acquisition & Conversion", required_level: 2, weight: 15, description: "Providing club walkthroughs for prospective members and day pass visitors." },
    ],
  },
  {
    role_id: "role-pt",
    role_name: "Personal Trainer",
    job_level: "Staff",
    job_family: "Fitness & Coaching",
    role_purpose: "Deliver 1-on-1 personalized training sessions, conduct fitness assessments, drive personal training renewals through goal achievement, and maintain workout floor safety.",
    benchmark_tenure_months: 14,
    benchmark_min_rating: 4.1,
    natural_feeder_roles: ["Personal Trainer"],
    open_requisition_codes: ["REQ-BLI-0109", "REQ-SBY-0218", "REQ-JKS-0405"],
    required_capabilities: [
      { name: "Biomechanics & PT Session Programming", required_level: 3, weight: 35, description: "Design progressive training programs, correct exercise form, and prevent injury." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 30, description: "Track client session frequency, maintain motivation, and secure renewal commitments." },
      { name: "Gym Floor Maintenance & Safety", required_level: 2, weight: 20, description: "Equipment safety checks, weight re-racking enforcement, and floor supervision." },
      { name: "Member Acquisition & Conversion", required_level: 2, weight: 15, description: "Perform complimentary fitness audits for new club members and convert to PT packages." },
    ],
  },
  {
    role_id: "role-fc",
    role_name: "Fitness Consultant",
    job_level: "Staff",
    job_family: "Commercial & Sales",
    role_purpose: "Drive club membership acquisition through walk-in conversion, outbound prospect outreach, corporate partnership promotion, and onboarding new joiners.",
    benchmark_tenure_months: 13,
    benchmark_min_rating: 4.0,
    natural_feeder_roles: ["Fitness Consultant", "Customer Service"],
    open_requisition_codes: ["REQ-BLI-0115", "REQ-JKB-0312", "REQ-SBY-0224"],
    required_capabilities: [
      { name: "Member Acquisition & Conversion", required_level: 3, weight: 40, description: "Consultative sales, conducting club tours, handling pricing objections, and hitting targets." },
      { name: "Member Retention & Onboarding Care", required_level: 3, weight: 25, description: "First-week member welcome calls and facilitating initial club visits." },
      { name: "POS & Front-Desk Service Excellence", required_level: 2, weight: 20, description: "Accurate membership contract creation and payment processing." },
      { name: "Gym Floor Maintenance & Safety", required_level: 1, weight: 15, description: "Report floor hazards observed during prospective member club tours." },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// Curated Benchmark Performers Roster (3+ top performers per role)
// ═══════════════════════════════════════════════════════════════
export const benchmarkEmployeesPool: BenchmarkEmployeeProfile[] = [
  // --- 1. Club Manager ---
  {
    employee_id: "EMP-1003",
    employee_code: "FH-EMP-1003",
    fullname: "Wahyu Hidayat",
    role: "Club Manager",
    club_name: "FIT HUB Kelapa Gading",
    cluster_location: "Jakarta Utara",
    performance_rating: 4.80,
    tenure_months: 28,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Achiever", "Command", "Responsibility", "Maximizer", "Strategic"],
    capabilities: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 4,
      "Member Acquisition & Conversion": 3,
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 8.2, S: 5.4, G: 8.1, T: 7.9, W: 5.5 },
  },
  {
    employee_id: "EMP-1004",
    employee_code: "FH-EMP-1004",
    fullname: "Ratna Sari Dewi",
    role: "Club Manager",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 26,
    mbti: "ENTJ",
    disc: "DC",
    strengths: ["Strategic", "Achiever", "Arranger", "Focus", "Responsibility"],
    capabilities: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 4,
      "Member Acquisition & Conversion": 4,
      "Gym Floor Maintenance & Safety": 3,
      "POS & Front-Desk Service Excellence": 4,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 8.0, S: 5.6, G: 8.0, T: 7.8, W: 5.8 },
  },
  {
    employee_id: "EMP-1005",
    employee_code: "FH-EMP-1005",
    fullname: "Hendra Wijaya",
    role: "Club Manager",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.70,
    tenure_months: 25,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Command", "Achiever", "Responsibility", "Relator", "Arranger"],
    capabilities: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 3,
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 7.9, S: 5.8, G: 7.8, T: 7.6, W: 6.0 },
  },

  // --- 2. Area General Manager ---
  {
    employee_id: "EMP-1001",
    employee_code: "FH-EMP-1001",
    fullname: "Irwan Setiawan",
    role: "Area General Manager",
    club_name: "FIT HUB Regional Office Bali & Jawa Timur",
    cluster_location: "Bali",
    performance_rating: 4.90,
    tenure_months: 36,
    mbti: "ENTJ",
    disc: "DI",
    strengths: ["Strategic", "Command", "Achiever", "Maximizer", "Arranger"],
    capabilities: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 8.5, S: 5.2, G: 8.4, T: 8.2, W: 5.3 },
  },
  {
    employee_id: "EMP-1002",
    employee_code: "FH-EMP-1002",
    fullname: "Dewi Anggraini",
    role: "Area General Manager",
    club_name: "FIT HUB Regional Office Jabodetabek",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.85,
    tenure_months: 34,
    mbti: "ENTJ",
    disc: "DC",
    strengths: ["Strategic", "Focus", "Achiever", "Responsibility", "Competition"],
    capabilities: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 3,
      "POS & Front-Desk Service Excellence": 4,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 8.3, S: 5.5, G: 8.2, T: 8.0, W: 5.6 },
  },
  {
    employee_id: "EMP-1006",
    employee_code: "FH-EMP-1006",
    fullname: "Rudy Hartono",
    role: "Area General Manager",
    club_name: "FIT HUB Regional Office Jawa Barat",
    cluster_location: "Bandung",
    performance_rating: 4.80,
    tenure_months: 32,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Command", "Arranger", "Achiever", "Maximizer", "Relator"],
    capabilities: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 8.1, S: 5.6, G: 8.0, T: 7.8, W: 5.8 },
  },

  // --- 3. Operation Manager ---
  {
    employee_id: "EMP-1011",
    employee_code: "FH-EMP-1011",
    fullname: "Bambang Pamungkas",
    role: "Operation Manager",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.75,
    tenure_months: 24,
    mbti: "ESTJ",
    disc: "CD",
    strengths: ["Deliberative", "Responsibility", "Discipline", "Arranger", "Achiever"],
    capabilities: {
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 7.8, S: 5.5, G: 8.0, T: 7.6, W: 6.2 },
  },
  {
    employee_id: "EMP-1012",
    employee_code: "FH-EMP-1012",
    fullname: "Agus Prasetyo",
    role: "Operation Manager",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.70,
    tenure_months: 22,
    mbti: "ISTJ",
    disc: "CS",
    strengths: ["Discipline", "Responsibility", "Arranger", "Focus", "Restorative"],
    capabilities: {
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 2,
    },
    papi: { P: 7.6, S: 5.8, G: 7.8, T: 7.4, W: 6.4 },
  },
  {
    employee_id: "EMP-1013",
    employee_code: "FH-EMP-1013",
    fullname: "Hadi Purnomo",
    role: "Operation Manager",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.65,
    tenure_months: 21,
    mbti: "ESTJ",
    disc: "CD",
    strengths: ["Responsibility", "Arranger", "Achiever", "Discipline", "Relator"],
    capabilities: {
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.7, S: 5.7, G: 7.9, T: 7.5, W: 6.1 },
  },

  // --- 4. Customer Service Leader ---
  {
    employee_id: "EMP-1015",
    employee_code: "FH-EMP-1015",
    fullname: "Rangga Pratama",
    role: "Customer Service Leader",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 22,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Achiever", "Command", "Responsibility", "Arranger", "Strategic"],
    capabilities: {
      "POS & Front-Desk Service Excellence": 4,
      "Member Retention & Onboarding Care": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 8.0, S: 5.6, G: 7.9, T: 7.6, W: 5.8 },
  },
  {
    employee_id: "EMP-1018",
    employee_code: "FH-EMP-1018",
    fullname: "Siti Nurhaliza",
    role: "Customer Service Leader",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.70,
    tenure_months: 20,
    mbti: "ENTJ",
    disc: "DC",
    strengths: ["Responsibility", "Command", "Focus", "Discipline", "Achiever"],
    capabilities: {
      "POS & Front-Desk Service Excellence": 4,
      "Member Retention & Onboarding Care": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.8, S: 5.5, G: 7.7, T: 7.4, W: 6.0 },
  },
  {
    employee_id: "EMP-1022",
    employee_code: "FH-EMP-1022",
    fullname: "Budi Santoso",
    role: "Customer Service Leader",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.65,
    tenure_months: 24,
    mbti: "ESTJ",
    disc: "ID",
    strengths: ["Achiever", "Arranger", "Responsibility", "Relator", "Strategic"],
    capabilities: {
      "POS & Front-Desk Service Excellence": 3,
      "Member Retention & Onboarding Care": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.9, S: 6.0, G: 7.8, T: 7.2, W: 6.2 },
  },

  // --- 5. Personal Trainer Leader ---
  {
    employee_id: "EMP-1031",
    employee_code: "FH-EMP-1031",
    fullname: "Yoga Permana",
    role: "Personal Trainer Leader",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 24,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Focus", "Developer", "Achiever", "Command", "Competition"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.9, S: 6.0, G: 8.0, T: 7.5, W: 5.2 },
  },
  {
    employee_id: "EMP-1032",
    employee_code: "FH-EMP-1032",
    fullname: "Doni Prasetyo",
    role: "Personal Trainer Leader",
    club_name: "FIT HUB Kebon Jeruk",
    cluster_location: "Jakarta Barat",
    performance_rating: 4.70,
    tenure_months: 22,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Developer", "Relator", "Achiever", "Competition", "Maximizer"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.7, S: 6.4, G: 7.8, T: 7.3, W: 5.4 },
  },
  {
    employee_id: "EMP-1033",
    employee_code: "FH-EMP-1033",
    fullname: "Reza Pahlevi",
    role: "Personal Trainer Leader",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.65,
    tenure_months: 20,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Command", "Focus", "Developer", "Responsibility", "Achiever"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.8, S: 6.2, G: 7.9, T: 7.4, W: 5.3 },
  },

  // --- 6. Personal Trainer Master ---
  {
    employee_id: "EMP-1035",
    employee_code: "FH-EMP-1035",
    fullname: "Aris Munandar",
    role: "Personal Trainer Master",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.85,
    tenure_months: 30,
    mbti: "INTJ",
    disc: "DC",
    strengths: ["Learner", "Focus", "Achiever", "Analytical", "Developer"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 3,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.5, S: 5.2, G: 8.3, T: 7.8, W: 5.5 },
  },
  {
    employee_id: "EMP-1036",
    employee_code: "FH-EMP-1036",
    fullname: "Gilang Ramadhan",
    role: "Personal Trainer Master",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.80,
    tenure_months: 28,
    mbti: "ENTP",
    disc: "DI",
    strengths: ["Developer", "Maximizer", "Achiever", "Relator", "Focus"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.6, S: 6.0, G: 8.1, T: 7.6, W: 5.3 },
  },
  {
    employee_id: "EMP-1037",
    employee_code: "FH-EMP-1037",
    fullname: "Taufik Hidayat",
    role: "Personal Trainer Master",
    club_name: "FIT HUB Riau Bandung",
    cluster_location: "Bandung",
    performance_rating: 4.75,
    tenure_months: 26,
    mbti: "ISTP",
    disc: "CD",
    strengths: ["Learner", "Focus", "Restorative", "Achiever", "Responsibility"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.4, S: 5.5, G: 8.0, T: 7.5, W: 5.7 },
  },

  // --- 7. Fitness Consultant Leader ---
  {
    employee_id: "EMP-1047",
    employee_code: "FH-EMP-1047",
    fullname: "Maya Safitri",
    role: "Fitness Consultant Leader",
    club_name: "FIT HUB Puri Indah",
    cluster_location: "Jakarta Barat",
    performance_rating: 4.75,
    tenure_months: 21,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.6, S: 7.5, G: 8.1, T: 7.7, W: 5.0 },
  },
  {
    employee_id: "EMP-1048",
    employee_code: "FH-EMP-1048",
    fullname: "Bagus Priyanto",
    role: "Fitness Consultant Leader",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.70,
    tenure_months: 20,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Woo", "Communication", "Relator", "Competition", "Achiever"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 2,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.3, S: 7.2, G: 7.8, T: 7.4, W: 5.3 },
  },
  {
    employee_id: "EMP-1049",
    employee_code: "FH-EMP-1049",
    fullname: "Siska Wardani",
    role: "Fitness Consultant Leader",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.65,
    tenure_months: 19,
    mbti: "ENFP",
    disc: "ID",
    strengths: ["Communication", "Positivity", "Woo", "Activator", "Relator"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.4, S: 7.4, G: 7.9, T: 7.5, W: 5.1 },
  },

  // --- 8. Fitness Manager ---
  {
    employee_id: "EMP-1051",
    employee_code: "FH-EMP-1051",
    fullname: "David Christian",
    role: "Fitness Manager",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.80,
    tenure_months: 26,
    mbti: "ENTJ",
    disc: "DI",
    strengths: ["Command", "Developer", "Achiever", "Maximizer", "Strategic"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 8.0, S: 5.8, G: 8.1, T: 7.7, W: 5.4 },
  },
  {
    employee_id: "EMP-1052",
    employee_code: "FH-EMP-1052",
    fullname: "I Wayan Sukerta",
    role: "Fitness Manager",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 24,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Achiever", "Developer", "Command", "Focus", "Responsibility"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.9, S: 6.0, G: 7.9, T: 7.5, W: 5.5 },
  },
  {
    employee_id: "EMP-1053",
    employee_code: "FH-EMP-1053",
    fullname: "Fajar Nugraha",
    role: "Fitness Manager",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.70,
    tenure_months: 23,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Developer", "Relator", "Achiever", "Competition", "Strategic"],
    capabilities: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    papi: { P: 7.8, S: 6.2, G: 7.8, T: 7.4, W: 5.6 },
  },

  // --- 9. Sales Manager ---
  {
    employee_id: "EMP-1061",
    employee_code: "FH-EMP-1061",
    fullname: "Denny Siregar",
    role: "Sales Manager",
    club_name: "FIT HUB Kelapa Gading",
    cluster_location: "Jakarta Utara",
    performance_rating: 4.80,
    tenure_months: 25,
    mbti: "ENTJ",
    disc: "DI",
    strengths: ["Woo", "Command", "Competition", "Strategic", "Achiever"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 8.1, S: 7.0, G: 8.2, T: 7.8, W: 5.1 },
  },
  {
    employee_id: "EMP-1062",
    employee_code: "FH-EMP-1062",
    fullname: "Jessica Tanujaya",
    role: "Sales Manager",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 23,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Maximizer", "Strategic", "Activator"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.9, S: 7.3, G: 8.0, T: 7.6, W: 5.0 },
  },
  {
    employee_id: "EMP-1063",
    employee_code: "FH-EMP-1063",
    fullname: "Aditya Pratama",
    role: "Sales Manager",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.70,
    tenure_months: 22,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Competition", "Command", "Woo", "Achiever", "Relator"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.8, S: 7.1, G: 7.9, T: 7.5, W: 5.2 },
  },

  // --- 10. Customer Service ---
  {
    employee_id: "EMP-1081",
    employee_code: "FH-EMP-1081",
    fullname: "Anisa Rahmawati",
    role: "Customer Service",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.65,
    tenure_months: 18,
    mbti: "ISFJ",
    disc: "SC",
    strengths: ["Responsibility", "Harmony", "Discipline", "Empathy", "Relator"],
    capabilities: {
      "POS & Front-Desk Service Excellence": 3,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Member Acquisition & Conversion": 2,
      "Shift Supervision & Operational Leadership": 1,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.2, S: 6.0, G: 7.7, T: 7.3, W: 6.5 },
  },
  {
    employee_id: "EMP-1082",
    employee_code: "FH-EMP-1082",
    fullname: "Kadek Ayu Lestari",
    role: "Customer Service",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.60,
    tenure_months: 16,
    mbti: "ESFJ",
    disc: "IS",
    strengths: ["Positivity", "Relator", "Arranger", "Responsibility", "Communication"],
    capabilities: {
      "POS & Front-Desk Service Excellence": 3,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Member Acquisition & Conversion": 2,
      "Shift Supervision & Operational Leadership": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.3, S: 6.5, G: 7.6, T: 7.1, W: 6.0 },
  },
  {
    employee_id: "EMP-1083",
    employee_code: "FH-EMP-1083",
    fullname: "Rina Kusuma",
    role: "Customer Service",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.60,
    tenure_months: 22,
    mbti: "ISFJ",
    disc: "SC",
    strengths: ["Discipline", "Arranger", "Responsibility", "Relator", "Restorative"],
    capabilities: {
      "POS & Front-Desk Service Excellence": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Member Retention & Onboarding Care": 3,
      "Member Acquisition & Conversion": 1,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.4, S: 5.8, G: 7.8, T: 7.2, W: 6.4 },
  },

  // --- 11. Personal Trainer ---
  {
    employee_id: "EMP-1091",
    employee_code: "FH-EMP-1091",
    fullname: "Bayu Wicaksono",
    role: "Personal Trainer",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.70,
    tenure_months: 18,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Developer", "Achiever", "Focus", "Competition", "Relator"],
    capabilities: {
      "Biomechanics & PT Session Programming": 3,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Member Acquisition & Conversion": 2,
      "Shift Supervision & Operational Leadership": 2,
      "POS & Front-Desk Service Excellence": 1,
    },
    papi: { P: 7.5, S: 6.2, G: 7.9, T: 7.4, W: 5.3 },
  },
  {
    employee_id: "EMP-1092",
    employee_code: "FH-EMP-1092",
    fullname: "I Gede Suardika",
    role: "Personal Trainer",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.65,
    tenure_months: 16,
    mbti: "ESFP",
    disc: "IS",
    strengths: ["Developer", "Positivity", "Relator", "Achiever", "Focus"],
    capabilities: {
      "Biomechanics & PT Session Programming": 3,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Member Acquisition & Conversion": 2,
      "Shift Supervision & Operational Leadership": 1,
      "POS & Front-Desk Service Excellence": 1,
    },
    papi: { P: 7.3, S: 6.6, G: 7.7, T: 7.2, W: 5.4 },
  },
  {
    employee_id: "EMP-1093",
    employee_code: "FH-EMP-1093",
    fullname: "Rizal Firmansyah",
    role: "Personal Trainer",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.60,
    tenure_months: 19,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Developer", "Relator", "Competition", "Focus", "Positivity"],
    capabilities: {
      "Biomechanics & PT Session Programming": 3,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 1,
    },
    papi: { P: 7.4, S: 6.5, G: 7.7, T: 7.2, W: 5.4 },
  },

  // --- 12. Fitness Consultant ---
  {
    employee_id: "EMP-1101",
    employee_code: "FH-EMP-1101",
    fullname: "Maya Anggraini",
    role: "Fitness Consultant",
    club_name: "FIT HUB Puri Indah",
    cluster_location: "Jakarta Barat",
    performance_rating: 4.70,
    tenure_months: 20,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.5, S: 7.4, G: 8.0, T: 7.6, W: 5.0 },
  },
  {
    employee_id: "EMP-1103",
    employee_code: "FH-EMP-1103",
    fullname: "Dian Permata Sari",
    role: "Fitness Consultant",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.60,
    tenure_months: 18,
    mbti: "ENFP",
    disc: "IS",
    strengths: ["Woo", "Communication", "Relator", "Competition", "Activator"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Gym Floor Maintenance & Safety": 1,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 7.0, S: 7.2, G: 7.6, T: 7.1, W: 5.2 },
  },
  {
    employee_id: "EMP-1105",
    employee_code: "FH-EMP-1105",
    fullname: "Putu Ayu Lestari",
    role: "Fitness Consultant",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.50,
    tenure_months: 16,
    mbti: "ENFP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Positivity", "Relator", "Competition"],
    capabilities: {
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 2,
      "Shift Supervision & Operational Leadership": 2,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    papi: { P: 6.8, S: 7.0, G: 7.4, T: 6.9, W: 5.0 },
  },
];

// ═══════════════════════════════════════════════════════════════
// Active Employee Candidates Pool (Tier 1 Staff, Tier 2 Leads, Tier 3 Managers)
// ═══════════════════════════════════════════════════════════════
export const activeEmployeePool: ActiveEmployeeCandidate[] = [
  // --- TIER 2 LEADERS (Succession Ready for Club Manager & Operation Manager) ---
  {
    employee_id: "emp-201",
    employee_code: "FH-EMP-201",
    fullname: "Made Dharma Wijaya",
    current_role: "Customer Service Leader",
    current_location: "Bali",
    current_club: "FIT HUB Canggu",
    tenure_months: 24,
    performance_rating: 4.88,
    capability_scores: {
      "POS & Front-Desk Service Excellence": 4,
      "Member Retention & Onboarding Care": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 3,
      "Biomechanics & PT Session Programming": 2,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 8.2, S: 6.0, G: 8.1, T: 7.9, W: 5.6 },
    strengths: ["Achiever", "Command", "Responsibility", "Arranger", "Strategic"],
    top_strength: "Peak-shift floor leadership & zero-dispute POS auditing",
    development_priority: "Club P&L analysis and corporate B2B acquisition strategy",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Selatan"],
  },
  {
    employee_id: "emp-202",
    employee_code: "FH-EMP-202",
    fullname: "Sarah Amalia",
    current_role: "Customer Service Leader",
    current_location: "Surabaya",
    current_club: "FIT HUB Merr Surabaya",
    tenure_months: 22,
    performance_rating: 4.82,
    capability_scores: {
      "POS & Front-Desk Service Excellence": 4,
      "Member Retention & Onboarding Care": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 3,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ESFJ",
    disc: "IS",
    papi: { P: 7.9, S: 6.8, G: 7.9, T: 7.5, W: 6.0 },
    strengths: ["Responsibility", "Arranger", "Relator", "Achiever", "Empathy"],
    top_strength: "Front-desk check-in throughput (+45% peak speed)",
    development_priority: "Contractual dispute escalation and facility Capex budgeting",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Malang"],
  },
  {
    employee_id: "emp-203",
    employee_code: "FH-EMP-203",
    fullname: "Aditya Nugroho",
    current_role: "Personal Trainer Leader",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road",
    tenure_months: 26,
    performance_rating: 4.85,
    capability_scores: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Member Retention & Onboarding Care": 4,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    mbti: "ESTP",
    disc: "DI",
    papi: { P: 8.0, S: 6.2, G: 8.0, T: 7.6, W: 5.3 },
    strengths: ["Developer", "Command", "Achiever", "Focus", "Competition"],
    top_strength: "Trainer team quota delivery (114% monthly PT target)",
    development_priority: "Club EBITDA accounting and non-PT member retention systems",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Bandung"],
  },
  {
    employee_id: "emp-204",
    employee_code: "FH-EMP-204",
    fullname: "Rizky Ramadhan",
    current_role: "Personal Trainer Master",
    current_location: "Jakarta Selatan",
    current_club: "FIT HUB Kuningan",
    tenure_months: 28,
    performance_rating: 4.90,
    capability_scores: {
      "Biomechanics & PT Session Programming": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    mbti: "INTJ",
    disc: "DC",
    papi: { P: 7.9, S: 5.4, G: 8.3, T: 7.9, W: 5.5 },
    strengths: ["Learner", "Focus", "Achiever", "Developer", "Analytical"],
    top_strength: "Elite VIP movement assessment & VIP client retention (88%)",
    development_priority: "People coaching for club multi-department teams",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Surabaya"],
  },
  {
    employee_id: "emp-205",
    employee_code: "FH-EMP-205",
    fullname: "Nadia Utami",
    current_role: "Fitness Consultant Leader",
    current_location: "Bali",
    current_club: "FIT HUB Canggu",
    tenure_months: 23,
    performance_rating: 4.86,
    capability_scores: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 3,
      "Member Retention & Onboarding Care": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 2,
    },
    mbti: "ENTP",
    disc: "ID",
    papi: { P: 7.8, S: 7.5, G: 8.2, T: 7.7, W: 5.0 },
    strengths: ["Communication", "Woo", "Competition", "Strategic", "Activator"],
    top_strength: "Presale lead blitz campaigns (Rp 120M ACV generated)",
    development_priority: "Shift rostering operations and floor safety audits",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Barat", "Surabaya"],
  },

  // --- TIER 3 MANAGERS (Succession Ready for Area General Manager & Club Manager Backfill) ---
  {
    employee_id: "emp-301",
    employee_code: "FH-EMP-301",
    fullname: "Gede Agus Suantara",
    current_role: "Operation Manager",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road",
    tenure_months: 28,
    performance_rating: 4.89,
    capability_scores: {
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 4,
      "Member Acquisition & Conversion": 3,
      "Biomechanics & PT Session Programming": 2,
    },
    mbti: "ESTJ",
    disc: "CD",
    papi: { P: 8.1, S: 5.7, G: 8.1, T: 7.8, W: 6.0 },
    strengths: ["Responsibility", "Discipline", "Arranger", "Achiever", "Focus"],
    top_strength: "Multi-club preventative maintenance & zero safety incidents",
    development_priority: "Cluster commercial marketing & cross-regional brand deals",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Selatan"],
  },
  {
    employee_id: "emp-302",
    employee_code: "FH-EMP-302",
    fullname: "Ferry Kurniawan",
    current_role: "Fitness Manager",
    current_location: "Surabaya",
    current_club: "FIT HUB Merr Surabaya",
    tenure_months: 29,
    performance_rating: 4.87,
    capability_scores: {
      "Biomechanics & PT Session Programming": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Member Acquisition & Conversion": 3,
      "POS & Front-Desk Service Excellence": 2,
    },
    mbti: "ENTJ",
    disc: "DI",
    papi: { P: 8.2, S: 5.9, G: 8.2, T: 7.8, W: 5.4 },
    strengths: ["Command", "Developer", "Achiever", "Maximizer", "Strategic"],
    top_strength: "Trainer retention (92%) & high-margin PT package delivery",
    development_priority: "Front-desk POS SOP governance & facilities audit",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Utara"],
  },
  {
    employee_id: "emp-303",
    employee_code: "FH-EMP-303",
    fullname: "Clarissa Dewi",
    current_role: "Sales Manager",
    current_location: "Jakarta Selatan",
    current_club: "FIT HUB Kuningan",
    tenure_months: 27,
    performance_rating: 4.88,
    capability_scores: {
      "Member Acquisition & Conversion": 4,
      "Shift Supervision & Operational Leadership": 4,
      "Member Retention & Onboarding Care": 4,
      "POS & Front-Desk Service Excellence": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ENTJ",
    disc: "DI",
    papi: { P: 8.2, S: 7.2, G: 8.3, T: 7.9, W: 5.1 },
    strengths: ["Strategic", "Woo", "Command", "Competition", "Achiever"],
    top_strength: "Corporate B2B wellness partnership pipelines (Rp 280M)",
    development_priority: "Club floor safety SOPs and Capex maintenance cycles",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Bandung"],
  },
  {
    employee_id: "emp-304",
    employee_code: "FH-EMP-304",
    fullname: "Kurnia Sandi",
    current_role: "Club Manager",
    current_location: "Bandung",
    current_club: "FIT HUB Riau Bandung",
    tenure_months: 32,
    performance_rating: 4.92,
    capability_scores: {
      "Shift Supervision & Operational Leadership": 4,
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 4,
      "POS & Front-Desk Service Excellence": 4,
      "Biomechanics & PT Session Programming": 2,
    },
    mbti: "ENTJ",
    disc: "DI",
    papi: { P: 8.4, S: 5.6, G: 8.3, T: 8.1, W: 5.4 },
    strengths: ["Strategic", "Command", "Achiever", "Maximizer", "Arranger"],
    top_strength: "Turnaround club EBITDA margin (+18% YoY) & zero leadership turnover",
    development_priority: "Multi-unit regional cluster governance and expansion SOPs",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Surabaya"],
  },

  // --- TIER 1 STAFF (Frontline Ready for Promotion to Tier 2 Team Leader) ---
  {
    employee_id: "emp-1042",
    employee_code: "FH-EMP-1042",
    fullname: "Dimas Arya Pratama",
    current_role: "Customer Service",
    current_location: "Surabaya",
    current_club: "FIT HUB Merr Surabaya",
    tenure_months: 22,
    performance_rating: 4.85,
    capability_scores: {
      "POS & Front-Desk Service Excellence": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 8.1, S: 5.8, G: 8.0, T: 7.7, W: 5.9 },
    strengths: ["Achiever", "Arranger", "Responsibility", "Command", "Discipline"],
    top_strength: "Fast cash reconciliation & zero drawer discrepancies",
    development_priority: "Shift roster allocation and buddy mentoring",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Malang"],
  },
  {
    employee_id: "emp-1044",
    employee_code: "FH-EMP-1044",
    fullname: "Ni Putu Sri Wahyuni",
    current_role: "Customer Service",
    current_location: "Bali",
    current_club: "FIT HUB Canggu",
    tenure_months: 20,
    performance_rating: 4.80,
    capability_scores: {
      "POS & Front-Desk Service Excellence": 3,
      "Member Retention & Onboarding Care": 4,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 3,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ESFJ",
    disc: "IS",
    papi: { P: 7.5, S: 6.4, G: 7.8, T: 7.4, W: 5.7 },
    strengths: ["Positivity", "Relator", "Responsibility", "Arranger", "Empathy"],
    top_strength: "Highest member NPS in Bali cluster (94 NPS)",
    development_priority: "Dispute resolution and refund approvals",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya"],
  },
  {
    employee_id: "emp-1046",
    employee_code: "FH-EMP-1046",
    fullname: "I Wayan Balik",
    current_role: "Personal Trainer",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road",
    tenure_months: 21,
    performance_rating: 4.82,
    capability_scores: {
      "Biomechanics & PT Session Programming": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 3,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 1,
    },
    mbti: "ESTP",
    disc: "DI",
    papi: { P: 7.8, S: 6.1, G: 7.9, T: 7.5, W: 5.4 },
    strengths: ["Developer", "Focus", "Achiever", "Command", "Competition"],
    top_strength: "Top corrective exercise coach in Bali (140+ sessions/month)",
    development_priority: "Junior trainer coaching and session conversion audit",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Surabaya"],
  },
  {
    employee_id: "emp-1048",
    employee_code: "FH-EMP-1048",
    fullname: "Annisa Larasati",
    current_role: "Fitness Consultant",
    current_location: "Jakarta Barat",
    current_club: "FIT HUB Kebon Jeruk",
    tenure_months: 19,
    performance_rating: 4.78,
    capability_scores: {
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Gym Floor Maintenance & Safety": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ENTP",
    disc: "ID",
    papi: { P: 7.4, S: 7.2, G: 7.9, T: 7.6, W: 5.2 },
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    top_strength: "Walk-in trial conversion champion (44% conversion rate)",
    development_priority: "Team closing coaching and contract auditing",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Barat", "Tangerang"],
  },
  {
    employee_id: "emp-1050",
    employee_code: "FH-EMP-1050",
    fullname: "Agung Surya Wijaya",
    current_role: "Personal Trainer",
    current_location: "Surabaya",
    current_club: "FIT HUB Gubeng",
    tenure_months: 23,
    performance_rating: 4.79,
    capability_scores: {
      "Biomechanics & PT Session Programming": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Member Acquisition & Conversion": 2,
      "POS & Front-Desk Service Excellence": 1,
    },
    mbti: "ESTP",
    disc: "IS",
    papi: { P: 7.6, S: 6.3, G: 7.8, T: 7.3, W: 5.5 },
    strengths: ["Developer", "Relator", "Achiever", "Focus", "Positivity"],
    top_strength: "High client transformation renewal (82% renewal pacing)",
    development_priority: "Session scheduling across multi-trainer floor shifts",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Malang"],
  },
  {
    employee_id: "emp-1052",
    employee_code: "FH-EMP-1052",
    fullname: "Kadek Dwi Antara",
    current_role: "Customer Service",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road",
    tenure_months: 18,
    performance_rating: 4.75,
    capability_scores: {
      "POS & Front-Desk Service Excellence": 3,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ISFJ",
    disc: "SC",
    papi: { P: 7.1, S: 6.2, G: 7.5, T: 7.1, W: 6.3 },
    strengths: ["Discipline", "Responsibility", "Harmony", "Arranger", "Relator"],
    top_strength: "Gym floor checklist audit & towel distribution efficiency",
    development_priority: "Handling aggressive billing disputes calmly",
    willing_to_relocate: false,
    preferred_locations: ["Bali"],
  },
  {
    employee_id: "emp-1054",
    employee_code: "FH-EMP-1054",
    fullname: "Mega Puspita",
    current_role: "Fitness Consultant",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road",
    tenure_months: 17,
    performance_rating: 4.72,
    capability_scores: {
      "Member Acquisition & Conversion": 4,
      "Member Retention & Onboarding Care": 3,
      "POS & Front-Desk Service Excellence": 3,
      "Shift Supervision & Operational Leadership": 2,
      "Gym Floor Maintenance & Safety": 1,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ENFP",
    disc: "ID",
    papi: { P: 7.2, S: 7.3, G: 7.7, T: 7.3, W: 5.1 },
    strengths: ["Communication", "Woo", "Positivity", "Relator", "Competition"],
    top_strength: "WhatsApp outreach re-engagement on cold leads",
    development_priority: "Corporate presale pitch presentations",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya"],
  },
  {
    employee_id: "emp-1056",
    employee_code: "FH-EMP-1056",
    fullname: "Fajar Maulana",
    current_role: "Customer Service",
    current_location: "Jakarta Selatan",
    current_club: "FIT HUB Kuningan",
    tenure_months: 19,
    performance_rating: 4.70,
    capability_scores: {
      "POS & Front-Desk Service Excellence": 4,
      "Member Retention & Onboarding Care": 3,
      "Gym Floor Maintenance & Safety": 2,
      "Shift Supervision & Operational Leadership": 2,
      "Member Acquisition & Conversion": 2,
      "Biomechanics & PT Session Programming": 1,
    },
    mbti: "ESFJ",
    disc: "IS",
    papi: { P: 7.3, S: 6.4, G: 7.6, T: 7.2, W: 5.9 },
    strengths: ["Arranger", "Responsibility", "Positivity", "Relator", "Achiever"],
    top_strength: "Corporate member onboarding speed",
    development_priority: "Shift handover log audits",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Bandung"],
  },
];

// ═══════════════════════════════════════════════════════════════
// Matching Parameters Interface & Career Governance Helpers
// ═══════════════════════════════════════════════════════════════
export interface MatchingParams {
  targetRoleId: string;
  targetLocation: string;
  benchmarkEmpIds?: string[];
  minPerformance: number;
  minTenureMonths: number;
  feederOnly: boolean;
  weights?: {
    capability: number;
    performance: number;
    psychometric: number;
    tenure: number;
  };
  dynamicCapabilities?: TargetCapabilityRequirement[];
}

function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 3.0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateMode(arr: string[], fallback: string): string {
  if (arr.length === 0) return fallback;
  const freq: Record<string, number> = {};
  let maxCount = 0;
  let mode = fallback;
  arr.forEach((item) => {
    freq[item] = (freq[item] || 0) + 1;
    if (freq[item] > maxCount) {
      maxCount = freq[item];
      mode = item;
    }
  });
  return mode;
}

export function getRoleTier(roleName: string): number {
  const r = roleName.toLowerCase();
  if (r.includes("area general manager") || r.includes("agm")) return 4;
  if (r.includes("club manager") || r.includes("operation manager") || r.includes("fitness manager") || r.includes("sales manager")) return 3;
  if (r.includes("leader") || r.includes("master") || r.includes("lead")) return 2;
  return 1;
}

// ═══════════════════════════════════════════════════════════════
// Dynamic Matching Engine (Frontline Mobility Matching Core)
// ═══════════════════════════════════════════════════════════════
export function runDynamicMobilityMatching(params: MatchingParams): {
  benchmark: TargetRoleBenchmark;
  results: DynamicMatchResult[];
  derivedBaseline: {
    medianRating: number;
    medianTenure: number;
    modeMbti: string;
    modeDisc: string;
    benchmarkStrengths: string[];
    capabilities: Record<string, number>;
  };
} {
  const benchmark =
    targetRoleBenchmarks.find((b) => b.role_id === params.targetRoleId) || targetRoleBenchmarks[0];

  // 1. Identify selected benchmark performers
  const selectedBenchmarks = (params.benchmarkEmpIds && params.benchmarkEmpIds.length > 0)
    ? benchmarkEmployeesPool.filter((b) => params.benchmarkEmpIds!.includes(b.employee_id))
    : benchmarkEmployeesPool.slice(0, 3);

  const effectiveBenchmarks = selectedBenchmarks.length > 0 ? selectedBenchmarks : benchmarkEmployeesPool.slice(0, 3);

  // 2. Synthesize Dynamic Ideal Baseline from selected performers
  const medianRating = calculateMedian(effectiveBenchmarks.map((b) => b.performance_rating));
  const medianTenure = calculateMedian(effectiveBenchmarks.map((b) => b.tenure_months));
  const modeMbti = calculateMode(effectiveBenchmarks.map((b) => b.mbti), "ESTJ");
  const modeDisc = calculateMode(effectiveBenchmarks.map((b) => b.disc), "DI");

  // 3. CliftonStrengths Synthesis (Combine Top 5 of selected benchmark performers)
  const benchmarkStrengthsSet = new Set<string>();
  effectiveBenchmarks.forEach((b) => {
    b.strengths.forEach((s) => benchmarkStrengthsSet.add(s));
  });
  const benchmarkStrengths = Array.from(benchmarkStrengthsSet);

  // 4. Determine Active Capabilities (Live from DB params or static fallback)
  const activeCapabilities: TargetCapabilityRequirement[] = (params.dynamicCapabilities && params.dynamicCapabilities.length > 0)
    ? params.dynamicCapabilities
    : benchmark.required_capabilities;

  const baselineCaps: Record<string, number> = {};
  activeCapabilities.forEach((req) => {
    const scores = effectiveBenchmarks.map((b) => b.capabilities[req.name] || req.required_level);
    baselineCaps[req.name] = calculateMedian(scores);
  });

  // Weights (Exact 45% + 25% + 20% + 10% = 100%)
  const wCap = params.weights?.capability ?? 45;
  const wPerf = params.weights?.performance ?? 25;
  const wPsych = params.weights?.psychometric ?? 20;
  const wTenure = params.weights?.tenure ?? 10;
  const totalWeight = wCap + wPerf + wPsych + wTenure;

  const capWeightNorm = wCap / totalWeight;
  const perfWeightNorm = wPerf / totalWeight;
  const psychWeightNorm = wPsych / totalWeight;
  const tenureWeightNorm = wTenure / totalWeight;

  const targetTier = getRoleTier(benchmark.role_name);

  const scoredCandidates = activeEmployeePool.map((candidate) => {
    const candidateTier = getRoleTier(candidate.current_role);
    const isFeeder = benchmark.natural_feeder_roles.some(
      (f) => f.toLowerCase() === candidate.current_role.toLowerCase()
    );

    // Anti-Lompat HR Governance Validation
    let careerTierWarning: string | undefined = undefined;
    if (targetTier >= 3 && candidateTier === 1) {
      careerTierWarning = `Anti-Lompat Policy: Direct jump from Tier 1 Staff to ${benchmark.role_name} is restricted. Tier 2 Lead/Specialist tenure required.`;
    } else if (targetTier === 4 && candidateTier <= 2) {
      careerTierWarning = `Anti-Lompat Policy: Direct jump from Tier ${candidateTier} to Area General Manager is restricted. Club Manager tenure required.`;
    }

    // 1. Capability Coverage Score (Weight 45%)
    let totalCapScore = 0;
    let totalCapWeight = 0;
    const criticalGaps: Array<{ capability: string; current_level: number; required_level: number }> = [];

    activeCapabilities.forEach((req) => {
      // Find candidate score or deduce from role tier
      let candidateLevel = candidate.capability_scores[req.name];
      if (candidateLevel === undefined) {
        // Fallback deduction based on tier and domain
        if (candidateTier >= 3) candidateLevel = 3;
        else if (candidateTier === 2) candidateLevel = 3;
        else candidateLevel = 2;
      }

      const targetLevel = baselineCaps[req.name] || req.required_level;
      const coverageRatio = Math.min(1.0, candidateLevel / targetLevel);
      totalCapScore += coverageRatio * req.weight;
      totalCapWeight += req.weight;

      if (candidateLevel < targetLevel) {
        criticalGaps.push({
          capability: req.name,
          current_level: candidateLevel,
          required_level: Math.round(targetLevel),
        });
      }
    });

    const capabilityCoveragePct = totalCapWeight > 0 ? (totalCapScore / totalCapWeight) * 100 : 70;

    // 2. Performance Score (Weight 25%)
    const performanceScorePct = Math.min(100, (candidate.performance_rating / medianRating) * 100);

    // 3. Psychometrics & Personality Score (Weight 20%)
    // PAPI (30%) + DISC (25%) + MBTI (20%) + CliftonStrengths Overlap (25%)
    const papiMatchRatio = Math.min(1.0, (candidate.papi.P / 8.0) * 0.3 + (candidate.papi.G / 8.0) * 0.3 + (candidate.papi.T / 7.5) * 0.4) * 100;
    const discMatchRatio = candidate.disc === modeDisc ? 100 : candidate.disc[0] === modeDisc[0] ? 75 : 50;
    const mbtiMatchRatio = candidate.mbti === modeMbti ? 100 : candidate.mbti[0] === modeMbti[0] ? 70 : 40;

    // CliftonStrengths Overlap Calculation
    const matchingStrengths = candidate.strengths.filter((s) => benchmarkStrengthsSet.has(s));
    const strengthsOverlapRatio = Math.min(100, (matchingStrengths.length / 5.0) * 100);

    const psychometricScorePct = (
      papiMatchRatio * 0.30 +
      discMatchRatio * 0.25 +
      mbtiMatchRatio * 0.20 +
      strengthsOverlapRatio * 0.25
    );

    // 4. Contextual & Mobility Score (Weight 10%)
    const tenureMaturityPct = Math.min(100, (candidate.tenure_months / medianTenure) * 100);
    const isSameLocation = candidate.current_location === params.targetLocation;
    const isWillingRelocate = candidate.willing_to_relocate && (
      candidate.preferred_locations.includes(params.targetLocation) || candidate.preferred_locations.length === 0
    );
    const locationScore = isSameLocation ? 100 : isWillingRelocate ? 85 : 60;
    const feederBonus = isFeeder ? 100 : 70;
    const contextualScorePct = tenureMaturityPct * 0.5 + ((locationScore * 0.6 + feederBonus * 0.4) * 0.5);

    // 5. Composite Match Rate (0.0% to 100.0%)
    let rawMatchRate = (
      capabilityCoveragePct * capWeightNorm +
      performanceScorePct * perfWeightNorm +
      psychometricScorePct * psychWeightNorm +
      contextualScorePct * tenureWeightNorm
    );

    // If Anti-Lompat warning applies, cap match rate to prevent leapfrogging
    if (careerTierWarning) {
      rawMatchRate = Math.min(rawMatchRate, 62.5);
    }

    const matchRatePct = Math.round(Math.min(100.0, Math.max(0.0, rawMatchRate)) * 10) / 10;

    // Determine Readiness Status Tier
    let readinessStatus: "Ready" | "Near Ready" | "Development Needed";
    if (careerTierWarning) {
      readinessStatus = "Development Needed";
    } else if (matchRatePct >= 85.0 && criticalGaps.length === 0 && candidate.performance_rating >= 4.2) {
      readinessStatus = "Ready";
    } else if (matchRatePct >= 70.0 && criticalGaps.length <= 1) {
      readinessStatus = "Near Ready";
    } else {
      readinessStatus = "Development Needed";
    }

    return {
      candidate,
      isFeeder,
      careerTierWarning,
      matchingStrengths,
      matchRatePct,
      readinessStatus,
      capabilityCoveragePct: Math.round(capabilityCoveragePct * 10) / 10,
      performanceScorePct: Math.round(performanceScorePct * 10) / 10,
      psychometricScorePct: Math.round(psychometricScorePct * 10) / 10,
      tenureScorePct: Math.round(contextualScorePct * 10) / 10,
      criticalGaps,
    };
  });

  // Filter candidates based on input criteria
  const filtered = scoredCandidates.filter((item) => {
    if (params.feederOnly && (!item.isFeeder || item.careerTierWarning)) {
      return false;
    }
    if (item.candidate.performance_rating < params.minPerformance) {
      return false;
    }
    if (item.candidate.tenure_months < params.minTenureMonths) {
      return false;
    }
    return true;
  });

  // Sort by Match Rate descending
  filtered.sort((a, b) => b.matchRatePct - a.matchRatePct);

  // Assign ranks and format output
  const results: DynamicMatchResult[] = filtered.map((item, index) => {
    return {
      rank: index + 1,
      employee_code: item.candidate.employee_code,
      fullname: item.candidate.fullname,
      current_role: item.candidate.current_role,
      current_location: item.candidate.current_location,
      current_club: item.candidate.current_club,
      target_role: benchmark.role_name,
      target_location: params.targetLocation,
      match_rate_pct: item.matchRatePct,
      readiness_status: item.readinessStatus,
      capability_coverage_pct: item.capabilityCoveragePct,
      performance_score_pct: item.performanceScorePct,
      psychometric_score_pct: item.psychometricScorePct,
      tenure_score_pct: item.tenureScorePct,
      performance_rating: item.candidate.performance_rating,
      tenure_months: item.candidate.tenure_months,
      mbti: item.candidate.mbti,
      disc: item.candidate.disc,
      critical_gaps: item.criticalGaps,
      strengths: item.candidate.strengths,
      matching_strengths: item.matchingStrengths,
      top_strength: item.candidate.top_strength,
      recommended_action: item.careerTierWarning || item.candidate.development_priority,
      is_feeder_role: item.isFeeder,
      career_tier_warning: item.careerTierWarning,
    };
  });

  return {
    benchmark,
    results,
    derivedBaseline: {
      medianRating,
      medianTenure,
      modeMbti,
      modeDisc,
      benchmarkStrengths,
      capabilities: baselineCaps,
    },
  };
}
