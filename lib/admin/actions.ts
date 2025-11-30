'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/config"
import { Prisma } from "@prisma/client"

const ADMIN_EMAILS = ["nicolas.laborde@example.com"]

async function checkAdmin() {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
        throw new Error("Unauthorized")
    }
}

export async function getUsers(query: string = "", page: number = 1, limit: number = 10) {
    await checkAdmin()

    const skip = (page - 1) * limit
    const where = query
        ? {
            OR: [
                { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
            ],
        }
        : {}

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        createdEvents: true,
                        participations: true,
                    },
                },
            },
        }),
        prisma.user.count({ where }),
    ])

    return { users, total, pages: Math.ceil(total / limit) }
}

export async function getEvents(query: string = "", page: number = 1, limit: number = 10) {
    await checkAdmin()

    const skip = (page - 1) * limit
    const where = query
        ? {
            OR: [
                { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { location: { contains: query, mode: Prisma.QueryMode.insensitive } },
            ],
        }
        : {}

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: { startDate: "desc" },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        participants: true,
                        media: true,
                    },
                },
            },
        }),
        prisma.event.count({ where }),
    ])

    return { events, total, pages: Math.ceil(total / limit) }
}

export async function resetEvents() {
    await checkAdmin()

    // Delete all events
    // Due to cascade delete, this will also delete:
    // - Participants
    // - Media
    // - Contributions
    await prisma.event.deleteMany({})

    return { success: true }
}
