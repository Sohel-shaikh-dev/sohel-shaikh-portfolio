import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectDetailsClient } from './ProjectDetailsClient'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('meta_title, meta_description, og_image, title, description')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!project) return {}

  const metaTitle = project.meta_title || `${project.title} - Project Details`
  const metaDescription = project.meta_description || project.description || `View details about the ${project.title} project.`
  
  let ogImage = ''
  if (project.og_image) {
    ogImage = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${project.og_image}`
  } else {
    ogImage = 'https://sohel-shaikh-portfolio.vercel.app/favicon.png'
  }

  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projects/${resolvedParams.slug}`

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [{ url: ogImage }],
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    }
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch the project with all relations
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      project_gallery (*),
      project_statistics (*),
      project_insights (*),
      project_technologies (*)
    `)
    .eq('slug', resolvedParams.slug)
    .single()

  if (!project) {
    notFound()
  }

  // Fetch prev/next projects for navigation
  const { data: allProjects } = await supabase
    .from('projects')
    .select('slug, title')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  let prevProject = null
  let nextProject = null

  if (allProjects && allProjects.length > 0) {
    const currentIndex = allProjects.findIndex(p => p.slug === resolvedParams.slug)
    if (currentIndex > 0) {
      prevProject = allProjects[currentIndex - 1]
    }
    if (currentIndex < allProjects.length - 1) {
      nextProject = allProjects[currentIndex + 1]
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": project.title,
            "headline": project.title,
            "description": project.description,
            "image": project.og_image ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${project.og_image}` : undefined,
            "author": {
              "@type": "Person",
              "name": "Sohel Shaikh"
            }
          })
        }}
      />
      <ProjectDetailsClient 
        project={project} 
        prevProject={prevProject} 
        nextProject={nextProject} 
      />
    </>
  )
}
