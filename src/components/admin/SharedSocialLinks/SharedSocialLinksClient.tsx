'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react'
import { SocialIcon } from '@/components/SocialIconMap'
import { SharedSocialLinkForm } from './SharedSocialLinkForm'
import { AlertModal } from '@/components/admin/AlertModal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'

export type SocialLinkActions = {
  reorder: (orderedIds: string[]) => Promise<void>
  delete: (id: string) => Promise<void>
  update: (id: string, data: any) => Promise<void>
  add: (data: any) => Promise<any>
}

export function SharedSocialLinksClient({ 
  initialLinks, 
  actions 
}: { 
  initialLinks: any[], 
  actions: SocialLinkActions 
}) {
  const [links, setLinks] = useState(initialLinks)
  const [isEditing, setIsEditing] = useState(false)
  const [currentEdit, setCurrentEdit] = useState<any>(null)
  
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  })

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Synchronize with initialLinks from server when they change (e.g. after mutations)
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(links)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLinks(items)

    try {
      const orderedIds = items.map((item: any) => item.id)
      await actions.reorder(orderedIds)
    } catch (err: any) {
      setAlertInfo({ isOpen: true, title: 'Error', message: 'Failed to reorder links', type: 'error' })
      setLinks(initialLinks) // Revert on failure
    }
  }

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Social Link',
      message: 'Are you sure you want to delete this social link? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await actions.delete(id)
          setAlertInfo({ isOpen: true, title: 'Success', message: 'Link deleted successfully.', type: 'success' })
        } catch (err: any) {
          setAlertInfo({ isOpen: true, title: 'Error', message: err.message, type: 'error' })
        }
      }
    })
  }

  const handleToggleActive = async (item: any) => {
    try {
      await actions.update(item.id, { is_active: !item.is_active })
    } catch (err: any) {
      setAlertInfo({ isOpen: true, title: 'Error', message: 'Failed to toggle status.', type: 'error' })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => { setCurrentEdit(null); setIsEditing(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(255,1,79,0.3)]"
        >
          <Plus size={18} />
          Add Platform
        </button>
      </div>

      <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 neumorphic">
        {links.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No social links found. Click "Add Platform" to create one.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="social_links">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {links.map((link: any, index: number) => (
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between gap-3 sm:gap-4 p-4 bg-background border border-white/5 rounded-2xl transition-colors ${snapshot.isDragging ? 'shadow-2xl border-primary/50' : 'hover:border-white/10'}`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div {...provided.dragHandleProps} className="text-gray-500 hover:text-white cursor-grab flex-shrink-0">
                                <GripVertical size={20} />
                              </div>
                              
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 flex-shrink-0 ${link.is_active ? 'text-white' : 'text-gray-600'}`}>
                                <SocialIcon iconName={link.icon_name} size={18} />
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <div className={`font-bold text-sm truncate ${link.is_active ? 'text-white' : 'text-gray-500'}`}>
                                  {link.platform_name}
                                </div>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-500 hover:text-primary transition-colors truncate">
                                  {link.url}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleToggleActive(link)}
                                title={link.is_active ? "Disable" : "Enable"}
                                className={`p-2 rounded-lg border transition-colors ${link.is_active ? 'border-green-500/30 text-green-500 hover:bg-green-500/10' : 'border-gray-500/30 text-gray-500 hover:bg-gray-500/10'}`}
                              >
                                {link.is_active ? <Check size={16} /> : <X size={16} />}
                              </button>
                              <button
                                onClick={() => { setCurrentEdit(link); setIsEditing(true); }}
                                className="p-2 rounded-lg border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(link.id)}
                                className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {isEditing && (
        <SharedSocialLinkForm 
          initialData={currentEdit} 
          onClose={() => setIsEditing(false)} 
          addAction={actions.add}
          updateAction={actions.update}
        />
      )}

      <AlertModal 
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => setAlertInfo(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          confirmModal.onConfirm()
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
