-- 1. Deactivate all existing demo projects so they no longer appear on the frontend
UPDATE projects 
SET is_active = false;

-- 2. Insert the real projects into the database
INSERT INTO projects (
  title, 
  slug, 
  category, 
  description, 
  github_link, 
  status, 
  is_active, 
  display_order
)
VALUES 
  (
    'Tailor Fabric Sales Analysis', 
    'tailor-fabric-sales-analysis', 
    'Power BI / Data Analysis', 
    'Comprehensive dashboard analyzing fabric sales performance, customer trends, and inventory optimization strategies.', 
    'https://github.com/Sohel-shaikh-dev/Tailor-Fabric-Sales-Analysis', 
    'published', 
    true, 
    1
  ),
  (
    'Mobile Sales Analysis', 
    'mobile-sales-analysis', 
    'SQL / Power BI', 
    'In-depth analysis of mobile device sales, market share, and revenue growth across different regions and demographics.', 
    'https://github.com/Sohel-shaikh-dev/Mobile-Sales-Analysis', 
    'published', 
    true, 
    2
  ),
  (
    'HR Diversity & Inclusion', 
    'hr-diversity-inclusion', 
    'Data Visualization / HR', 
    'Interactive dashboard visualizing workforce diversity metrics, hiring trends, and inclusion KPIs to drive organizational change.', 
    'https://github.com/Sohel-shaikh-dev/HR-Diversity-Inclusion', 
    'published', 
    true, 
    3
  ),
  (
    'Customer Churn Analysis', 
    'customer-churn-analysis', 
    'SQL / Analytics', 
    'Analyzed customer retention patterns to identify key churn drivers, providing actionable strategies to improve loyalty.', 
    'https://github.com/Sohel-shaikh-dev/Customer-Churn-Analysis', 
    'published', 
    true, 
    4
  ),
  (
    'Call Center Analysis', 
    'call-center-analysis', 
    'Power Query / Excel', 
    'Performance analysis tracking agent efficiency, call resolution times, and customer satisfaction scores across multiple channels.', 
    'https://github.com/Sohel-shaikh-dev/Call-Center-Analysis', 
    'published', 
    true, 
    5
  )
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  github_link = EXCLUDED.github_link,
  status = EXCLUDED.status,
  is_active = true,
  display_order = EXCLUDED.display_order;
