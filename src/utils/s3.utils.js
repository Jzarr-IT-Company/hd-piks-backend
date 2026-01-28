import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import serverConfig from "../config/server.config.js";

const s3Client = new S3Client({
    region: serverConfig.aws.region,
    credentials: {
        accessKeyId: serverConfig.aws.accessKeyId,
        secretAccessKey: serverConfig.aws.secretAccessKey
    }
});

// Build a safe S3 key path based on media type and taxonomy
const sanitizeSegment = (segment, fallback = null) => {
    const trimmed = (segment || '').toString().trim().toLowerCase();
    const cleaned = trimmed
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
        .replace(/-+/g, '-');
    if (cleaned) return cleaned;
    if (fallback) return fallback;
    return null;
};

// Generate presigned URL for upload (PUT request)
export const generatePresignedUploadUrl = async (
    fileName,
    fileType,
    category,
    subcategory,
    subsubcategory,
    expiresIn = 3600
) => {
    try {
        const baseFolder = fileType?.startsWith('video') ? 'videos' : 'images';  // there will be folder based on category
        const safeCategory = sanitizeSegment(category, 'uncategorized'); // default to 'uncategorized' if no category
        const safeSubcategory = sanitizeSegment(subcategory);   // optional
        const safeSubsubcategory = sanitizeSegment(subsubcategory);   // optional
  
        const pathParts = [baseFolder, safeCategory];
        if (safeSubcategory) pathParts.push(safeSubcategory);
        if (safeSubsubcategory) pathParts.push(safeSubsubcategory);

        const safeFileName = (fileName || 'file')
            .toString()
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9._-]/g, '');

        const Key = `${pathParts.join('/')}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${safeFileName}`;
        
        const command = new PutObjectCommand({
            Bucket: serverConfig.aws.bucket,
            Key,
            ContentType: fileType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        
        return {
            presignedUrl,
            s3Key: Key,
            s3Url: `https://${serverConfig.aws.domain}/${Key}`
        };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw error;
    }
};

// Delete file from S3
export const deleteS3Object = async (s3Key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: serverConfig.aws.bucket,
            Key: s3Key
        });
        
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        console.error("Error deleting S3 object:", error);
        throw error;
    }
};

// Generate presigned URL for download (GET request)
export const generatePresignedDownloadUrl = async (s3Key, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: serverConfig.aws.bucket,
            Key: s3Key
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return presignedUrl;
    } catch (error) {
        console.error("Error generating download URL:", error);
        throw error;
    }
};

export default s3Client;