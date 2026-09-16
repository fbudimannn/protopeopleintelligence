-- FIT HUB People Intelligence
-- Migration: 015_early_tenure_pulse_mart.sql
-- Standard: Rakamin / MySpark Enterprise People Analytics
-- Description: Analytics mart view for Early-Tenure Pulse Monitoring (Day 30, 60, 90 checkpoints)
-- Links early frontline joiners (< 6 months tenure) with capability progression and onboarding sentiment.

CREATE OR REPLACE VIEW mart_early_tenure_pulse AS
SELECT
    e.employee_id,
    e.full_name AS employee_name,
    r.role_name,
    jf.family_name AS job_family,
    l.location_name,
    l.cluster_name,
    l.province_name,
    l.city_name,
    e.join_date,
    ROUND(CAST(EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) / 30.417 AS NUMERIC), 1) AS tenure_months,
    CASE 
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) >= 30 THEN p.score_30d
        ELSE NULL
    END AS score_30d,
    CASE 
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) >= 60 THEN p.score_60d
        ELSE NULL
    END AS score_60d,
    CASE 
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) >= 90 THEN p.score_90d
        ELSE NULL
    END AS score_90d,
    p.primary_concern_category,
    p.primary_concern_detail,
    CASE
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) < 45 THEN 'Day 30'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) < 75 THEN 'Day 60'
        ELSE 'Day 90'
    END AS milestone_stage,
    CASE
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) < 45 THEN 'Level 1 Baseline Sync'
        WHEN EXTRACT(DAY FROM (CURRENT_DATE - e.join_date)) < 75 THEN 'Level 1 -> Level 2 Gate'
        ELSE 'Level 2 Verification & L3 Roadmap'
    END AS capability_gate
FROM employees e
JOIN roles r ON e.role_id = r.role_id
JOIN job_families jf ON r.family_id = jf.family_id
JOIN locations l ON e.location_id = l.location_id
LEFT JOIN early_tenure_pulse_responses p ON e.employee_id = p.employee_id
WHERE e.status = 'ACTIVE' 
  AND e.join_date >= CURRENT_DATE - INTERVAL '180 days';
