import { prisma } from "@/lib/prisma"
import { Users, Calendar, Image as ImageIcon, MessageSquare } from "lucide-react"

async function getStats() {
    const [userCount, eventCount, mediaCount, contributionCount] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.media.count(),
        prisma.contribution.count(),
    ])

    return {
        userCount,
        eventCount,
        mediaCount,
        contributionCount,
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.userCount}</h3>
                    <p className="text-gray-500 mt-1">Utilisateurs inscrits</p>
                </div>

                {/* Events Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.eventCount}</h3>
                    <p className="text-gray-500 mt-1">Événements créés</p>
                </div>

                {/* Media Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.mediaCount}</h3>
                    <p className="text-gray-500 mt-1">Photos & Vidéos</p>
                </div>

                {/* Contributions Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.contributionCount}</h3>
                    <p className="text-gray-500 mt-1">Anecdotes</p>
                </div>
            </div>
        </div>
    )
}
