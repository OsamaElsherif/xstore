'use client'

import { useState, useEffect } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { getProductImageUrl } from '@/lib/supabase/storage'

interface ImageUploaderProps {
  currentImageUrl?: string | null
  onFileSelected: (file: File | null) => void
}

export default function ImageUploader({ currentImageUrl, onFileSelected }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string, size: string } | null>(null)

  useEffect(() => {
    if (currentImageUrl) {
      setPreview(getProductImageUrl(currentImageUrl))
    }
  }, [currentImageUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create local preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      })
      onFileSelected(file)
    }
  }

  const clearSelection = () => {
    setPreview(currentImageUrl ? getProductImageUrl(currentImageUrl) : null)
    setFileInfo(null)
    onFileSelected(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center bg-gray-50 ${preview ? 'border-indigo-200' : 'border-gray-200 hover:border-indigo-400'}`}>
          {preview ? (
            <>
              <Image 
                src={preview} 
                alt="Preview" 
                fill 
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => document.getElementById('product-image-upload')?.click()}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors"
                >
                  Replace Image
                </button>
              </div>
            </>
          ) : (
            <button 
              type="button"
              onClick={() => document.getElementById('product-image-upload')?.click()}
              className="flex flex-col items-center gap-2 text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon size={24} />
              </div>
              <p className="text-xs font-medium">Click to upload image</p>
            </button>
          )}
        </div>

        {preview && (
          <button 
            type="button"
            onClick={clearSelection}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <input 
        type="file" 
        id="product-image-upload"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {fileInfo && (
        <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
          <span className="truncate max-w-[200px]">{fileInfo.name}</span>
          <span>{fileInfo.size}</span>
        </div>
      )}
    </div>
  )
}
