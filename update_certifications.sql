-- Migration to add premium certificate features to certifications table

-- 1. Add missing columns
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS thumbnail_path text,
ADD COLUMN IF NOT EXISTS organization_logo_path text,
ADD COLUMN IF NOT EXISTS skills_learned text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS credential_id text,
ADD COLUMN IF NOT EXISTS pdf_file_path text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2. Update existing rows to have a valid created_at timestamp if null
UPDATE certifications SET created_at = now() WHERE created_at IS NULL;
