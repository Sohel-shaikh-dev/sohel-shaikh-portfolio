'use client'

import { useState } from 'react'
import { motion, Reorder } from 'motion/react'
import { Plus, X, GripVertical } from 'lucide-react'

export function DynamicListBuilder({
  items,
  onChange,
  itemKey,
  placeholder = "Add item"
}: {
  items: any[]
  onChange: (items: any[]) => void
  itemKey: string // The property name in the object, e.g., 'insight' or 'technology'
  placeholder?: string
}) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...items, { [itemKey]: inputValue.trim() }])
      setInputValue('')
    }
  }

  const handleRemove = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const handleReorder = (newOrder: any[]) => {
    onChange(newOrder)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="flex-1 rounded-xl px-4 py-2 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="bg-primary/20 text-primary p-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </div>

      {items.length > 0 && (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="flex flex-col gap-2">
          {items.map((item, index) => (
            <Reorder.Item
              key={item[itemKey] + index} // Use value+index as key for uniqueness
              value={item}
              className="flex items-center gap-3 bg-card p-3 rounded-xl border border-white/5 neumorphic-inner cursor-grab active:cursor-grabbing group"
            >
              <GripVertical size={16} className="text-gray-500" />
              <span className="flex-1 text-sm text-gray-300">{item[itemKey]}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  )
}
