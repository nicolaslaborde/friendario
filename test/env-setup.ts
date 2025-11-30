import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// 1. Load .env (contains DB password, but placeholder AWS keys)
const result = dotenv.config({ path: path.join(process.cwd(), '.env') })
if (result.error) {
    console.error('❌ Erreur chargement .env:', result.error)
}

// 2. Manually load env.local to override AWS keys
try {
    const localEnvPath = path.join(process.cwd(), 'env.local')
    if (fs.existsSync(localEnvPath)) {
        const localEnvConfig = dotenv.parse(fs.readFileSync(localEnvPath))

        // Override AWS keys if present in env.local
        if (localEnvConfig.AWS_ACCESS_KEY_ID) {
            process.env.AWS_ACCESS_KEY_ID = localEnvConfig.AWS_ACCESS_KEY_ID
        }
        if (localEnvConfig.AWS_SECRET_ACCESS_KEY) {
            process.env.AWS_SECRET_ACCESS_KEY = localEnvConfig.AWS_SECRET_ACCESS_KEY
        }
        if (localEnvConfig.AWS_REGION) {
            process.env.AWS_REGION = localEnvConfig.AWS_REGION
        }
        if (localEnvConfig.S3_BUCKET_MEDIA) {
            process.env.S3_BUCKET_MEDIA = localEnvConfig.S3_BUCKET_MEDIA
        }

        console.log('✅ AWS keys loaded from env.local')
    }
} catch (error) {
    console.error('⚠️ Erreur lecture env.local:', error)
}

console.log('📂 CWD:', process.cwd())
console.log('🔑 AWS_ACCESS_KEY_ID loaded:', process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 5) + '...' : 'UNDEFINED')
