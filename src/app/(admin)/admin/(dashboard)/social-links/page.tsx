import { getSocialLinks, addSocialLink, updateSocialLink, deleteSocialLink, reorderSocialLinks } from './actions'
import { SharedSocialLinksClient } from '@/components/admin/SharedSocialLinks/SharedSocialLinksClient'

export const metadata = {
  title: 'Footer Social Links | Admin',
}

export default async function SocialLinksPage() {
  const initialLinks = await getSocialLinks()

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight text-white">Footer Social Links</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Manage your digital presence</p>
      </div>
      
      <SharedSocialLinksClient 
        initialLinks={initialLinks} 
        actions={{
          add: addSocialLink,
          update: updateSocialLink,
          delete: deleteSocialLink,
          reorder: reorderSocialLinks
        }}
      />
    </div>
  )
}
