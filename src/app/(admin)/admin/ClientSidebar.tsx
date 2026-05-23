'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, FolderKanban, FileText, Award, Briefcase, MessageSquare, LogOut, Settings } from 'lucide-react'

export function ClientSidebar({ signOutAction }: { signOutAction: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Projects', href: '/admin/projects', icon: <FolderKanban size={18} /> },
    { name: 'Case Studies', href: '/admin/case-studies', icon: <FileText size={18} /> },
    { name: 'Certifications', href: '/admin/certifications', icon: <Award size={18} /> },
    { name: 'Experience', href: '/admin/experiences', icon: <Briefcase size={18} /> },
    { name: 'Messages', href: '/admin/messages', icon: <MessageSquare size={18} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
  ]

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center neumorphic-inner border border-white/5">
            <span className="text-primary font-bold text-lg">S</span>
          </div>
          <span className="font-bold tracking-tight">Admin<span className="text-primary">.dev</span></span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-white/5 p-6 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="hidden lg:flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center neumorphic-inner border border-white/5">
            <span className="text-primary font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Admin<span className="text-primary">.dev</span></span>
        </div>

        <nav className="flex flex-col gap-3 flex-grow">
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4">Menu</span>
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-background text-primary neumorphic-inner border-l-2 border-primary shadow-[inset_0_0_10px_rgba(255,1,79,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={() => signOutAction()} 
            className="flex items-center justify-center gap-2 w-full py-4 bg-background rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all neumorphic-inner border border-white/5"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
