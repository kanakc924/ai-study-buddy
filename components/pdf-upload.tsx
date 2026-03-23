'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import { uploadFile } from '@/services/api'
import { toast } from 'sonner'

export function PdfUpload({ topicId, onExtracted }: { topicId: string, onExtracted: (text: string) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'application/pdf' || droppedFile?.type === 'text/plain') {
      await processFile(droppedFile)
    } else {
      toast.error('Only PDF or TXT files are supported')
    }
  }, [topicId])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) await processFile(selected)
  }

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setIsUploading(true)
    try {
      const res = await uploadFile(topicId, selectedFile)
      toast.success('File processed successfully')
      if (res.extractedText || res.text) {
        onExtracted(res.extractedText || res.text)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process file')
      setFile(null)
    } finally {
      setIsUploading(false)
      // Reset after a bit
      setTimeout(() => setFile(null), 2000)
    }
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/50'
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById('pdf-upload-input')?.click()}
    >
      <input 
        id="pdf-upload-input" 
        type="file" 
        accept=".pdf,.txt" 
        className="hidden" 
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      
      <div className="flex flex-col items-center justify-center gap-3">
        {isUploading ? (
          <>
            <div className="bg-primary/20 p-4 rounded-full animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="font-serif text-lg text-foreground">Processing {file?.name}...</p>
            <p className="text-sm text-muted-foreground">Extracting text, this might take a moment.</p>
          </>
        ) : file ? (
          <>
            <div className="bg-[#4CAF50]/15 border border-[#4CAF50]/30 p-4 rounded-full">
              <FileText className="w-8 h-8 text-[#4CAF50]" />
            </div>
            <p className="font-serif text-lg text-foreground">Done!</p>
            <p className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          </>
        ) : (
          <>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-full group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="font-serif text-lg text-foreground">Drag & drop your notes</p>
            <p className="text-sm text-muted-foreground">Supports PDF and TXT files. Or click to browse.</p>
          </>
        )}
      </div>
    </div>
  )
}
