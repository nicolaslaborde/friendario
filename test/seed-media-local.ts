import { PrismaClient, MediaType, MediaStatus } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Début du script d\'injection de médias (mode local)...\n')

    // 1. Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
        where: { email: 'nicolas.laborde@example.com' },
    })

    if (!user) {
        console.error('❌ Utilisateur "Nicolas Laborde" introuvable. Lancez d\'abord "seed-data.ts".')
        process.exit(1)
    }

    console.log(`👤 Utilisateur trouvé: ${user.name}`)

    // 2. Récupérer les événements
    const events = await prisma.event.findMany({
        where: {
            title: {
                in: ["Soirée chez Bob l'éponge", "Week-end à Étretat", "Vacances à Saint-Marcel"]
            }
        }
    })

    if (events.length === 0) {
        console.error('❌ Aucun événement trouvé. Lancez d\'abord "seed-data.ts".')
        process.exit(1)
    }

    console.log(`🎉 ${events.length} événements trouvés\n`)

    // 3. Créer le dossier public/uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
        console.log('📁 Dossier public/uploads créé')
    }

    // 4. Chercher les images générées dans le dossier artifacts
    const artifactsDir = 'C:/Users/nicolas/.gemini/antigravity/brain/5ba09edd-d933-4f2e-9101-3ea8ea4f192c'

    // Mapping des événements aux images
    const eventImages: Record<string, string[]> = {
        "Soirée chez Bob l'éponge": [
            'soiree_bob_eponge_1764070531961.png',
            'soiree_bob_1_1764070603849.png',
            'soiree_bob_2_1764070617788.png',
            'soiree_bob_3_1764070631778.png',
            'soiree_bob_4_1764070645417.png'
        ],
        "Week-end à Étretat": [
            'etretat_falaises_1764070545354.png'
        ],
        "Vacances à Saint-Marcel": [
            'vacances_provence_1764070559098.png'
        ]
    }

    let totalMediaCreated = 0

    // 5. Pour chaque événement, copier les images et créer les entrées en base
    for (const event of events) {
        const imageFiles = eventImages[event.title] || []

        console.log(`\n📸 Traitement de l'événement: ${event.title}`)
        console.log(`   Images à ajouter: ${imageFiles.length}`)

        for (const imageFile of imageFiles) {
            const sourcePath = path.join(artifactsDir, imageFile)

            if (!fs.existsSync(sourcePath)) {
                console.log(`   ⚠️ Image non trouvée: ${imageFile}`)
                continue
            }

            // Copier l'image dans public/uploads
            const destFileName = `${event.id}-${imageFile}`
            const destPath = path.join(uploadsDir, destFileName)

            fs.copyFileSync(sourcePath, destPath)
            console.log(`   ✅ Image copiée: ${destFileName}`)

            // Créer l'entrée en base de données
            const fileStats = fs.statSync(destPath)

            await prisma.media.create({
                data: {
                    eventId: event.id,
                    uploadedBy: user.id,
                    type: MediaType.IMAGE,
                    s3Key: `/uploads/${destFileName}`, // Chemin local au lieu de S3
                    s3Bucket: 'local', // Marqueur pour indiquer stockage local
                    filename: imageFile,
                    mimeType: 'image/png',
                    size: fileStats.size,
                    status: MediaStatus.VALIDATED,
                    width: 1024,
                    height: 1024,
                },
            })

            totalMediaCreated++
        }
    }

    console.log(`\n📊 Résumé:`)
    console.log(`─────────────────────────────────────`)
    console.log(`✅ ${totalMediaCreated} médias créés`)
    console.log(`✅ Images stockées dans: public/uploads`)
    console.log(`─────────────────────────────────────`)
    console.log('\n🎉 Script terminé avec succès !')
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
