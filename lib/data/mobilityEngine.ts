// FIT HUB People Intelligence
// Dynamic Internal Mobility & Talent Matching Engine
// Operationalizing FIT HUB Frontline Capability Scoring & Succession Matching

export interface TargetCapabilityRequirement {
  name: string;
  required_level: number; // 1 to 4
  weight: number; // percentage weight
  description: string;
}

export interface TargetRoleBenchmark {
  role_id: string;
  role_name: string;
  job_level: "Staff" | "Lead / Supervisor" | "Assistant Manager" | "Manager" | "Senior Staff";
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
  strengths: string[];
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
  strengths: string[];
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
  top_strength: string;
  recommended_action: string;
  is_feeder_role: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Location Hierarchy (Consistent with fithub_analysis.ipynb)
// 3-Tier: Region Cluster → Province → City
// Source: PROV_MAP & get_region_cluster from notebook analysis
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

// Helper: Get all cities flattened
export function getAllCities(): string[] {
  const cities: string[] = [];
  Object.values(locationHierarchy).forEach((region) => {
    Object.values(region.provinces).forEach((cityList) => {
      cities.push(...cityList);
    });
  });
  return cities;
}

// Helper: Get Region Cluster for a given city (mirrors get_region_cluster from notebook)
export function getRegionCluster(city: string): string {
  for (const [regionName, region] of Object.entries(locationHierarchy)) {
    for (const cityList of Object.values(region.provinces)) {
      if (cityList.includes(city)) return regionName;
    }
  }
  return "Luar Jawa";
}

// Helper: Get Province for a given city (mirrors PROV_MAP from notebook)
export function getProvince(city: string): string {
  for (const region of Object.values(locationHierarchy)) {
    for (const [prov, cityList] of Object.entries(region.provinces)) {
      if (cityList.includes(city)) return prov;
    }
  }
  return "Other";
}

// Helper: Get provinces for a region
export function getProvincesForRegion(regionName: string): string[] {
  const region = locationHierarchy[regionName];
  return region ? Object.keys(region.provinces) : [];
}

// Helper: Get cities for a region + province combo
export function getCitiesForProvince(regionName: string, provinceName: string): string[] {
  const region = locationHierarchy[regionName];
  if (!region) return [];
  return region.provinces[provinceName] || [];
}

// Target Role Benchmarks (All FIT HUB Roles Except Housekeeping)
export const targetRoleBenchmarks: TargetRoleBenchmark[] = [
  {
    role_id: "role-acm",
    role_name: "Assistant Club Manager",
    job_level: "Assistant Manager",
    job_family: "Club Operations",
    role_purpose: "Oversee daily gym floor shifts, supervise frontline staff, manage POS reconciliations, and ensure member safety standards across high-traffic operating hours.",
    benchmark_tenure_months: 18,
    benchmark_min_rating: 4.2,
    natural_feeder_roles: ["Customer Service", "Front Desk Officer", "Fitness Consultant"],
    open_requisition_codes: ["REQ-BLI-0120", "REQ-SBY-0210", "REQ-BTM-0701", "REQ-JKT-0320"],
    required_capabilities: [
      { name: "Shift Leadership", required_level: 3, weight: 30, description: "Supervise floor roster, resolve staff shortages, and lead daily huddles." },
      { name: "POS Service Excellence", required_level: 3, weight: 25, description: "Handle complex billing disputes, refund authorizations, and audit cash SOPs." },
      { name: "Gym Floor Safety", required_level: 3, weight: 25, description: "Manage emergency medical protocols, AED readiness, and incident logging." },
      { name: "Member Retention", required_level: 2, weight: 20, description: "Track member visit frequency and execute proactive outreach on drop-offs." },
    ],
  },
  {
    role_id: "role-club-gm",
    role_name: "Club Manager",
    job_level: "Manager",
    job_family: "Club Operations",
    role_purpose: "Full P&L and operational accountability for club branch, including local marketing, facilities maintenance, staff retention, and EBITDA margin delivery.",
    benchmark_tenure_months: 24,
    benchmark_min_rating: 4.5,
    natural_feeder_roles: ["Assistant Club Manager", "Fitness Lead", "Sales Lead", "PT Team Leader", "FC Team Leader"],
    open_requisition_codes: ["REQ-BLI-0104", "REQ-BDG-0610"],
    required_capabilities: [
      { name: "Shift Leadership", required_level: 4, weight: 30, description: "Develop club successor bench and foster high-performance club culture." },
      { name: "Member Retention", required_level: 4, weight: 30, description: "Maintain club renewal rate > 75% and minimize monthly member churn." },
      { name: "Member Acquisition", required_level: 3, weight: 20, description: "Oversee regional brand partnerships and commercial targets." },
      { name: "POS Service Excellence", required_level: 3, weight: 20, description: "Manage monthly club P&L, budget compliance, and facilities audits." },
    ],
  },
  {
    role_id: "role-fit-lead",
    role_name: "Fitness Lead",
    job_level: "Lead / Supervisor",
    job_family: "Fitness & Coaching",
    role_purpose: "Direct club trainer team, conduct technical PT auditions, coach junior trainers on client conversion, and maintain studio revenue targets.",
    benchmark_tenure_months: 16,
    benchmark_min_rating: 4.3,
    natural_feeder_roles: ["Personal Trainer", "PT Team Leader"],
    open_requisition_codes: ["REQ-BLI-0109", "REQ-JKS-0401"],
    required_capabilities: [
      { name: "Biomechanics & Coaching", required_level: 4, weight: 35, description: "Advanced corrective movement patterns and VIP training architecture." },
      { name: "PT Revenue Architecture", required_level: 3, weight: 30, description: "Train new coaches on consultative sales and session package renewals." },
      { name: "Gym Floor Safety", required_level: 3, weight: 20, description: "Maintain zero equipment injury rate and audit free-weight zones." },
      { name: "Shift Leadership", required_level: 2, weight: 15, description: "Coordinate PT floor schedules and VIP studio availability." },
    ],
  },
  {
    role_id: "role-pt-lead",
    role_name: "PT Team Leader",
    job_level: "Lead / Supervisor",
    job_family: "Fitness & Coaching",
    role_purpose: "Supervise floor personal trainers, monitor individual trainer revenue pacing, conduct weekly biomechanics reviews, and maintain trainer retention.",
    benchmark_tenure_months: 16,
    benchmark_min_rating: 4.2,
    natural_feeder_roles: ["Personal Trainer"],
    open_requisition_codes: ["REQ-5005", "REQ-5035", "REQ-5069", "REQ-5072", "REQ-5075"],
    required_capabilities: [
      { name: "Biomechanics & Coaching", required_level: 4, weight: 35, description: "Advanced kinesiology coaching, trainer assessment drills, and VIP client escalations." },
      { name: "PT Revenue Architecture", required_level: 3, weight: 30, description: "Drive team monthly package renewal quota and PT floor activation." },
      { name: "Shift Leadership", required_level: 3, weight: 20, description: "Manage trainer shift allocations, attendance, and technical onboarding." },
      { name: "Gym Floor Safety", required_level: 2, weight: 15, description: "Audit equipment cleanliness, pin-loaded machine safety, and incident tracking." },
    ],
  },
  {
    role_id: "role-sales-lead",
    role_name: "Sales Lead",
    job_level: "Lead / Supervisor",
    job_family: "Commercial & Sales",
    role_purpose: "Drive monthly club membership presales and corporate partnerships, train Fitness Consultants on objection handling, and hit club gross revenue quotas.",
    benchmark_tenure_months: 15,
    benchmark_min_rating: 4.1,
    natural_feeder_roles: ["Fitness Consultant", "FC Team Leader"],
    open_requisition_codes: ["REQ-BLI-0115", "REQ-JKB-0305", "REQ-TNG-0504"],
    required_capabilities: [
      { name: "Member Acquisition", required_level: 4, weight: 40, description: "Consistent monthly lead generation and B2B corporate outreach." },
      { name: "Member Retention", required_level: 3, weight: 30, description: "Build automated re-engagement workflows for lapsed memberships." },
      { name: "Shift Leadership", required_level: 2, weight: 20, description: "Lead daily sales call blitzes and track consultant closing ratios." },
      { name: "POS Service Excellence", required_level: 2, weight: 10, description: "Audit member contract agreements and discount authorization gates." },
    ],
  },
  {
    role_id: "role-fc-lead",
    role_name: "FC Team Leader",
    job_level: "Lead / Supervisor",
    job_family: "Commercial & Sales",
    role_purpose: "Coach frontline membership consultants on consultative sales scripts, supervise outreach blitzes, audit POS contract entries, and hit weekly sales quotas.",
    benchmark_tenure_months: 15,
    benchmark_min_rating: 4.1,
    natural_feeder_roles: ["Fitness Consultant", "Customer Service"],
    open_requisition_codes: ["REQ-5028", "REQ-5058", "REQ-5060", "REQ-5074"],
    required_capabilities: [
      { name: "Member Acquisition", required_level: 4, weight: 40, description: "Closing trial walk-ins, leading telephone follow-ups, and corporate lead gen." },
      { name: "Member Retention", required_level: 3, weight: 25, description: "Member onboarding touchpoints and post-purchase member engagement." },
      { name: "Shift Leadership", required_level: 3, weight: 20, description: "Daily sales huddle coaching, consultant activity pacing, and shift coverage." },
      { name: "POS Service Excellence", required_level: 2, weight: 15, description: "Audit member agreements, membership freeze requests, and refund gates." },
    ],
  },
  {
    role_id: "role-cs",
    role_name: "Customer Service",
    job_level: "Staff",
    job_family: "Club Operations",
    role_purpose: "Execute daily club floor operations including front desk check-in, POS transactions, facility cleanliness audits, shift handover protocols, and member complaint resolution.",
    benchmark_tenure_months: 14,
    benchmark_min_rating: 4.0,
    natural_feeder_roles: ["Front Desk Officer", "Customer Service"],
    open_requisition_codes: ["REQ-BLI-0104", "REQ-SBY-0202", "REQ-JKB-0301", "REQ-TNG-0502", "REQ-BDG-0601"],
    required_capabilities: [
      { name: "POS Service Excellence", required_level: 3, weight: 30, description: "Process member check-ins, handle billing inquiries, and audit daily cash reconciliation." },
      { name: "Gym Floor Safety", required_level: 3, weight: 30, description: "Maintain equipment safety standards, incident logging, and emergency protocols." },
      { name: "Shift Leadership", required_level: 2, weight: 25, description: "Coordinate shift handovers, manage front desk roster coverage during peak hours." },
      { name: "Member Retention", required_level: 2, weight: 15, description: "Proactive member greeting, complaint resolution, and visit frequency tracking." },
    ],
  },
  {
    role_id: "role-fdo",
    role_name: "Front Desk Officer",
    job_level: "Staff",
    job_family: "Club Operations",
    role_purpose: "Serve as first point of contact for club members and visitors, manage access turnstiles, process retail POS sales, and maintain front lobby presentation.",
    benchmark_tenure_months: 12,
    benchmark_min_rating: 4.0,
    natural_feeder_roles: ["Customer Service"],
    open_requisition_codes: ["REQ-JKB-0302", "REQ-SBY-0204"],
    required_capabilities: [
      { name: "POS Service Excellence", required_level: 3, weight: 35, description: "Check-in processing, towel service distribution, and retail shake POS entry." },
      { name: "Member Retention", required_level: 3, weight: 30, description: "First-name member greetings, check-in engagement, and handling immediate feedback." },
      { name: "Gym Floor Safety", required_level: 2, weight: 20, description: "Emergency exit clearance, guest log verification, and AED checklist audits." },
      { name: "Shift Leadership", required_level: 1, weight: 15, description: "Punctual front desk opening/closing and cash float handovers." },
    ],
  },
  {
    role_id: "role-pt",
    role_name: "Personal Trainer",
    job_level: "Staff",
    job_family: "Fitness & Coaching",
    role_purpose: "Deliver personalized training sessions, conduct fitness assessments, drive PT package sales through consultative techniques, and maintain client retention through progressive program design.",
    benchmark_tenure_months: 14,
    benchmark_min_rating: 4.1,
    natural_feeder_roles: ["Gym Instructor", "PT Intern", "Group Fitness Instructor"],
    open_requisition_codes: ["REQ-BLI-0109", "REQ-SBY-0218", "REQ-JKS-0405"],
    required_capabilities: [
      { name: "Biomechanics & Coaching", required_level: 3, weight: 35, description: "Design progressive training programs, correct movement patterns, and manage injury prevention." },
      { name: "PT Revenue Architecture", required_level: 3, weight: 30, description: "Consultative session selling, package renewal tactics, and client lifetime value optimization." },
      { name: "Gym Floor Safety", required_level: 2, weight: 20, description: "Equipment safety checks, AED readiness, and free-weight zone supervision." },
      { name: "Member Retention", required_level: 2, weight: 15, description: "Client engagement tracking, session attendance follow-up, and VIP experience delivery." },
    ],
  },
  {
    role_id: "role-fc",
    role_name: "Fitness Consultant",
    job_level: "Staff",
    job_family: "Commercial & Sales",
    role_purpose: "Drive membership acquisition through walk-in conversion, corporate B2B partnerships, presale campaign execution, and consultative needs assessment for prospective members.",
    benchmark_tenure_months: 13,
    benchmark_min_rating: 4.0,
    natural_feeder_roles: ["Customer Service", "Front Desk Officer"],
    open_requisition_codes: ["REQ-BLI-0115", "REQ-JKB-0312", "REQ-SBY-0224"],
    required_capabilities: [
      { name: "Member Acquisition", required_level: 3, weight: 40, description: "Lead generation, walk-in conversion, corporate outreach, and presale target achievement." },
      { name: "Member Retention", required_level: 2, weight: 25, description: "Post-signup onboarding experience and lapsed member re-engagement." },
      { name: "POS Service Excellence", required_level: 2, weight: 20, description: "Contract processing, promotional package setup, and refund authorization." },
      { name: "Shift Leadership", required_level: 2, weight: 15, description: "Coordinate daily sales blitz schedules and track team closing ratios." },
    ],
  },
  {
    role_id: "role-cs",
    role_name: "Customer Service",
    job_level: "Staff",
    job_family: "Commercial & Sales",
    role_purpose: "Deliver omni-channel member support (WhatsApp, Zendesk, in-club), resolve membership freezes/cancellations, and gather member satisfaction voice feedback.",
    benchmark_tenure_months: 12,
    benchmark_min_rating: 4.0,
    natural_feeder_roles: ["Front Desk Officer"],
    open_requisition_codes: ["REQ-CORP-0101", "REQ-JKT-0402"],
    required_capabilities: [
      { name: "Member Retention", required_level: 3, weight: 35, description: "De-escalate unhappy members, handle contract freezes, and minimize churn risk." },
      { name: "POS Service Excellence", required_level: 3, weight: 30, description: "Process billing dispute adjustments, refund approvals, and receipt audits." },
      { name: "Member Acquisition", required_level: 2, weight: 20, description: "Convert incoming customer inquiries into trial passes and club tours." },
      { name: "Shift Leadership", required_level: 1, weight: 15, description: "Coordinate ticket response SLAs and hand over open issues across shifts." },
    ],
  },
];

// Top Benchmark Performers Roster (3+ performers per role across FIT HUB branches)
export const benchmarkEmployeesPool: BenchmarkEmployeeProfile[] = [
  // --- 1. Assistant Club Manager ---
  {
    employee_id: "EMP-1015",
    employee_code: "FH-EMP-1015",
    fullname: "Rangga Pratama",
    role: "Assistant Club Manager",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 22,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Achiever", "Command", "Responsibility", "Arranger", "Strategic"],
    capabilities: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 2,
    },
    papi: { P: 8.0, S: 5.6, G: 7.9, T: 7.6, W: 5.8 },
  },
  {
    employee_id: "EMP-1018",
    employee_code: "FH-EMP-1018",
    fullname: "Siti Nurhaliza",
    role: "Assistant Club Manager",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.70,
    tenure_months: 20,
    mbti: "ENTJ",
    disc: "DC",
    strengths: ["Responsibility", "Command", "Focus", "Discipline", "Achiever"],
    capabilities: {
      "Shift Leadership": 3,
      "POS Service Excellence": 4,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    papi: { P: 7.8, S: 5.5, G: 7.7, T: 7.4, W: 6.0 },
  },
  {
    employee_id: "EMP-1022",
    employee_code: "FH-EMP-1022",
    fullname: "Budi Santoso",
    role: "Assistant Club Manager",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.65,
    tenure_months: 24,
    mbti: "ESTJ",
    disc: "ID",
    strengths: ["Achiever", "Arranger", "Responsibility", "Relator", "Strategic"],
    capabilities: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 2,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 2,
    },
    papi: { P: 7.9, S: 6.0, G: 7.8, T: 7.2, W: 6.2 },
  },

  // --- 2. Club Manager ---
  {
    employee_id: "EMP-1003",
    employee_code: "FH-EMP-1003",
    fullname: "Wahyu Hidayat",
    role: "Club Manager",
    club_name: "FIT HUB Kelapa Gading",
    cluster_location: "Jakarta Utara",
    performance_rating: 4.7,
    tenure_months: 28,
    mbti: "ESTJ",
    disc: "DI",
    strengths: ["Achiever", "Command", "Responsibility", "Maximizer", "Strategic"],
    capabilities: {
      "Shift Leadership": 4,
      "POS Service Excellence": 4,
      "Gym Floor Safety": 4,
      "Member Retention": 4,
      "Member Acquisition": 3,
      "Biomechanics & Coaching": 2,
    },
    papi: { P: 8.2, S: 5.5, G: 8.0, T: 7.8, W: 6.0 },
  },
  {
    employee_id: "EMP-1005",
    employee_code: "FH-EMP-1005",
    fullname: "Hadi Wibowo",
    role: "Club Manager",
    club_name: "FIT HUB BSD City",
    cluster_location: "Tangerang",
    performance_rating: 4.7,
    tenure_months: 26,
    mbti: "ENTJ",
    disc: "DC",
    strengths: ["Achiever", "Command", "Responsibility", "Focus", "Discipline"],
    capabilities: {
      "Shift Leadership": 4,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 4,
      "Member Retention": 4,
      "Member Acquisition": 4,
      "Biomechanics & Coaching": 3,
    },
    papi: { P: 8.5, S: 5.2, G: 7.9, T: 7.5, W: 5.8 },
  },
  {
    employee_id: "EMP-1002",
    employee_code: "FH-EMP-1002",
    fullname: "Putri Santoso",
    role: "Club Manager",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.5,
    tenure_months: 24,
    mbti: "ESTJ",
    disc: "ID",
    strengths: ["Achiever", "Arranger", "Responsibility", "Relator", "Strategic"],
    capabilities: {
      "Shift Leadership": 3,
      "POS Service Excellence": 4,
      "Gym Floor Safety": 3,
      "Member Retention": 4,
      "Member Acquisition": 3,
      "Biomechanics & Coaching": 2,
    },
    papi: { P: 7.8, S: 6.2, G: 7.6, T: 7.0, W: 6.4 },
  },
  {
    employee_id: "EMP-1011",
    employee_code: "FH-EMP-1011",
    fullname: "Putri Hidayat",
    role: "Club Manager",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.6,
    tenure_months: 22,
    mbti: "ENTJ",
    disc: "DI",
    strengths: ["Achiever", "Command", "Relator", "Strategic", "Responsibility"],
    capabilities: {
      "Shift Leadership": 4,
      "POS Service Excellence": 4,
      "Gym Floor Safety": 3,
      "Member Retention": 4,
      "Member Acquisition": 4,
      "Biomechanics & Coaching": 2,
    },
    papi: { P: 8.0, S: 5.8, G: 7.8, T: 7.4, W: 5.5 },
  },

  // --- 3. Fitness Lead ---
  {
    employee_id: "EMP-1061",
    employee_code: "FH-EMP-1061",
    fullname: "Aditya Santoso",
    role: "Fitness Lead",
    club_name: "FIT HUB Senopati",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.8,
    tenure_months: 21,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Command", "Developer", "Focus", "Achiever", "Competition"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 4,
      "Gym Floor Safety": 4,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    papi: { P: 8.0, S: 6.0, G: 8.1, T: 7.6, W: 5.2 },
  },
  {
    employee_id: "EMP-1063",
    employee_code: "FH-EMP-1063",
    fullname: "Reza Mahendra",
    role: "Fitness Lead",
    club_name: "FIT HUB Kelapa Gading",
    cluster_location: "Jakarta Utara",
    performance_rating: 4.7,
    tenure_months: 22,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Focus", "Developer", "Achiever", "Command", "Competition"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 4,
      "Gym Floor Safety": 3,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    papi: { P: 7.8, S: 5.9, G: 7.9, T: 7.5, W: 5.4 },
  },
  {
    employee_id: "EMP-1065",
    employee_code: "FH-EMP-1065",
    fullname: "Bima Setiawan",
    role: "Fitness Lead",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.6,
    tenure_months: 19,
    mbti: "ENTJ",
    disc: "ID",
    strengths: ["Developer", "Relator", "Command", "Achiever", "Focus"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 4,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    papi: { P: 7.7, S: 6.4, G: 7.5, T: 7.2, W: 5.5 },
  },

  // --- 4. PT Team Leader ---
  {
    employee_id: "EMP-1067",
    employee_code: "FH-EMP-1067",
    fullname: "Faris Pratama",
    role: "PT Team Leader",
    club_name: "FIT HUB Senopati",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.75,
    tenure_months: 23,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Command", "Developer", "Focus", "Competition", "Achiever"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 4,
      "Shift Leadership": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
    },
    papi: { P: 8.1, S: 5.8, G: 8.0, T: 7.5, W: 5.1 },
  },
  {
    employee_id: "EMP-1068",
    employee_code: "FH-EMP-1068",
    fullname: "Gede Arya",
    role: "PT Team Leader",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.70,
    tenure_months: 21,
    mbti: "ENTJ",
    disc: "DI",
    strengths: ["Developer", "Command", "Relator", "Achiever", "Focus"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Shift Leadership": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
    },
    papi: { P: 7.9, S: 6.2, G: 7.8, T: 7.3, W: 5.3 },
  },
  {
    employee_id: "EMP-1069",
    employee_code: "FH-EMP-1069",
    fullname: "Danang Kusuma",
    role: "PT Team Leader",
    club_name: "FIT HUB Gubeng",
    cluster_location: "Surabaya",
    performance_rating: 4.65,
    tenure_months: 20,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Developer", "Relator", "Focus", "Competition", "Positivity"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Shift Leadership": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
    },
    papi: { P: 7.5, S: 6.5, G: 7.6, T: 7.1, W: 5.5 },
  },

  // --- 5. Sales Lead ---
  {
    employee_id: "EMP-1041",
    employee_code: "FH-EMP-1041",
    fullname: "Wahyu Putra",
    role: "Sales Lead",
    club_name: "FIT HUB Kelapa Gading",
    cluster_location: "Jakarta Utara",
    performance_rating: 4.8,
    tenure_months: 20,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Competition", "Woo", "Communication", "Command", "Relator"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 4,
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
    },
    papi: { P: 7.5, S: 7.1, G: 8.2, T: 8.0, W: 5.0 },
  },
  {
    employee_id: "EMP-1043",
    employee_code: "FH-EMP-1043",
    fullname: "Jessica Wijaya",
    role: "Sales Lead",
    club_name: "FIT HUB Senopati",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.75,
    tenure_months: 22,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Competition", "Strategic", "Maximizer"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
    },
    papi: { P: 7.7, S: 7.3, G: 8.0, T: 7.8, W: 5.1 },
  },
  {
    employee_id: "EMP-1045",
    employee_code: "FH-EMP-1045",
    fullname: "Arif Budiman",
    role: "Sales Lead",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.65,
    tenure_months: 19,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Woo", "Competition", "Communication", "Relator", "Achiever"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
    },
    papi: { P: 7.3, S: 7.0, G: 7.8, T: 7.5, W: 5.2 },
  },

  // --- 6. FC Team Leader ---
  {
    employee_id: "EMP-1047",
    employee_code: "FH-EMP-1047",
    fullname: "Maya Safitri",
    role: "FC Team Leader",
    club_name: "FIT HUB Puri Indah",
    cluster_location: "Jakarta Barat",
    performance_rating: 4.75,
    tenure_months: 21,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
    },
    papi: { P: 7.6, S: 7.5, G: 8.1, T: 7.7, W: 5.0 },
  },
  {
    employee_id: "EMP-1048",
    employee_code: "FH-EMP-1048",
    fullname: "Bagus Priyanto",
    role: "FC Team Leader",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.70,
    tenure_months: 20,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Woo", "Communication", "Relator", "Competition", "Activator"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 3,
      "POS Service Excellence": 2,
    },
    papi: { P: 7.2, S: 7.2, G: 7.7, T: 7.3, W: 5.2 },
  },
  {
    employee_id: "EMP-1049",
    employee_code: "FH-EMP-1049",
    fullname: "Nita Anggraini",
    role: "FC Team Leader",
    club_name: "FIT HUB Dago Bandung",
    cluster_location: "Bandung",
    performance_rating: 4.65,
    tenure_months: 19,
    mbti: "ENFP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Positivity", "Relator", "Competition"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 3,
      "POS Service Excellence": 2,
    },
    papi: { P: 7.0, S: 7.1, G: 7.5, T: 7.0, W: 5.1 },
  },

  // --- 7. Customer Service ---
  {
    employee_id: "EMP-1081",
    employee_code: "FH-EMP-1081",
    fullname: "Andi Saputra",
    role: "Customer Service",
    club_name: "FIT HUB Senopati",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.7,
    tenure_months: 20,
    mbti: "ESTJ",
    disc: "DC",
    strengths: ["Responsibility", "Discipline", "Achiever", "Arranger", "Focus"],
    capabilities: {
      "POS Service Excellence": 3,
      "Gym Floor Safety": 4,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    papi: { P: 7.8, S: 5.4, G: 8.0, T: 7.5, W: 6.2 },
  },
  {
    employee_id: "EMP-1083",
    employee_code: "FH-EMP-1083",
    fullname: "Rina Kusuma",
    role: "Customer Service",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.6,
    tenure_months: 22,
    mbti: "ISFJ",
    disc: "SC",
    strengths: ["Discipline", "Arranger", "Responsibility", "Relator", "Restorative"],
    capabilities: {
      "POS Service Excellence": 4,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 3,
      "Member Acquisition": 1,
      "Biomechanics & Coaching": 1,
    },
    papi: { P: 7.4, S: 5.8, G: 7.8, T: 7.2, W: 6.4 },
  },
  {
    employee_id: "EMP-1085",
    employee_code: "FH-EMP-1085",
    fullname: "Made Dharma",
    role: "Customer Service",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.5,
    tenure_months: 18,
    mbti: "ESFJ",
    disc: "IS",
    strengths: ["Responsibility", "Arranger", "Relator", "Discipline", "Achiever"],
    capabilities: {
      "POS Service Excellence": 3,
      "Gym Floor Safety": 4,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    papi: { P: 7.2, S: 6.0, G: 7.6, T: 7.0, W: 6.0 },
  },

  // --- 8. Front Desk Officer ---
  {
    employee_id: "EMP-1111",
    employee_code: "FH-EMP-1111",
    fullname: "Dewi Lestari",
    role: "Front Desk Officer",
    club_name: "FIT HUB Canggu",
    cluster_location: "Bali",
    performance_rating: 4.75,
    tenure_months: 19,
    mbti: "ESFJ",
    disc: "IS",
    strengths: ["Positivity", "Communication", "Responsibility", "Arranger", "Relator"],
    capabilities: {
      "POS Service Excellence": 3,
      "Member Retention": 3,
      "Gym Floor Safety": 2,
      "Shift Leadership": 2,
    },
    papi: { P: 7.1, S: 6.8, G: 7.4, T: 7.0, W: 5.8 },
  },
  {
    employee_id: "EMP-1113",
    employee_code: "FH-EMP-1113",
    fullname: "Agung Pratama",
    role: "Front Desk Officer",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.70,
    tenure_months: 20,
    mbti: "ISFJ",
    disc: "SC",
    strengths: ["Discipline", "Responsibility", "Arranger", "Relator", "Focus"],
    capabilities: {
      "POS Service Excellence": 3,
      "Member Retention": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
    },
    papi: { P: 7.3, S: 6.0, G: 7.7, T: 7.2, W: 6.1 },
  },
  {
    employee_id: "EMP-1115",
    employee_code: "FH-EMP-1115",
    fullname: "Citra Kirana",
    role: "Front Desk Officer",
    club_name: "FIT HUB Merr Surabaya",
    cluster_location: "Surabaya",
    performance_rating: 4.65,
    tenure_months: 18,
    mbti: "ESFP",
    disc: "IS",
    strengths: ["Woo", "Communication", "Positivity", "Relator", "Includer"],
    capabilities: {
      "POS Service Excellence": 3,
      "Member Retention": 3,
      "Gym Floor Safety": 2,
      "Shift Leadership": 1,
    },
    papi: { P: 6.9, S: 7.2, G: 7.3, T: 6.9, W: 5.5 },
  },

  // --- 9. Personal Trainer ---
  {
    employee_id: "EMP-1091",
    employee_code: "FH-EMP-1091",
    fullname: "Gilang Ramadhan",
    role: "Personal Trainer",
    club_name: "FIT HUB Kuningan",
    cluster_location: "Jakarta Selatan",
    performance_rating: 4.8,
    tenure_months: 24,
    mbti: "ESTP",
    disc: "DI",
    strengths: ["Command", "Developer", "Focus", "Achiever", "Competition"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 4,
      "Gym Floor Safety": 4,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "Member Acquisition": 2,
    },
    papi: { P: 8.2, S: 6.0, G: 8.4, T: 7.8, W: 5.0 },
  },
  {
    employee_id: "EMP-1093",
    employee_code: "FH-EMP-1093",
    fullname: "Wayan Krisna",
    role: "Personal Trainer",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.7,
    tenure_months: 21,
    mbti: "ENTJ",
    disc: "DI",
    strengths: ["Developer", "Command", "Focus", "Relator", "Achiever"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 4,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    papi: { P: 7.9, S: 6.2, G: 8.0, T: 7.5, W: 5.2 },
  },
  {
    employee_id: "EMP-1095",
    employee_code: "FH-EMP-1095",
    fullname: "Rizal Firmansyah",
    role: "Personal Trainer",
    club_name: "FIT HUB Gubeng",
    cluster_location: "Surabaya",
    performance_rating: 4.6,
    tenure_months: 19,
    mbti: "ESTP",
    disc: "IS",
    strengths: ["Developer", "Relator", "Competition", "Focus", "Positivity"],
    capabilities: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    papi: { P: 7.4, S: 6.5, G: 7.7, T: 7.2, W: 5.4 },
  },

  // --- 10. Fitness Consultant ---
  {
    employee_id: "EMP-1101",
    employee_code: "FH-EMP-1101",
    fullname: "Maya Anggraini",
    role: "Fitness Consultant",
    club_name: "FIT HUB Puri Indah",
    cluster_location: "Jakarta Barat",
    performance_rating: 4.7,
    tenure_months: 20,
    mbti: "ENTP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 4,
      "POS Service Excellence": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
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
    performance_rating: 4.6,
    tenure_months: 18,
    mbti: "ENFP",
    disc: "IS",
    strengths: ["Woo", "Communication", "Relator", "Competition", "Activator"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "POS Service Excellence": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 1,
      "Biomechanics & Coaching": 1,
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
    performance_rating: 4.5,
    tenure_months: 16,
    mbti: "ENFP",
    disc: "ID",
    strengths: ["Communication", "Woo", "Positivity", "Relator", "Competition"],
    capabilities: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "POS Service Excellence": 2,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    papi: { P: 6.8, S: 7.0, G: 7.4, T: 6.9, W: 5.0 },
  },

  // --- 11. Customer Service ---
  {
    employee_id: "EMP-1121",
    employee_code: "FH-EMP-1121",
    fullname: "Sarah Oktaviani",
    role: "Customer Service",
    club_name: "FIT HUB Kelapa Gading",
    cluster_location: "Jakarta Utara",
    performance_rating: 4.80,
    tenure_months: 20,
    mbti: "ENFP",
    disc: "IS",
    strengths: ["Empathy", "Communication", "Relator", "Positivity", "Restorative"],
    capabilities: {
      "Member Retention": 4,
      "POS Service Excellence": 3,
      "Member Acquisition": 2,
      "Shift Leadership": 2,
    },
    papi: { P: 7.2, S: 7.6, G: 7.8, T: 7.4, W: 5.2 },
  },
  {
    employee_id: "EMP-1123",
    employee_code: "FH-EMP-1123",
    fullname: "Kevin Sanjaya",
    role: "Customer Service",
    club_name: "FIT HUB BSD City",
    cluster_location: "Tangerang",
    performance_rating: 4.65,
    tenure_months: 18,
    mbti: "ESFJ",
    disc: "ID",
    strengths: ["Communication", "Woo", "Arranger", "Positivity", "Relator"],
    capabilities: {
      "Member Retention": 3,
      "POS Service Excellence": 3,
      "Member Acquisition": 2,
      "Shift Leadership": 1,
    },
    papi: { P: 7.0, S: 7.1, G: 7.4, T: 7.0, W: 5.5 },
  },
  {
    employee_id: "EMP-1125",
    employee_code: "FH-EMP-1125",
    fullname: "Larasati Putri",
    role: "Customer Service",
    club_name: "FIT HUB Sunset Road",
    cluster_location: "Bali",
    performance_rating: 4.70,
    tenure_months: 21,
    mbti: "ENFP",
    disc: "IS",
    strengths: ["Empathy", "Relator", "Communication", "Individualization", "Positivity"],
    capabilities: {
      "Member Retention": 4,
      "POS Service Excellence": 3,
      "Member Acquisition": 2,
      "Shift Leadership": 1,
    },
    papi: { P: 6.9, S: 7.4, G: 7.6, T: 7.2, W: 5.3 },
  },
];

// Active Employee Pool (32 Frontline Candidates with diverse ratings up to 4.92)
export const activeEmployeePool: ActiveEmployeeCandidate[] = [
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
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 7.8, S: 5.9, G: 7.9, T: 7.5, W: 5.8 },
    strengths: ["Achiever", "Arranger", "Responsibility", "Relator", "Discipline"],
    top_strength: "Shift Incident De-escalation & POS Reconciliation",
    development_priority: "Complete level 3 floor manager safety audit",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Selatan", "Batam"],
  },
  {
    employee_id: "emp-1108",
    employee_code: "FH-EMP-1108",
    fullname: "Rizky Firmansyah",
    current_role: "Customer Service",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road Bali",
    tenure_months: 19,
    performance_rating: 4.80,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 2,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESTJ",
    disc: "DC",
    papi: { P: 7.6, S: 5.5, G: 7.8, T: 7.2, W: 6.0 },
    strengths: ["Achiever", "Command", "Responsibility", "Focus", "Discipline"],
    top_strength: "Club Opening/Closing SOP Compliance (99.2% Audit)",
    development_priority: "Lead quarterly member retention outreach cohort",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Batam", "Surabaya"],
  },
  {
    employee_id: "emp-1144",
    employee_code: "FH-EMP-1144",
    fullname: "Siti Rahmawati",
    current_role: "Fitness Consultant",
    current_location: "Bali",
    current_club: "FIT HUB Canggu Bali",
    tenure_months: 20,
    performance_rating: 4.80,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "POS Service Excellence": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENTP",
    disc: "ID",
    papi: { P: 7.2, S: 7.0, G: 7.8, T: 7.5, W: 5.2 },
    strengths: ["Communication", "Woo", "Competition", "Activator", "Relator"],
    top_strength: "Corporate B2B Fitness Partnerships (Rp 85M New ACV)",
    development_priority: "Gym safety first-aid & CPR level 2 certification",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Batam"],
  },
  {
    employee_id: "emp-1180",
    employee_code: "FH-EMP-1180",
    fullname: "Bagus Setiawan",
    current_role: "Personal Trainer",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road Bali",
    tenure_months: 18,
    performance_rating: 4.80,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "Member Acquisition": 2,
    },
    mbti: "ESTP",
    disc: "DI",
    papi: { P: 7.4, S: 6.2, G: 7.6, T: 7.2, W: 5.4 },
    strengths: ["Developer", "Relator", "Individualization", "Positivity", "Achiever"],
    top_strength: "VIP Client PT Renewal Rate (88% Retention)",
    development_priority: "Floor operations roster and shift coverage training",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Denpasar", "Batam"],
  },
  {
    employee_id: "emp-1215",
    employee_code: "FH-EMP-1215",
    fullname: "Agus Santoso",
    current_role: "Customer Service",
    current_location: "Jakarta Barat",
    current_club: "FIT HUB Puri Indah",
    tenure_months: 24,
    performance_rating: 4.90,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 7.7, S: 5.8, G: 8.0, T: 7.6, W: 6.2 },
    strengths: ["Achiever", "Arranger", "Responsibility", "Discipline", "Strategic"],
    top_strength: "Multi-Club Staff Relief Coordination & Audit Readiness",
    development_priority: "Execute regional membership campaign simulation",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Barat", "Tangerang", "Batam"],
  },
  {
    employee_id: "emp-1250",
    employee_code: "FH-EMP-1250",
    fullname: "Nadia Putri",
    current_role: "Fitness Consultant",
    current_location: "Jakarta Selatan",
    current_club: "FIT HUB Kuningan",
    tenure_months: 17,
    performance_rating: 4.75,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "POS Service Excellence": 2,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENFP",
    disc: "ID",
    papi: { P: 6.8, S: 7.4, G: 7.2, T: 7.0, W: 5.0 },
    strengths: ["Communication", "Woo", "Competition", "Activator", "Maximizer"],
    top_strength: "Club Walk-In Trial Conversion (48% vs 32% Target)",
    development_priority: "Complete POS refund and chargeback compliance module",
    willing_to_relocate: true,
    preferred_locations: ["Jakarta Selatan", "Bali", "Batam"],
  },
  {
    employee_id: "emp-1288",
    employee_code: "FH-EMP-1288",
    fullname: "Fajar Nugraha",
    current_role: "Personal Trainer",
    current_location: "Surabaya",
    current_club: "FIT HUB Gubeng",
    tenure_months: 20,
    performance_rating: 4.82,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 4,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "Member Acquisition": 2,
    },
    mbti: "ESTP",
    disc: "IS",
    papi: { P: 6.9, S: 6.5, G: 7.2, T: 7.0, W: 5.1 },
    strengths: ["Developer", "Relator", "Competition", "Focus", "Achiever"],
    top_strength: "Technical Kinesiology & Small-Group Training",
    development_priority: "Equipment maintenance protocols and AED emergency drill",
    willing_to_relocate: true,
    preferred_locations: ["Surabaya", "Bali", "Denpasar"],
  },
  {
    employee_id: "emp-1320",
    employee_code: "FH-EMP-1320",
    fullname: "Anisa Lestari",
    current_role: "Fitness Consultant",
    current_location: "Surabaya",
    current_club: "FIT HUB Merr Surabaya",
    tenure_months: 18,
    performance_rating: 4.80,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "POS Service Excellence": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENFP",
    disc: "IS",
    papi: { P: 6.6, S: 7.2, G: 7.3, T: 6.9, W: 5.3 },
    strengths: ["Communication", "Woo", "Competition", "Relator", "Positivity"],
    top_strength: "Consistent Monthly Target Overachievement (120% Quota)",
    development_priority: "Regional new-club presale management assignment",
    willing_to_relocate: true,
    preferred_locations: ["Surabaya", "Bali", "Bandung", "Batam"],
  },
  {
    employee_id: "emp-1355",
    employee_code: "FH-EMP-1355",
    fullname: "Eko Prasetyo",
    current_role: "Customer Service",
    current_location: "Bali",
    current_club: "FIT HUB Canggu Bali",
    tenure_months: 18,
    performance_rating: 4.80,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ISFJ",
    disc: "SC",
    papi: { P: 6.8, S: 6.0, G: 7.5, T: 6.8, W: 6.5 },
    strengths: ["Discipline", "Responsibility", "Arranger", "Relator", "Restorative"],
    top_strength: "High-Traffic Check-In Management & Staff Motivation",
    development_priority: "POS refund authorization audit procedures",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Batam", "Surabaya"],
  },
  {
    employee_id: "emp-1390",
    employee_code: "FH-EMP-1390",
    fullname: "Yuliana Dewi",
    current_role: "Fitness Consultant",
    current_location: "Surabaya",
    current_club: "FIT HUB Gubeng",
    tenure_months: 15,
    performance_rating: 4.60,
    capability_scores: {
      "Member Acquisition": 3,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 1,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESFP",
    disc: "IS",
    papi: { P: 6.4, S: 7.0, G: 6.8, T: 6.6, W: 5.2 },
    strengths: ["Communication", "Woo", "Relator", "Individualization", "Positivity"],
    top_strength: "Member Consultative Needs Assessment",
    development_priority: "B2B partnership pitching simulation",
    willing_to_relocate: true,
    preferred_locations: ["Surabaya", "Bali"],
  },
  {
    employee_id: "emp-1422",
    employee_code: "FH-EMP-1422",
    fullname: "Bayu Wicaksono",
    current_role: "Personal Trainer",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road Bali",
    tenure_months: 16,
    performance_rating: 4.65,
    capability_scores: {
      "Biomechanics & Coaching": 3,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 2,
      "Member Acquisition": 2,
    },
    mbti: "ESTP",
    disc: "DI",
    papi: { P: 7.0, S: 6.2, G: 7.4, T: 7.1, W: 5.5 },
    strengths: ["Developer", "Relator", "Command", "Achiever", "Focus"],
    top_strength: "Client Injury Prevention & VIP Onboarding",
    development_priority: "Lead trainer mentoring and conversion workshops",
    willing_to_relocate: false,
    preferred_locations: ["Bali"],
  },
  {
    employee_id: "emp-1456",
    employee_code: "FH-EMP-1456",
    fullname: "Taufik Hidayat",
    current_role: "Customer Service",
    current_location: "Jakarta Selatan",
    current_club: "FIT HUB Senopati",
    tenure_months: 21,
    performance_rating: 4.85,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 7.6, S: 5.7, G: 7.9, T: 7.4, W: 6.0 },
    strengths: ["Achiever", "Command", "Responsibility", "Arranger", "Discipline"],
    top_strength: "Flagship Club Roster Coordination & Incident Resolution",
    development_priority: "Complete executive leadership development module",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Selatan", "Batam"],
  },
  {
    employee_id: "emp-1488",
    employee_code: "FH-EMP-1488",
    fullname: "Dewi Puspita",
    current_role: "Personal Trainer",
    current_location: "Bandung",
    current_club: "FIT HUB Dago Bandung",
    tenure_months: 18,
    performance_rating: 4.70,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    mbti: "ISFP",
    disc: "SI",
    papi: { P: 6.8, S: 6.6, G: 7.3, T: 6.9, W: 5.4 },
    strengths: ["Developer", "Relator", "Individualization", "Positivity", "Empathy"],
    top_strength: "Female Member Strength Conditioning Programs",
    development_priority: "Trainer floor audit and safety standards refresh",
    willing_to_relocate: true,
    preferred_locations: ["Bandung", "Jakarta Barat", "Surabaya"],
  },
  {
    employee_id: "emp-1510",
    employee_code: "FH-EMP-1510",
    fullname: "Ahmad Fauzi",
    current_role: "Fitness Consultant",
    current_location: "Jakarta Barat",
    current_club: "FIT HUB Puri Indah",
    tenure_months: 18,
    performance_rating: 4.80,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENTP",
    disc: "ID",
    papi: { P: 7.1, S: 6.8, G: 7.4, T: 7.2, W: 5.0 },
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    top_strength: "Digital Lead Inflow Closing Speed",
    development_priority: "Member onboarding touchpoint consistency",
    willing_to_relocate: true,
    preferred_locations: ["Jakarta Barat", "Tangerang", "Batam"],
  },
  {
    employee_id: "emp-1544",
    employee_code: "FH-EMP-1544",
    fullname: "Rina Marlina",
    current_role: "Customer Service",
    current_location: "Bandung",
    current_club: "FIT HUB Dago Bandung",
    tenure_months: 15,
    performance_rating: 4.55,
    capability_scores: {
      "Shift Leadership": 2,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
      "Member Retention": 2,
      "Member Acquisition": 1,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ISFJ",
    disc: "SC",
    papi: { P: 6.2, S: 6.1, G: 7.0, T: 6.5, W: 6.6 },
    strengths: ["Discipline", "Responsibility", "Arranger", "Relator", "Restorative"],
    top_strength: "Front Desk Cashier & Audit Compliance",
    development_priority: "Cross-shift escalation and staff dispute handling",
    willing_to_relocate: true,
    preferred_locations: ["Bandung", "Jakarta Barat"],
  },
  {
    employee_id: "emp-1580",
    employee_code: "FH-EMP-1580",
    fullname: "Hendrik Gunawan",
    current_role: "Personal Trainer",
    current_location: "Tangerang",
    current_club: "FIT HUB BSD City",
    tenure_months: 20,
    performance_rating: 4.75,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    mbti: "ESTP",
    disc: "DI",
    papi: { P: 7.3, S: 6.0, G: 7.5, T: 7.0, W: 5.5 },
    strengths: ["Command", "Developer", "Focus", "Competition", "Achiever"],
    top_strength: "Strength & Conditioning Client Periodization",
    development_priority: "Floor equipment audit check-sheet leadership",
    willing_to_relocate: true,
    preferred_locations: ["Tangerang", "Jakarta Barat", "Batam"],
  },
  // --- Additional Batam & Regional Top Performers (4.8+) ---
  {
    employee_id: "emp-1601",
    employee_code: "FH-EMP-1601",
    fullname: "Hendra Kurniawan",
    current_role: "Customer Service",
    current_location: "Batam",
    current_club: "FIT HUB Grand Batam",
    tenure_months: 20,
    performance_rating: 4.85,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 7.8, S: 5.7, G: 8.0, T: 7.5, W: 6.0 },
    strengths: ["Achiever", "Command", "Responsibility", "Arranger", "Discipline"],
    top_strength: "Cross-Border Island Member SOP & Emergency Protocol Leadership",
    development_priority: "Club EBITDA and revenue forecast certification",
    willing_to_relocate: true,
    preferred_locations: ["Batam", "Bali", "Jakarta Barat"],
  },
  {
    employee_id: "emp-1602",
    employee_code: "FH-EMP-1602",
    fullname: "Maya Indah Permata",
    current_role: "Front Desk Officer",
    current_location: "Batam",
    current_club: "FIT HUB Grand Batam",
    tenure_months: 18,
    performance_rating: 4.85,
    capability_scores: {
      "POS Service Excellence": 3,
      "Member Retention": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESFJ",
    disc: "IS",
    papi: { P: 7.4, S: 7.0, G: 7.8, T: 7.3, W: 5.8 },
    strengths: ["Positivity", "Communication", "Responsibility", "Arranger", "Relator"],
    top_strength: "High-Volume Member Check-In & Service De-escalation",
    development_priority: "Assistant Manager shift roster scheduling simulation",
    willing_to_relocate: true,
    preferred_locations: ["Batam", "Bali", "Jakarta Selatan"],
  },
  {
    employee_id: "emp-1603",
    employee_code: "FH-EMP-1603",
    fullname: "Arif Rahman",
    current_role: "Fitness Consultant",
    current_location: "Batam",
    current_club: "FIT HUB Grand Batam",
    tenure_months: 16,
    performance_rating: 4.80,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "POS Service Excellence": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENTP",
    disc: "ID",
    papi: { P: 7.3, S: 7.2, G: 7.6, T: 7.4, W: 5.1 },
    strengths: ["Communication", "Woo", "Competition", "Activator", "Strategic"],
    top_strength: "Regional Corporate Membership Sign-ups (Rp 90M Target Beat)",
    development_priority: "Club management budget compliance training",
    willing_to_relocate: true,
    preferred_locations: ["Batam", "Bali", "Surabaya"],
  },
  {
    employee_id: "emp-1604",
    employee_code: "FH-EMP-1604",
    fullname: "Gede Krisna Wijaya",
    current_role: "Front Desk Officer",
    current_location: "Bali",
    current_club: "FIT HUB Sunset Road Bali",
    tenure_months: 19,
    performance_rating: 4.82,
    capability_scores: {
      "POS Service Excellence": 3,
      "Member Retention": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ISFJ",
    disc: "SC",
    papi: { P: 7.5, S: 6.5, G: 7.9, T: 7.4, W: 6.2 },
    strengths: ["Discipline", "Responsibility", "Arranger", "Relator", "Focus"],
    top_strength: "VIP Guest Welcoming & Cash float audit 100% accurate",
    development_priority: "Complete shift manager conflict resolution module",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Batam", "Surabaya"],
  },
  {
    employee_id: "emp-1605",
    employee_code: "FH-EMP-1605",
    fullname: "Sarah Anggraini",
    current_role: "Customer Service",
    current_location: "Jakarta Utara",
    current_club: "FIT HUB Kelapa Gading",
    tenure_months: 21,
    performance_rating: 4.85,
    capability_scores: {
      "Member Retention": 4,
      "POS Service Excellence": 3,
      "Member Acquisition": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENFP",
    disc: "IS",
    papi: { P: 7.2, S: 7.6, G: 7.8, T: 7.4, W: 5.2 },
    strengths: ["Empathy", "Communication", "Relator", "Positivity", "Restorative"],
    top_strength: "Omnichannel Member Escalation Resolution (CSAT 96%)",
    development_priority: "Club floor emergency and incident logging drill",
    willing_to_relocate: true,
    preferred_locations: ["Jakarta Utara", "Bali", "Batam"],
  },
  {
    employee_id: "emp-1606",
    employee_code: "FH-EMP-1606",
    fullname: "Wahyu Setiawan",
    current_role: "Customer Service",
    current_location: "Semarang",
    current_club: "FIT HUB Pemuda Semarang",
    tenure_months: 20,
    performance_rating: 4.80,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ESTJ",
    disc: "DI",
    papi: { P: 7.7, S: 5.8, G: 7.9, T: 7.5, W: 5.9 },
    strengths: ["Achiever", "Arranger", "Responsibility", "Discipline", "Focus"],
    top_strength: "Multi-shift coverage coordination and member SOP audit",
    development_priority: "Club P&L and financial accounting review",
    willing_to_relocate: true,
    preferred_locations: ["Semarang", "Surabaya", "Bali", "Batam"],
  },
  {
    employee_id: "emp-1607",
    employee_code: "FH-EMP-1607",
    fullname: "Chandra Pratama",
    current_role: "Personal Trainer",
    current_location: "Medan",
    current_club: "FIT HUB Centre Point Medan",
    tenure_months: 22,
    performance_rating: 4.88,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 4,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Shift Leadership": 3,
      "Member Acquisition": 2,
    },
    mbti: "ESTP",
    disc: "DI",
    papi: { P: 8.0, S: 6.1, G: 8.2, T: 7.6, W: 5.1 },
    strengths: ["Command", "Developer", "Focus", "Competition", "Achiever"],
    top_strength: "Top Regional PT Revenue Delivery (140% Quota)",
    development_priority: "Trainer leadership team onboarding program",
    willing_to_relocate: true,
    preferred_locations: ["Medan", "Bali", "Jakarta Selatan", "Batam"],
  },
  {
    employee_id: "emp-1608",
    employee_code: "FH-EMP-1608",
    fullname: "Fitri Handayani",
    current_role: "Fitness Consultant",
    current_location: "Bandung",
    current_club: "FIT HUB Dago Bandung",
    tenure_months: 19,
    performance_rating: 4.80,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 4,
      "POS Service Excellence": 3,
      "Shift Leadership": 2,
      "Gym Floor Safety": 2,
      "Biomechanics & Coaching": 1,
    },
    mbti: "ENTP",
    disc: "ID",
    papi: { P: 7.3, S: 7.4, G: 7.9, T: 7.5, W: 5.0 },
    strengths: ["Communication", "Woo", "Competition", "Strategic", "Relator"],
    top_strength: "Presale Launch Lead Conversion (Rp 110M Presale ACV)",
    development_priority: "Shift scheduling and floor SOP compliance",
    willing_to_relocate: true,
    preferred_locations: ["Bandung", "Surabaya", "Bali", "Batam"],
  },
];

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
}

// Helper: Calculate median of numeric array
function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 3.0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper: Calculate mode of string array
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

// Dynamic Matching Logic (Operationalizing calculate_mobility_match SQL function)
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

  const benchmarkStrengthsSet = new Set<string>();
  effectiveBenchmarks.forEach((b) => {
    b.strengths.forEach((s) => benchmarkStrengthsSet.add(s));
  });
  const benchmarkStrengths = Array.from(benchmarkStrengthsSet);

  const baselineCaps: Record<string, number> = {};
  benchmark.required_capabilities.forEach((req) => {
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

  const scoredCandidates = activeEmployeePool.map((candidate) => {
    const isFeeder = benchmark.natural_feeder_roles.includes(candidate.current_role);

    // 1. Capability Coverage Score (Bobot 45%)
    let totalCapScore = 0;
    let totalCapWeight = 0;
    const criticalGaps: Array<{ capability: string; current_level: number; required_level: number }> = [];

    benchmark.required_capabilities.forEach((req) => {
      const candidateLevel = candidate.capability_scores[req.name] || 1;
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

    // 2. Performance Score (Bobot 25%)
    const performanceScorePct = Math.min(100, (candidate.performance_rating / medianRating) * 100);

    // 3. Psychometrics & Personality Score (Bobot 20%)
    // PAPI (6%) + DISC (5%) + MBTI (4%) + Strengths Overlap (5%)
    const papiMatchRatio = Math.min(1.0, (candidate.papi.P / 8.0) * 0.3 + (candidate.papi.G / 8.0) * 0.3 + (candidate.papi.T / 7.5) * 0.4) * 100;
    const discMatchRatio = candidate.disc === modeDisc ? 100 : candidate.disc[0] === modeDisc[0] ? 75 : 50;
    const mbtiMatchRatio = candidate.mbti === modeMbti ? 100 : candidate.mbti[0] === modeMbti[0] ? 70 : 40;
    
    // Strengths Overlap Ratio
    const overlapCount = candidate.strengths.filter((s) => benchmarkStrengthsSet.has(s)).length;
    const strengthsOverlapRatio = Math.min(100, (overlapCount / 5.0) * 100);

    const psychometricScorePct = (
      papiMatchRatio * 0.30 +
      discMatchRatio * 0.25 +
      mbtiMatchRatio * 0.20 +
      strengthsOverlapRatio * 0.25
    );

    // 4. Contextual & Mobility Score (Bobot 10%)
    const tenureMaturityPct = Math.min(100, (candidate.tenure_months / medianTenure) * 100);
    const isSameLocation = candidate.current_location === params.targetLocation;
    const isWillingRelocate = candidate.willing_to_relocate && (
      candidate.preferred_locations.includes(params.targetLocation) || candidate.preferred_locations.length === 0
    );
    const locationScore = isSameLocation ? 100 : isWillingRelocate ? 85 : 60;
    const feederBonus = isFeeder ? 100 : 70;
    const contextualScorePct = tenureMaturityPct * 0.5 + ((locationScore * 0.6 + feederBonus * 0.4) * 0.5);

    // 5. Composite Unclamped Match Rate (Exact 100%)
    const rawMatchRate = (
      capabilityCoveragePct * capWeightNorm +
      performanceScorePct * perfWeightNorm +
      psychometricScorePct * psychWeightNorm +
      contextualScorePct * tenureWeightNorm
    );

    // Pure mathematical bounding (0.0% to 100.0%) - NO ARTIFICIAL CLAMPING!
    const matchRatePct = Math.round(Math.min(100.0, Math.max(0.0, rawMatchRate)) * 10) / 10;

    // Determine Readiness Status Tier
    let readinessStatus: "Ready" | "Near Ready" | "Development Needed";
    if (matchRatePct >= 85.0 && criticalGaps.length === 0 && candidate.performance_rating >= 4.2) {
      readinessStatus = "Ready";
    } else if (matchRatePct >= 70.0 && criticalGaps.length <= 1) {
      readinessStatus = "Near Ready";
    } else {
      readinessStatus = "Development Needed";
    }

    return {
      candidate,
      isFeeder,
      matchRatePct,
      readinessStatus,
      capabilityCoveragePct: Math.round(capabilityCoveragePct * 10) / 10,
      performanceScorePct: Math.round(performanceScorePct * 10) / 10,
      psychometricScorePct: Math.round(psychometricScorePct * 10) / 10,
      tenureScorePct: Math.round(contextualScorePct * 10) / 10,
      criticalGaps,
    };
  });

  // Filter based on input criteria
  const filtered = scoredCandidates.filter((item) => {
    if (params.feederOnly && !item.isFeeder) {
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
      top_strength: item.candidate.top_strength,
      recommended_action: item.candidate.development_priority,
      is_feeder_role: item.isFeeder,
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
