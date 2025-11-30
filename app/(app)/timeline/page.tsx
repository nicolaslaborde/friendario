import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

export default async function TimelinePage() {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    // Fetch user's events (created + participated)
    const events = await prisma.event.findMany({
        where: {
            OR: [
                { creatorId: session.user.id },
                {
                    participants: {
                        some: {
                            userId: session.user.id,
                        },
                    },
                },
            ],
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
            media: {
                take: 3,
            },
            _count: {
                select: {
                    media: true,
                    contributions: true,
                },
            },
        },
        orderBy: {
            startDate: "desc",
        },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Ma Timeline</h1>
                <p className="text-gray-600">Tous vos souvenirs partagés</p>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Aucun événement pour le moment
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Créez votre premier souvenir pour commencer
                    </p>
                    <Link
                        href="/events/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                        <Calendar className="w-5 h-5" />
                        Créer un événement
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => {
                        const isCreator = event.creatorId === session.user?.id
                        const participantCount = event.participants.length

                        return (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                                {isCreator && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                                        Créateur
                                                    </span>
                                                )}
                                            </div>
                                            {event.description && (
                                                <p className="text-gray-600 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(event.startDate)}</span>
                                        </div>

                                        {event.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{participantCount} participant{participantCount > 1 ? "s" : ""}</span>
                                        </div>

                                        {event._count.media > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{event._count.media} média{event._count.media > 1 ? "s" : ""}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Media Preview */}
                                    {event.media.length > 0 && (
                                        <div className="mt-4 flex gap-2 overflow-hidden">
                                            {event.media.map((media) => (
                                                <div key={media.id} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={media.s3Key}
                                                        alt="Event preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {event._count.media > 3 && (
                                                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 font-medium text-sm border border-gray-100">
                                                    +{event._count.media - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Pending Contributions Badge */}
                                    {isCreator && event._count.contributions > 0 && (
                                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                            {event._count.contributions} contribution{event._count.contributions > 1 ? "s" : ""} en attente
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
