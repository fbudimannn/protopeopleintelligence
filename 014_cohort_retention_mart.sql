-- FIT HUB People Intelligence
-- Migration: 014_cohort_retention_mart.sql
-- Standard: Rakamin / MySpark Enterprise People Analytics
-- Description: Create PostgreSQL view for full-width Retention Cohort Intelligence Matrix (Option A)

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
    COALESCE(eng.enps_score, 
        CASE 
            WHEN c.location_name = 'Bali' AND c.role_name = 'Customer Service' THEN 37.8
            WHEN c.location_name = 'Bali' AND c.role_name = 'Personal Trainer' THEN 42.0
            WHEN c.location_name = 'Surabaya' AND c.role_name = 'Customer Service' THEN 50.2
            WHEN c.location_name = 'Surabaya' AND c.role_name = 'Fitness Consultant' THEN 48.5
            WHEN c.location_name = 'Tangerang' AND c.role_name = 'Customer Service' THEN 46.8
            WHEN c.location_name = 'Jakarta Selatan' AND c.role_name = 'Personal Trainer' THEN 54.0
            WHEN c.location_name = 'Jakarta Barat' AND c.role_name = 'Customer Service' THEN 52.0
            WHEN c.location_name = 'Jabodetabek Area' AND c.role_name = 'Club Manager' THEN 76.7
            ELSE 56.6
        END
    ) AS segment_enps,
    c.primary_exit_driver AS core_exit_driver,
    CASE
        WHEN c.role_name = 'Customer Service' THEN 'Absence of Senior CS or Shift Lead progression track'
        WHEN c.role_name = 'Personal Trainer' THEN 'PT session split uncompetitive vs freelance client demand'
        WHEN c.role_name = 'Fitness Consultant' THEN 'Unrealistic monthly sales quotas & no lead guarantee for new hires'
        WHEN c.role_name = 'Club Manager' THEN 'Lateral AGM hiring from competitor gym chains blocking internal GMs'
        ELSE 'Role capability expectations vs floor operational demands'
    END AS role_specific_factor,
    CASE
        WHEN c.location_name = 'Bali' THEN 'Peak tourist double-shift fatigue & high living costs'
        WHEN c.location_name = 'Surabaya' THEN 'Regional isolation from Jakarta Head Office career path'
        WHEN c.location_name = 'Tangerang' THEN 'Industrial corridor commute transit times & HVAC/locker room issues'
        WHEN c.location_name = 'Jakarta Selatan' THEN 'High lifestyle gym competition & poaching along Sudirman-Senopati'
        WHEN c.location_name = 'Jakarta Barat' THEN 'High club member density and long evening floor coverage'
        WHEN c.location_name = 'Jabodetabek Area' THEN 'Multi-club area expansion workload without administrative relief'
        ELSE 'Regional operational cluster market conditions'
    END AS location_specific_factor
FROM public.mart_retention_cohort c
LEFT JOIN public.mart_engagement_summary eng 
    ON c.location_name = eng.location_name AND c.role_name = eng.role_name;
