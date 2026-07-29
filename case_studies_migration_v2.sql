-- Case Studies Phase 2: Enterprise Upgrades

-- 1. Add new columns to case_studies
ALTER TABLE case_studies
ADD COLUMN IF NOT EXISTS modeling TEXT,
ADD COLUMN IF NOT EXISTS dax TEXT,
ADD COLUMN IF NOT EXISTS dashboard TEXT,
ADD COLUMN IF NOT EXISTS pbix_file_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_export_path TEXT,
ADD COLUMN IF NOT EXISTS github_link TEXT,
ADD COLUMN IF NOT EXISTS live_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_case_studies_updated_at ON case_studies;
CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON case_studies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. Create new relational tables for repeatable narrative content
CREATE TABLE IF NOT EXISTS case_study_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS case_study_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS case_study_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_case_study_recommendations_fk ON case_study_recommendations(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_challenges_fk ON case_study_challenges(case_study_id);
CREATE INDEX IF NOT EXISTS idx_case_study_learnings_fk ON case_study_learnings(case_study_id);

-- 5. Enable RLS and Policies
ALTER TABLE case_study_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_learnings ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Drops
DROP POLICY IF EXISTS "Public Read Access" ON case_study_recommendations;
DROP POLICY IF EXISTS "Public Read Access" ON case_study_challenges;
DROP POLICY IF EXISTS "Public Read Access" ON case_study_learnings;

DROP POLICY IF EXISTS "Admin Full Access" ON case_study_recommendations;
DROP POLICY IF EXISTS "Admin Full Access" ON case_study_challenges;
DROP POLICY IF EXISTS "Admin Full Access" ON case_study_learnings;

-- Public Read Access Policies
CREATE POLICY "Public Read Access" ON case_study_recommendations FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_study_challenges FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_study_learnings FOR SELECT USING (true);

-- Admin Full Access Policies
CREATE POLICY "Admin Full Access" ON case_study_recommendations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_study_challenges FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_study_learnings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
