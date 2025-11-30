'use client'

import { useState } from 'react'
import { Upload, Plus } from 'lucide-react'
import MediaUploader from '@/components/events/MediaUploader'
import { useRouter } from 'next/navigation'

interface MediaSectionProps {
    eventId: string
}

export default function MediaSection({ eventId }: MediaSectionProps) {
    const [showUploader, setShowUploader] = useState(false)
    const router = useRouter()

    const handleUploadComplete = () => {
        setShowUploader(false)
        router.refresh() // Refresh server component data
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-purple-600" />
                    Ajouter des photos
                </h2>
                {!showUploader && (
                    <button
                        onClick={() => setShowUploader(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Ajouter
                    </button>
                )}
            </div>

            {showUploader ? (
                <div className="space-y-4">
                    <MediaUploader eventId={eventId} onUploadComplete={handleUploadComplete} />
                    <button
                        onClick={() => setShowUploader(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Annuler
                    </button>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">
                    Cliquez sur "Ajouter" pour uploader des photos
                </p>
            )}
        </div>
    )
}
