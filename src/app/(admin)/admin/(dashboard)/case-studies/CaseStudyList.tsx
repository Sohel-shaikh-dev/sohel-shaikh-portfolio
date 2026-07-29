'use client'

import { useState, useEffect } from 'react'
import { AnimatedCard } from '@/components/admin/AnimatedCard'
import { ActionButtons } from '@/components/admin/ActionButtons'
import { deleteCaseStudy, updateCaseStudyOrder } from './actions'
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react'

export function CaseStudyList({ initialStudies }: { initialStudies: any[] }) {
  const [studies, setStudies] = useState(initialStudies)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, published, draft, archived

  // Sync state with fresh data from server when props change
  useEffect(() => {
    setStudies(initialStudies)
  }, [initialStudies])

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === studies.length - 1) return;

    const newStudies = [...studies];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order property
    const tempOrder = newStudies[index].order || 0;
    newStudies[index].order = newStudies[swapIndex].order || 0;
    newStudies[swapIndex].order = tempOrder;

    // Swap in array
    const temp = newStudies[index];
    newStudies[index] = newStudies[swapIndex];
    newStudies[swapIndex] = temp;

    setStudies(newStudies);

    // Call server actions
    await updateCaseStudyOrder(newStudies[index].id, newStudies[index].order);
    await updateCaseStudyOrder(newStudies[swapIndex].id, newStudies[swapIndex].order);
  }

  const filteredStudies = studies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) || study.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'published' ? study.status === 'published' && study.is_active
      : statusFilter === 'draft' ? study.status === 'draft'
      : statusFilter === 'archived' ? study.status === 'archived' || !study.is_active
      : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-4 h-[2px] bg-primary"></span>
        Existing Case Studies
      </h3>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by title or slug..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card rounded-2xl py-3 pl-10 pr-4 text-sm text-gray-300 border border-white/5 outline-none focus:border-primary/50"
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-card rounded-2xl py-3 pl-10 pr-4 text-sm text-gray-300 border border-white/5 outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredStudies.map((study, index) => {
          const isArchived = study.status === 'archived' || !study.is_active;
          const isDraft = study.status === 'draft';
          
          return (
            <AnimatedCard key={study.id} index={index} className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group ${isArchived ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                <div className="flex flex-col gap-1 items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pr-4 border-r border-white/5 flex-shrink-0">
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500"><ChevronUp size={16} /></button>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === filteredStudies.length - 1} className="text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500"><ChevronDown size={16} /></button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xl mb-1 group-hover:text-primary transition-colors flex flex-wrap items-center gap-2 truncate">
                    <span className="truncate">{study.title}</span>
                    {study.featured && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">Featured</span>}
                    {isArchived && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">Archived</span>}
                    {isDraft && <span className="text-[9px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">Draft</span>}
                  </div>
                  <div className="text-xs text-gray-400 font-mono tracking-widest truncate">{study.slug}</div>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:ml-4 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="text-xs font-bold px-4 py-2 rounded-full bg-background neumorphic-inner text-gray-300 whitespace-nowrap hidden sm:block">
                  Order: {study.order || 0}
                </div>
                <ActionButtons id={study.id} editUrl={`/admin/case-studies?edit=${study.id}`} deleteAction={deleteCaseStudy} itemType="Case Study" />
              </div>
            </AnimatedCard>
          )
        })}
        
        {filteredStudies.length === 0 && (
          <div className="bg-card rounded-[2rem] neumorphic p-12 text-center flex flex-col items-center justify-center">
            <span className="text-gray-500 font-bold uppercase tracking-widest mb-2">No case studies found</span>
            <span className="text-sm text-gray-400">Try adjusting your filters or search query.</span>
          </div>
        )}
      </div>
    </div>
  )
}
