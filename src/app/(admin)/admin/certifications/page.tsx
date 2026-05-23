import { createClient } from '@/lib/supabase/server'
import { CertificationForm } from '@/components/admin/CertificationForm'
import { AnimatedCard } from '@/components/admin/AnimatedCard'
import { ActionButtons } from '@/components/admin/ActionButtons'
import { deleteCertification } from './actions'

export default async function CertificationsAdminPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: certifications } = await supabase.from('certifications').select('*').order('order', { ascending: true })

  const editItem = searchParams.edit ? certifications?.find(c => c.id === searchParams.edit) : null

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">Manage Certifications</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Update your professional credentials</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div>
          <CertificationForm key={editItem?.id || 'new'} initialData={editItem} />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary"></span>
            Existing Certifications
          </h3>
          <div className="flex flex-col gap-4">
            {certifications?.map((cert, index) => (
              <AnimatedCard key={cert.id} index={index} className="p-6 flex justify-between items-center group">
                <div>
                  <div className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{cert.title}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">{cert.issuing_platform}</div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-xs font-bold px-4 py-2 rounded-full bg-background neumorphic-inner text-gray-300 whitespace-nowrap">
                    {cert.date_earned}
                  </div>
                  <ActionButtons id={cert.id} editUrl={`/admin/certifications?edit=${cert.id}`} deleteAction={deleteCertification} />
                </div>
              </AnimatedCard>
            ))}
            {(!certifications || certifications.length === 0) && (
              <div className="bg-card rounded-[2rem] neumorphic p-12 text-center flex flex-col items-center justify-center">
                <span className="text-gray-500 font-bold uppercase tracking-widest mb-2">No certifications found</span>
                <span className="text-sm text-gray-400">Add your first certification to get started.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
