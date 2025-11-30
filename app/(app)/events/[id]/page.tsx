import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { Calendar, MapPin, Users, MessageSquare, Image as ImageIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDate, formatDateTime, getInitials } from "@/lib/utils"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import MediaSection from "@/components/events/MediaSection"

export default async function EventDetailPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    // Fetch event with all relations
    const event = await prisma.event.findUnique({
        where: { id: params.id },
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
                orderBy: {
                    createdAt: "desc",
                },
            },
            contributions: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    })

    if (!event) {
        notFound()
    }

    // Check if user is a participant
    const isParticipant = event.participants.some(
        (p) => p.userId === session.user?.id
    )

    if (!isParticipant) {
        redirect("/timeline")
    }

    const isCreator = event.creatorId === session.user?.id

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/timeline"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à la timeline</span>
            </Link>

            {/* Event Header */}
            <div className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
                            {isCreator && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                                    Créateur
                                </span>
                            )}
                        </div>
                        {event.description && (
                            <p className="text-lg text-gray-600 mt-4">{event.description}</p>
                        )}
                    </div>
                </div>

                {/* Event Metadata */}
                <div className="flex flex-wrap gap-6 mt-6 text-gray-600">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                                {formatDate(event.startDate)}
                                {event.endDate && ` - ${formatDate(event.endDate)}`}
                            </p>
                        </div>
                    </div>

                    {event.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-500">Lieu</p>
                                <p className="font-medium">{event.location}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                            <p className="text-sm text-gray-500">Participants</p>
                            <p className="font-medium">{event.participants.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Participants ({event.participants.length})
                </h2>
                <div className="flex flex-wrap gap-4">
                    {event.participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
                        >
                            {participant.user.image ? (
                                <Image
                                    src={participant.user.image}
                                    alt={participant.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                    {getInitials(participant.user.name || "?")}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{participant.user.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{participant.role.toLowerCase()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Media Upload Section */}
            <MediaSection eventId={params.id} />

            {/* Media Gallery */}
            {event.media.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-purple-600" />
                        Photos & Vidéos ({event.media.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {event.media.map((media) => (
                            <div
                                key={media.id}
                                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
                            >
                                <Image
                                    src={media.s3Key}
                                    alt={media.filename}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                                {media.status === "PENDING" && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                                        En attente
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contributions Section */}
            {event.contributions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                        Anecdotes & Commentaires ({event.contributions.length})
                    </h2>
                    <div className="space-y-4">
                        {event.contributions.map((contribution) => (
                            <div
                                key={contribution.id}
                                className="bg-gray-50 rounded-xl p-4 border-l-4 border-purple-500"
                            >
                                <div className="flex items-start gap-3">
                                    {contribution.user.image ? (
                                        <Image
                                            src={contribution.user.image}
                                            alt={contribution.user.name || "User"}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {getInitials(contribution.user.name || "?")}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900">
                                                {contribution.user.name}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {formatDateTime(contribution.createdAt)}
                                            </span>
                                            {contribution.status === "VALIDATED" && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    Validé
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700">{contribution.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty States */}
            {event.media.length === 0 && event.contributions.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Aucun contenu pour le moment
                    </h3>
                    <p className="text-gray-500">
                        Soyez le premier à ajouter des photos ou des anecdotes !
                    </p>
                </div>
            )}
        </div>
    )
}
