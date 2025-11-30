"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Clock, Users, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        isPunctual: true,
        location: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Une erreur est survenue")
                setLoading(false)
                return
            }

            router.push(`/events/${data.event.id}`)
            router.refresh()
        } catch (error) {
            setError("Une erreur est survenue")
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/timeline"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la timeline
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Créer un événement
                </h1>
                <p className="text-gray-600">
                    Partagez un nouveau souvenir avec vos amis
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                        Titre de l'événement *
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-colors"
                            placeholder="Ex: Anniversaire de Marie"
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-colors resize-none"
                        placeholder="Décrivez cet événement..."
                        rows={4}
                    />
                </div>

                {/* Date Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Durée de l'événement
                    </label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPunctual: true, endDate: "" })}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${formData.isPunctual
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Clock className="w-5 h-5 mx-auto mb-1" />
                            Ponctuel (1 jour)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPunctual: false })}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${!formData.isPunctual
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Calendar className="w-5 h-5 mx-auto mb-1" />
                            Plusieurs jours
                        </button>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            Date de début *
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-colors"
                            required
                        />
                    </div>

                    {!formData.isPunctual && (
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                Date de fin
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-colors"
                                min={formData.startDate}
                            />
                        </div>
                    )}
                </div>

                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                        Lieu
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-colors"
                            placeholder="Ex: Paris, France"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                    <Link
                        href="/timeline"
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Création..." : "Créer l'événement"}
                    </button>
                </div>
            </form>
        </div>
    )
}
