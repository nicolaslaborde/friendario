import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }

        const { title, description, startDate, endDate, isPunctual, location } = await req.json()

        // Validation
        if (!title || !startDate) {
            return NextResponse.json(
                { error: "Le titre et la date de début sont requis" },
                { status: 400 }
            )
        }

        // Create event
        const event = await prisma.event.create({
            data: {
                title,
                description: description || null,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                isPunctual: isPunctual ?? true,
                location: location || null,
                creatorId: session.user.id,
                participants: {
                    create: {
                        userId: session.user.id,
                        role: "CREATOR",
                        status: "ACCEPTED",
                        joinedAt: new Date(),
                    },
                },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json(
            {
                message: "Événement créé avec succès",
                event,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Event creation error:", error)
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la création de l'événement" },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }

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

        return NextResponse.json({ events })
    } catch (error) {
        console.error("Events fetch error:", error)
        return NextResponse.json(
            { error: "Une erreur est survenue" },
            { status: 500 }
        )
    }
}
