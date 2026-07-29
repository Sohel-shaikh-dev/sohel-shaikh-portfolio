-- Case Studies Phase 3: Simplification and Alignment with Projects Module

-- 1. Drop unused columns from case_studies
ALTER TABLE case_studies DROP COLUMN IF EXISTS pbix_file_path;
ALTER TABLE case_studies DROP COLUMN IF EXISTS pdf_export_path;
ALTER TABLE case_studies DROP COLUMN IF EXISTS live_url;
ALTER TABLE case_studies DROP COLUMN IF EXISTS modeling;
ALTER TABLE case_studies DROP COLUMN IF EXISTS dax;
ALTER TABLE case_studies DROP COLUMN IF EXISTS dashboard;

-- 2. Add new columns
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 3. Drop unused tables (Skills & Tools)
DROP TABLE IF EXISTS case_study_skills;
DROP TABLE IF EXISTS case_study_tools;
