import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { MediaType, MediaStatus } from "@prisma/client"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }

        // Check if user is a participant
        const participant = await prisma.participant.findFirst({
            where: {
                eventId: id,
                userId: session.user.id,
            },
        })

        if (!participant) {
            return NextResponse.json(
                { error: "Vous devez être participant pour ajouter des photos" },
                { status: 403 }
            )
        }

        // Parse form data
        const formData = await req.formData()
        const files = formData.getAll("files") as File[]

        if (files.length === 0) {
            return NextResponse.json(
                { error: "Aucun fichier fourni" },
                { status: 400 }
            )
        }

        if (files.length > 10) {
            return NextResponse.json(
                { error: "Maximum 10 fichiers par upload" },
                { status: 400 }
            )
        }

        const uploadedMedia = []

        // Process each file
        for (const file of files) {
            // Validate file type
            const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
            if (!validTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: `Type de fichier non supporté: ${file.name}` },
                    { status: 400 }
                )
            }

            // Validate file size (10MB max)
            const maxSize = 10 * 1024 * 1024
            if (file.size > maxSize) {
                return NextResponse.json(
                    { error: `Fichier trop volumineux: ${file.name} (max 10MB)` },
                    { status: 400 }
                )
            }

            // Generate unique filename
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(7)
            const extension = file.name.split(".").pop()
            const filename = `${id}-${timestamp}-${randomStr}.${extension}`

            // Save file to public/uploads
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const uploadPath = join(process.cwd(), "public", "uploads", filename)

            await writeFile(uploadPath, buffer)

            // Create media record in database
            const media = await prisma.media.create({
                data: {
                    eventId: id,
                    uploadedBy: session.user.id,
                    type: MediaType.IMAGE,
                    s3Key: `/uploads/${filename}`,
                    s3Bucket: "local",
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    status: MediaStatus.PENDING, // Awaiting validation
                    width: 1024, // Placeholder
                    height: 1024, // Placeholder
                },
            })

            uploadedMedia.push({
                id: media.id,
                filename: media.filename,
                status: media.status,
            })
        }

        return NextResponse.json({
            success: true,
            message: `${uploadedMedia.length} photo(s) ajoutée(s) avec succès`,
            media: uploadedMedia,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Erreur lors de l'upload" },
            { status: 500 }
        )
    }
}
