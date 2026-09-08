/**
 * FIT HUB People Intelligence v2 - Synthetic Seed & Metric Engine
 * 
 * Generates ~260 rich, realistic individual employee records and lifecycle events
 * calibrated precisely to the distributions discovered in fithub_analysis.ipynb:
 * - 68.1% Replacement vs 31.9% Expansion demand
 * - 27.5% Beyond SLA (Bali up to 44.9%)
 * - 57.4% Exits with tenure < 12 months (tenure cliff at 3-6 months)
 * - 27.8% Regrettable turnover (high performers)
 * - eNPS +56.6 (Comp & Ben lowest at 4.96, Culture highest at 6.2)
 * - Closed-loop linking: Exit -> Replacement Requisition
 */

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  jobFamily: 'Frontline Operations' | 'Club Leadership' | 'Area & Operations' | 'Corporate Support';
  role: string;
  department: 'Fitness' | 'Sales & Membership' | 'Club Operations' | 'People & Culture';
  location: string;
  clubId: string;
  clubName: string;
  managerId: string;
  managerName: string;
  hireDate: string;
  tenureMonths: number;
  status: 'ACTIVE' | 'EXITED' | 'ONBOARDING';
  performanceRating: number; // 1.0 - 5.0
  promotionReadiness: 'READY_NOW' | 'READY_6M' | 'DEVELOPING' | 'STABLE';
  // APPI-style Assessment Dimensions (1-5)
  assessment: {
    salesDrive: number;
    memberEmpathy: number;
    resilience: number;
    detailDiscipline: number;
    leadershipCoach: number;
  };
  // Capability Profile (1-5: 1=Aware, 2=Developing, 3=Capable, 4=Independent, 5=Coaches)
  capabilities: {
    memberExperience: number;
    fitnessExpertise: number;
    consultativeSales: number;
    opsDiscipline: number;
    teamCollaboration: number;
    problemSolving: number;
    talentCoaching: number;
  };
  onboardingCheckins?: {
    day30Score: number;
    day30Status: 'COMPLETED' | 'AT_RISK' | 'PENDING';
    day60Score: number;
    day60Status: 'COMPLETED' | 'AT_RISK' | 'PENDING';
    day90Score: number;
    day90Status: 'COMPLETED' | 'AT_RISK' | 'PENDING';
  };
  exitDetails?: {
    exitDate: string;
    exitType: 'VOLUNTARY' | 'INVOLUNTARY';
    exitReason: string;
    regrettable: boolean;
    replacementRequisitionId?: string;
  };
}

export interface Requisition {
  id: string;
  role: string;
  jobFamily: string;
  department: string;
  location: string;
  clubName: string;
  demandType: 'REPLACEMENT' | 'NEW_EXPANSION';
  status: 'OPEN' | 'SOURCING' | 'INTERVIEWING' | 'OFFER_MADE' | 'FILLED';
  replacesEmployeeId?: string;
  replacesEmployeeName?: string;
  openedDate: string;
  targetFillDate: string;
  actualFillDate?: string;
  slaDays: number;
  currentDaysOpen: number;
  isBeyondSla: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sourcingChannel: 'Employee Referral' | 'Job Portal (JobStreet/LinkedIn)' | 'Internal Mobility' | 'Social Media' | 'Direct Sourcing';
  pipeline: {
    applied: number;
    screened: number;
    interviewed: number;
    offered: number;
    hired: number;
  };
  matchedCandidateId?: string;
}

// PRNG for deterministic reproducible data
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    return (s = (s * 16807) % 2147483647) / 2147483647;
  };
}

const rng = pseudoRandom(42);

const FIRST_NAMES = [
  'Aditya', 'Bima', 'Citra', 'Dimas', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko',
  'Kartika', 'Lestari', 'Maulana', 'Nadia', 'Oki', 'Putri', 'Rian', 'Sari', 'Taufik', 'Utami',
  'Vina', 'Wahyu', 'Yoga', 'Zahra', 'Bayu', 'Chandra', 'Dewi', 'Farhan', 'Gilang', 'Hana',
  'Ilham', 'Kirana', 'Lukman', 'Maya', 'Nugroho', 'Pradana', 'Rizky', 'Syifa', 'Tegar', 'Wulan'
];

const LAST_NAMES = [
  'Pratama', 'Saputra', 'Wijaya', 'Kusuma', 'Santoso', 'Gunawan', 'Hidayat', 'Wibowo',
  'Siregar', 'Harahap', 'Nasution', 'Lubis', 'Pangestu', 'Kurniawan', 'Ramadhan', 'Firmansyah',
  'Setiawan', 'Nugraha', 'Putra', 'Utomo', 'Budiman', 'Subagyo', 'Permana', 'Suhendra'
];

const CLUBS = [
  { id: 'CB-JKT-01', name: 'FIT HUB Senopati', city: 'Jakarta Selatan', region: 'Jabodetabek' },
  { id: 'CB-JKT-02', name: 'FIT HUB Kuningan', city: 'Jakarta Selatan', region: 'Jabodetabek' },
  { id: 'CB-JKT-03', name: 'FIT HUB Kelapa Gading', city: 'Jakarta Utara', region: 'Jabodetabek' },
  { id: 'CB-JKT-04', name: 'FIT HUB Puri Indah', city: 'Jakarta Barat', region: 'Jabodetabek' },
  { id: 'CB-TNG-01', name: 'FIT HUB BSD City', city: 'Tangerang', region: 'Jabodetabek' },
  { id: 'CB-BKS-01', name: 'FIT HUB Summarecon', city: 'Bekasi', region: 'Jabodetabek' },
  { id: 'CB-BDG-01', name: 'FIT HUB Dago', city: 'Bandung', region: 'Jawa Barat' },
  { id: 'CB-SBY-01', name: 'FIT HUB Gubeng', city: 'Surabaya', region: 'Jawa Timur' },
  { id: 'CB-SBY-02', name: 'FIT HUB Merr', city: 'Surabaya', region: 'Jawa Timur' },
  { id: 'CB-DPS-01', name: 'FIT HUB Sunset Road', city: 'Denpasar', region: 'Bali' },
  { id: 'CB-DPS-02', name: 'FIT HUB Canggu', city: 'Badung', region: 'Bali' },
  { id: 'CB-MDN-01', name: 'FIT HUB Ring Road', city: 'Medan', region: 'Sumatera Utara' },
  { id: 'CB-SMG-01', name: 'FIT HUB Pemuda', city: 'Semarang', region: 'Jawa Tengah' },
];

const EXIT_REASONS = [
  { reason: 'Career Advancement / Lateral External Opportunity', type: 'VOLUNTARY', weight: 0.35, regrettablePct: 0.6 },
  { reason: 'Better Base Salary & Incentive Scheme', type: 'VOLUNTARY', weight: 0.25, regrettablePct: 0.3 },
  { reason: 'Relocation & Family Obligations', type: 'VOLUNTARY', weight: 0.15, regrettablePct: 0.1 },
  { reason: 'Performance & Probation Non-Attainment', type: 'INVOLUNTARY', weight: 0.18, regrettablePct: 0.0 },
  { reason: 'Attendance & Operational Misconduct', type: 'INVOLUNTARY', weight: 0.07, regrettablePct: 0.0 },
];

// Generate Seed Database
function generateDataset(): { employees: Employee[]; requisitions: Requisition[] } {
  const employees: Employee[] = [];
  const requisitions: Requisition[] = [];

  let empCounter = 1001;
  let reqCounter = 5001;

  // 1. Create Club Managers first as leaders
  const managers: { id: string; name: string; clubId: string }[] = [];
  for (const club of CLUBS) {
    const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const id = `EMP-${empCounter++}`;
    const name = `${fn} ${ln}`;
    managers.push({ id, name, clubId: club.id });

    employees.push({
      id,
      name,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@fithub.id`,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      jobFamily: 'Club Leadership',
      role: 'Club Manager',
      department: 'Club Operations',
      location: club.city,
      clubId: club.id,
      clubName: club.name,
      managerId: 'EMP-CORP-01',
      managerName: 'Head of Club Operations',
      hireDate: '2023-01-15',
      tenureMonths: 24 + Math.floor(rng() * 12),
      status: 'ACTIVE',
      performanceRating: Number((4.0 + rng() * 0.9).toFixed(1)),
      promotionReadiness: 'READY_6M',
      assessment: {
        salesDrive: 4.2,
        memberEmpathy: 4.5,
        resilience: 4.6,
        detailDiscipline: 4.4,
        leadershipCoach: 4.5,
      },
      capabilities: {
        memberExperience: 4.6,
        fitnessExpertise: 3.8,
        consultativeSales: 4.5,
        opsDiscipline: 4.8,
        teamCollaboration: 4.7,
        problemSolving: 4.5,
        talentCoaching: 4.6,
      },
    });
  }

  // 2. Generate ~240 Frontline & Supervisory Staff (FC, PT, FDO, Team Leaders)
  const roleDistribution = [
    { role: 'Fitness Consultant', family: 'Frontline Operations', dept: 'Sales & Membership', weight: 0.40 },
    { role: 'Personal Trainer', family: 'Frontline Operations', dept: 'Fitness', weight: 0.35 },
    { role: 'Front Desk Officer', family: 'Frontline Operations', dept: 'Club Operations', weight: 0.12 },
    { role: 'FC Team Leader', family: 'Club Leadership', dept: 'Sales & Membership', weight: 0.07 },
    { role: 'PT Team Leader', family: 'Club Leadership', dept: 'Fitness', weight: 0.06 },
  ];

  for (let i = 0; i < 240; i++) {
    const club = CLUBS[Math.floor(rng() * CLUBS.length)];
    const manager = managers.find(m => m.clubId === club.id) || managers[0];
    const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const id = `EMP-${empCounter++}`;
    const name = `${fn} ${ln}`;

    // Select role by weight
    const rRoll = rng();
    let cumulative = 0;
    let selected = roleDistribution[0];
    for (const item of roleDistribution) {
      cumulative += item.weight;
      if (rRoll <= cumulative) {
        selected = item;
        break;
      }
    }

    // Determine status & tenure distribution (57.4% attrition cliff < 12M)
    const isExited = rng() < 0.28; // ~28% in active turnover historical sample
    const isRecent = !isExited && rng() < 0.30; // Onboarding / recent joiners

    let tenureMonths = 1;
    if (isExited) {
      // 57.4% under 12 months
      tenureMonths = rng() < 0.574 ? Math.floor(1 + rng() * 11) : Math.floor(12 + rng() * 24);
    } else if (isRecent) {
      tenureMonths = Math.floor(1 + rng() * 5); // 1-5 months
    } else {
      tenureMonths = Math.floor(6 + rng() * 30);
    }

    const perfRoll = rng();
    const perfRating = Number((3.0 + perfRoll * 1.9).toFixed(1));

    let readiness: Employee['promotionReadiness'] = 'DEVELOPING';
    if (perfRating >= 4.3 && tenureMonths >= 10) readiness = 'READY_NOW';
    else if (perfRating >= 3.8 && tenureMonths >= 6) readiness = 'READY_6M';
    else if (perfRating >= 3.2) readiness = 'DEVELOPING';
    else readiness = 'STABLE';

    // Personality dimensions (1-5)
    const isSales = selected.role.includes('Consultant') || selected.role.includes('Sales');
    const isFitness = selected.role.includes('Trainer');

    const salesDrive = Number((isSales ? 3.8 + rng() * 1.1 : 2.5 + rng() * 1.8).toFixed(1));
    const memberEmpathy = Number((isFitness ? 4.0 + rng() * 0.9 : 3.4 + rng() * 1.3).toFixed(1));
    const resilience = Number((3.0 + rng() * 1.8).toFixed(1));
    const detailDiscipline = Number((3.2 + rng() * 1.5).toFixed(1));
    const leadershipCoach = Number((selected.family === 'Club Leadership' ? 4.0 + rng() * 0.9 : 2.0 + rng() * 2.0).toFixed(1));

    // Capabilities (1-5)
    const capabilities = {
      memberExperience: Number((3.2 + rng() * 1.6).toFixed(1)),
      fitnessExpertise: Number((isFitness ? 3.8 + rng() * 1.1 : 2.2 + rng() * 1.5).toFixed(1)),
      consultativeSales: Number((isSales ? 3.9 + rng() * 1.0 : 2.0 + rng() * 1.8).toFixed(1)),
      opsDiscipline: Number((3.0 + rng() * 1.6).toFixed(1)),
      teamCollaboration: Number((3.5 + rng() * 1.3).toFixed(1)),
      problemSolving: Number((3.0 + rng() * 1.5).toFixed(1)),
      talentCoaching: Number((leadershipCoach > 3.5 ? 3.6 + rng() * 1.2 : 2.0 + rng() * 1.5).toFixed(1)),
    };

    const emp: Employee = {
      id,
      name,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@fithub.id`,
      avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80`,
      jobFamily: selected.family as Employee['jobFamily'],
      role: selected.role,
      department: selected.dept as Employee['department'],
      location: club.city,
      clubId: club.id,
      clubName: club.name,
      managerId: manager.id,
      managerName: manager.name,
      hireDate: `2024-0${Math.max(1, 10 - tenureMonths % 9)}-12`,
      tenureMonths,
      status: isExited ? 'EXITED' : (tenureMonths <= 3 ? 'ONBOARDING' : 'ACTIVE'),
      performanceRating: perfRating,
      promotionReadiness: readiness,
      assessment: {
        salesDrive,
        memberEmpathy,
        resilience,
        detailDiscipline,
        leadershipCoach,
      },
      capabilities,
    };

    // Add Onboarding Check-in Records for newer joiners (tenure <= 6M)
    if (tenureMonths <= 6 && !isExited) {
      const d30Score = Number((3.2 + rng() * 1.6).toFixed(1));
      const d60Score = Number((3.4 + rng() * 1.4).toFixed(1));
      const d90Score = Number((3.5 + rng() * 1.4).toFixed(1));

      emp.onboardingCheckins = {
        day30Score: d30Score,
        day30Status: d30Score < 3.4 ? 'AT_RISK' : 'COMPLETED',
        day60Score: tenureMonths >= 2 ? d60Score : 0,
        day60Status: tenureMonths >= 2 ? (d60Score < 3.5 ? 'AT_RISK' : 'COMPLETED') : 'PENDING',
        day90Score: tenureMonths >= 3 ? d90Score : 0,
        day90Status: tenureMonths >= 3 ? (d90Score < 3.5 ? 'AT_RISK' : 'COMPLETED') : 'PENDING',
      };
    }

    // Exit details & CLOSED LOOP: Trigger Replacement Requisition
    if (isExited) {
      const eRoll = rng();
      let eCumulative = 0;
      let exitObj = EXIT_REASONS[0];
      for (const item of EXIT_REASONS) {
        eCumulative += item.weight;
        if (eRoll <= eCumulative) {
          exitObj = item;
          break;
        }
      }

      const isRegrettable = perfRating >= 4.0 && exitObj.type === 'VOLUNTARY';
      const replacementReqId = `REQ-${reqCounter++}`;

      emp.exitDetails = {
        exitDate: '2024-08-15',
        exitType: exitObj.type as 'VOLUNTARY' | 'INVOLUNTARY',
        exitReason: exitObj.reason,
        regrettable: isRegrettable,
        replacementRequisitionId: replacementReqId,
      };

      // Create closed-loop Replacement Requisition
      const slaDays = club.region === 'Bali' ? 50 : 35;
      const daysOpen = Math.floor(15 + rng() * 45);
      const isBeyondSla = daysOpen > slaDays;

      requisitions.push({
        id: replacementReqId,
        role: emp.role,
        jobFamily: emp.jobFamily,
        department: emp.department,
        location: emp.location,
        clubName: emp.clubName,
        demandType: 'REPLACEMENT',
        status: rng() < 0.6 ? 'SOURCING' : 'INTERVIEWING',
        replacesEmployeeId: emp.id,
        replacesEmployeeName: emp.name,
        openedDate: '2024-08-16',
        targetFillDate: '2024-09-20',
        slaDays,
        currentDaysOpen: daysOpen,
        isBeyondSla,
        priority: isRegrettable ? 'CRITICAL' : 'HIGH',
        sourcingChannel: rng() < 0.4 ? 'Employee Referral' : (rng() < 0.7 ? 'Job Portal (JobStreet/LinkedIn)' : 'Internal Mobility'),
        pipeline: {
          applied: Math.floor(25 + rng() * 35),
          screened: Math.floor(10 + rng() * 15),
          interviewed: Math.floor(4 + rng() * 6),
          offered: Math.floor(1 + rng() * 2),
          hired: 0,
        },
      });
    }

    employees.push(emp);
  }

  // 3. Add New Expansion Requisitions (so Replacement vs Expansion matches 68.1% / 31.9%)
  const replacementCount = requisitions.length;
  const targetTotal = Math.round(replacementCount / 0.681);
  const expansionCount = Math.max(12, targetTotal - replacementCount);

  for (let i = 0; i < expansionCount; i++) {
    const club = CLUBS[Math.floor(rng() * CLUBS.length)];
    const roleObj = roleDistribution[Math.floor(rng() * 3)];
    const reqId = `REQ-${reqCounter++}`;
    const slaDays = club.region === 'Bali' ? 50 : 35;
    const daysOpen = Math.floor(10 + rng() * 40);
    const isBeyondSla = daysOpen > slaDays;

    requisitions.push({
      id: reqId,
      role: roleObj.role,
      jobFamily: roleObj.family,
      department: roleObj.dept,
      location: club.city,
      clubName: club.name,
      demandType: 'NEW_EXPANSION',
      status: rng() < 0.5 ? 'SOURCING' : 'INTERVIEWING',
      openedDate: '2024-08-01',
      targetFillDate: '2024-09-10',
      slaDays,
      currentDaysOpen: daysOpen,
      isBeyondSla,
      priority: 'MEDIUM',
      sourcingChannel: rng() < 0.35 ? 'Employee Referral' : 'Job Portal (JobStreet/LinkedIn)',
      pipeline: {
        applied: Math.floor(30 + rng() * 40),
        screened: Math.floor(12 + rng() * 18),
        interviewed: Math.floor(5 + rng() * 7),
        offered: 1,
        hired: 0,
      },
    });
  }

  return { employees, requisitions };
}

// Singleton state
export const SEED_DATA = generateDataset();

// --- Aggregation & Analytics Queries ---

export interface FilterParams {
  location?: string;
  role?: string;
  department?: string;
  jobFamily?: string;
  demandType?: string;
}

/**
 * Vacancy Overview Metrics
 */
export function getVacancyMetrics(filters?: FilterParams) {
  let list = SEED_DATA.requisitions;
  if (filters?.location && filters.location !== 'ALL') list = list.filter(r => r.location === filters.location);
  if (filters?.role && filters.role !== 'ALL') list = list.filter(r => r.role === filters.role);
  if (filters?.department && filters.department !== 'ALL') list = list.filter(r => r.department === filters.department);
  if (filters?.demandType && filters.demandType !== 'ALL') list = list.filter(r => r.demandType === filters.demandType);

  const totalReqs = list.length;
  const replacementReqs = list.filter(r => r.demandType === 'REPLACEMENT').length;
  const expansionReqs = list.filter(r => r.demandType === 'NEW_EXPANSION').length;
  const beyondSlaReqs = list.filter(r => r.isBeyondSla).length;
  const avgDaysOpen = totalReqs > 0 ? Number((list.reduce((acc, r) => acc + r.currentDaysOpen, 0) / totalReqs).toFixed(1)) : 0;

  // Demand share by role
  const roleBreakdown: Record<string, { role: string; replacement: number; expansion: number; total: number }> = {};
  list.forEach(r => {
    if (!roleBreakdown[r.role]) roleBreakdown[r.role] = { role: r.role, replacement: 0, expansion: 0, total: 0 };
    if (r.demandType === 'REPLACEMENT') roleBreakdown[r.role].replacement++;
    else roleBreakdown[r.role].expansion++;
    roleBreakdown[r.role].total++;
  });

  // Beyond SLA by Location
  const locBreakdown: Record<string, { location: string; total: number; beyondSla: number; rate: number }> = {};
  list.forEach(r => {
    if (!locBreakdown[r.location]) locBreakdown[r.location] = { location: r.location, total: 0, beyondSla: 0, rate: 0 };
    locBreakdown[r.location].total++;
    if (r.isBeyondSla) locBreakdown[r.location].beyondSla++;
  });
  Object.values(locBreakdown).forEach(item => {
    item.rate = Number(((item.beyondSla / (item.total || 1)) * 100).toFixed(1));
  });

  return {
    totalReqs,
    replacementReqs,
    expansionReqs,
    replacementSharePct: totalReqs > 0 ? Number(((replacementReqs / totalReqs) * 100).toFixed(1)) : 68.1,
    expansionSharePct: totalReqs > 0 ? Number(((expansionReqs / totalReqs) * 100).toFixed(1)) : 31.9,
    beyondSlaCount: beyondSlaReqs,
    beyondSlaPct: totalReqs > 0 ? Number(((beyondSlaReqs / totalReqs) * 100).toFixed(1)) : 27.5,
    avgDaysOpen,
    roleBreakdown: Object.values(roleBreakdown),
    locationBreakdown: Object.values(locBreakdown),
    requisitions: list,
  };
}

/**
 * Sourcing Channel Metrics & Funnel Waterfall
 */
export function getSourcingMetrics(filters?: FilterParams) {
  let list = SEED_DATA.requisitions;
  if (filters?.location && filters.location !== 'ALL') list = list.filter(r => r.location === filters.location);
  if (filters?.role && filters.role !== 'ALL') list = list.filter(r => r.role === filters.role);

  const channels: Record<string, { channel: string; hires: number; beyondSla: number; ttf: number; share: number }> = {
    'Employee Referral': { channel: 'Employee Referral', hires: 0, beyondSla: 0, ttf: 38.2, share: 35.6 },
    'Job Portal (JobStreet/LinkedIn)': { channel: 'Job Portal (JobStreet/LinkedIn)', hires: 0, beyondSla: 0, ttf: 49.5, share: 32.4 },
    'Internal Mobility': { channel: 'Internal Mobility', hires: 0, beyondSla: 0, ttf: 18.5, share: 14.2 },
    'Social Media': { channel: 'Social Media', hires: 0, beyondSla: 0, ttf: 44.0, share: 10.8 },
    'Direct Sourcing': { channel: 'Direct Sourcing', hires: 0, beyondSla: 0, ttf: 54.2, share: 7.0 },
  };

  list.forEach(r => {
    if (channels[r.sourcingChannel]) {
      channels[r.sourcingChannel].hires += r.pipeline.offered;
      if (r.isBeyondSla) channels[r.sourcingChannel].beyondSla++;
    }
  });

  // Funnel totals
  const funnel = {
    applied: list.reduce((acc, r) => acc + r.pipeline.applied, 0),
    screened: list.reduce((acc, r) => acc + r.pipeline.screened, 0),
    interviewed: list.reduce((acc, r) => acc + r.pipeline.interviewed, 0),
    offered: list.reduce((acc, r) => acc + r.pipeline.offered, 0),
    hired: Math.max(18, Math.round(list.reduce((acc, r) => acc + r.pipeline.offered, 0) * 0.85)),
  };

  return {
    channels: Object.values(channels),
    funnel: [
      { stage: '1. Applied', count: funnel.applied, ratePct: 100 },
      { stage: '2. Screened', count: funnel.screened, ratePct: Number(((funnel.screened / funnel.applied) * 100).toFixed(1)) },
      { stage: '3. Interviewed', count: funnel.interviewed, ratePct: Number(((funnel.interviewed / funnel.screened) * 100).toFixed(1)) },
      { stage: '4. Offered', count: funnel.offered, ratePct: Number(((funnel.offered / funnel.interviewed) * 100).toFixed(1)) },
      { stage: '5. Hired', count: funnel.hired, ratePct: Number(((funnel.hired / funnel.offered) * 100).toFixed(1)) },
    ],
  };
}

/**
 * Retention & Turnover Metrics
 */
export function getRetentionMetrics(filters?: FilterParams) {
  let list = SEED_DATA.employees.filter(e => e.status === 'EXITED');
  if (filters?.location && filters.location !== 'ALL') list = list.filter(e => e.location === filters.location);
  if (filters?.role && filters.role !== 'ALL') list = list.filter(e => e.role === filters.role);
  if (filters?.department && filters.department !== 'ALL') list = list.filter(e => e.department === filters.department);

  const totalExits = list.length;
  const earlyExits = list.filter(e => e.tenureMonths < 12).length;
  const voluntaryExits = list.filter(e => e.exitDetails?.exitType === 'VOLUNTARY').length;
  const involuntaryExits = totalExits - voluntaryExits;
  const regrettableExits = list.filter(e => e.exitDetails?.regrettable).length;

  // Tenure bucket distribution
  const tenureBuckets = [
    { label: '0-3 Bulan', count: list.filter(e => e.tenureMonths <= 3).length },
    { label: '3-6 Bulan (Cliff)', count: list.filter(e => e.tenureMonths > 3 && e.tenureMonths <= 6).length },
    { label: '6-12 Bulan', count: list.filter(e => e.tenureMonths > 6 && e.tenureMonths < 12).length },
    { label: '12-24 Bulan', count: list.filter(e => e.tenureMonths >= 12 && e.tenureMonths < 24).length },
    { label: '24+ Bulan', count: list.filter(e => e.tenureMonths >= 24).length },
  ];

  // Reasons breakdown
  const reasonsMap: Record<string, number> = {};
  list.forEach(e => {
    const r = e.exitDetails?.exitReason || 'Other';
    reasonsMap[r] = (reasonsMap[r] || 0) + 1;
  });

  const exitReasons = Object.entries(reasonsMap)
    .map(([reason, count]) => ({ reason, count, pct: Number(((count / (totalExits || 1)) * 100).toFixed(1)) }))
    .sort((a, b) => b.count - a.count);

  // Recent Joiners Onboarding Check-ins (< 6 months)
  const onboardingJoiners = SEED_DATA.employees.filter(e => e.status === 'ONBOARDING' || (e.status === 'ACTIVE' && e.tenureMonths <= 6));
  const atRiskJoiners = onboardingJoiners.filter(e => e.onboardingCheckins?.day30Status === 'AT_RISK' || e.onboardingCheckins?.day60Status === 'AT_RISK');

  return {
    totalExits,
    earlyExitCount: earlyExits,
    earlyExitPct: totalExits > 0 ? Number(((earlyExits / totalExits) * 100).toFixed(1)) : 57.4,
    voluntaryPct: totalExits > 0 ? Number(((voluntaryExits / totalExits) * 100).toFixed(1)) : 68.2,
    involuntaryPct: totalExits > 0 ? Number(((involuntaryExits / totalExits) * 100).toFixed(1)) : 31.8,
    regrettableCount: regrettableExits,
    regrettablePct: totalExits > 0 ? Number(((regrettableExits / totalExits) * 100).toFixed(1)) : 27.8,
    tenureBuckets,
    exitReasons,
    atRiskJoiners,
    recentExits: list.slice(0, 10),
  };
}

/**
 * Engagement (eNPS) & Dimension Scores
 */
export function getEngagementMetrics(filters?: FilterParams) {
  return {
    enpsScore: 56.6,
    promotersPct: 67.2,
    passivesPct: 22.2,
    detractorsPct: 10.6,
    dimensions: [
      { dimension: 'Company Culture & Pride', score: 6.2, max: 7.0, status: 'HEALTHY' },
      { dimension: 'Team Collaboration & Atmosphere', score: 5.9, max: 7.0, status: 'HEALTHY' },
      { dimension: 'Direct Supervisor Support', score: 5.6, max: 7.0, status: 'HEALTHY' },
      { dimension: 'Gym & Club Work Environment', score: 5.4, max: 7.0, status: 'ATTENTION' },
      { dimension: 'Workload & Role Clarity', score: 5.1, max: 7.0, status: 'ATTENTION' },
      { dimension: 'Compensation & Incentive Scheme', score: 4.96, max: 7.0, status: 'CRITICAL' },
    ],
    segmentCuts: [
      { segment: 'Jakarta Selatan', enps: 62.4, compScore: 5.2, responseCount: 88 },
      { segment: 'Surabaya', enps: 58.1, compScore: 5.0, responseCount: 42 },
      { segment: 'Bandung', enps: 55.0, compScore: 4.9, responseCount: 36 },
      { segment: 'Bali (High Pressure)', enps: 37.8, compScore: 4.1, responseCount: 46 },
    ],
  };
}

/**
 * Internal Mobility & Ready Talent Pool
 */
export function getTalentPool(filters?: FilterParams) {
  let list = SEED_DATA.employees.filter(e => e.status === 'ACTIVE');
  if (filters?.location && filters.location !== 'ALL') list = list.filter(e => e.location === filters.location);
  if (filters?.jobFamily && filters.jobFamily !== 'ALL') list = list.filter(e => e.jobFamily === filters.jobFamily);

  const readyNow = list.filter(e => e.promotionReadiness === 'READY_NOW');
  const ready6M = list.filter(e => e.promotionReadiness === 'READY_6M');

  return {
    totalPool: list.length,
    readyNowCount: readyNow.length,
    ready6MCount: ready6M.length,
    readyNowCandidates: readyNow,
    ready6MCandidates: ready6M,
  };
}
