import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import serverConfig from "../config/server.config.js";

const s3Client = new S3Client({
    region: serverConfig.aws.region,
    credentials: {
        accessKeyId: serverConfig.aws.accessKeyId,
        secretAccessKey: serverConfig.aws.secretAccessKey
    }
});

// 1. Initiate multipart upload
export async function initiateMultipartUpload({ fileName, fileType, category }) {
    const Key = `${category || "uploads"}/${Date.now()}-${fileName}`;
    const command = new CreateMultipartUploadCommand({
        Bucket: serverConfig.aws.bucket,
        Key,
        ContentType: fileType
    });
    const response = await s3Client.send(command);
    return { uploadId: response.UploadId, key: Key };
}

// 2. Get presigned URL for a part
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export async function getMultipartPresignedUrl({ key, uploadId, partNumber }) {
    const command = new UploadPartCommand({
        Bucket: serverConfig.aws.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
}

// 3. Complete multipart upload
export async function completeMultipartUpload({ key, uploadId, parts }) {
    const command = new CompleteMultipartUploadCommand({
        Bucket: serverConfig.aws.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
    });
    const response = await s3Client.send(command);
    return {
        ...response,
        s3Key: key,
        s3Url: `https://${serverConfig.aws.domain}/${key}`
    };
}

// 4. Abort multipart upload
export async function abortMultipartUpload({ key, uploadId }) {
    const command = new AbortMultipartUploadCommand({
        Bucket: serverConfig.aws.bucket,
        Key: key,
        UploadId: uploadId
    });
    return await s3Client.send(command);
}
