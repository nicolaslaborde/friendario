import './env-setup'
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'

const regions = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'eu-central-1',
    'ap-southeast-1',
    'ap-northeast-1',
]

const bucketName = 'friendoria-media'

async function findBucketRegion() {
    console.log(`🔍 Recherche de la région du bucket "${bucketName}"...\n`)

    for (const region of regions) {
        try {
            const client = new S3Client({
                region,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                },
            })

            const command = new HeadBucketCommand({ Bucket: bucketName })
            await client.send(command)

            console.log(`✅ TROUVÉ ! Le bucket est dans la région: ${region}`)
            return region
        } catch (error: any) {
            if (region === 'us-east-1') {
                console.log(`🔍 ${region}: Détails de l'erreur:`)
                console.log(JSON.stringify(error, null, 2))
            }

            if (error.name === 'NotFound') {
                console.log(`❌ ${region}: Bucket non trouvé`)
            } else if (error.$metadata?.httpStatusCode === 301) {
                console.log(`⚠️  ${region}: Redirect (mauvaise région)`)
            } else if (error.$metadata?.httpStatusCode === 200) {
                console.log(`✅ TROUVÉ ! Le bucket est dans la région: ${region}`)
                return region
            } else {
                console.log(`⚠️  ${region}: ${error.name || error.message}`)
            }
        }
    }

    console.log('\n❌ Bucket non trouvé dans aucune des régions testées.')
    return null
}

findBucketRegion()
    .then((region) => {
        if (region) {
            console.log(`\n💡 Mettez à jour AWS_REGION="${region}" dans votre fichier env.local`)
        }
    })
    .catch((error) => {
        console.error('❌ Erreur:', error)
        process.exit(1)
    })
