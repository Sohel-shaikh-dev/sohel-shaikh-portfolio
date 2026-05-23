'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSiteSettings() {
  const supabase = await createClient()
  
  // We expect only 1 row in site_settings
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
    console.error('Error fetching site settings:', error)
  }

  return data
}

export async function updateSiteSettings(formData: any) {
  const supabase = await createClient()
  
  // First check if a row exists
  const { data: existing } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single()

  let result;

  if (existing) {
    // Delete old CV if a new one was uploaded and the path has changed
    if (existing.cv_pdf_path && formData.cv_pdf_path && existing.cv_pdf_path !== formData.cv_pdf_path) {
      await supabase.storage.from('portfolio-media').remove([existing.cv_pdf_path])
    }

    result = await supabase
      .from('site_settings')
      .update(formData)
      .eq('id', existing.id)
  } else {
    result = await supabase
      .from('site_settings')
      .insert([formData])
  }

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function seedDemoData() {
  const supabase = await createClient()

  const demoProjects = [
    {
      title: "E-commerce Sales Dashboard",
      category: "Power BI / Tableau",
      description: "Interactive dashboard visualizing $2M+ in annual sales data with deep-drill capabilities into regions and categories.",
      is_featured: false,
      order: 1
    },
    {
      title: "Customer Segment Analysis",
      category: "SQL / Data Modeling",
      description: "Used K-Means clustering to segment user base into 5 distinct personas, increasing marketing ROI by 25%.",
      is_featured: false,
      order: 2
    },
    {
      title: "Financial Risk Assessment",
      category: "SQL / Excel Analytics",
      description: "Complex statistical model assessing credit risk for SME loans using historical repayment data and macro-economic factors.",
      is_featured: false,
      order: 3
    },
    {
      title: "Inventory Optimization Tool",
      category: "Power Query / Excel",
      description: "Reduced stockouts by 15% through a predictive inventory model using XGBoost on three years of supply chain data.",
      is_featured: false,
      order: 4
    },
    {
      title: "Healthcare Insights Engine",
      category: "Data Visualization",
      description: "A holistic view of patient recovery rates and clinic efficiency metrics across 12 different hospital locations.",
      is_featured: false,
      order: 5
    },
    {
      title: "Real Estate Market Trends",
      category: "Market Research",
      description: "Scraped and analyzed 50k+ property listings to identify undervalued investment zones in Tier-1 cities.",
      is_featured: false,
      order: 6
    }
  ];

  const demoCaseStudies = [
    {
      title: "Optimizing Supply Chain Through Predictive Analytics",
      subtitle: "Logistics Industry",
      challenge: "A leading retail chain was facing declining margins despite high footfall. They needed to identify price elasticity and optimal discount windows.",
      solution: "Implemented an advanced Power BI data model analyzing 5 years of transaction data. Created a real-time dashboard for monitoring of SKU performance.",
      result: "12% increase in overall quarterly revenue and 8% reduction in overstock inventory costs.",
      tags: ["DAX", "Data Modeling", "Power BI", "Retail"],
      order: 1
    },
    {
      title: "Healthcare Patient Flow Analysis",
      subtitle: "Operational Efficiency Study",
      challenge: "A multi-specialty hospital experienced bottleneck clusters in the emergency department, leading to long wait times and patient dissatisfaction.",
      solution: "Performed time-series analysis and queuing theory modeling on patient admission data. Identified specific hours where staffing didn't match demand.",
      key_result: "Reduced average patient wait time by 30% without increasing total staff headcount through better scheduling.",
      tags: ["Queuing Theory", "SQL", "Tableau", "Healthcare"],
      order: 2
    }
  ];

  const demoCertifications = [
    {
      title: "Google Data Analytics Professional Certificate",
      issuing_platform: "Coursera",
      date_earned: "2024-01-01",
      description: "Comprehensive curriculum covering data cleaning, visualization, and analysis using tools like R, SQL, and Tableau.",
      order: 1
    },
    {
      title: "Microsoft Certified: Power BI Data Analyst Associate",
      issuing_platform: "Microsoft",
      date_earned: "2024-01-01",
      description: "Advanced certification validating expertise in modeling, visualizing, and analyzing data with Power BI.",
      order: 2
    },
    {
      title: "SQL for Data Science",
      issuing_platform: "Coursera",
      date_earned: "2023-01-01",
      description: "Focused on complex query writing, performance optimization, and data extraction for analytical purposes.",
      order: 3
    }
  ];

  const demoExperiences = [
    {
      job_title: "Data Analyst",
      company_name: "Accenture",
      date_range: "Feb 2025 - May 2025",
      description: "Advised a hypothetical social media client by analyzing massive datasets. Evaluated 16 unique content categories to identify engagement trends, highlighting the 'animal' category as the most favored content type based on photo post volume.",
      order: 1
    },
    {
      job_title: "Power BI Developer",
      company_name: "PwC",
      date_range: "Oct 2024 - Feb 2025",
      description: "Designed Call Centre analytics reporting to track performance trends and customer ratings. Developed Churn Analysis dashboards using advanced DAX functions to support operational decision-making for 7000+ customers. Crafted Diversity & Inclusion reports to harmonize workforce data and highlight gender distribution metrics.",
      order: 2
    }
  ];

  // Insert if tables are empty
  const checkP = await supabase.from('projects').select('id').limit(1);
  if (checkP.data && checkP.data.length === 0) {
    await supabase.from('projects').insert(demoProjects);
  }

  const checkC = await supabase.from('case_studies').select('id').limit(1);
  if (checkC.data && checkC.data.length === 0) {
    await supabase.from('case_studies').insert(demoCaseStudies);
  }

  const checkCert = await supabase.from('certifications').select('id').limit(1);
  if (checkCert.data && checkCert.data.length === 0) {
    await supabase.from('certifications').insert(demoCertifications);
  }

  const checkE = await supabase.from('experiences').select('id').limit(1);
  if (checkE.data && checkE.data.length === 0) {
    await supabase.from('experiences').insert(demoExperiences);
  }

  revalidatePath('/')
  return { success: true }
}
