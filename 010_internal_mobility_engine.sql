-- FIT HUB People Intelligence
-- Internal Mobility Benchmark + Matching Engine
-- PostgreSQL / Supabase
--
-- Purpose:
-- 1. Build a versioned target-role benchmark from high-performing incumbents.
-- 2. Compare active internal employees to approved role capability requirements.
-- 3. Use actual performance and development evidence as primary readiness evidence.
-- 4. Reuse existing DISC / MBTI / PAPI / Strengths only as optional supporting context.
-- 5. Produce transparent Ready / Near Ready / Development Needed results.
--
-- Important:
-- The default weights below are ILLUSTRATIVE FOR THE PROTOTYPE.
-- They are not claimed to be scientifically validated or business-approved.
-- Psychometric / work-style context is capped at 5% and cannot override
-- missing critical capability or minimum performance evidence.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS talent;
CREATE SCHEMA IF NOT EXISTS mart;
CREATE SCHEMA IF NOT EXISTS public;

-- ============================================================
-- PHASE 0: CONFIGURATION
-- ============================================================

CREATE TABLE IF NOT EXISTS talent.mobility_scoring_config (
    config_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_role_id uuid NULL REFERENCES core.job_role(job_role_id),
    config_version text NOT NULL,
    capability_weight numeric(6,4) NOT NULL DEFAULT 0.5500,
    performance_weight numeric(6,4) NOT NULL DEFAULT 0.3000,
    development_weight numeric(6,4) NOT NULL DEFAULT 0.1000,
    assessment_context_weight numeric(6,4) NOT NULL DEFAULT 0.0500,
    performance_scale_max numeric(6,2) NOT NULL DEFAULT 5.00,
    performance_cycles_to_use integer NOT NULL DEFAULT 2,
    min_performance_cycles integer NOT NULL DEFAULT 2,
    benchmark_performance_threshold numeric(6,4) NOT NULL DEFAULT 0.8000,
    minimum_performance_score numeric(6,4) NOT NULL DEFAULT 0.7000,
    strong_performance_score numeric(6,4) NOT NULL DEFAULT 0.8500,
    min_capability_coverage numeric(6,4) NOT NULL DEFAULT 0.8000,
    critical_gap_rank_threshold integer NOT NULL DEFAULT 2,
    ready_threshold numeric(6,4) NOT NULL DEFAULT 0.8500,
    near_ready_threshold numeric(6,4) NOT NULL DEFAULT 0.7000,
    min_benchmark_size integer NOT NULL DEFAULT 5,
    active_flag boolean NOT NULL DEFAULT true,
    valid_from date NOT NULL DEFAULT current_date,
    valid_to date NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_mobility_weights
        CHECK (
            capability_weight >= 0
            AND performance_weight >= 0
            AND development_weight >= 0
            AND assessment_context_weight >= 0
            AND capability_weight
                + performance_weight
                + development_weight
                + assessment_context_weight > 0
        ),
    CONSTRAINT chk_assessment_context_cap
        CHECK (assessment_context_weight <= 0.0500)
);

-- Seed one global demo configuration if none exists.
INSERT INTO talent.mobility_scoring_config (
    job_role_id,
    config_version,
    capability_weight,
    performance_weight,
    development_weight,
    assessment_context_weight,
    performance_scale_max,
    performance_cycles_to_use,
    min_performance_cycles,
    benchmark_performance_threshold,
    minimum_performance_score,
    strong_performance_score,
    min_capability_coverage,
    critical_gap_rank_threshold,
    ready_threshold,
    near_ready_threshold,
    min_benchmark_size,
    active_flag,
    valid_from
)
SELECT
    NULL,
    'demo_v1',
    0.5500,
    0.3000,
    0.1000,
    0.0500,
    5.00,
    2,
    2,
    0.8000,
    0.7000,
    0.8500,
    0.8000,
    2,
    0.8500,
    0.7000,
    5,
    true,
    current_date
WHERE NOT EXISTS (
    SELECT 1
    FROM talent.mobility_scoring_config
    WHERE job_role_id IS NULL
      AND active_flag = true
);

-- Extend benchmark lineage tables for sample-size transparency.
ALTER TABLE talent.role_benchmark_profile
    ADD COLUMN IF NOT EXISTS benchmark_sample_size integer;

ALTER TABLE talent.role_benchmark_metric
    ADD COLUMN IF NOT EXISTS metric_sample_size integer;

-- Extend the final Mart so the UI can explain every component.
ALTER TABLE mart.internal_mobility_match
    ADD COLUMN IF NOT EXISTS benchmark_id uuid,
    ADD COLUMN IF NOT EXISTS current_assignment_id uuid,
    ADD COLUMN IF NOT EXISTS current_role_id uuid,
    ADD COLUMN IF NOT EXISTS current_location_id uuid,
    ADD COLUMN IF NOT EXISTS capability_coverage numeric(6,4),
    ADD COLUMN IF NOT EXISTS performance_score numeric(6,4),
    ADD COLUMN IF NOT EXISTS development_score numeric(6,4),
    ADD COLUMN IF NOT EXISTS assessment_context_score numeric(6,4),
    ADD COLUMN IF NOT EXISTS required_gap_count integer,
    ADD COLUMN IF NOT EXISTS missing_required_assessment_count integer,
    ADD COLUMN IF NOT EXISTS final_readiness_score numeric(6,4),
    ADD COLUMN IF NOT EXISTS scoring_config_version text,
    ADD COLUMN IF NOT EXISTS details_json jsonb;

-- ============================================================
-- PHASE 1: BUILD A VERSIONED SUCCESS BENCHMARK
-- ============================================================

CREATE OR REPLACE FUNCTION talent.refresh_role_benchmark(
    p_job_role_id uuid,
    p_benchmark_version text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_config talent.mobility_scoring_config%ROWTYPE;
    v_benchmark_id uuid := gen_random_uuid();
    v_version text;
    v_member_count integer;
    v_threshold_raw numeric;
BEGIN
    -- 1.A Select the most specific active scoring configuration.
    SELECT c.*
    INTO v_config
    FROM talent.mobility_scoring_config c
    WHERE c.active_flag = true
      AND c.valid_from <= current_date
      AND (c.valid_to IS NULL OR c.valid_to >= current_date)
      AND (c.job_role_id = p_job_role_id OR c.job_role_id IS NULL)
    ORDER BY
        CASE WHEN c.job_role_id = p_job_role_id THEN 0 ELSE 1 END,
        c.valid_from DESC,
        c.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active mobility scoring configuration for role %', p_job_role_id;
    END IF;

    v_threshold_raw :=
        v_config.benchmark_performance_threshold
        * v_config.performance_scale_max;

    v_version := COALESCE(
        p_benchmark_version,
        'v_' || to_char(clock_timestamp(), 'YYYYMMDD_HH24MISS')
    );

    -- 1.B Count eligible high-performing incumbents.
    WITH current_assignment AS (
        SELECT DISTINCT ON (em.employee_id)
            em.employee_id,
            ea.assignment_id,
            ea.job_role_id,
            ea.location_id,
            ea.valid_from
        FROM core.employment em
        JOIN core.employee e
          ON e.employee_id = em.employee_id
        JOIN core.employee_assignment ea
          ON ea.employment_id = em.employment_id
        WHERE e.employee_status::text = 'ACTIVE'
          AND em.employment_status::text = 'ACTIVE'
          AND ea.valid_from <= current_date
          AND (ea.valid_to IS NULL OR ea.valid_to >= current_date)
        ORDER BY
            em.employee_id,
            ea.valid_from DESC,
            ea.assignment_id
    ),
    ranked_performance AS (
        SELECT
            pr.employee_id,
            pr.overall_rating,
            pr.review_date,
            row_number() OVER (
                PARTITION BY pr.employee_id
                ORDER BY pr.review_date DESC NULLS LAST, pr.review_id DESC
            ) AS rn
        FROM performance.performance_review pr
        WHERE pr.overall_rating IS NOT NULL
          AND (pr.review_date IS NULL OR pr.review_date <= current_date)
    ),
    recent_performance AS (
        SELECT
            rp.employee_id,
            avg(rp.overall_rating)::numeric AS avg_recent_rating,
            count(*)::integer AS performance_cycles
        FROM ranked_performance rp
        WHERE rp.rn <= v_config.performance_cycles_to_use
        GROUP BY rp.employee_id
    )
    SELECT count(*)::integer
    INTO v_member_count
    FROM current_assignment ca
    JOIN recent_performance rp
      ON rp.employee_id = ca.employee_id
    WHERE ca.job_role_id = p_job_role_id
      AND rp.performance_cycles >= v_config.min_performance_cycles
      AND rp.avg_recent_rating >= v_threshold_raw;

    IF v_member_count < v_config.min_benchmark_size THEN
        RAISE EXCEPTION
            'Benchmark for role % has only % eligible incumbents; minimum required is %',
            p_job_role_id,
            v_member_count,
            v_config.min_benchmark_size;
    END IF;

    -- 1.C Retire the previous active benchmark for the role.
    UPDATE talent.role_benchmark_profile
    SET
        benchmark_status = 'RETIRED',
        valid_to = COALESCE(valid_to, current_date)
    WHERE job_role_id = p_job_role_id
      AND benchmark_status = 'ACTIVE';

    -- 1.D Create the benchmark header.
    INSERT INTO talent.role_benchmark_profile (
        benchmark_id,
        job_role_id,
        benchmark_version,
        performance_threshold,
        minimum_benchmark_size,
        benchmark_method,
        valid_from,
        valid_to,
        benchmark_status,
        benchmark_sample_size
    )
    VALUES (
        v_benchmark_id,
        p_job_role_id,
        v_version,
        v_threshold_raw,
        v_config.min_benchmark_size,
        'HIGH_PERFORMER_INCUMBENTS',
        current_date,
        NULL,
        'ACTIVE',
        v_member_count
    );

    -- 1.E Persist benchmark members for lineage.
    INSERT INTO talent.role_benchmark_member (
        benchmark_id,
        employee_id,
        benchmark_performance_value,
        included_at
    )
    WITH current_assignment AS (
        SELECT DISTINCT ON (em.employee_id)
            em.employee_id,
            ea.job_role_id,
            ea.valid_from
        FROM core.employment em
        JOIN core.employee e
          ON e.employee_id = em.employee_id
        JOIN core.employee_assignment ea
          ON ea.employment_id = em.employment_id
        WHERE e.employee_status::text = 'ACTIVE'
          AND em.employment_status::text = 'ACTIVE'
          AND ea.valid_from <= current_date
          AND (ea.valid_to IS NULL OR ea.valid_to >= current_date)
        ORDER BY
            em.employee_id,
            ea.valid_from DESC,
            ea.assignment_id
    ),
    ranked_performance AS (
        SELECT
            pr.employee_id,
            pr.overall_rating,
            pr.review_date,
            row_number() OVER (
                PARTITION BY pr.employee_id
                ORDER BY pr.review_date DESC NULLS LAST, pr.review_id DESC
            ) AS rn
        FROM performance.performance_review pr
        WHERE pr.overall_rating IS NOT NULL
          AND (pr.review_date IS NULL OR pr.review_date <= current_date)
    ),
    recent_performance AS (
        SELECT
            rp.employee_id,
            avg(rp.overall_rating)::numeric AS avg_recent_rating,
            count(*)::integer AS performance_cycles
        FROM ranked_performance rp
        WHERE rp.rn <= v_config.performance_cycles_to_use
        GROUP BY rp.employee_id
    )
    SELECT
        v_benchmark_id,
        ca.employee_id,
        rp.avg_recent_rating,
        now()
    FROM current_assignment ca
    JOIN recent_performance rp
      ON rp.employee_id = ca.employee_id
    WHERE ca.job_role_id = p_job_role_id
      AND rp.performance_cycles >= v_config.min_performance_cycles
      AND rp.avg_recent_rating >= v_threshold_raw;

    -- --------------------------------------------------------
    -- 1.F Benchmark capability levels
    -- --------------------------------------------------------

    INSERT INTO talent.role_benchmark_metric (
        benchmark_metric_id,
        benchmark_id,
        evidence_type,
        metric_code,
        numeric_median,
        numeric_q1,
        numeric_q3,
        categorical_mode,
        distribution_json,
        metric_sample_size
    )
    WITH latest_capability AS (
        SELECT DISTINCT ON (ca.employee_id, ca.capability_id)
            ca.employee_id,
            ca.capability_id,
            pl.level_rank::numeric AS level_rank
        FROM talent.capability_assessment ca
        JOIN talent.proficiency_level pl
          ON pl.level_id = ca.assessed_level_id
        JOIN talent.role_benchmark_member bm
          ON bm.employee_id = ca.employee_id
         AND bm.benchmark_id = v_benchmark_id
        WHERE ca.assessment_date <= current_date
        ORDER BY
            ca.employee_id,
            ca.capability_id,
            ca.assessment_date DESC,
            ca.assessment_id DESC
    )
    SELECT
        gen_random_uuid(),
        v_benchmark_id,
        'CAPABILITY',
        'CAPABILITY:' || lc.capability_id::text,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY lc.level_rank)::numeric,
        percentile_cont(0.25) WITHIN GROUP (ORDER BY lc.level_rank)::numeric,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY lc.level_rank)::numeric,
        NULL,
        NULL,
        count(DISTINCT lc.employee_id)::integer
    FROM latest_capability lc
    GROUP BY lc.capability_id;

    -- --------------------------------------------------------
    -- 1.G Benchmark recent performance
    -- --------------------------------------------------------

    INSERT INTO talent.role_benchmark_metric (
        benchmark_metric_id,
        benchmark_id,
        evidence_type,
        metric_code,
        numeric_median,
        numeric_q1,
        numeric_q3,
        categorical_mode,
        distribution_json,
        metric_sample_size
    )
    SELECT
        gen_random_uuid(),
        v_benchmark_id,
        'PERFORMANCE',
        'OVERALL_RATING',
        percentile_cont(0.50) WITHIN GROUP (
            ORDER BY bm.benchmark_performance_value
        )::numeric,
        percentile_cont(0.25) WITHIN GROUP (
            ORDER BY bm.benchmark_performance_value
        )::numeric,
        percentile_cont(0.75) WITHIN GROUP (
            ORDER BY bm.benchmark_performance_value
        )::numeric,
        NULL,
        NULL,
        count(*)::integer
    FROM talent.role_benchmark_member bm
    WHERE bm.benchmark_id = v_benchmark_id;

    -- --------------------------------------------------------
    -- 1.H Benchmark categorical assessments such as DISC / MBTI
    --     Mode is retained, but the full distribution is stored.
    -- --------------------------------------------------------

    INSERT INTO talent.role_benchmark_metric (
        benchmark_metric_id,
        benchmark_id,
        evidence_type,
        metric_code,
        numeric_median,
        numeric_q1,
        numeric_q3,
        categorical_mode,
        distribution_json,
        metric_sample_size
    )
    WITH latest_assessment AS (
        SELECT
            ea.*,
            row_number() OVER (
                PARTITION BY ea.employee_id, ea.assessment_definition_id
                ORDER BY ea.assessment_date DESC, ea.employee_assessment_id DESC
            ) AS rn
        FROM talent.employee_assessment ea
        JOIN talent.role_benchmark_member bm
          ON bm.employee_id = ea.employee_id
         AND bm.benchmark_id = v_benchmark_id
        WHERE ea.assessment_date <= current_date
          AND (ea.valid_until IS NULL OR ea.valid_until >= current_date)
    ),
    category_counts AS (
        SELECT
            ad.assessment_code,
            ear.categorical_value,
            count(DISTINCT la.employee_id)::numeric AS category_count
        FROM latest_assessment la
        JOIN talent.assessment_definition ad
          ON ad.assessment_definition_id = la.assessment_definition_id
        JOIN talent.employee_assessment_result ear
          ON ear.employee_assessment_id = la.employee_assessment_id
        WHERE la.rn = 1
          AND ad.result_shape = 'CATEGORICAL'
          AND ear.categorical_value IS NOT NULL
        GROUP BY
            ad.assessment_code,
            ear.categorical_value
    ),
    category_totals AS (
        SELECT
            assessment_code,
            sum(category_count)::numeric AS total_count
        FROM category_counts
        GROUP BY assessment_code
    ),
    ranked_categories AS (
        SELECT
            cc.*,
            ct.total_count,
            row_number() OVER (
                PARTITION BY cc.assessment_code
                ORDER BY cc.category_count DESC, cc.categorical_value
            ) AS category_rank
        FROM category_counts cc
        JOIN category_totals ct
          USING (assessment_code)
    ),
    category_summary AS (
        SELECT
            rc.assessment_code,
            max(rc.categorical_value) FILTER (
                WHERE rc.category_rank = 1
            ) AS categorical_mode,
            jsonb_object_agg(
                rc.categorical_value,
                round(rc.category_count / NULLIF(rc.total_count, 0), 4)
                ORDER BY rc.categorical_value
            ) AS distribution_json,
            max(rc.total_count)::integer AS metric_sample_size
        FROM ranked_categories rc
        GROUP BY rc.assessment_code
    )
    SELECT
        gen_random_uuid(),
        v_benchmark_id,
        'ASSESSMENT_CATEGORICAL',
        cs.assessment_code,
        NULL,
        NULL,
        NULL,
        cs.categorical_mode,
        cs.distribution_json,
        cs.metric_sample_size
    FROM category_summary cs;

    -- --------------------------------------------------------
    -- 1.I Benchmark numeric assessment dimensions such as PAPI
    -- --------------------------------------------------------

    INSERT INTO talent.role_benchmark_metric (
        benchmark_metric_id,
        benchmark_id,
        evidence_type,
        metric_code,
        numeric_median,
        numeric_q1,
        numeric_q3,
        categorical_mode,
        distribution_json,
        metric_sample_size
    )
    WITH latest_assessment AS (
        SELECT
            ea.*,
            row_number() OVER (
                PARTITION BY ea.employee_id, ea.assessment_definition_id
                ORDER BY ea.assessment_date DESC, ea.employee_assessment_id DESC
            ) AS rn
        FROM talent.employee_assessment ea
        JOIN talent.role_benchmark_member bm
          ON bm.employee_id = ea.employee_id
         AND bm.benchmark_id = v_benchmark_id
        WHERE ea.assessment_date <= current_date
          AND (ea.valid_until IS NULL OR ea.valid_until >= current_date)
    ),
    numeric_results AS (
        SELECT
            la.employee_id,
            ad.assessment_code,
            dim.dimension_code,
            ear.numeric_value
        FROM latest_assessment la
        JOIN talent.assessment_definition ad
          ON ad.assessment_definition_id = la.assessment_definition_id
        JOIN talent.employee_assessment_result ear
          ON ear.employee_assessment_id = la.employee_assessment_id
        JOIN talent.assessment_dimension dim
          ON dim.assessment_dimension_id = ear.assessment_dimension_id
        WHERE la.rn = 1
          AND ad.result_shape = 'NUMERIC_DIMENSION'
          AND ear.numeric_value IS NOT NULL
    )
    SELECT
        gen_random_uuid(),
        v_benchmark_id,
        'ASSESSMENT_NUMERIC',
        nr.assessment_code || ':' || nr.dimension_code,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY nr.numeric_value)::numeric,
        percentile_cont(0.25) WITHIN GROUP (ORDER BY nr.numeric_value)::numeric,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY nr.numeric_value)::numeric,
        NULL,
        NULL,
        count(DISTINCT nr.employee_id)::integer
    FROM numeric_results nr
    GROUP BY
        nr.assessment_code,
        nr.dimension_code;

    -- --------------------------------------------------------
    -- 1.J Benchmark ranked categorical assessments such as Strengths
    --     Store theme frequency and average rank.
    -- --------------------------------------------------------

    INSERT INTO talent.role_benchmark_metric (
        benchmark_metric_id,
        benchmark_id,
        evidence_type,
        metric_code,
        numeric_median,
        numeric_q1,
        numeric_q3,
        categorical_mode,
        distribution_json,
        metric_sample_size
    )
    WITH latest_assessment AS (
        SELECT
            ea.*,
            row_number() OVER (
                PARTITION BY ea.employee_id, ea.assessment_definition_id
                ORDER BY ea.assessment_date DESC, ea.employee_assessment_id DESC
            ) AS rn
        FROM talent.employee_assessment ea
        JOIN talent.role_benchmark_member bm
          ON bm.employee_id = ea.employee_id
         AND bm.benchmark_id = v_benchmark_id
        WHERE ea.assessment_date <= current_date
          AND (ea.valid_until IS NULL OR ea.valid_until >= current_date)
    ),
    ranked_results AS (
        SELECT
            la.employee_id,
            ad.assessment_code,
            ear.categorical_value AS theme,
            ear.rank_value
        FROM latest_assessment la
        JOIN talent.assessment_definition ad
          ON ad.assessment_definition_id = la.assessment_definition_id
        JOIN talent.employee_assessment_result ear
          ON ear.employee_assessment_id = la.employee_assessment_id
        WHERE la.rn = 1
          AND ad.result_shape = 'RANKED_CATEGORY'
          AND ear.categorical_value IS NOT NULL
          AND COALESCE(ear.rank_value, 999) <= 5
    ),
    assessed_population AS (
        SELECT
            assessment_code,
            count(DISTINCT employee_id)::numeric AS assessed_employees
        FROM ranked_results
        GROUP BY assessment_code
    ),
    theme_summary AS (
        SELECT
            rr.assessment_code,
            rr.theme,
            count(DISTINCT rr.employee_id)::numeric AS employee_count,
            avg(rr.rank_value)::numeric AS avg_rank
        FROM ranked_results rr
        GROUP BY
            rr.assessment_code,
            rr.theme
    )
    SELECT
        gen_random_uuid(),
        v_benchmark_id,
        'STRENGTH',
        ts.assessment_code || ':' || ts.theme,
        round(ts.employee_count / NULLIF(ap.assessed_employees, 0), 4),
        NULL,
        NULL,
        NULL,
        jsonb_build_object(
            'frequency',
            round(ts.employee_count / NULLIF(ap.assessed_employees, 0), 4),
            'avg_rank',
            round(ts.avg_rank, 2)
        ),
        ap.assessed_employees::integer
    FROM theme_summary ts
    JOIN assessed_population ap
      USING (assessment_code);

    -- --------------------------------------------------------
    -- 1.K Refresh app-ready benchmark mart
    -- --------------------------------------------------------

    DELETE FROM mart.role_success_benchmark
    WHERE target_role_id = p_job_role_id;

    INSERT INTO mart.role_success_benchmark (
        target_role_id,
        benchmark_id,
        benchmark_version,
        evidence_type,
        metric_code,
        numeric_median,
        numeric_q1,
        numeric_q3,
        categorical_mode,
        distribution_json,
        benchmark_sample_size
    )
    SELECT
        rbp.job_role_id,
        rbm.benchmark_id,
        rbp.benchmark_version,
        rbm.evidence_type,
        rbm.metric_code,
        rbm.numeric_median,
        rbm.numeric_q1,
        rbm.numeric_q3,
        rbm.categorical_mode,
        rbm.distribution_json,
        rbm.metric_sample_size
    FROM talent.role_benchmark_metric rbm
    JOIN talent.role_benchmark_profile rbp
      ON rbp.benchmark_id = rbm.benchmark_id
    WHERE rbm.benchmark_id = v_benchmark_id;

    RETURN v_benchmark_id;
END;
$$;

-- ============================================================
-- PHASE 2: SCORE INTERNAL EMPLOYEES FOR ONE INTERNAL VACANCY
-- ============================================================

CREATE OR REPLACE FUNCTION mart.refresh_internal_mobility_match(
    p_target_requisition_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    v_target_role_id uuid;
    v_benchmark_id uuid;
    v_benchmark_version text;
    v_config talent.mobility_scoring_config%ROWTYPE;
    v_inserted_rows integer;
BEGIN
    -- 2.A Resolve the target role from the vacancy.
    SELECT r.job_role_id
    INTO v_target_role_id
    FROM recruiting.requisition r
    WHERE r.requisition_id = p_target_requisition_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target requisition % does not exist', p_target_requisition_id;
    END IF;

    -- 2.B Resolve role-specific config, falling back to the global config.
    SELECT c.*
    INTO v_config
    FROM talent.mobility_scoring_config c
    WHERE c.active_flag = true
      AND c.valid_from <= current_date
      AND (c.valid_to IS NULL OR c.valid_to >= current_date)
      AND (c.job_role_id = v_target_role_id OR c.job_role_id IS NULL)
    ORDER BY
        CASE WHEN c.job_role_id = v_target_role_id THEN 0 ELSE 1 END,
        c.valid_from DESC,
        c.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No mobility scoring config for target role %', v_target_role_id;
    END IF;

    -- 2.C Use the active benchmark. If missing, build it first.
    SELECT
        rbp.benchmark_id,
        rbp.benchmark_version
    INTO
        v_benchmark_id,
        v_benchmark_version
    FROM talent.role_benchmark_profile rbp
    WHERE rbp.job_role_id = v_target_role_id
      AND rbp.benchmark_status = 'ACTIVE'
      AND rbp.valid_from <= current_date
      AND (rbp.valid_to IS NULL OR rbp.valid_to >= current_date)
    ORDER BY rbp.valid_from DESC, rbp.benchmark_version DESC
    LIMIT 1;

    IF v_benchmark_id IS NULL THEN
        v_benchmark_id := talent.refresh_role_benchmark(v_target_role_id);

        SELECT rbp.benchmark_version
        INTO v_benchmark_version
        FROM talent.role_benchmark_profile rbp
        WHERE rbp.benchmark_id = v_benchmark_id;
    END IF;

    -- Refresh only this selected vacancy.
    DELETE FROM mart.internal_mobility_match
    WHERE target_requisition_id = p_target_requisition_id;

    -- ========================================================
    -- PHASE 3: BUILD CANDIDATE EVIDENCE
    -- ========================================================

    INSERT INTO mart.internal_mobility_match (
        target_requisition_id,
        target_role_id,
        employee_id,
        benchmark_id,
        current_assignment_id,
        current_role_id,
        current_location_id,
        capability_coverage,
        role_requirement_fit,
        performance_score,
        performance_status,
        development_score,
        development_status,
        assessment_context_score,
        benchmark_alignment,
        critical_gap_count,
        required_gap_count,
        missing_required_assessment_count,
        final_readiness_score,
        readiness_status,
        recommended_next_step,
        scoring_config_version,
        benchmark_version,
        details_json,
        calculated_at
    )
    WITH
    -- --------------------------------------------------------
    -- 3.A Current active employee population
    -- --------------------------------------------------------
    current_assignment AS (
        SELECT DISTINCT ON (em.employee_id)
            em.employee_id,
            em.employment_id,
            ea.assignment_id,
            ea.job_role_id,
            ea.location_id,
            ea.org_unit_id,
            ea.valid_from
        FROM core.employment em
        JOIN core.employee e
          ON e.employee_id = em.employee_id
        JOIN core.employee_assignment ea
          ON ea.employment_id = em.employment_id
        WHERE e.employee_status::text = 'ACTIVE'
          AND em.employment_status::text = 'ACTIVE'
          AND ea.valid_from <= current_date
          AND (ea.valid_to IS NULL OR ea.valid_to >= current_date)
        ORDER BY
            em.employee_id,
            ea.valid_from DESC,
            ea.assignment_id
    ),
    candidate_population AS (
        SELECT ca.*
        FROM current_assignment ca
        WHERE ca.job_role_id <> v_target_role_id
    ),

    -- --------------------------------------------------------
    -- 3.B Approved target-role capability requirements
    -- --------------------------------------------------------
    role_requirement AS (
        SELECT
            rcr.capability_id,
            pl.level_rank::numeric AS target_rank,
            rcr.required_flag
        FROM talent.role_capability_requirement rcr
        JOIN talent.proficiency_level pl
          ON pl.level_id = rcr.target_level_id
        WHERE rcr.job_role_id = v_target_role_id
    ),

    -- --------------------------------------------------------
    -- 3.C Latest employee capability level
    -- --------------------------------------------------------
    latest_capability AS (
        SELECT DISTINCT ON (ca.employee_id, ca.capability_id)
            ca.employee_id,
            ca.capability_id,
            pl.level_rank::numeric AS current_rank,
            ca.assessment_date
        FROM talent.capability_assessment ca
        JOIN talent.proficiency_level pl
          ON pl.level_id = ca.assessed_level_id
        WHERE ca.assessment_date <= current_date
        ORDER BY
            ca.employee_id,
            ca.capability_id,
            ca.assessment_date DESC,
            ca.assessment_id DESC
    ),
    capability_detail AS (
        SELECT
            cp.employee_id,
            rr.capability_id,
            rr.target_rank,
            rr.required_flag,
            lc.current_rank,
            CASE
                WHEN lc.current_rank IS NULL THEN NULL
                WHEN rr.target_rank <= 0 THEN 1.0
                ELSE least(lc.current_rank / rr.target_rank, 1.0)
            END AS requirement_match,
            CASE
                WHEN lc.current_rank IS NULL THEN NULL
                ELSE greatest(rr.target_rank - lc.current_rank, 0)
            END AS gap_rank
        FROM candidate_population cp
        CROSS JOIN role_requirement rr
        LEFT JOIN latest_capability lc
          ON lc.employee_id = cp.employee_id
         AND lc.capability_id = rr.capability_id
    ),
    capability_aggregate AS (
        SELECT
            cd.employee_id,
            count(*)::integer AS requirement_count,
            count(cd.current_rank)::integer AS assessed_requirement_count,
            (
                count(cd.current_rank)::numeric
                / NULLIF(count(*)::numeric, 0)
            ) AS capability_coverage,
            avg(COALESCE(cd.requirement_match, 0.0))::numeric
                AS role_requirement_fit,
            count(*) FILTER (
                WHERE cd.required_flag = true
                  AND cd.current_rank IS NOT NULL
                  AND cd.current_rank < cd.target_rank
            )::integer AS required_gap_count,
            count(*) FILTER (
                WHERE cd.required_flag = true
                  AND cd.current_rank IS NULL
            )::integer AS missing_required_assessment_count,
            count(*) FILTER (
                WHERE cd.required_flag = true
                  AND cd.current_rank IS NOT NULL
                  AND cd.gap_rank >= v_config.critical_gap_rank_threshold
            )::integer AS critical_gap_count
        FROM capability_detail cd
        GROUP BY cd.employee_id
    ),

    -- --------------------------------------------------------
    -- 3.D Capability alignment to successful incumbents
    --     This is calibration, not the authoritative role target.
    -- --------------------------------------------------------
    benchmark_capability AS (
        SELECT
            replace(rbm.metric_code, 'CAPABILITY:', '')::uuid AS capability_id,
            rbm.numeric_median AS benchmark_rank
        FROM talent.role_benchmark_metric rbm
        WHERE rbm.benchmark_id = v_benchmark_id
          AND rbm.evidence_type = 'CAPABILITY'
          AND rbm.numeric_median IS NOT NULL
    ),
    capability_benchmark_alignment AS (
        SELECT
            cd.employee_id,
            avg(
                CASE
                    WHEN cd.current_rank IS NULL THEN NULL
                    WHEN bc.benchmark_rank IS NULL OR bc.benchmark_rank <= 0 THEN NULL
                    ELSE least(cd.current_rank / bc.benchmark_rank, 1.0)
                END
            )::numeric AS capability_benchmark_alignment
        FROM capability_detail cd
        LEFT JOIN benchmark_capability bc
          ON bc.capability_id = cd.capability_id
        GROUP BY cd.employee_id
    ),

    -- --------------------------------------------------------
    -- 3.E Recent performance
    -- --------------------------------------------------------
    ranked_performance AS (
        SELECT
            pr.employee_id,
            pr.overall_rating,
            pr.review_date,
            row_number() OVER (
                PARTITION BY pr.employee_id
                ORDER BY pr.review_date DESC NULLS LAST, pr.review_id DESC
            ) AS rn
        FROM performance.performance_review pr
        WHERE pr.overall_rating IS NOT NULL
          AND (pr.review_date IS NULL OR pr.review_date <= current_date)
    ),
    recent_performance AS (
        SELECT
            rp.employee_id,
            avg(rp.overall_rating)::numeric AS avg_recent_rating,
            count(*)::integer AS performance_cycles
        FROM ranked_performance rp
        WHERE rp.rn <= v_config.performance_cycles_to_use
        GROUP BY rp.employee_id
    ),
    performance_evidence AS (
        SELECT
            cp.employee_id,
            rp.avg_recent_rating,
            rp.performance_cycles,
            CASE
                WHEN rp.performance_cycles < v_config.min_performance_cycles
                    THEN NULL
                ELSE least(
                    greatest(
                        rp.avg_recent_rating
                        / NULLIF(v_config.performance_scale_max, 0),
                        0.0
                    ),
                    1.0
                )
            END::numeric AS performance_score
        FROM candidate_population cp
        LEFT JOIN recent_performance rp
          ON rp.employee_id = cp.employee_id
    ),
    benchmark_performance AS (
        SELECT rbm.numeric_median AS benchmark_performance_median
        FROM talent.role_benchmark_metric rbm
        WHERE rbm.benchmark_id = v_benchmark_id
          AND rbm.evidence_type = 'PERFORMANCE'
          AND rbm.metric_code = 'OVERALL_RATING'
        LIMIT 1
    ),
    performance_alignment AS (
        SELECT
            pe.employee_id,
            CASE
                WHEN pe.avg_recent_rating IS NULL THEN NULL
                WHEN bp.benchmark_performance_median IS NULL
                  OR bp.benchmark_performance_median <= 0 THEN NULL
                ELSE least(
                    pe.avg_recent_rating
                    / bp.benchmark_performance_median,
                    1.0
                )
            END::numeric AS performance_benchmark_alignment
        FROM performance_evidence pe
        CROSS JOIN benchmark_performance bp
    ),

    -- --------------------------------------------------------
    -- 3.F Development evidence
    -- --------------------------------------------------------
    target_plan AS (
        SELECT DISTINCT ON (dp.employee_id)
            dp.employee_id,
            dp.development_plan_id,
            dp.plan_status,
            dp.start_date
        FROM talent.development_plan dp
        WHERE dp.target_job_role_id = v_target_role_id
        ORDER BY
            dp.employee_id,
            CASE
                WHEN upper(dp.plan_status) IN ('ACTIVE', 'IN_PROGRESS', 'OPEN')
                    THEN 0
                ELSE 1
            END,
            dp.start_date DESC,
            dp.development_plan_id DESC
    ),
    plan_progress AS (
        SELECT
            tp.employee_id,
            tp.development_plan_id,
            count(da.action_id)::integer AS total_actions,
            count(da.action_id) FILTER (
                WHERE da.completed_at IS NOT NULL
            )::integer AS completed_actions
        FROM target_plan tp
        LEFT JOIN talent.development_action da
          ON da.development_plan_id = tp.development_plan_id
        GROUP BY
            tp.employee_id,
            tp.development_plan_id
    ),
    development_evidence AS (
        SELECT
            cp.employee_id,
            CASE
                WHEN COALESCE(ca.required_gap_count, 0) = 0
                    THEN 1.0
                WHEN pp.development_plan_id IS NULL
                    THEN 0.0
                WHEN pp.total_actions = 0
                    THEN 0.0
                ELSE
                    pp.completed_actions::numeric
                    / NULLIF(pp.total_actions::numeric, 0)
            END::numeric AS development_score,
            CASE
                WHEN COALESCE(ca.required_gap_count, 0) = 0
                    THEN 'NO_REQUIRED_GAP'
                WHEN pp.development_plan_id IS NULL
                    THEN 'NO_TARGET_ROLE_PLAN'
                WHEN pp.total_actions > 0
                 AND pp.completed_actions = pp.total_actions
                    THEN 'PLAN_COMPLETED'
                ELSE 'PLAN_IN_PROGRESS'
            END AS development_status
        FROM candidate_population cp
        LEFT JOIN capability_aggregate ca
          ON ca.employee_id = cp.employee_id
        LEFT JOIN plan_progress pp
          ON pp.employee_id = cp.employee_id
    ),

    -- --------------------------------------------------------
    -- 3.G Latest valid optional assessment context
    --     Only assessment types configured for the target role
    --     are eligible to contribute.
    -- --------------------------------------------------------
    latest_employee_assessment AS (
        SELECT
            ea.*,
            row_number() OVER (
                PARTITION BY ea.employee_id, ea.assessment_definition_id
                ORDER BY ea.assessment_date DESC, ea.employee_assessment_id DESC
            ) AS rn
        FROM talent.employee_assessment ea
        JOIN candidate_population cp
          ON cp.employee_id = ea.employee_id
        WHERE ea.assessment_date <= current_date
          AND (ea.valid_until IS NULL OR ea.valid_until >= current_date)
    ),
    eligible_role_assessment AS (
        SELECT
            rar.*,
            ad.assessment_code,
            ad.result_shape
        FROM talent.role_assessment_reference rar
        JOIN talent.assessment_definition ad
          ON ad.assessment_definition_id = rar.assessment_definition_id
        WHERE rar.job_role_id = v_target_role_id
          AND rar.use_type = 'SUPPORTING_CONTEXT'
          AND rar.valid_from <= current_date
          AND (rar.valid_to IS NULL OR rar.valid_to >= current_date)
    ),

    -- Categorical: candidate category is scored against the observed
    -- high-performer distribution, normalized so the most common
    -- observed category = 1.0. It is NOT a pass/fail rule.
    categorical_context AS (
        SELECT
            lea.employee_id,
            era.assessment_code,
            (
                COALESCE(
                    (rbm.distribution_json ->> ear.categorical_value)::numeric,
                    0.0
                )
                /
                NULLIF(
                    (
                        SELECT max(value::numeric)
                        FROM jsonb_each_text(rbm.distribution_json)
                    ),
                    0.0
                )
            )::numeric AS component_score,
            COALESCE(NULLIF(era.max_weight, 0), 1.0)::numeric
                AS component_weight
        FROM latest_employee_assessment lea
        JOIN eligible_role_assessment era
          ON era.assessment_definition_id = lea.assessment_definition_id
         AND era.result_shape = 'CATEGORICAL'
        JOIN talent.employee_assessment_result ear
          ON ear.employee_assessment_id = lea.employee_assessment_id
        JOIN talent.role_benchmark_metric rbm
          ON rbm.benchmark_id = v_benchmark_id
         AND rbm.evidence_type = 'ASSESSMENT_CATEGORICAL'
         AND rbm.metric_code = era.assessment_code
        WHERE lea.rn = 1
          AND ear.categorical_value IS NOT NULL
    ),

    -- Numeric dimensions such as PAPI:
    -- if a business contextual range exists, score 1 inside the range.
    -- otherwise score closeness to the incumbent benchmark median / IQR.
    numeric_context AS (
        SELECT
            lea.employee_id,
            era.assessment_code || ':' || dim.dimension_code AS metric_code,
            CASE
                WHEN ear.numeric_value IS NULL THEN NULL
                WHEN era.min_numeric IS NOT NULL
                 AND era.max_numeric IS NOT NULL
                 AND ear.numeric_value BETWEEN era.min_numeric AND era.max_numeric
                    THEN 1.0
                WHEN era.min_numeric IS NOT NULL
                 AND era.max_numeric IS NOT NULL
                    THEN greatest(
                        0.0,
                        1.0
                        - (
                            least(
                                abs(ear.numeric_value - era.min_numeric),
                                abs(ear.numeric_value - era.max_numeric)
                            )
                            /
                            greatest(
                                era.max_numeric - era.min_numeric,
                                1.0
                            )
                        )
                    )
                WHEN rbm.numeric_median IS NOT NULL
                    THEN greatest(
                        0.0,
                        1.0
                        - (
                            abs(ear.numeric_value - rbm.numeric_median)
                            /
                            greatest(
                                COALESCE(rbm.numeric_q3, rbm.numeric_median)
                                - COALESCE(rbm.numeric_q1, rbm.numeric_median),
                                1.0
                            )
                        )
                    )
                ELSE NULL
            END::numeric AS component_score,
            COALESCE(NULLIF(era.max_weight, 0), 1.0)::numeric
                AS component_weight
        FROM latest_employee_assessment lea
        JOIN eligible_role_assessment era
          ON era.assessment_definition_id = lea.assessment_definition_id
         AND era.result_shape = 'NUMERIC_DIMENSION'
        JOIN talent.employee_assessment_result ear
          ON ear.employee_assessment_id = lea.employee_assessment_id
        JOIN talent.assessment_dimension dim
          ON dim.assessment_dimension_id = ear.assessment_dimension_id
        LEFT JOIN talent.role_benchmark_metric rbm
          ON rbm.benchmark_id = v_benchmark_id
         AND rbm.evidence_type = 'ASSESSMENT_NUMERIC'
         AND rbm.metric_code =
             era.assessment_code || ':' || dim.dimension_code
        WHERE lea.rn = 1
          AND ear.numeric_value IS NOT NULL
          AND (
              era.assessment_dimension_id IS NULL
              OR era.assessment_dimension_id = dim.assessment_dimension_id
          )
    ),

    -- Ranked strengths:
    -- compare the employee's top 5 themes to how frequently those themes
    -- occur among successful incumbents. Higher-ranked employee themes
    -- receive more weight.
    strength_benchmark_max AS (
        SELECT
            split_part(rbm.metric_code, ':', 1) AS assessment_code,
            max(COALESCE(rbm.numeric_median, 0.0))::numeric
                AS max_benchmark_frequency
        FROM talent.role_benchmark_metric rbm
        WHERE rbm.benchmark_id = v_benchmark_id
          AND rbm.evidence_type = 'STRENGTH'
        GROUP BY split_part(rbm.metric_code, ':', 1)
    ),
    strength_context_raw AS (
        SELECT
            lea.employee_id,
            era.assessment_code,
            ear.categorical_value AS theme,
            ear.rank_value,
            COALESCE(rbm.numeric_median, 0.0)::numeric AS benchmark_frequency,
            COALESCE(sbm.max_benchmark_frequency, 0.0)::numeric
                AS max_benchmark_frequency,
            COALESCE(NULLIF(era.max_weight, 0), 1.0)::numeric
                AS component_weight
        FROM latest_employee_assessment lea
        JOIN eligible_role_assessment era
          ON era.assessment_definition_id = lea.assessment_definition_id
         AND era.result_shape = 'RANKED_CATEGORY'
        JOIN talent.employee_assessment_result ear
          ON ear.employee_assessment_id = lea.employee_assessment_id
        LEFT JOIN talent.role_benchmark_metric rbm
          ON rbm.benchmark_id = v_benchmark_id
         AND rbm.evidence_type = 'STRENGTH'
         AND rbm.metric_code =
             era.assessment_code || ':' || ear.categorical_value
        LEFT JOIN strength_benchmark_max sbm
          ON sbm.assessment_code = era.assessment_code
        WHERE lea.rn = 1
          AND ear.categorical_value IS NOT NULL
          AND COALESCE(ear.rank_value, 999) <= 5
    ),
    strength_context AS (
        SELECT
            scr.employee_id,
            scr.assessment_code,
            (
                sum(
                    CASE
                        WHEN scr.max_benchmark_frequency <= 0 THEN 0
                        ELSE
                            (
                                scr.benchmark_frequency
                                / scr.max_benchmark_frequency
                            )
                            *
                            greatest(
                                1.0,
                                6.0 - COALESCE(scr.rank_value, 5)
                            )
                    END
                )
                /
                NULLIF(
                    sum(
                        greatest(
                            1.0,
                            6.0 - COALESCE(scr.rank_value, 5)
                        )
                    ),
                    0.0
                )
            )::numeric AS component_score,
            max(scr.component_weight)::numeric AS component_weight
        FROM strength_context_raw scr
        GROUP BY
            scr.employee_id,
            scr.assessment_code
    ),
    assessment_components AS (
        SELECT
            employee_id,
            component_score,
            component_weight
        FROM categorical_context
        WHERE component_score IS NOT NULL

        UNION ALL

        SELECT
            employee_id,
            component_score,
            component_weight
        FROM numeric_context
        WHERE component_score IS NOT NULL

        UNION ALL

        SELECT
            employee_id,
            component_score,
            component_weight
        FROM strength_context
        WHERE component_score IS NOT NULL
    ),
    assessment_context AS (
        SELECT
            ac.employee_id,
            (
                sum(ac.component_score * ac.component_weight)
                /
                NULLIF(sum(ac.component_weight), 0.0)
            )::numeric AS assessment_context_score,
            count(*)::integer AS assessment_component_count
        FROM assessment_components ac
        GROUP BY ac.employee_id
    ),

    -- --------------------------------------------------------
    -- 3.H Benchmark alignment
    --     Diagnostic only. The approved role requirement fit remains
    --     the primary role-readiness anchor.
    -- --------------------------------------------------------
    benchmark_alignment AS (
        SELECT
            cp.employee_id,
            (
                (
                    COALESCE(cba.capability_benchmark_alignment, 0.0) * 0.70
                    + COALESCE(pa.performance_benchmark_alignment, 0.0) * 0.20
                    + COALESCE(ac.assessment_context_score, 0.0) * 0.10
                )
                /
                NULLIF(
                    (CASE
                        WHEN cba.capability_benchmark_alignment IS NOT NULL
                        THEN 0.70 ELSE 0 END)
                    + (CASE
                        WHEN pa.performance_benchmark_alignment IS NOT NULL
                        THEN 0.20 ELSE 0 END)
                    + (CASE
                        WHEN ac.assessment_context_score IS NOT NULL
                        THEN 0.10 ELSE 0 END),
                    0.0
                )
            )::numeric AS benchmark_alignment
        FROM candidate_population cp
        LEFT JOIN capability_benchmark_alignment cba
          ON cba.employee_id = cp.employee_id
        LEFT JOIN performance_alignment pa
          ON pa.employee_id = cp.employee_id
        LEFT JOIN assessment_context ac
          ON ac.employee_id = cp.employee_id
    ),

    -- --------------------------------------------------------
    -- PHASE 4: APPLY THE SUCCESS FORMULA
    --
    -- Prototype default:
    -- Capability          55%
    -- Performance         30%
    -- Development         10%
    -- Assessment context   5% max
    --
    -- If optional assessment context is absent, it is excluded
    -- from the denominator so the employee is not penalized.
    -- --------------------------------------------------------
    component_scores AS (
        SELECT
            cp.employee_id,
            cp.assignment_id,
            cp.job_role_id AS current_role_id,
            cp.location_id AS current_location_id,
            COALESCE(ca.capability_coverage, 0.0)::numeric
                AS capability_coverage,
            COALESCE(ca.role_requirement_fit, 0.0)::numeric
                AS role_requirement_fit,
            pe.performance_score,
            CASE
                WHEN pe.performance_score IS NULL
                    THEN 'INSUFFICIENT_EVIDENCE'
                WHEN pe.performance_score >= v_config.strong_performance_score
                    THEN 'STRONG'
                WHEN pe.performance_score >= v_config.minimum_performance_score
                    THEN 'MEETS'
                ELSE 'BELOW'
            END AS performance_status,
            de.development_score,
            de.development_status,
            ac.assessment_context_score,
            ba.benchmark_alignment,
            COALESCE(ca.critical_gap_count, 0)::integer
                AS critical_gap_count,
            COALESCE(ca.required_gap_count, 0)::integer
                AS required_gap_count,
            COALESCE(ca.missing_required_assessment_count, 0)::integer
                AS missing_required_assessment_count,
            (
                (
                    COALESCE(ca.role_requirement_fit, 0.0)
                        * v_config.capability_weight
                    + COALESCE(pe.performance_score, 0.0)
                        * v_config.performance_weight
                    + COALESCE(de.development_score, 0.0)
                        * v_config.development_weight
                    + COALESCE(ac.assessment_context_score, 0.0)
                        * v_config.assessment_context_weight
                )
                /
                NULLIF(
                    v_config.capability_weight
                    + CASE
                        WHEN pe.performance_score IS NOT NULL
                        THEN v_config.performance_weight
                        ELSE 0
                      END
                    + v_config.development_weight
                    + CASE
                        WHEN ac.assessment_context_score IS NOT NULL
                        THEN v_config.assessment_context_weight
                        ELSE 0
                      END,
                    0.0
                )
            )::numeric AS final_readiness_score
        FROM candidate_population cp
        LEFT JOIN capability_aggregate ca
          ON ca.employee_id = cp.employee_id
        LEFT JOIN performance_evidence pe
          ON pe.employee_id = cp.employee_id
        LEFT JOIN development_evidence de
          ON de.employee_id = cp.employee_id
        LEFT JOIN assessment_context ac
          ON ac.employee_id = cp.employee_id
        LEFT JOIN benchmark_alignment ba
          ON ba.employee_id = cp.employee_id
    ),

    -- --------------------------------------------------------
    -- PHASE 5: GOVERNED READINESS STATUS
    -- Score alone never decides the outcome.
    -- --------------------------------------------------------
    readiness_decision AS (
        SELECT
            cs.*,
            CASE
                WHEN cs.capability_coverage < v_config.min_capability_coverage
                  OR cs.missing_required_assessment_count > 0
                  OR cs.performance_score IS NULL
                    THEN 'INSUFFICIENT_DATA'

                WHEN cs.performance_score
                     < v_config.minimum_performance_score
                    THEN 'DEVELOPMENT_NEEDED'

                WHEN cs.critical_gap_count > 0
                    THEN 'DEVELOPMENT_NEEDED'

                WHEN cs.required_gap_count = 0
                 AND cs.final_readiness_score >= v_config.ready_threshold
                    THEN 'READY'

                WHEN cs.final_readiness_score >= v_config.near_ready_threshold
                 AND cs.critical_gap_count = 0
                    THEN 'NEAR_READY'

                ELSE 'DEVELOPMENT_NEEDED'
            END AS readiness_status
        FROM component_scores cs
    )

    SELECT
        p_target_requisition_id,
        v_target_role_id,
        rd.employee_id,
        v_benchmark_id,
        rd.assignment_id,
        rd.current_role_id,
        rd.current_location_id,
        rd.capability_coverage,
        rd.role_requirement_fit,
        rd.performance_score,
        rd.performance_status,
        rd.development_score,
        rd.development_status,
        rd.assessment_context_score,
        rd.benchmark_alignment,
        rd.critical_gap_count,
        rd.required_gap_count,
        rd.missing_required_assessment_count,
        rd.final_readiness_score,
        rd.readiness_status,
        CASE rd.readiness_status
            WHEN 'READY' THEN
                'Proceed to human internal selection; readiness is decision support, not automatic promotion.'
            WHEN 'NEAR_READY' THEN
                'Prioritize targeted development or a stretch assignment, then reassess.'
            WHEN 'INSUFFICIENT_DATA' THEN
                'Complete missing capability or performance evidence before interpreting readiness.'
            ELSE
                CASE
                    WHEN rd.performance_status = 'BELOW' THEN
                        'Strengthen demonstrated performance before internal selection.'
                    WHEN rd.critical_gap_count > 0 THEN
                        'Close critical target-role capability gaps before reassessment.'
                    ELSE
                        'Continue targeted capability development and reassess against the target role.'
                END
        END AS recommended_next_step,
        v_config.config_version,
        v_benchmark_version,
        jsonb_build_object(
            'weights', jsonb_build_object(
                'capability', v_config.capability_weight,
                'performance', v_config.performance_weight,
                'development', v_config.development_weight,
                'assessment_context', v_config.assessment_context_weight
            ),
            'thresholds', jsonb_build_object(
                'ready', v_config.ready_threshold,
                'near_ready', v_config.near_ready_threshold,
                'minimum_performance', v_config.minimum_performance_score,
                'minimum_capability_coverage', v_config.min_capability_coverage
            ),
            'governance', jsonb_build_object(
                'psychometric_is_supporting_only', true,
                'automatic_promotion', false,
                'benchmark_is_calibration_not_requirement', true
            )
        ),
        now()
    FROM readiness_decision rd;

    GET DIAGNOSTICS v_inserted_rows = ROW_COUNT;

    RETURN v_inserted_rows;
END;
$$;

-- ============================================================
-- PHASE 6: SAFE APP VIEW
-- ============================================================

CREATE OR REPLACE VIEW public.vw_internal_mobility_match AS
SELECT
    imm.target_requisition_id,
    imm.target_role_id,
    imm.employee_id,
    imm.current_role_id,
    imm.current_location_id,
    imm.capability_coverage,
    imm.role_requirement_fit,
    imm.performance_score,
    imm.performance_status,
    imm.development_score,
    imm.development_status,
    imm.assessment_context_score,
    imm.benchmark_alignment,
    imm.critical_gap_count,
    imm.required_gap_count,
    imm.missing_required_assessment_count,
    imm.final_readiness_score,
    imm.readiness_status,
    imm.recommended_next_step,
    imm.scoring_config_version,
    imm.benchmark_version,
    imm.calculated_at
FROM mart.internal_mobility_match imm;

-- ============================================================
-- PHASE 7: EXAMPLE EXECUTION
-- ============================================================

-- 1. Optional: manually rebuild the benchmark for a target role.
-- SELECT talent.refresh_role_benchmark(
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     'fc_leader_demo_v1'
-- );

-- 2. Refresh internal candidate matching for one selected vacancy.
-- SELECT mart.refresh_internal_mobility_match(
--     '00000000-0000-0000-0000-000000000000'::uuid
-- );

-- 3. Read the result for the app.
-- SELECT *
-- FROM public.vw_internal_mobility_match
-- WHERE target_requisition_id =
--     '00000000-0000-0000-0000-000000000000'::uuid
-- ORDER BY
--     CASE readiness_status
--         WHEN 'READY' THEN 1
--         WHEN 'NEAR_READY' THEN 2
--         WHEN 'DEVELOPMENT_NEEDED' THEN 3
--         ELSE 4
--     END,
--     final_readiness_score DESC NULLS LAST;

-- ============================================================
-- INTERPRETATION NOTES
-- ============================================================

-- This engine deliberately differs from a pure "similarity to high performers"
-- model. The approved role capability requirement is the main anchor.
--
-- High-performer benchmark:
--     empirical calibration
--
-- Capability + performance:
--     primary readiness evidence
--
-- Development:
--     evidence that identified gaps are being closed
--
-- DISC / MBTI / PAPI / Strengths:
--     optional supporting context only
--
-- A candidate with a different personality profile can still be Ready
-- if capability, performance, and critical requirements are met.
