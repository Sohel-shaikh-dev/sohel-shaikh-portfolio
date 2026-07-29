import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ChevronRight, BarChart3, Target, Lightbulb, PenTool, BrainCircuit, Download, Github, ExternalLink, ArrowRight, BookOpen, AlertTriangle, FileText } from 'lucide-react'
import { CaseStudyGalleryClient } from '@/components/public/CaseStudyGalleryClient'
import Image from 'next/image'

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: study } = await supabase
    .from('case_studies')
    .select('meta_title, meta_description, og_image, title, short_description, cover_image_path, slug')
    .eq('slug', params.slug)
    .single()

  if (!study) return {}

  let imageUrl = ''
  if (study.og_image || study.cover_image_path) {
    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${study.og_image || study.cover_image_path}`
  } else {
    imageUrl = 'https://sohel-shaikh-portfolio.vercel.app/favicon.png'
  }
  const title = study.meta_title || `${study.title} | Case Study`
  const description = study.meta_description || study.short_description || `Read about the ${study.title} case study.`
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/case-studies/${study.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  }
}

export default async function CaseStudyPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ preview?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const isPreview = searchParams.preview === 'true';
  const supabase = await createClient()
  
  const { data: study } = await supabase
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
    .eq('slug', params.slug)
    .single()

  if (!study || (!study.is_active && !isPreview && study.status !== 'published')) {
    notFound()
  }

  // Fetch all active case studies for prev/next and related
  const { data: allStudies } = await supabase
    .from('case_studies')
    .select('id, slug, title, tags, cover_image_path, short_description')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('order', { ascending: true })
    .order('created_at', { ascending: false })

  const currentIndex = allStudies?.findIndex(s => s.id === study.id) ?? -1;
  const prevStudy = currentIndex > 0 ? allStudies?.[currentIndex - 1] : null;
  const nextStudy = currentIndex !== -1 && currentIndex < (allStudies?.length || 0) - 1 ? allStudies?.[currentIndex + 1] : null;

  const relatedStudies = allStudies?.filter(s => 
    s.id !== study.id && 
    s.tags?.some((t: string) => study.tags?.includes(t))
  ).slice(0, 2) || [];

  // Sort relational data
  const gallery = study.case_study_gallery?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  const metrics = study.case_study_metrics?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  const insights = study.case_study_insights?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  const recommendations = study.case_study_recommendations?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  const challenges = study.case_study_challenges?.sort((a: any, b: any) => a.display_order - b.display_order) || []
  const learnings = study.case_study_learnings?.sort((a: any, b: any) => a.display_order - b.display_order) || []

  const Section = ({ title, content, icon: Icon }: any) => {
    if (!content) return null;
    return (
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          {Icon && <Icon className="text-primary" size={24} />}
          {title}
        </h3>
        <div className="text-gray-400 leading-relaxed text-lg whitespace-pre-line border-l-2 border-white/5 pl-6 py-2">
          {content}
        </div>
      </div>
    );
  };

  const getMediaUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/${path}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": study.title,
            "headline": study.title,
            "description": study.short_description || study.meta_description,
            "image": study.cover_image_path ? getMediaUrl(study.cover_image_path) : undefined,
            "author": {
              "@type": "Person",
              "name": "Sohel Shaikh"
            }
          })
        }}
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Preview Banner */}
      {isPreview && (
        <div className="fixed top-0 left-0 w-full bg-orange-500/20 border-b border-orange-500/50 text-orange-400 text-center py-2 text-xs font-bold uppercase tracking-widest z-[100] backdrop-blur-md">
          Preview Mode - This case study is currently a draft
        </div>
      )}

      {/* Hero Section */}
      <div className={`w-full max-w-5xl mx-auto px-6 pb-16 ${isPreview ? 'pt-40' : 'pt-32'}`}>
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs mb-10 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
        </Link>
        
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-primary"></div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{study.client_or_company_name || 'Case Study'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {study.github_link && (
              <a href={study.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-card border border-white/5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:border-white/20 transition-all">
                <Github size={14} /> GitHub
              </a>
            )}
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight tracking-tight">
          {study.title}
        </h1>
        
        {study.short_description && (
          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mb-12">
            {study.short_description}
          </p>
        )}

        {study.cover_image_path && (
          <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-card neumorphic border border-white/5 relative mb-16 shadow-2xl">
            <Image 
              src={getMediaUrl(study.cover_image_path)} 
              alt={study.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content (Narrative Flow) */}
          <div className="lg:col-span-8">
            <Section title="Overview" content={study.overview} icon={FileText} />
            <Section title="Problem Statement" content={study.problem_statement} icon={Target} />
            <Section title="Objectives" content={study.objectives} icon={Target} />
            
            {(study.data_source || study.data_cleaning) && (
              <div className="mb-16 p-8 rounded-3xl bg-card border border-white/5 neumorphic">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><BarChart3 className="text-primary"/> Dataset & Cleaning</h3>
                <div className="space-y-6">
                  {study.data_source && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Data Source</h4>
                      <p className="text-gray-300 leading-relaxed">{study.data_source}</p>
                    </div>
                  )}
                  {study.data_cleaning && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Data Cleaning & Prep</h4>
                      <p className="text-gray-300 leading-relaxed">{study.data_cleaning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Section title="Modeling & DAX" content={study.process} icon={BrainCircuit} />
            
            {/* Metrics Grid (Dynamic KPI Builder) */}
            {metrics.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Target className="text-primary"/> Key Performance Indicators</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.map((m: any, i: number) => (
                    <div key={i} className="bg-card rounded-3xl p-6 neumorphic-inner border border-white/5 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors">
                      <div className="text-2xl md:text-3xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform">{m.value}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {insights.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Lightbulb className="text-primary"/> Key Insights</h3>
                <div className="space-y-4">
                  {insights.map((insight: any, i: number) => (
                    <div key={i} className="flex gap-4 p-6 rounded-2xl bg-background border border-white/5 neumorphic-inner">
                      <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                      <p className="text-gray-300 leading-relaxed">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Target className="text-primary"/> Recommendations</h3>
                <div className="space-y-4">
                  {recommendations.map((rec: any, i: number) => (
                    <div key={i} className="flex gap-4 p-6 rounded-2xl bg-background border border-white/5 neumorphic-inner">
                      <ChevronRight className="text-primary shrink-0 mt-1" size={20} />
                      <p className="text-gray-300 leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Section title="Business Impact" content={study.business_impact} icon={Target} />

            {(challenges.length > 0 || learnings.length > 0) && (
              <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                {challenges.length > 0 && (
                  <div className="p-8 rounded-3xl bg-background border border-white/5 neumorphic-inner">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="text-orange-500" size={20}/> Challenges Faced</h3>
                    <ul className="space-y-4">
                      {challenges.map((c: any, i: number) => (
                        <li key={i} className="text-gray-400 text-sm leading-relaxed pl-4 border-l border-white/10">{c.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {learnings.length > 0 && (
                  <div className="p-8 rounded-3xl bg-background border border-white/5 neumorphic-inner">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="text-green-500" size={20}/> Learnings</h3>
                    <ul className="space-y-4">
                      {learnings.map((l: any, i: number) => (
                        <li key={i} className="text-gray-400 text-sm leading-relaxed pl-4 border-l border-white/10">{l.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="p-8 rounded-3xl bg-card border border-white/5 neumorphic sticky top-32">
              {study.tags && study.tags.length > 0 && (
                <div className="mb-8 pb-8 border-b border-white/5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.tags.map((t: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-background rounded-lg text-xs font-bold text-gray-300 uppercase tracking-wider border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Gallery */}
        <CaseStudyGalleryClient gallery={gallery} />

        {/* Related Case Studies */}
        {relatedStudies.length > 0 && (
          <div className="mt-24 pt-16 border-t border-white/5">
            <h3 className="text-2xl font-bold text-white mb-8">Related Studies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedStudies.map((rel: any) => (
                <Link key={rel.id} href={`/case-studies/${rel.slug}`} className="flex items-center gap-6 p-6 bg-card rounded-2xl border border-white/5 neumorphic group hover:border-white/20 transition-all">
                  {rel.cover_image_path && (
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative">
                      <Image src={getMediaUrl(rel.cover_image_path)} alt={rel.title} fill sizes="(max-width: 768px) 100vw, 240px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{rel.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{rel.short_description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  )
}
