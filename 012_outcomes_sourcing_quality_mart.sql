-- FIT HUB People Intelligence
-- Migration: 012_outcomes_sourcing_quality_mart.sql
-- Data Mart: Hiring Outcomes Quarterly Trajectory & Sourcing Channel Retention Quality
-- Standard: Rakamin / MySpark Enterprise People Analytics

-- 1. Table for Sourcing Channel Retention Quality Mart
CREATE TABLE IF NOT EXISTS public.mart_sourcing_channel_retention_quality (
    channel_key character varying(50) PRIMARY KEY,
    channel_name character varying(100) NOT NULL,
    channel_category character varying(50) NOT NULL, -- 'PROACTIVE_POOL', 'INTERNAL', 'CONVENTIONAL', 'EXTERNAL'
    median_ttf_days numeric(4,1) NOT NULL,
    six_month_retention_pct numeric(4,1) NOT NULL,
    probation_pass_rate_pct numeric(4,1) NOT NULL,
    cost_efficiency character varying(20) NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
    sample_size integer NOT NULL,
    avg_performance_rating numeric(3,2) NOT NULL,
    is_recommended boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Seed / Upsert Sourcing Channel Quality Data derived from Case Study Observations
INSERT INTO public.mart_sourcing_channel_retention_quality (
    channel_key, channel_name, channel_category, median_ttf_days, six_month_retention_pct, 
    probation_pass_rate_pct, cost_efficiency, sample_size, avg_performance_rating, is_recommended, notes
) VALUES
(
    'PROACTIVE_TALENT_POOL',
    'Frontline Ready Pool (Enabler)',
    'PROACTIVE_POOL',
    10.5,
    84.2,
    91.5,
    'HIGH',
    340,
    4.35,
    true,
    'Pre-verified pipeline cuts TTF from 34 to 10 days while delivering highest floor autonomy and 6-month retention.'
),
(
    'EMPLOYEE_REFERRAL',
    'Employee Referral Network',
    'INTERNAL',
    14.0,
    81.8,
    88.0,
    'HIGH',
    712,
    4.28,
    true,
    'FIT HUB case study #1 channel (35.6% volume). High culture fit and strong peer onboarding buddy effect.'
),
(
    'INTERNAL_MOBILITY',
    'Internal Staff Mobility (IDP)',
    'INTERNAL',
    8.0,
    92.0,
    96.0,
    'HIGH',
    115,
    4.55,
    true,
    'Zero acquisition cost, proven attendance record, and immediate day-1 floor operational readiness.'
),
(
    'JOB_PORTAL_EXTERNAL',
    'Job Portals (JobStreet / Glints)',
    'CONVENTIONAL',
    28.5,
    65.4,
    74.2,
    'MEDIUM',
    520,
    3.95,
    false,
    'High application volume but higher early churn (<6 months) due to floor reality vs expectations mismatch.'
),
(
    'SOCIAL_MEDIA_CAMPAIGN',
    'Social Media Ads (IG / TikTok)',
    'CONVENTIONAL',
    22.0,
    61.0,
    71.5,
    'LOW',
    240,
    3.88,
    false,
    'Effective for top-of-funnel reach during new club launch, but requires strict pre-screening to improve longevity.'
),
(
    'WALK_IN_OFFLINE',
    'Club Walk-In / QR Drop',
    'EXTERNAL',
    19.0,
    58.5,
    69.0,
    'MEDIUM',
    73,
    3.82,
    false,
    'Convenient local candidates around the club, but highly vulnerable to hospitality wage competition.'
)
ON CONFLICT (channel_key) DO UPDATE SET
    median_ttf_days = EXCLUDED.median_ttf_days,
    six_month_retention_pct = EXCLUDED.six_month_retention_pct,
    probation_pass_rate_pct = EXCLUDED.probation_pass_rate_pct,
    cost_efficiency = EXCLUDED.cost_efficiency,
    sample_size = EXCLUDED.sample_size,
    avg_performance_rating = EXCLUDED.avg_performance_rating,
    is_recommended = EXCLUDED.is_recommended,
    notes = EXCLUDED.notes;

-- 3. Materialized View / Table for Historical Hiring Outcomes Trajectory
CREATE TABLE IF NOT EXISTS public.mart_hiring_outcomes_quarterly (
    period_code character varying(20) PRIMARY KEY,
    period_label character varying(50) NOT NULL,
    quarter_index integer NOT NULL,
    median_ttf_days numeric(4,1) NOT NULL,
    beyond_sla_pct numeric(4,1) NOT NULL,
    six_month_retention_pct numeric(4,1) NOT NULL,
    ramp_up_speed_pct numeric(4,1) NOT NULL,
    manager_rating_avg numeric(3,2) NOT NULL,
    total_openings integer NOT NULL,
    fulfilled_count integer NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.mart_hiring_outcomes_quarterly (
    period_code, period_label, quarter_index, median_ttf_days, beyond_sla_pct, 
    six_month_retention_pct, ramp_up_speed_pct, manager_rating_avg, total_openings, fulfilled_count, is_active
) VALUES
(
    '2024_Q4',
    'Q4 Prev Year',
    1,
    34.0,
    48.3,
    68.9,
    74.0,
    3.90,
    480,
    420,
    false
),
(
    '2025_Q1',
    'Q1 Current Year',
    2,
    31.5,
    42.7,
    71.2,
    77.5,
    4.03,
    510,
    475,
    false
),
(
    '2025_Q2',
    'Q2 Current Year',
    3,
    29.0,
    37.8,
    73.6,
    80.3,
    4.17,
    530,
    502,
    false
),
(
    '2025_Q3',
    'Q3 Current Year (Active)',
    4,
    27.2,
    35.0,
    75.4,
    82.5,
    4.25,
    480,
    460,
    true
)
ON CONFLICT (period_code) DO UPDATE SET
    median_ttf_days = EXCLUDED.median_ttf_days,
    beyond_sla_pct = EXCLUDED.beyond_sla_pct,
    six_month_retention_pct = EXCLUDED.six_month_retention_pct,
    ramp_up_speed_pct = EXCLUDED.ramp_up_speed_pct,
    manager_rating_avg = EXCLUDED.manager_rating_avg,
    total_openings = EXCLUDED.total_openings,
    fulfilled_count = EXCLUDED.fulfilled_count,
    is_active = EXCLUDED.is_active;
