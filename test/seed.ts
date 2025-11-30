import { PrismaClient, MediaType, MediaStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Début du script de seed unifié...\n')

    // ----------------------------------------------------------------
    // 1. CRÉATION DE L'UTILISATEUR
    // ----------------------------------------------------------------
    console.log('👤 Création de l\'utilisateur Nicolas Laborde...')

    const hashedPassword = await bcrypt.hash('password123', 12)

    const user = await prisma.user.upsert({
        where: { email: 'nicolas.laborde@example.com' },
        update: {},
        create: {
            name: 'Nicolas Laborde',
            email: 'nicolas.laborde@example.com',
            password: hashedPassword,
            phone: '+33 6 12 34 56 78',
            status: 'REGISTERED',
            emailVerified: new Date(),
        },
    })

    console.log(`✅ Utilisateur prêt: ${user.name} (${user.email})\n`)

    // ----------------------------------------------------------------
    // 2. CRÉATION DES ÉVÉNEMENTS
    // ----------------------------------------------------------------
    console.log('🎉 Création des événements...')

    const eventsData = [
        {
            title: 'Soirée chez Bob l\'éponge',
            description: 'Une soirée mémorable chez Bob avec tous les amis de Bikini Bottom ! Au programme : karaoké, jeux de société et bien sûr, des burgers Krabby Patty. Ambiance décontractée et bonne humeur garantie !',
            startDate: new Date('2024-11-15T19:00:00'),
            endDate: null,
            isPunctual: true,
            location: 'Ananas sous la mer, Bikini Bottom',
            latitude: 48.8566,
            longitude: 2.3522,
            images: [
                'soiree_bob_eponge_1764070531961.png',
                'soiree_bob_1_1764070603849.png',
                'soiree_bob_2_1764070617788.png',
                'soiree_bob_3_1764070631778.png',
                'soiree_bob_4_1764070645417.png'
            ]
        },
        {
            title: 'Week-end à Étretat',
            description: 'Escapade de 3 jours sur les magnifiques falaises d\'Étretat en Normandie. Découverte des célèbres falaises d\'Aval et d\'Amont, balades sur la plage de galets, dégustation de fruits de mer frais et exploration du charmant village. Un moment de détente et de ressourcement face à la mer.',
            startDate: new Date('2024-10-18T14:00:00'),
            endDate: new Date('2024-10-20T18:00:00'),
            isPunctual: false,
            location: 'Étretat, Normandie, France',
            latitude: 49.7076,
            longitude: 0.2044,
            images: [
                'etretat_falaises_1764070545354.png'
            ]
        },
        {
            title: 'Vacances à Saint-Marcel',
            description: 'Trois semaines de vacances inoubliables à Saint-Marcel ! Entre randonnées dans les montagnes environnantes, découverte du patrimoine local, marchés provençaux colorés et moments de détente au bord de la piscine. Des journées ensoleillées rythmées par les apéros entre amis, les barbecues en soirée et les siestes à l\'ombre des oliviers. Le bonheur simple de la vie en Provence.',
            startDate: new Date('2024-08-01T10:00:00'),
            endDate: new Date('2024-08-21T17:00:00'),
            isPunctual: false,
            location: 'Saint-Marcel, Ardèche, France',
            latitude: 44.4167,
            longitude: 4.5667,
            images: [
                'vacances_provence_1764070559098.png'
            ]
        }
    ]

    const createdEvents = []

    for (const eventData of eventsData) {
        // Check if event exists to avoid duplicates
        let event = await prisma.event.findFirst({
            where: { title: eventData.title, creatorId: user.id }
        })

        if (!event) {
            event = await prisma.event.create({
                data: {
                    title: eventData.title,
                    description: eventData.description,
                    startDate: eventData.startDate,
                    endDate: eventData.endDate,
                    isPunctual: eventData.isPunctual,
                    location: eventData.location,
                    latitude: eventData.latitude,
                    longitude: eventData.longitude,
                    creatorId: user.id,
                    participants: {
                        create: {
                            userId: user.id,
                            role: 'CREATOR',
                            status: 'ACCEPTED',
                            joinedAt: new Date(),
                        },
                    },
                },
            })
            console.log(`   ✅ Créé: ${event.title}`)
        } else {
            console.log(`   ℹ️ Existe déjà: ${event.title}`)
        }
        createdEvents.push({ ...event, images: eventData.images })
    }

    // ----------------------------------------------------------------
    // 3. CRÉATION DES CONTRIBUTIONS
    // ----------------------------------------------------------------
    console.log('\n💬 Vérification des contributions...')

    const contributionsData = [
        {
            eventTitle: 'Soirée chez Bob l\'éponge',
            type: 'ANECDOTE',
            content: 'Patrick a essayé de faire un karaoké de "Sweet Victory" mais il a oublié toutes les paroles ! On a tous bien ri 😂'
        },
        {
            eventTitle: 'Week-end à Étretat',
            type: 'COMMENT',
            content: 'Les falaises au coucher du soleil étaient absolument magnifiques. Un spectacle inoubliable !'
        },
        {
            eventTitle: 'Vacances à Saint-Marcel',
            type: 'ANECDOTE',
            content: 'La randonnée jusqu\'au Pont d\'Arc était épique ! 15km sous le soleil mais la baignade dans l\'Ardèche à l\'arrivée valait vraiment le coup.'
        }
    ]

    for (const contrib of contributionsData) {
        const event = createdEvents.find(e => e.title === contrib.eventTitle)
        if (event) {
            const exists = await prisma.contribution.findFirst({
                where: { eventId: event.id, content: contrib.content }
            })

            if (!exists) {
                await prisma.contribution.create({
                    data: {
                        eventId: event.id,
                        userId: user.id,
                        type: contrib.type as any,
                        content: contrib.content,
                        status: 'VALIDATED',
                        validatedAt: new Date(),
                    },
                })
                console.log(`   ✅ Contribution ajoutée pour: ${event.title}`)
            }
        }
    }

    // ----------------------------------------------------------------
    // 4. INJECTION DES MÉDIAS
    // ----------------------------------------------------------------
    console.log('\n📸 Injection des médias...')

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
        console.log('   📁 Dossier public/uploads créé')
    }

    const artifactsDir = 'C:/Users/nicolas/.gemini/antigravity/brain/5ba09edd-d933-4f2e-9101-3ea8ea4f192c'
    let totalMediaCreated = 0

    for (const event of createdEvents) {
        for (const imageFile of event.images) {
            const sourcePath = path.join(artifactsDir, imageFile)

            if (!fs.existsSync(sourcePath)) {
                console.log(`   ⚠️ Image source non trouvée: ${imageFile}`)
                continue
            }

            const destFileName = `${event.id}-${imageFile}`
            const destPath = path.join(uploadsDir, destFileName)

            // Copy file
            if (!fs.existsSync(destPath)) {
                fs.copyFileSync(sourcePath, destPath)
                console.log(`   ✅ Fichier copié: ${destFileName}`)
            }

            // Create DB record
            const exists = await prisma.media.findFirst({
                where: { eventId: event.id, filename: imageFile }
            })

            if (!exists) {
                const fileStats = fs.statSync(destPath)
                await prisma.media.create({
                    data: {
                        eventId: event.id,
                        uploadedBy: user.id,
                        type: MediaType.IMAGE,
                        s3Key: `/uploads/${destFileName}`,
                        s3Bucket: 'local',
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
    }

    console.log(`   ✅ ${totalMediaCreated} nouveaux médias enregistrés en base`)

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
