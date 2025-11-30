import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

export interface UploadParams {
    bucket: string
    key: string
    body: Buffer
    contentType: string
}

/**
 * Upload a file to S3
 */
export async function uploadToS3({ bucket, key, body, contentType }: UploadParams): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    })

    await s3Client.send(command)
    return key
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    })

    await s3Client.send(command)
}

/**
 * Get a signed URL for temporary access to a private S3 object
 */
export async function getSignedS3Url(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generate a unique S3 key for a file
 */
export function generateS3Key(userId: string, eventId: string, filename: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = filename.split('.').pop()
    return `${userId}/${eventId}/${timestamp}-${randomString}.${extension}`
}

/**
 * Get the appropriate S3 bucket based on file type
 */
export function getS3Bucket(type: 'user' | 'event' | 'media'): string {
    switch (type) {
        case 'user':
            return process.env.S3_BUCKET_USERS || 'friendoria-users'
        case 'event':
            return process.env.S3_BUCKET_EVENTS || 'friendoria-events'
        case 'media':
            return process.env.S3_BUCKET_MEDIA || 'friendoria-media'
        default:
            return process.env.S3_BUCKET_MEDIA || 'friendoria-media'
    }
}
