import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Début du script de test...\n')

    // 1. Créer l'utilisateur Nicolas Laborde
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

    console.log(`✅ Utilisateur créé: ${user.name} (${user.email})\n`)

    // 2. Événement 1 : Soirée chez Bob l'éponge (ponctuel)
    console.log('🎉 Création de l\'événement 1: Soirée chez Bob l\'éponge...')

    const event1 = await prisma.event.create({
        data: {
            title: 'Soirée chez Bob l\'éponge',
            description: 'Une soirée mémorable chez Bob avec tous les amis de Bikini Bottom ! Au programme : karaoké, jeux de société et bien sûr, des burgers Krabby Patty. Ambiance décontractée et bonne humeur garantie !',
            startDate: new Date('2024-11-15T19:00:00'),
            endDate: null,
            isPunctual: true,
            location: 'Ananas sous la mer, Bikini Bottom',
            latitude: 48.8566,
            longitude: 2.3522,
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

    console.log(`✅ Événement créé: ${event1.title}`)
    console.log(`   📅 Date: ${event1.startDate.toLocaleDateString('fr-FR')}`)
    console.log(`   📍 Lieu: ${event1.location}\n`)

    // 3. Événement 2 : Week-end à Étretat (3 jours)
    console.log('🏖️ Création de l\'événement 2: Week-end à Étretat...')

    const event2 = await prisma.event.create({
        data: {
            title: 'Week-end à Étretat',
            description: 'Escapade de 3 jours sur les magnifiques falaises d\'Étretat en Normandie. Découverte des célèbres falaises d\'Aval et d\'Amont, balades sur la plage de galets, dégustation de fruits de mer frais et exploration du charmant village. Un moment de détente et de ressourcement face à la mer.',
            startDate: new Date('2024-10-18T14:00:00'),
            endDate: new Date('2024-10-20T18:00:00'),
            isPunctual: false,
            location: 'Étretat, Normandie, France',
            latitude: 49.7076,
            longitude: 0.2044,
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

    console.log(`✅ Événement créé: ${event2.title}`)
    console.log(`   📅 Dates: ${event2.startDate.toLocaleDateString('fr-FR')} → ${event2.endDate?.toLocaleDateString('fr-FR')}`)
    console.log(`   📍 Lieu: ${event2.location}\n`)

    // 4. Événement 3 : Vacances à Saint-Marcel (21 jours)
    console.log('🏝️ Création de l\'événement 3: Vacances à Saint-Marcel...')

    const event3 = await prisma.event.create({
        data: {
            title: 'Vacances à Saint-Marcel',
            description: 'Trois semaines de vacances inoubliables à Saint-Marcel ! Entre randonnées dans les montagnes environnantes, découverte du patrimoine local, marchés provençaux colorés et moments de détente au bord de la piscine. Des journées ensoleillées rythmées par les apéros entre amis, les barbecues en soirée et les siestes à l\'ombre des oliviers. Le bonheur simple de la vie en Provence.',
            startDate: new Date('2024-08-01T10:00:00'),
            endDate: new Date('2024-08-21T17:00:00'),
            isPunctual: false,
            location: 'Saint-Marcel, Ardèche, France',
            latitude: 44.4167,
            longitude: 4.5667,
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

    console.log(`✅ Événement créé: ${event3.title}`)
    console.log(`   📅 Dates: ${event3.startDate.toLocaleDateString('fr-FR')} → ${event3.endDate?.toLocaleDateString('fr-FR')}`)
    console.log(`   📍 Lieu: ${event3.location}\n`)

    // 5. Ajouter quelques contributions pour rendre les événements plus vivants
    console.log('💬 Ajout de contributions...')

    await prisma.contribution.create({
        data: {
            eventId: event1.id,
            userId: user.id,
            type: 'ANECDOTE',
            content: 'Patrick a essayé de faire un karaoké de "Sweet Victory" mais il a oublié toutes les paroles ! On a tous bien ri 😂',
            status: 'VALIDATED',
            validatedAt: new Date(),
        },
    })

    await prisma.contribution.create({
        data: {
            eventId: event2.id,
            userId: user.id,
            type: 'COMMENT',
            content: 'Les falaises au coucher du soleil étaient absolument magnifiques. Un spectacle inoubliable !',
            status: 'VALIDATED',
            validatedAt: new Date(),
        },
    })

    await prisma.contribution.create({
        data: {
            eventId: event3.id,
            userId: user.id,
            type: 'ANECDOTE',
            content: 'La randonnée jusqu\'au Pont d\'Arc était épique ! 15km sous le soleil mais la baignade dans l\'Ardèche à l\'arrivée valait vraiment le coup.',
            status: 'VALIDATED',
            validatedAt: new Date(),
        },
    })

    console.log('✅ 3 contributions ajoutées\n')

    // Résumé final
    console.log('📊 Résumé:')
    console.log('─────────────────────────────────────')
    console.log(`✅ 1 utilisateur créé: ${user.name}`)
    console.log(`✅ 3 événements créés:`)
    console.log(`   1. ${event1.title} (ponctuel)`)
    console.log(`   2. ${event2.title} (3 jours)`)
    console.log(`   3. ${event3.title} (21 jours)`)
    console.log(`✅ 3 contributions ajoutées`)
    console.log('─────────────────────────────────────')
    console.log('\n🎉 Script de test terminé avec succès !\n')
    console.log('💡 Vous pouvez maintenant vous connecter avec:')
    console.log('   Email: nicolas.laborde@example.com')
    console.log('   Mot de passe: password123')
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
