'use client'

import { useState } from 'react'
import { motion, Reorder } from 'motion/react'
import { Plus, X, GripVertical } from 'lucide-react'

export function DynamicKeyValueBuilder({
  items,
  onChange,
}: {
  items: any[]
  onChange: (items: any[]) => void
}) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (label.trim() && value.trim()) {
      onChange([...items, { label: label.trim(), value: value.trim() }])
      setLabel('')
      setValue('')
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
      <div className="flex gap-2 items-center">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 rounded-xl px-4 py-2 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm"
          placeholder="Label (e.g. Accuracy)"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="flex-1 rounded-xl px-4 py-2 bg-background border border-white/5 neumorphic-inner focus:border-primary/50 outline-none transition-all text-sm"
          placeholder="Value (e.g. 95%)"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!label.trim() || !value.trim()}
          className="bg-primary/20 text-primary p-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </div>

      {items.length > 0 && (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="flex flex-col gap-2">
          {items.map((item, index) => (
            <Reorder.Item
              key={item.label + item.value + index}
              value={item}
              className="flex items-center gap-3 bg-card p-3 rounded-xl border border-white/5 neumorphic-inner cursor-grab active:cursor-grabbing group"
            >
              <GripVertical size={16} className="text-gray-500" />
              <div className="flex-1 flex justify-between text-sm">
                <span className="font-bold text-gray-300">{item.label}</span>
                <span className="text-primary font-bold">{item.value}</span>
              </div>
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
