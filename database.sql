-- 1. Site Settings (Singleton)
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text,
  hero_subtitle text,
  hero_description text,
  hero_image_path text,
  availability_status text,
  about_description text,
  about_quote text,
  about_image_path text,
  stats_projects_done text,
  stats_happy_clients text,
  stats_success_rate text,
  cv_pdf_path text,
  contact_email text,
  contact_phone text,
  whatsapp_number text
);

-- 2. Projects (Power BI Desktop Centric)
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  description text,
  thumbnail_path text,
  dashboard_screenshots text[], -- Array of image paths
  pdf_export_path text,         -- Downloadable PDF
  pbix_file_path text,          -- Downloadable PBIX
  source_url text,
  "order" integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Case Studies
CREATE TABLE case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  challenge text,
  solution text,
  key_result text,
  cover_image_path text,
  tags text[],
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. Certifications
CREATE TABLE certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuing_platform text,
  date_earned text,
  description text,
  credential_url text,
  "order" integer DEFAULT 0
);

-- 5. Experiences
CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  job_title text NOT NULL,
  date_range text,
  description text,
  "order" integer DEFAULT 0
);

-- 6. Contact Messages
CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'UNREAD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Public Read Access Policies (Projects, Studies, Settings, etc.)
CREATE POLICY "Public Read Access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON case_studies FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON certifications FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON experiences FOR SELECT USING (true);

-- Admin Full Access Policies (Authenticated role only)
CREATE POLICY "Admin Full Access" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON case_studies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON certifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access" ON experiences FOR ALL USING (auth.role() = 'authenticated');

-- Contact Messages Policy
CREATE POLICY "Public Insert Access" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Manage Messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
