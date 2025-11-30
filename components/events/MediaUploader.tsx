'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface MediaUploaderProps {
    eventId: string
    onUploadComplete?: () => void
}

interface PreviewFile {
    file: File
    preview: string
    id: string
}

export default function MediaUploader({ eventId, onUploadComplete }: MediaUploaderProps) {
    const [files, setFiles] = useState<PreviewFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateFile = (file: File): string | null => {
        // Check file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return `${file.name}: Type de fichier non supporté. Utilisez PNG, JPEG ou WebP.`
        }

        // Check file size (10MB max)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return `${file.name}: Fichier trop volumineux (max 10MB).`
        }

        return null
    }

    const handleFiles = useCallback((newFiles: FileList | null) => {
        if (!newFiles) return

        setError(null)
        const fileArray = Array.from(newFiles)

        // Validate all files
        for (const file of fileArray) {
            const validationError = validateFile(file)
            if (validationError) {
                setError(validationError)
                return
            }
        }

        // Check total count
        if (files.length + fileArray.length > 10) {
            setError('Maximum 10 fichiers par upload.')
            return
        }

        // Create previews
        const newPreviews: PreviewFile[] = fileArray.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substring(7),
        }))

        setFiles((prev) => [...prev, ...newPreviews])
    }, [files.length])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }, [handleFiles])

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const file = prev.find((f) => f.id === id)
            if (file) {
                URL.revokeObjectURL(file.preview)
            }
            return prev.filter((f) => f.id !== id)
        })
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            files.forEach((f) => {
                formData.append('files', f.file)
            })

            const response = await fetch(`/api/events/${eventId}/media`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erreur lors de l\'upload')
            }

            // Clear files and previews
            files.forEach((f) => URL.revokeObjectURL(f.preview))
            setFiles([])

            // Notify parent
            onUploadComplete?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                    }
        `}
            >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                    Glissez vos photos ici
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    ou cliquez pour sélectionner
                </p>
                <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="file-input"
                />
                <label
                    htmlFor="file-input"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200"
                >
                    Sélectionner des fichiers
                </label>
                <p className="text-xs text-gray-400 mt-4">
                    PNG, JPEG, WebP • Max 10MB par fichier • Max 10 fichiers
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Preview Grid */}
            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {files.length} photo{files.length > 1 ? 's' : ''} sélectionnée{files.length > 1 ? 's' : ''}
                        </h3>
                        <button
                            onClick={() => {
                                files.forEach((f) => URL.revokeObjectURL(f.preview))
                                setFiles([])
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Tout supprimer
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="relative group">
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                    <Image
                                        src={file.preview}
                                        alt={file.file.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    {file.file.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-5 h-5" />
                                Ajouter {files.length} photo{files.length > 1 ? 's' : ''}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
