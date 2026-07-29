import { createClient } from '@/lib/supabase/server'
import { CaseStudyForm } from '@/components/admin/CaseStudyForm'
import { CaseStudyList } from './CaseStudyList'

export default async function CaseStudiesAdminPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  // Fetch case studies with relational data
  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select(`
      *,
      case_study_gallery(*),
      case_study_metrics(*),
      case_study_insights(*),
      case_study_recommendations(*),
      case_study_challenges(*),
      case_study_learnings(*)
    `)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Sort relational data by display_order where applicable
  const sortedCaseStudies = caseStudies?.map(study => ({
    ...study,
    case_study_gallery: study.case_study_gallery?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    case_study_metrics: study.case_study_metrics?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    case_study_insights: study.case_study_insights?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    case_study_recommendations: study.case_study_recommendations?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    case_study_challenges: study.case_study_challenges?.sort((a: any, b: any) => a.display_order - b.display_order) || [],
    case_study_learnings: study.case_study_learnings?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  })) || []

  const editItem = searchParams.edit ? sortedCaseStudies.find(s => s.id === searchParams.edit) : null

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">Manage Case Studies</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Showcase your analytics walkthroughs</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div>
          <CaseStudyForm key={editItem?.id || 'new'} initialData={editItem} />
        </div>
        
        <div>
          <CaseStudyList initialStudies={sortedCaseStudies} />
        </div>
      </div>
    </div>
  )
}
