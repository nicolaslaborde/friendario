import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, phone } = await req.json()

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tous les champs sont requis" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Le mot de passe doit contenir au moins 8 caractères" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Un compte existe déjà avec cet email" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                status: "PENDING", // Will be updated after email verification
            },
        })

        return NextResponse.json(
            {
                message: "Compte créé avec succès",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la création du compte" },
            { status: 500 }
        )
    }
}
