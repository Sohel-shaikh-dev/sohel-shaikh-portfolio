'use client'

import { Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ConfirmModal } from './ConfirmModal'
import { AlertModal } from './AlertModal'

export function ActionButtons({ 
  id, 
  editUrl, 
  deleteAction 
}: { 
  id: string, 
  editUrl: string, 
  deleteAction: (id: string) => Promise<{ success: boolean, error?: string }> 
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'}>({
    isOpen: false, title: '', message: '', type: 'success'
  })

  const showAlert = (title: string, message: string, type: 'success'|'error') => {
    setAlertInfo({ isOpen: true, title, message, type })
  }

  async function handleDeleteConfirm() {
    setShowConfirm(false)
    setIsDeleting(true)
    const result = await deleteAction(id)
    if (result.success) {
      router.refresh()
    } else {
      showAlert('Error', result.error || 'Failed to delete item', 'error')
      setIsDeleting(false)
    }
  }

  function handleDeleteClick() {
    setShowConfirm(true)
  }

  return (
    <div className="flex items-center gap-2">
      <Link 
        href={editUrl}
        className="p-2 text-gray-400 hover:text-blue-400 transition-colors bg-background rounded-xl neumorphic-inner inline-flex items-center justify-center"
        title="Edit"
      >
        <Edit size={14} />
      </Link>
      <button 
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-background rounded-xl neumorphic-inner disabled:opacity-50"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>

      <ConfirmModal 
        isOpen={showConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone and will permanently remove it from your portfolio."
        confirmText="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <AlertModal
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
      />
    </div>
  )
}
