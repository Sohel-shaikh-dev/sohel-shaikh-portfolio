import { getDeveloperSocialLinks, addDeveloperSocialLink, updateDeveloperSocialLink, deleteDeveloperSocialLink, reorderDeveloperSocialLinks } from './actions'
import { SharedSocialLinksClient } from '@/components/admin/SharedSocialLinks/SharedSocialLinksClient'

export const metadata = {
  title: 'Developer Social Links | Admin',
}

export default async function DeveloperSocialLinksPage() {
  const initialLinks = await getDeveloperSocialLinks()

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight text-white">Developer Social Links</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Connect with me section in About Developer modal</p>
      </div>
      
      <SharedSocialLinksClient 
        initialLinks={initialLinks} 
        actions={{
          add: addDeveloperSocialLink,
          update: updateDeveloperSocialLink,
          delete: deleteDeveloperSocialLink,
          reorder: reorderDeveloperSocialLinks
        }}
      />
    </div>
  )
}
