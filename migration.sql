-- 1. Create a function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Extend the `projects` table
ALTER TABLE projects ADD COLUMN slug text;
-- Because the table is empty, we can safely add the constraint directly, but for safety in case there are rows, we'll do:
-- If there are rows, this would fail. We assume it's empty or we can add it without NOT NULL first.
-- Given I cleared it earlier, I will apply NOT NULL.
ALTER TABLE projects ALTER COLUMN slug SET NOT NULL;
ALTER TABLE projects ADD CONSTRAINT projects_slug_key UNIQUE (slug);
CREATE INDEX idx_projects_slug ON projects(slug);

ALTER TABLE projects ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE projects ADD COLUMN business_problem text;
ALTER TABLE projects ADD COLUMN solution text;
ALTER TABLE projects ADD COLUMN github_link text;
ALTER TABLE projects ADD COLUMN live_url text;
ALTER TABLE projects ADD COLUMN display_order integer DEFAULT 0;
ALTER TABLE projects ADD COLUMN status text DEFAULT 'published';
ALTER TABLE projects ADD COLUMN is_active boolean DEFAULT true;
ALTER TABLE projects ADD COLUMN meta_title text;
ALTER TABLE projects ADD COLUMN meta_description text;
ALTER TABLE projects ADD COLUMN og_image text;

-- 3. Create new relational tables with updated_at triggers
CREATE TABLE project_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
CREATE TRIGGER set_project_gallery_updated_at BEFORE UPDATE ON project_gallery FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE project_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
CREATE TRIGGER set_project_statistics_updated_at BEFORE UPDATE ON project_statistics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE project_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  insight text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
CREATE TRIGGER set_project_insights_updated_at BEFORE UPDATE ON project_insights FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE project_technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  technology text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
CREATE TRIGGER set_project_technologies_updated_at BEFORE UPDATE ON project_technologies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;

-- 5. Define Public Read Access Policies
CREATE POLICY "Public Read Access" ON project_gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON project_statistics FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON project_insights FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON project_technologies FOR SELECT USING (true);

-- 6. Define Strict Admin Write Policies
-- Note: Using auth.role() = 'authenticated' implies anyone who signs in can edit.
-- For a portfolio site where public signup is disabled, this effectively means ONLY the admin.
CREATE POLICY "Admin Full Access" ON project_gallery FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON project_statistics FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON project_insights FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON project_technologies FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
