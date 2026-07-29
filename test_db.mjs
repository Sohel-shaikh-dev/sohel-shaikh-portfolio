import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching projects...");
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
     console.error("Fetch error:", error);
     return;
  }
  console.log("Found", data.length, "projects. Deleting them...");
  
  if (data.length > 0) {
      for (const p of data) {
          await supabase.from('projects').delete().eq('id', p.id);
      }
      console.log("Deleted all old projects.");
  }

  const newProjects = [
    {
      title: "Tailor Fabric Sales Analysis",
      category: "Power BI / Data Analysis",
      description: "Comprehensive dashboard analyzing fabric sales performance, customer trends, and inventory optimization strategies.",
      github_link: "https://github.com/Sohel-shaikh-dev/Tailor-Fabric-Sales-Analysis",
      order: 1
    },
    {
      title: "Mobile Sales Analysis",
      category: "SQL / Power BI",
      description: "In-depth analysis of mobile device sales, market share, and revenue growth across different regions and demographics.",
      github_link: "https://github.com/Sohel-shaikh-dev/Mobile-Sales-Analysis",
      order: 2
    },
    {
      title: "HR Diversity & Inclusion",
      category: "Data Visualization / HR",
      description: "Interactive dashboard visualizing workforce diversity metrics, hiring trends, and inclusion KPIs to drive organizational change.",
      github_link: "https://github.com/Sohel-shaikh-dev/HR-Diversity-Inclusion",
      order: 3
    },
    {
      title: "Customer Churn Analysis",
      category: "SQL / Analytics",
      description: "Analyzed customer retention patterns to identify key churn drivers, providing actionable strategies to improve loyalty.",
      github_link: "https://github.com/Sohel-shaikh-dev/Customer-Churn-Analysis",
      order: 4
    },
    {
      title: "Call Center Analysis",
      category: "Power Query / Excel",
      description: "Performance analysis tracking agent efficiency, call resolution times, and customer satisfaction scores across multiple channels.",
      github_link: "https://github.com/Sohel-shaikh-dev/Call-Center-Analysis",
      order: 5
    },
    {
      title: "Bazm-E-Niswan Maharashtra",
      category: "Market Research",
      description: "Social impact analysis and demographic study for a community welfare organization operating across Maharashtra.",
      github_link: "https://github.com/Sohel-shaikh-dev/Bazm-E-Niswan-Maharashtra",
      order: 6
    }
  ];

  console.log("Inserting real projects...");
  const { error: insertError } = await supabase.from('projects').insert(newProjects);
  if (insertError) {
      console.error("Insert error:", insertError);
  } else {
      console.log("Successfully inserted all real projects!");
  }
}
run();
