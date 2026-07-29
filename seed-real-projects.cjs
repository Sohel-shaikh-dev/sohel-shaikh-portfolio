require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const realProjects = [
  {
    title: "Tailor Fabric Sales Analysis",
    slug: "tailor-fabric-sales-analysis",
    category: "Power BI / Data Analysis",
    description: "Comprehensive dashboard analyzing fabric sales performance, customer trends, and inventory optimization strategies.",
    github_link: "https://github.com/Sohel-shaikh-dev/Tailor-Fabric-Sales-Analysis",
    status: "published",
    is_active: true,
    display_order: 1
  },
  {
    title: "Mobile Sales Analysis",
    slug: "mobile-sales-analysis",
    category: "SQL / Power BI",
    description: "In-depth analysis of mobile device sales, market share, and revenue growth across different regions and demographics.",
    github_link: "https://github.com/Sohel-shaikh-dev/Mobile-Sales-Analysis",
    status: "published",
    is_active: true,
    display_order: 2
  },
  {
    title: "HR Diversity & Inclusion",
    slug: "hr-diversity-inclusion",
    category: "Data Visualization / HR",
    description: "Interactive dashboard visualizing workforce diversity metrics, hiring trends, and inclusion KPIs to drive organizational change.",
    github_link: "https://github.com/Sohel-shaikh-dev/HR-Diversity-Inclusion",
    status: "published",
    is_active: true,
    display_order: 3
  },
  {
    title: "Customer Churn Analysis",
    slug: "customer-churn-analysis",
    category: "SQL / Analytics",
    description: "Analyzed customer retention patterns to identify key churn drivers, providing actionable strategies to improve loyalty.",
    github_link: "https://github.com/Sohel-shaikh-dev/Customer-Churn-Analysis",
    status: "published",
    is_active: true,
    display_order: 4
  },
  {
    title: "Call Center Analysis",
    slug: "call-center-analysis",
    category: "Power Query / Excel",
    description: "Performance analysis tracking agent efficiency, call resolution times, and customer satisfaction scores across multiple channels.",
    github_link: "https://github.com/Sohel-shaikh-dev/Call-Center-Analysis",
    status: "published",
    is_active: true,
    display_order: 5
  },
  {
    title: "Bazm-E-Niswan Maharashtra",
    slug: "bazm-e-niswan-maharashtra",
    category: "Market Research",
    description: "Social impact analysis and demographic study for a community welfare organization operating across Maharashtra.",
    github_link: "https://github.com/Sohel-shaikh-dev/Bazm-E-Niswan-Maharashtra",
    status: "published",
    is_active: true,
    display_order: 6
  }
];

async function seed() {
  // Disable old demo projects
  console.log('Disabling old projects...');
  const { error: err1 } = await supabase.from('projects').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error('Error disabling old projects:', err1);

  console.log('Inserting real projects...');
  for (const p of realProjects) {
    const { data, error } = await supabase.from('projects').upsert([p], { onConflict: 'slug' });
    if (error) {
      console.error(`Error inserting ${p.title}:`, error);
    } else {
      console.log(`Successfully inserted ${p.title}`);
    }
  }
  console.log('Done!');
}

seed();
