'use client'

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { resetEvents } from "@/lib/admin/actions"
import { useRouter } from "next/navigation"

export default function ResetEventsButton() {
    const [isResetting, setIsResetting] = useState(false)
    const router = useRouter()

    const handleReset = async () => {
        if (
            !confirm(
                "⚠️ ATTENTION : Cette action est irréversible !\n\nCela va supprimer TOUS les événements, photos, et contributions.\n\nLes utilisateurs seront conservés.\n\nVoulez-vous vraiment continuer ?"
            )
        ) {
            return
        }

        // Double confirmation
        if (!confirm("Êtes-vous vraiment sûr ?")) {
            return
        }

        try {
            setIsResetting(true)
            await resetEvents()
            router.refresh()
            alert("Tous les événements ont été supprimés.")
        } catch (error) {
            console.error(error)
            alert("Une erreur est survenue.")
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isResetting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Trash2 className="w-5 h-5" />
            )}
            <span className="font-medium">Réinitialiser les événements</span>
        </button>
    )
}
