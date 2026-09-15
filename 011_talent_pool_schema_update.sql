-- FIT HUB People Intelligence
-- Migration: 011_talent_pool_schema_update.sql
-- Enhance public.synthetic_talent_pool with form submission attributes

ALTER TABLE public.synthetic_talent_pool
    ADD COLUMN IF NOT EXISTS phone character varying(30),
    ADD COLUMN IF NOT EXISTS email character varying(100),
    ADD COLUMN IF NOT EXISTS gym_experience_level character varying(50) DEFAULT 'Experienced',
    ADD COLUMN IF NOT EXISTS experience_years numeric(3,1) DEFAULT 1.5,
    ADD COLUMN IF NOT EXISTS education_level character varying(50) DEFAULT 'Bachelor Degree',
    ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS availability_status character varying(50) DEFAULT 'Immediate',
    ADD COLUMN IF NOT EXISTS willing_to_relocate boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS application_date date DEFAULT current_date - interval '14 days',
    ADD COLUMN IF NOT EXISTS profile_summary text;

-- Update existing 8 records with rich profile data
UPDATE public.synthetic_talent_pool
SET phone = '+62 812-3456-7890',
    email = 'dananjaya.made@email.com',
    gym_experience_level = 'Non-Gym Frontline',
    experience_years = 2.0,
    education_level = 'Diploma in Hospitality',
    certifications = '["Member Service SOP", "POS & Cashier Protocol", "Club Safety Protocol"]'::jsonb,
    availability_status = 'Immediate',
    willing_to_relocate = false,
    application_date = '2024-08-14',
    profile_summary = 'Ex-hotel front desk with 2 years member-facing hospitality experience in Kuta. High verbal fluency and service protocol readiness.'
WHERE candidate_id = 'CAN-BLI-041';

UPDATE public.synthetic_talent_pool
SET phone = '+62 813-8899-1122',
    email = 'ketut.arimbawa@email.com',
    gym_experience_level = 'Gym Experienced',
    experience_years = 3.0,
    education_level = 'Bachelor in Sports Science',
    certifications = '["APKI Certified Fitness Trainer", "CPR/AED Level 2", "Functional Movement"]'::jsonb,
    availability_status = 'Immediate',
    willing_to_relocate = true,
    application_date = '2024-08-18',
    profile_summary = '3 years personal training at local boutique studio in Denpasar. Referred by Sunset Road Senior Trainer. Certified APKI & ready for immediate club audition.'
WHERE candidate_id = 'CAN-BLI-045';

UPDATE public.synthetic_talent_pool
SET phone = '+62 819-0123-4567',
    email = 'putu.ayu.lestari@email.com',
    gym_experience_level = 'Non-Gym Frontline',
    experience_years = 2.5,
    education_level = 'Bachelor in Communications',
    certifications = '["B2C Direct Sales Masterclass", "CRM Lead Tracking", "Consultative Selling"]'::jsonb,
    availability_status = '2 Weeks Notice',
    willing_to_relocate = false,
    application_date = '2024-08-20',
    profile_summary = 'Ex-hospitality membership sales coordinator in Seminyak with high lead conversion track record. Completed asynchronous sales pitch demo.'
WHERE candidate_id = 'CAN-BLI-052';

UPDATE public.synthetic_talent_pool
SET phone = '+62 811-9876-5432',
    email = 'rizky.bayu@email.com',
    gym_experience_level = 'Gym Experienced',
    experience_years = 2.0,
    education_level = 'Bachelor in Business Admin',
    certifications = '["Retail Inventory & POS", "Member Service SOP", "Incident Reporting Protocol"]'::jsonb,
    availability_status = 'Immediate',
    willing_to_relocate = false,
    application_date = '2024-08-12',
    profile_summary = 'Prior front desk operations lead at commercial gym in Gubeng Surabaya. High readiness to deploy directly to Pakuwon or Merr branch.'
WHERE candidate_id = 'CAN-SBY-078';

UPDATE public.synthetic_talent_pool
SET phone = '+62 812-7766-5544',
    email = 'bayu.anggoro@email.com',
    gym_experience_level = 'Gym Experienced',
    experience_years = 1.5,
    education_level = 'Sports Science Certificate',
    certifications = '["Rai Institute PT Foundation", "Client Assessment", "Basic First Aid"]'::jsonb,
    availability_status = '2 Weeks Notice',
    willing_to_relocate = true,
    application_date = '2024-08-16',
    profile_summary = 'Fitness community trainer with Rai Institute certification. Demonstrated strong client rapport and mobility technique.'
WHERE candidate_id = 'CAN-SBY-083';

UPDATE public.synthetic_talent_pool
SET phone = '+62 815-4433-2211',
    email = 'anisa.rahmawati@email.com',
    gym_experience_level = 'Non-Gym Frontline',
    experience_years = 2.0,
    education_level = 'Diploma in Management',
    certifications = '["Cash Management & SOP", "Customer Care Protocol", "Shift Coordination"]'::jsonb,
    availability_status = 'Immediate',
    willing_to_relocate = false,
    application_date = '2024-08-21',
    profile_summary = 'Internal staff referral. 2 years customer service in retail chain with verified background check.'
WHERE candidate_id = 'CAN-JKB-102';

UPDATE public.synthetic_talent_pool
SET phone = '+62 817-2233-4455',
    email = 'bagas.wicaksono@email.com',
    gym_experience_level = 'Non-Gym Frontline',
    experience_years = 1.0,
    education_level = 'Bachelor in Marketing',
    certifications = '["Front Desk Administration", "Member Service Protocol", "Equipment Safety"]'::jsonb,
    availability_status = 'Immediate',
    willing_to_relocate = true,
    application_date = '2024-08-10',
    profile_summary = 'Runner-up finalist for Q2 BSD requisition. Highly motivated to fill open slot in Tangerang cluster.'
WHERE candidate_id = 'CAN-TNG-115';

UPDATE public.synthetic_talent_pool
SET phone = '+62 818-9988-7766',
    email = 'deri.kurniawan@email.com',
    gym_experience_level = 'Gym Experienced',
    experience_years = 1.5,
    education_level = 'Diploma in Sports Recreation',
    certifications = '["Member Service SOP", "Basic First Aid", "Shift Operations"]'::jsonb,
    availability_status = '2 Weeks Notice',
    willing_to_relocate = false,
    application_date = '2024-08-19',
    profile_summary = 'Frontline operations at student fitness center in Dago Bandung. Ready for club operations interview.'
WHERE candidate_id = 'CAN-BDG-128';

-- Insert 4 additional diverse candidates to guarantee cluster coverage
INSERT INTO public.synthetic_talent_pool (
    candidate_id, display_name, role_target, location_preference,
    readiness_status, source_channel, fit_score, verified_competencies,
    est_ttf_days, last_activity_date, notes, data_provenance,
    phone, email, gym_experience_level, experience_years, education_level,
    certifications, availability_status, willing_to_relocate, application_date, profile_summary
)
VALUES
(
    'CAN-JKB-105', 'Ferry Sanjaya', 'Personal Trainer', 'Jakarta Barat',
    'Active Pool', 'Referral Pipeline', 92.00,
    '["Strength Conditioning", "Biomechanics Analysis", "APKI Certified Trainer"]'::jsonb,
    8, '2024-08-22', 'Recommended by Kebon Jeruk Head Coach, competitive powerlifting background with APKI cert.', 'SYNTHETIC_ENABLER',
    '+62 812-9900-1122', 'ferry.sanjaya@email.com', 'Gym Experienced', 3.5, 'Bachelor in Physical Education',
    '["APKI Level 1", "CPR/AED", "Rehabilitation Basics"]'::jsonb, 'Immediate', false, '2024-08-15',
    '3.5 years PT experience in West Jakarta commercial fitness centers. Proven retention rate of 88% on renewal clients.'
),
(
    'CAN-JKB-108', 'Cindy Claudia', 'Fitness Consultant', 'Jakarta Barat',
    'Active Pool', 'Direct Career Site', 89.00,
    '["B2C Direct Sales", "Consultative Negotiation", "Sales Target Discipline"]'::jsonb,
    9, '2024-08-23', 'Ex-telecom premium package consultant, high closing rate in Tanjung Duren area.', 'SYNTHETIC_ENABLER',
    '+62 813-2211-9988', 'cindy.claudia@email.com', 'Non-Gym Frontline', 2.0, 'Bachelor in Marketing',
    '["B2C Consultative Selling", "CRM Master"]'::jsonb, 'Immediate', false, '2024-08-17',
    'Proven track record achieving 120% target as telecom consultant. Energetic approach to gym membership demos.'
),
(
    'CAN-TNG-120', 'Galih Pratama', 'Personal Trainer', 'Tangerang',
    'Active Pool', 'Alumni Network', 88.00,
    '["Functional Movement", "Client Motivation", "Nutrition Guidance"]'::jsonb,
    11, '2024-08-24', 'Sports coaching alumni with strong nutrition advisory and client onboarding skills.', 'SYNTHETIC_ENABLER',
    '+62 817-4455-6677', 'galih.pratama@email.com', 'Gym Experienced', 2.0, 'Bachelor in Sports Science',
    '["Rai Institute Certified", "Sport Nutrition Foundation"]'::jsonb, 'Immediate', true, '2024-08-19',
    '2 years freelance PT in BSD Tangerang area. Excellent communication and client motivation skills.'
),
(
    'CAN-BDG-132', 'Farhan Fauzi', 'Personal Trainer', 'Bandung',
    'Active Pool', 'Ex-Finalist Pool', 91.00,
    '["Strength Conditioning", "Client Assessment", "First Aid Protocol"]'::jsonb,
    9, '2024-08-25', 'Runner up candidate from July Bandung expansion wave, ready for immediate deployment in Riau or Buah Batu.', 'SYNTHETIC_ENABLER',
    '+62 818-3322-1100', 'farhan.fauzi@email.com', 'Gym Experienced', 2.5, 'Bachelor in Sports Education',
    '["APKI Certified PT", "CPR First Aid"]'::jsonb, 'Immediate', false, '2024-08-16',
    '2.5 years gym instructor experience in Bandung. Passed all theoretical tests with 94 score.'
)
ON CONFLICT (candidate_id) DO UPDATE
SET phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    gym_experience_level = EXCLUDED.gym_experience_level,
    experience_years = EXCLUDED.experience_years,
    education_level = EXCLUDED.education_level,
    certifications = EXCLUDED.certifications,
    availability_status = EXCLUDED.availability_status,
    willing_to_relocate = EXCLUDED.willing_to_relocate,
    application_date = EXCLUDED.application_date,
    profile_summary = EXCLUDED.profile_summary;
