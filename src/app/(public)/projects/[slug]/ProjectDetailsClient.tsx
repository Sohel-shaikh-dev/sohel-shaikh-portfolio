'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Github, ChevronLeft, ChevronRight, Layout, CheckCircle2, TrendingUp } from 'lucide-react'

export function ProjectDetailsClient({ project, prevProject, nextProject }: { project: any, prevProject: any, nextProject: any }) {
  const router = useRouter();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const getImageUrl = (path: string) => path ? `${supabaseUrl}/storage/v1/object/public/portfolio-media/${path}` : ''

  const heroImage = getImageUrl(project.thumbnail_path) || 'https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=1200'

  // Sort related data
  const gallery = [...(project.project_gallery || [])].sort((a, b) => a.sort_order - b.sort_order)
  const stats = [...(project.project_statistics || [])].sort((a, b) => a.sort_order - b.sort_order)
  const insights = [...(project.project_insights || [])].sort((a, b) => a.sort_order - b.sort_order)
  const tech = project.project_technologies || []

  return (
    <div className="min-h-screen bg-background text-white pb-20">
      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <a 
          href="/#projects"
          onClick={(e) => {
            e.preventDefault();
            const referrer = document.referrer;
            const origin = window.location.origin;
            if (referrer === origin + '/' || referrer === origin + '/#projects' || referrer === origin + '/#casestudy') {
              window.history.back();
            } else {
              router.push('/#projects');
            }
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} /> Back to Portfolio
        </a>
        <div className="flex gap-4">
          {project.github_link && (
            <a 
              href={project.github_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10 text-xs font-bold"
            >
              <Github size={14} /> Source
            </a>
          )}
          {project.live_url && (
            <a 
              href={project.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors text-xs font-bold shadow-[0_0_15px_rgba(255,1,79,0.3)]"
            >
              <ExternalLink size={14} /> Live Demo
            </a>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-32 px-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">{project.category}</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8">{project.title}</h1>
          
          <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden neumorphic-inner border border-white/5 mb-12 shadow-2xl">
            <Image 
              src={heroImage} 
              alt={project.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-card rounded-3xl neumorphic border border-white/5">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Layout className="text-primary" size={20} /> Project Overview</h3>
                <p className="text-gray-400 leading-relaxed">{project.description}</p>
              </div>
              
              {project.business_problem && (
                <div>
                  <h3 className="text-xl font-bold mb-3 text-red-400">The Problem</h3>
                  <p className="text-gray-400 leading-relaxed">{project.business_problem}</p>
                </div>
              )}

              {project.solution && (
                <div>
                  <h3 className="text-xl font-bold mb-3 text-green-400">The Solution</h3>
                  <p className="text-gray-400 leading-relaxed">{project.solution}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {tech.length > 0 ? tech.map((t: any) => (
                  <span key={t.id} className="px-3 py-1 bg-background rounded-md text-xs font-bold text-gray-300 uppercase tracking-wider border border-white/5">
                    {t.technology}
                  </span>
                )) : (
                  <span className="text-gray-500 text-sm">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        {stats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16"
          >
            {stats.map((s: any) => (
              <div key={s.id} className="p-6 bg-card rounded-2xl neumorphic border border-white/5 text-center flex flex-col justify-center">
                <div className="text-3xl font-extrabold text-primary mb-2">{s.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 space-y-8"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Dashboard Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gallery.map((g: any, i: number) => (
                <div key={g.id} className="relative aspect-video rounded-2xl overflow-hidden neumorphic-inner border border-white/5 group">
                  <Image 
                    src={getImageUrl(g.image_url)} 
                    alt={`Gallery ${i + 1}`} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                     <ExternalLink className="text-white ml-auto" size={24} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key Insights */}
        {insights.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Key Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((ins: any) => (
                <div key={ins.id} className="p-5 bg-card rounded-xl neumorphic border border-white/5 flex items-start gap-4 hover:border-primary/30 transition-colors">
                  <TrendingUp className="text-primary shrink-0 mt-1" size={20} />
                  <p className="text-gray-300 leading-relaxed text-sm font-medium">{ins.insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer Navigation */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {prevProject ? (
            <Link href={`/projects/${prevProject.slug}`} className="group flex flex-col items-start w-full md:w-1/3">
              <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2 flex items-center gap-2"><ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Previous Project</span>
              <span className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 text-left">{prevProject.title}</span>
            </Link>
          ) : <div className="w-full md:w-1/3"></div>}

          <div className="relative group flex items-center justify-center">
            <Link href="/" aria-label="Return to Home" className="w-12 h-12 bg-card rounded-full neumorphic border border-white/5 flex items-center justify-center text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
              <Layout size={20} />
            </Link>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background border border-white/10 rounded-lg text-xs font-bold text-white shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
              Return to Home
            </div>
          </div>

          {nextProject ? (
            <Link href={`/projects/${nextProject.slug}`} className="group flex flex-col items-end w-full md:w-1/3">
              <span className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2 flex items-center gap-2">Next Project <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              <span className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 text-right">{nextProject.title}</span>
            </Link>
          ) : <div className="w-full md:w-1/3"></div>}
        </div>
      </main>
    </div>
  )
}
