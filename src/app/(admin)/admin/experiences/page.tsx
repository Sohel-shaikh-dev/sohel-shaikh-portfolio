import { createClient } from '@/lib/supabase/server'
import { ExperienceForm } from '@/components/admin/ExperienceForm'
import { AnimatedCard } from '@/components/admin/AnimatedCard'
import { ActionButtons } from '@/components/admin/ActionButtons'
import { deleteExperience } from './actions'

export default async function ExperiencesAdminPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: experiences } = await supabase.from('experiences').select('*').order('order', { ascending: true })

  const editItem = searchParams.edit ? experiences?.find(e => e.id === searchParams.edit) : null

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">Manage Experience</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Update your professional timeline</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div>
          <ExperienceForm key={editItem?.id || 'new'} initialData={editItem} />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary"></span>
            Existing Experience
          </h3>
          <div className="flex flex-col gap-4">
            {experiences?.map((exp, index) => (
              <AnimatedCard key={exp.id} index={index} className="p-6 flex justify-between items-center group">
                <div>
                  <div className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{exp.job_title}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">{exp.company_name}</div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-xs font-bold px-4 py-2 rounded-full bg-background neumorphic-inner text-gray-300 whitespace-nowrap">
                    {exp.date_range}
                  </div>
                  <ActionButtons id={exp.id} editUrl={`/admin/experiences?edit=${exp.id}`} deleteAction={deleteExperience} />
                </div>
              </AnimatedCard>
            ))}
            {(!experiences || experiences.length === 0) && (
              <div className="bg-card rounded-[2rem] neumorphic p-12 text-center flex flex-col items-center justify-center">
                <span className="text-gray-500 font-bold uppercase tracking-widest mb-2">No experience found</span>
                <span className="text-sm text-gray-400">Add your first role to get started.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
