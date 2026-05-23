'use client'

import { motion } from 'motion/react'
import { FolderKanban, FileText, Award, Briefcase, MessageSquare } from 'lucide-react'

export function DashboardMetrics({ stats }: { stats: any }) {
  const cards = [
    { title: 'Total Projects', value: stats.projects, icon: <FolderKanban size={24} className="text-primary" /> },
    { title: 'Case Studies', value: stats.caseStudies, icon: <FileText size={24} className="text-blue-500" /> },
    { title: 'Certifications', value: stats.certifications, icon: <Award size={24} className="text-green-500" /> },
    { title: 'Experience', value: stats.experiences, icon: <Briefcase size={24} className="text-yellow-500" /> },
    { title: 'Unread Messages', value: stats.messages, icon: <MessageSquare size={24} className="text-purple-500" /> },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-card border border-white/5 p-6 sm:p-8 rounded-3xl neumorphic flex items-center justify-between group"
        >
          <div>
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">{card.title}</h3>
            <p className="text-4xl sm:text-5xl font-extrabold text-white">{card.value}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-background neumorphic-inner flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
            {card.icon}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
