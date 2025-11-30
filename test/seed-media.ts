import './env-setup.js' // Must be first!
import { PrismaClient, MediaType, MediaStatus } from '@prisma/client'
import { uploadToS3, generateS3Key, getS3Bucket } from '@/lib/aws/s3'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Début du script d\'injection de médias...\n')

    // 1. Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
        where: { email: 'nicolas.laborde@example.com' },
    })

    if (!user) {
        console.error('❌ Utilisateur "Nicolas Laborde" introuvable. Lancez d\'abord "seed-data.ts".')
        process.exit(1)
    }

    console.log(`👤 Utilisateur trouvé: ${user.name}`)

    // 2. Récupérer un événement
    const event = await prisma.event.findFirst({
        where: { title: "Soirée chez Bob l'éponge" },
    })

    if (!event) {
        console.error('❌ Événement "Soirée chez Bob l\'éponge" introuvable. Lancez d\'abord "seed-data.ts".')
        process.exit(1)
    }

    console.log(`🎉 Événement trouvé: ${event.title}`)

    // 3. Fichier à uploader
    // On cherche une image dans le dossier racine ou on utilise un buffer si pas d'image
    const imagePath = path.join(process.cwd(), 'ChatGPT Image 25 nov. 2025, 10_06_08.png')
    let fileBuffer: Buffer
    let fileName = 'sample-image.png'
    let mimeType = 'image/png'

    if (fs.existsSync(imagePath)) {
        console.log(`📂 Utilisation de l'image locale: ${path.basename(imagePath)}`)
        fileBuffer = fs.readFileSync(imagePath)
        fileName = path.basename(imagePath)
    } else {
        console.log('⚠️ Aucune image locale trouvée, création d\'une image vide pour le test.')
        // Création d'un petit buffer PNG valide (1x1 pixel transparent)
        fileBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    }

    // 4. Upload S3
    console.log('☁️ Upload vers S3 en cours...')

    const bucket = getS3Bucket('media')
    const key = generateS3Key(user.id, event.id, fileName)

    try {
        await uploadToS3({
            bucket,
            key,
            body: fileBuffer,
            contentType: mimeType,
        })
        console.log(`✅ Upload S3 réussi: ${key}`)
    } catch (error: any) {
        console.error('❌ Erreur lors de l\'upload S3:')
        console.error(JSON.stringify(error, null, 2))
        if (error.$metadata) {
            console.error('Metadata:', JSON.stringify(error.$metadata, null, 2))
        }
        process.exit(1)
    }

    // 5. Création en base de données
    console.log('💾 Enregistrement en base de données...')

    const media = await prisma.media.create({
        data: {
            eventId: event.id,
            uploadedBy: user.id,
            type: MediaType.IMAGE,
            s3Key: key,
            s3Bucket: bucket,
            filename: fileName,
            mimeType: mimeType,
            size: fileBuffer.length,
            status: MediaStatus.VALIDATED,
            width: 1024, // Valeurs arbitraires pour l'exemple
            height: 1024,
        },
    })

    console.log(`✅ Média créé en base: ID ${media.id}`)
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
