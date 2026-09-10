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
  job_level: "Staff" | "Lead / Supervisor" | "Assistant Manager" | "Manager";
  job_family: "Club Operations" | "Fitness & Coaching" | "Commercial & Sales";
  role_purpose: string;
  benchmark_tenure_months: number;
  benchmark_min_rating: number;
  natural_feeder_roles: string[];
  required_capabilities: TargetCapabilityRequirement[];
  open_requisition_codes: string[];
}

export interface ActiveEmployeeCandidate {
  employee_id: string;
  employee_code: string;
  fullname: string;
  current_role: string;
  current_location: string;
  tenure_months: number;
  performance_rating: number; // 1.0 to 5.0
  capability_scores: Record<string, number>; // 1 to 4
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
  target_role: string;
  target_location: string;
  match_rate_pct: number;
  readiness_status: "Ready" | "Near Ready" | "Development Needed";
  capability_coverage_pct: number;
  performance_score_pct: number;
  tenure_score_pct: number;
  performance_rating: number;
  tenure_months: number;
  critical_gaps: Array<{
    capability: string;
    current_level: number;
    required_level: number;
  }>;
  top_strength: string;
  recommended_action: string;
  is_feeder_role: boolean;
}

// Target Role Benchmarks
export const targetRoleBenchmarks: TargetRoleBenchmark[] = [
  {
    role_id: "role-acm",
    role_name: "Assistant Club Manager",
    job_level: "Assistant Manager",
    job_family: "Club Operations",
    role_purpose: "Oversee daily gym floor shifts, supervise frontline staff, manage POS reconciliations, and ensure member safety standards across high-traffic operating hours.",
    benchmark_tenure_months: 18,
    benchmark_min_rating: 4.2,
    natural_feeder_roles: ["Operation Specialist", "Fitness Consultant"],
    open_requisition_codes: ["REQ-BLI-0120", "REQ-SBY-0202"],
    required_capabilities: [
      { name: "Shift Leadership", required_level: 3, weight: 30, description: "Supervise floor roster, resolve staff shortages, and lead daily huddles." },
      { name: "POS Service Excellence", required_level: 3, weight: 25, description: "Handle complex billing disputes, refund authorizations, and audit cash SOPs." },
      { name: "Gym Floor Safety", required_level: 3, weight: 25, description: "Manage emergency medical protocols, AED readiness, and incident logging." },
      { name: "Member Retention", required_level: 2, weight: 20, description: "Track member visit frequency and execute proactive outreach on drop-offs." },
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
    natural_feeder_roles: ["Personal Trainer"],
    open_requisition_codes: ["REQ-BLI-0109", "REQ-JKS-0405"],
    required_capabilities: [
      { name: "Biomechanics & Coaching", required_level: 4, weight: 35, description: "Advanced corrective movement patterns and VIP training architecture." },
      { name: "PT Revenue Architecture", required_level: 3, weight: 30, description: "Train new coaches on consultative sales and session package renewals." },
      { name: "Gym Floor Safety", required_level: 3, weight: 20, description: "Maintain zero equipment injury rate and audit free-weight zones." },
      { name: "Shift Leadership", required_level: 2, weight: 15, description: "Coordinate PT floor schedules and VIP studio availability." },
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
    natural_feeder_roles: ["Fitness Consultant"],
    open_requisition_codes: ["REQ-BLI-0115", "REQ-JKB-0312"],
    required_capabilities: [
      { name: "Member Acquisition", required_level: 4, weight: 40, description: "Consistent monthly lead generation and B2B corporate outreach." },
      { name: "Member Retention", required_level: 3, weight: 30, description: "Build automated re-engagement workflows for lapsed memberships." },
      { name: "Shift Leadership", required_level: 2, weight: 20, description: "Lead daily sales call blitzes and track consultant closing ratios." },
      { name: "POS Service Excellence", required_level: 2, weight: 10, description: "Audit member contract agreements and discount authorization gates." },
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
    natural_feeder_roles: ["Assistant Club Manager", "Fitness Lead", "Sales Lead"],
    open_requisition_codes: ["REQ-BLI-0104"],
    required_capabilities: [
      { name: "Shift Leadership", required_level: 4, weight: 30, description: "Develop club successor bench and foster high-performance club culture." },
      { name: "Member Retention", required_level: 4, weight: 30, description: "Maintain club renewal rate > 75% and minimize monthly member churn." },
      { name: "Member Acquisition", required_level: 3, weight: 20, description: "Oversee regional brand partnerships and commercial targets." },
      { name: "POS Service Excellence", required_level: 3, weight: 20, description: "Manage monthly club P&L, budget compliance, and facilities audits." },
    ],
  },
];

// Active Employee Pool (16 Active Candidates)
export const activeEmployeePool: ActiveEmployeeCandidate[] = [
  {
    employee_id: "emp-1042",
    employee_code: "FH-EMP-1042",
    fullname: "Dimas Arya Pratama",
    current_role: "Operation Specialist",
    current_location: "Surabaya",
    tenure_months: 22,
    performance_rating: 4.65,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "Floor Leadership & Safety Protocol Mastery",
    development_priority: "Area Manager 30-day shift shadow on P&L management",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Barat"],
  },
  {
    employee_id: "emp-1088",
    employee_code: "FH-EMP-1088",
    fullname: "Siti Nurhaliza",
    current_role: "Operation Specialist",
    current_location: "Jakarta Barat",
    tenure_months: 18,
    performance_rating: 4.5,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "POS Resolution & Member Retention Excellence",
    development_priority: "Complete level 3 floor safety and incident logging certification",
    willing_to_relocate: true,
    preferred_locations: ["Tangerang", "Jakarta Barat", "Jakarta Selatan"],
  },
  {
    employee_id: "emp-1120",
    employee_code: "FH-EMP-1120",
    fullname: "Kevin Christian",
    current_role: "Personal Trainer",
    current_location: "Surabaya",
    tenure_months: 16,
    performance_rating: 4.25,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 2,
      "Member Acquisition": 2,
    },
    top_strength: "Biomechanics & High-Ticket PT Revenue Coaching",
    development_priority: "Complete Level 2 supervisory coaching module for trainer auditions",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya"],
  },
  {
    employee_id: "emp-1154",
    employee_code: "FH-EMP-1154",
    fullname: "Reza Fahlevi",
    current_role: "Fitness Consultant",
    current_location: "Jakarta Selatan",
    tenure_months: 14,
    performance_rating: 4.1,
    capability_scores: {
      "Member Acquisition": 3,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 1,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "B2B Corporate Outreach & Consultative Closing",
    development_priority: "Shadow regional sales lead on territory quota management",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Jakarta Selatan", "Bandung"],
  },
  {
    employee_id: "emp-1205",
    employee_code: "FH-EMP-1205",
    fullname: "Agus Setiawan",
    current_role: "Operation Specialist",
    current_location: "Bali",
    tenure_months: 10,
    performance_rating: 3.85,
    capability_scores: {
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 3,
      "Member Retention": 2,
      "Member Acquisition": 1,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "Gym Floor Hygiene & Equipment SOP Adherence",
    development_priority: "Structured mentoring program on member dispute resolution",
    willing_to_relocate: false,
    preferred_locations: ["Bali"],
  },
  {
    employee_id: "emp-1240",
    employee_code: "FH-EMP-1240",
    fullname: "Nadia Safitri",
    current_role: "Personal Trainer",
    current_location: "Jakarta Barat",
    tenure_months: 20,
    performance_rating: 4.7,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
    top_strength: "PT Program Architecture & Client Session Retention",
    development_priority: "Lead trainer onboarding workshop in West Jakarta hub",
    willing_to_relocate: true,
    preferred_locations: ["Jakarta Barat", "Tangerang", "Jakarta Selatan"],
  },
  {
    employee_id: "emp-1277",
    employee_code: "FH-EMP-1277",
    fullname: "Budi Santoso",
    current_role: "Operation Specialist",
    current_location: "Tangerang",
    tenure_months: 15,
    performance_rating: 4.3,
    capability_scores: {
      "Shift Leadership": 2,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
      "Member Retention": 2,
      "Member Acquisition": 1,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "Member Inquiries & Front-Desk Administration SOP",
    development_priority: "Financial administration and multi-shift roster planning",
    willing_to_relocate: true,
    preferred_locations: ["Jakarta Barat", "Tangerang"],
  },
  {
    employee_id: "emp-1312",
    employee_code: "FH-EMP-1312",
    fullname: "Fitri Handayani",
    current_role: "Fitness Consultant",
    current_location: "Bandung",
    tenure_months: 19,
    performance_rating: 4.6,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 1,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "Consistent Monthly Target Overachievement (120% Quota)",
    development_priority: "Regional new-club presale management assignment",
    willing_to_relocate: true,
    preferred_locations: ["Surabaya", "Bali", "Bandung"],
  },
  {
    employee_id: "emp-1355",
    employee_code: "FH-EMP-1355",
    fullname: "Eko Prasetyo",
    current_role: "Operation Specialist",
    current_location: "Bali",
    tenure_months: 17,
    performance_rating: 4.45,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 1,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "High-Traffic Check-In Management & Staff Motivation",
    development_priority: "POS refund authorization audit procedures",
    willing_to_relocate: false,
    preferred_locations: ["Bali"],
  },
  {
    employee_id: "emp-1390",
    employee_code: "FH-EMP-1390",
    fullname: "Yuliana Dewi",
    current_role: "Fitness Consultant",
    current_location: "Surabaya",
    tenure_months: 13,
    performance_rating: 4.15,
    capability_scores: {
      "Member Acquisition": 3,
      "Member Retention": 3,
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 1,
      "Biomechanics & Coaching": 1,
    },
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
    tenure_months: 15,
    performance_rating: 4.35,
    capability_scores: {
      "Biomechanics & Coaching": 3,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 2,
      "Member Acquisition": 2,
    },
    top_strength: "Client Injury Prevention & VIP Onboarding",
    development_priority: "Lead trainer mentoring and conversion workshops",
    willing_to_relocate: false,
    preferred_locations: ["Bali"],
  },
  {
    employee_id: "emp-1456",
    employee_code: "FH-EMP-1456",
    fullname: "Taufik Hidayat",
    current_role: "Operation Specialist",
    current_location: "Jakarta Selatan",
    tenure_months: 21,
    performance_rating: 4.55,
    capability_scores: {
      "Shift Leadership": 3,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 3,
      "Member Retention": 3,
      "Member Acquisition": 2,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "Flagship Club Roster Coordination & Incident Resolution",
    development_priority: "Complete executive leadership development module",
    willing_to_relocate: true,
    preferred_locations: ["Bali", "Surabaya", "Jakarta Selatan"],
  },
  {
    employee_id: "emp-1488",
    employee_code: "FH-EMP-1488",
    fullname: "Dewi Puspita",
    current_role: "Personal Trainer",
    current_location: "Bandung",
    tenure_months: 18,
    performance_rating: 4.4,
    capability_scores: {
      "Biomechanics & Coaching": 4,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 2,
      "Shift Leadership": 2,
      "Member Retention": 3,
      "Member Acquisition": 2,
    },
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
    tenure_months: 16,
    performance_rating: 4.25,
    capability_scores: {
      "Member Acquisition": 4,
      "Member Retention": 2,
      "Shift Leadership": 2,
      "POS Service Excellence": 2,
      "Gym Floor Safety": 1,
      "Biomechanics & Coaching": 1,
    },
    top_strength: "Digital Lead Inflow Closing Speed",
    development_priority: "Member onboarding touchpoint consistency",
    willing_to_relocate: true,
    preferred_locations: ["Jakarta Barat", "Tangerang"],
  },
  {
    employee_id: "emp-1544",
    employee_code: "FH-EMP-1544",
    fullname: "Rina Marlina",
    current_role: "Operation Specialist",
    current_location: "Bandung",
    tenure_months: 12,
    performance_rating: 4.1,
    capability_scores: {
      "Shift Leadership": 2,
      "POS Service Excellence": 3,
      "Gym Floor Safety": 2,
      "Member Retention": 2,
      "Member Acquisition": 1,
      "Biomechanics & Coaching": 1,
    },
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
    tenure_months: 14,
    performance_rating: 4.2,
    capability_scores: {
      "Biomechanics & Coaching": 3,
      "PT Revenue Architecture": 3,
      "Gym Floor Safety": 3,
      "Shift Leadership": 2,
      "Member Retention": 2,
      "Member Acquisition": 1,
    },
    top_strength: "High Client Session Volume Delivery",
    development_priority: "New client consultation and conversion pitch",
    willing_to_relocate: true,
    preferred_locations: ["Tangerang", "Jakarta Selatan"],
  },
];

export interface MatchingParams {
  targetRoleId: string;
  targetLocation: string;
  minPerformance: number;
  minTenureMonths: number;
  feederOnly: boolean;
  weights: {
    capability: number;
    performance: number;
    tenure: number;
  };
}

// Dynamic Matching Logic (Operationalizing 010_internal_mobility_engine.sql)
export function runDynamicMobilityMatching(params: MatchingParams): {
  benchmark: TargetRoleBenchmark;
  results: DynamicMatchResult[];
} {
  const benchmark = targetRoleBenchmarks.find((b) => b.role_id === params.targetRoleId) || targetRoleBenchmarks[0];

  const totalWeight = params.weights.capability + params.weights.performance + params.weights.tenure;
  const capWeightNorm = params.weights.capability / totalWeight;
  const perfWeightNorm = params.weights.performance / totalWeight;
  const tenureWeightNorm = params.weights.tenure / totalWeight;

  const scoredCandidates = activeEmployeePool.map((candidate) => {
    const isFeeder = benchmark.natural_feeder_roles.includes(candidate.current_role);

    // 1. Calculate Capability Coverage Score
    let totalCapScore = 0;
    let totalCapWeight = 0;
    const criticalGaps: Array<{ capability: string; current_level: number; required_level: number }> = [];

    benchmark.required_capabilities.forEach((req) => {
      const candidateLevel = candidate.capability_scores[req.name] || 1;
      const coverageRatio = Math.min(1.0, candidateLevel / req.required_level);
      totalCapScore += coverageRatio * req.weight;
      totalCapWeight += req.weight;

      if (candidateLevel < req.required_level) {
        criticalGaps.push({
          capability: req.name,
          current_level: candidateLevel,
          required_level: req.required_level,
        });
      }
    });

    const capabilityCoveragePct = totalCapWeight > 0 ? (totalCapScore / totalCapWeight) * 100 : 70;

    // 2. Calculate Performance Score (normalized to 100)
    const performanceScorePct = Math.min(100, (candidate.performance_rating / 5.0) * 100);

    // 3. Calculate Tenure Score (normalized against benchmark tenure)
    const tenureScorePct = Math.min(100, (candidate.tenure_months / benchmark.benchmark_tenure_months) * 100);

    // 4. Feeder Role Multiplier
    const feederMultiplier = isFeeder ? 1.0 : 0.85;

    // 5. Location Affinity Multiplier
    const isSameLocation = candidate.current_location === params.targetLocation;
    const isWillingRelocate = candidate.willing_to_relocate && (
      candidate.preferred_locations.includes(params.targetLocation) || candidate.preferred_locations.length === 0
    );
    const locationMultiplier = isSameLocation ? 1.0 : isWillingRelocate ? 0.94 : 0.75;

    // Composite Match Rate Calculation
    const rawMatchRate = (
      capabilityCoveragePct * capWeightNorm +
      performanceScorePct * perfWeightNorm +
      tenureScorePct * tenureWeightNorm
    ) * feederMultiplier * locationMultiplier;

    const matchRatePct = Math.round(Math.min(98.5, Math.max(45.0, rawMatchRate)) * 10) / 10;

    // Determine Readiness Status Tier
    let readinessStatus: "Ready" | "Near Ready" | "Development Needed";
    if (matchRatePct >= 85.0 && criticalGaps.length === 0 && candidate.performance_rating >= 4.2) {
      readinessStatus = "Ready";
    } else if (matchRatePct >= 72.0 && criticalGaps.length <= 1) {
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
      tenureScorePct: Math.round(tenureScorePct * 10) / 10,
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
      target_role: benchmark.role_name,
      target_location: params.targetLocation,
      match_rate_pct: item.matchRatePct,
      readiness_status: item.readinessStatus,
      capability_coverage_pct: item.capabilityCoveragePct,
      performance_score_pct: item.performanceScorePct,
      tenure_score_pct: item.tenureScorePct,
      performance_rating: item.candidate.performance_rating,
      tenure_months: item.candidate.tenure_months,
      critical_gaps: item.criticalGaps,
      top_strength: item.candidate.top_strength,
      recommended_action: item.candidate.development_priority,
      is_feeder_role: item.isFeeder,
    };
  });

  return { benchmark, results };
}
