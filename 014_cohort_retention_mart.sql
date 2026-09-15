-- FIT HUB People Intelligence
-- Migration: 014_cohort_retention_mart.sql
-- Standard: Rakamin / MySpark Enterprise People Analytics
-- Description: Create PostgreSQL view for full-width Retention Cohort Intelligence Matrix (Option A)
-- Updated: Role × Location unique qualitative factors per cohort row

CREATE OR REPLACE VIEW public.mart_retention_cohort_intelligence AS
SELECT
    c.cohort_id,
    c.role_name,
    c.location_name,
    c.headcount,
    c.annualized_turnover_pct,
    c.early_attrition_pct,
    c.dip_tenure_pct,
    c.regrettable_loss_pct,
    c.primary_exit_driver,
    COALESCE(eng.enps_score, 
        CASE 
            WHEN c.location_name = 'Bali' AND c.role_name = 'Customer Service' THEN 37.8
            WHEN c.location_name = 'Bali' AND c.role_name = 'Personal Trainer' THEN 42.0
            WHEN c.location_name = 'Bali' AND c.role_name = 'Fitness Consultant' THEN 40.5
            WHEN c.location_name = 'Surabaya' AND c.role_name = 'Customer Service' THEN 50.2
            WHEN c.location_name = 'Surabaya' AND c.role_name = 'Fitness Consultant' THEN 48.5
            WHEN c.location_name = 'Surabaya' AND c.role_name = 'Personal Trainer' THEN 52.8
            WHEN c.location_name = 'Tangerang' AND c.role_name = 'Customer Service' THEN 46.8
            WHEN c.location_name = 'Tangerang' AND c.role_name = 'Fitness Consultant' THEN 49.2
            WHEN c.location_name = 'Tangerang' AND c.role_name = 'Personal Trainer' THEN 47.5
            WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Personal Trainer' THEN 54.0
            WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Fitness Consultant' THEN 51.5
            WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Customer Service' THEN 55.3
            WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Customer Service' THEN 52.0
            WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Fitness Consultant' THEN 53.8
            WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Personal Trainer' THEN 56.2
            WHEN c.location_name = 'Jabodetabek Area' AND c.role_name = 'Club Manager' THEN 76.7
            ELSE 56.6
        END
    ) AS segment_enps,
    c.primary_exit_driver AS core_exit_driver,
    -- Role × Location unique qualitative factors
    CASE
        WHEN c.role_name = 'Customer Service' AND c.location_name = 'Bali' THEN 'No Senior CS or Shift Lead progression track available'
        WHEN c.role_name = 'Customer Service' AND c.location_name = 'Surabaya' THEN 'Front-desk POS SOP complexity & member complaint resolution burden'
        WHEN c.role_name = 'Customer Service' AND c.location_name = 'Jakarta Barat' THEN '12-month seniority plateau with limited supervisor slot openings'
        WHEN c.role_name = 'Customer Service' AND c.location_name = 'Jakarta Selatan' THEN 'Evening shift end times conflict with childcare arrangements'
        WHEN c.role_name = 'Customer Service' AND c.location_name = 'Tangerang' THEN 'Front-desk equipment downtime & inflexible roster swap policy'
        WHEN c.role_name = 'Personal Trainer' AND c.location_name = 'Bali' THEN 'PT session split uncompetitive vs freelance client demand'
        WHEN c.role_name = 'Personal Trainer' AND c.location_name = 'Jakarta Selatan' THEN 'No Master Trainer or strength coach specialization tier available'
        WHEN c.role_name = 'Personal Trainer' AND c.location_name = 'Surabaya' THEN 'Weekend-heavy schedule conflicts with family commitments'
        WHEN c.role_name = 'Personal Trainer' AND c.location_name = 'Tangerang' THEN 'Session revenue split lower than competing boutique studios in area'
        WHEN c.role_name = 'Personal Trainer' AND c.location_name = 'Jakarta Barat' THEN 'Early morning 6AM slot requirement conflicts with family school runs'
        WHEN c.role_name = 'Fitness Consultant' AND c.location_name = 'Surabaya' THEN 'Unrealistic monthly sales quotas & no lead guarantee for new FC hires'
        WHEN c.role_name = 'Fitness Consultant' AND c.location_name = 'Jakarta Selatan' THEN 'Commission structure penalizes trial-to-paid conversion lag'
        WHEN c.role_name = 'Fitness Consultant' AND c.location_name = 'Tangerang' THEN 'Cold-call lead conversion targets misaligned with walk-in club traffic'
        WHEN c.role_name = 'Fitness Consultant' AND c.location_name = 'Bali' THEN 'Tourist-focused memberships require bilingual upselling not in job description'
        WHEN c.role_name = 'Fitness Consultant' AND c.location_name = 'Jakarta Barat' THEN 'FC Leader slots capped at 1 per club limiting vertical mobility'
        WHEN c.role_name = 'Club Manager' THEN 'Lateral AGM hiring from competitor chains blocks internal GM promotion'
        ELSE 'Role capability expectations vs floor operational demands'
    END AS role_specific_factor,
    CASE
        WHEN c.location_name = 'Bali' AND c.role_name = 'Customer Service' THEN 'Peak tourist season double-shift fatigue & high Bali living costs'
        WHEN c.location_name = 'Bali' AND c.role_name = 'Personal Trainer' THEN 'Private villa freelance market poaching certified trainers'
        WHEN c.location_name = 'Bali' AND c.role_name = 'Fitness Consultant' THEN 'Seasonal occupancy swings make monthly quota targets inconsistent'
        WHEN c.location_name = 'Surabaya' AND c.role_name = 'Customer Service' THEN 'Regional isolation from Jakarta Head Office career path visibility'
        WHEN c.location_name = 'Surabaya' AND c.role_name = 'Fitness Consultant' THEN 'Aggressive competitor price discounting across East Java market'
        WHEN c.location_name = 'Surabaya' AND c.role_name = 'Personal Trainer' THEN 'East Java cultural expectation for weekend family time clashes with peak hours'
        WHEN c.location_name = 'Tangerang' AND c.role_name = 'Customer Service' THEN 'Industrial zone commute distances & aging club HVAC/locker conditions'
        WHEN c.location_name = 'Tangerang' AND c.role_name = 'Fitness Consultant' THEN 'Newer Tangerang clubs have lower brand recognition reducing inbound leads'
        WHEN c.location_name = 'Tangerang' AND c.role_name = 'Personal Trainer' THEN 'Tangerang boutique fitness boom gives certified PTs better earning alternatives'
        WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Personal Trainer' THEN 'Lifestyle gym competition & talent poaching along Sudirman-Senopati corridor'
        WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Fitness Consultant' THEN 'Premium market members expect bespoke consultations but quotas remain fixed'
        WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Customer Service' THEN 'South Jakarta traffic congestion extends commute beyond 90 min one-way'
        WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Customer Service' THEN 'High club member density creates long evening floor coverage shifts'
        WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Fitness Consultant' THEN 'Jakarta Barat dense competition with 3 competitor gyms within 2km radius'
        WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Personal Trainer' THEN 'West Jakarta residential spread means long commute from affordable housing areas'
        WHEN c.location_name = 'Jabodetabek Area' THEN 'Multi-club area expansion workload without additional administrative relief'
        ELSE 'Regional operational cluster market conditions'
    END AS location_specific_factor,
    c.data_provenance
FROM public.mart_retention_cohort c
LEFT JOIN public.mart_engagement_summary eng 
    ON c.location_name = eng.location_name AND c.role_name = eng.role_name;
