import { createClient } from '@/lib/supabase/server'
import { CaseStudyForm } from '@/components/admin/CaseStudyForm'
import { AnimatedCard } from '@/components/admin/AnimatedCard'
import { ActionButtons } from '@/components/admin/ActionButtons'
import { deleteCaseStudy } from './actions'

export default async function CaseStudiesAdminPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: caseStudies } = await supabase.from('case_studies').select('*').order('created_at', { ascending: false })

  const editItem = searchParams.edit ? caseStudies?.find(s => s.id === searchParams.edit) : null

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
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary"></span>
            Existing Case Studies
          </h3>
          <div className="flex flex-col gap-4">
            {caseStudies?.map((study, index) => (
              <AnimatedCard key={study.id} index={index} className="p-6 flex justify-between items-center group">
                <div>
                  <div className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{study.title}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">{study.subtitle}</div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-xs font-bold px-4 py-2 rounded-full bg-background neumorphic-inner text-gray-300 whitespace-nowrap">
                    {study.tags?.length || 0} Tags
                  </div>
                  <ActionButtons id={study.id} editUrl={`/admin/case-studies?edit=${study.id}`} deleteAction={deleteCaseStudy} />
                </div>
              </AnimatedCard>
            ))}
            {(!caseStudies || caseStudies.length === 0) && (
              <div className="bg-card rounded-[2rem] neumorphic p-12 text-center flex flex-col items-center justify-center">
                <span className="text-gray-500 font-bold uppercase tracking-widest mb-2">No case studies found</span>
                <span className="text-sm text-gray-400">Add your first case study to get started.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
