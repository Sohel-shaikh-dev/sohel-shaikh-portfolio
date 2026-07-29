-- 1. Alter case_studies table safely
ALTER TABLE case_studies
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS client_or_company_name TEXT,
ADD COLUMN IF NOT EXISTS problem_statement TEXT,
ADD COLUMN IF NOT EXISTS process TEXT,
ADD COLUMN IF NOT EXISTS results_or_outcomes TEXT,
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT,
ADD COLUMN IF NOT EXISTS data_cleaning TEXT,
ADD COLUMN IF NOT EXISTS business_impact TEXT,
ADD COLUMN IF NOT EXISTS recommendations TEXT,
ADD COLUMN IF NOT EXISTS challenges_faced TEXT,
ADD COLUMN IF NOT EXISTS learnings TEXT,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Backfill slugs and deactivate existing dummy case studies safely
UPDATE case_studies SET is_active = false WHERE slug IS NULL;
UPDATE case_studies SET slug = 'archived-' || id::text WHERE slug IS NULL;

-- Make slug UNIQUE safely (drop if exists first to be idempotent, though ADD CONSTRAINT IF NOT EXISTS is better on newer PG, we use standard approach)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_studies_slug_key') THEN
        ALTER TABLE case_studies ADD CONSTRAINT case_studies_slug_key UNIQUE (slug);
    END IF;
END $$;

-- 2. Restrict status column with a CHECK constraint
-- First sanitize existing data
UPDATE case_studies SET status = 'published' WHERE status NOT IN ('draft', 'published', 'archived') OR status IS NULL;

ALTER TABLE case_studies DROP CONSTRAINT IF EXISTS case_studies_status_check;
ALTER TABLE case_studies ADD CONSTRAINT case_studies_status_check CHECK (status IN ('draft', 'published', 'archived'));

-- 3. Collision-safe unique slug generation trigger
CREATE OR REPLACE FUNCTION generate_unique_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- If slug is provided and not empty, use it as base. Otherwise generate from title
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    base_slug := NEW.slug;
  ELSE
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
  END IF;

  new_slug := base_slug;

  -- Check for collisions and append suffix
  WHILE EXISTS (SELECT 1 FROM case_studies WHERE slug = new_slug AND id != NEW.id) LOOP
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_unique_case_study_slug ON case_studies;
CREATE TRIGGER ensure_unique_case_study_slug
BEFORE INSERT OR UPDATE OF title, slug ON case_studies
FOR EACH ROW
EXECUTE FUNCTION generate_unique_slug();

-- 4. Create relational tables
CREATE TABLE IF NOT EXISTS case_study_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS case_study_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS case_study_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS case_study_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS case_study_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_study_gallery_fk ON case_study_gallery(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_metrics_fk ON case_study_metrics(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_tools_fk ON case_study_tools(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_insights_fk ON case_study_insights(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_skills_fk ON case_study_skills(case_study_id);

-- 6. Enable RLS and Policies for new tables
ALTER TABLE case_study_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_skills ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Drops
DROP POLICY IF EXISTS "Public Read Access" ON case_study_gallery;
DROP POLICY IF EXISTS "Public Read Access" ON case_study_metrics;
DROP POLICY IF EXISTS "Public Read Access" ON case_study_tools;
DROP POLICY IF EXISTS "Public Read Access" ON case_study_insights;
DROP POLICY IF EXISTS "Public Read Access" ON case_study_skills;

DROP POLICY IF EXISTS "Admin Full Access" ON case_study_gallery;
DROP POLICY IF EXISTS "Admin Full Access" ON case_study_metrics;
DROP POLICY IF EXISTS "Admin Full Access" ON case_study_tools;
DROP POLICY IF EXISTS "Admin Full Access" ON case_study_insights;
DROP POLICY IF EXISTS "Admin Full Access" ON case_study_skills;

-- Public Read Access Policies
CREATE POLICY "Public Read Access" ON case_study_gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_study_metrics FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_study_tools FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_study_insights FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_study_skills FOR SELECT USING (true);

-- Admin Full Access Policies with WITH CHECK
CREATE POLICY "Admin Full Access" ON case_study_gallery FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_study_metrics FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_study_tools FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_study_insights FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_study_skills FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
