// Persist S3 profile image URL in user model
import db from '../modules/index.js';
export const saveProfileImageUrl = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user._id) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Unauthorized: user not found in request"
            });
        }
        const { s3Url, s3Key, fileSize, mimeType } = req.body;
        if (!s3Url || !s3Key) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "s3Url and s3Key are required"
            });
        }
        const update = {
            profileImage: {
                url: s3Url,
                s3Key,
                uploadedAt: new Date(),
                fileSize: fileSize || null,
                mimeType: mimeType || null
            }
        };
        const Users = db.users;
        await Users.findByIdAndUpdate(user._id, update);
        return res.status(200).json({
            status: 200,
            success: true,
            message: "Profile image URL saved successfully"
        });
    } catch (error) {
        console.error("Error saving profile image URL:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Error saving profile image URL",
            error: error.message
        });
    }
};
// Get presigned URL for profile image upload
export const getPresignedProfileImageUrl = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user._id) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Unauthorized: user not found in request"
            });
        }

        const { fileName, fileType } = req.body;
        if (!fileName || !fileType) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "fileName and fileType are required"
            });
        }

        // Use a fixed folder for profile images, with userId as subfolder
        const userId = user._id.toString();
        const baseFolder = `profile-images/${userId}`;
        const safeFileName = (fileName || 'profile').toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
        const s3Key = `${baseFolder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${safeFileName}`;

        // Use the same S3 client as in s3.utils.js
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        const serverConfig = (await import("../config/server.config.js")).default;
        const s3Client = new S3Client({
            region: serverConfig.aws.region,
            credentials: {
                accessKeyId: serverConfig.aws.accessKeyId,
                secretAccessKey: serverConfig.aws.secretAccessKey
            }
        });
        const command = new PutObjectCommand({
            Bucket: serverConfig.aws.bucket,
            Key: s3Key,
            ContentType: fileType,
        });
        const expiresIn = 3600;
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        const s3Url = `https://${serverConfig.aws.domain}/${s3Key}`;

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Presigned profile image URL generated successfully",
            data: {
                presignedUrl,
                s3Key,
                s3Url
            }
        });
    } catch (error) {
        console.error("Error generating presigned profile image URL:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Error generating presigned profile image URL",
            error: error.message
        });
    }
};
import { generatePresignedUploadUrl, deleteS3Object } from "../utils/s3.utils.js";

// Get presigned URL for upload
export const getPresignedUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType, category, subcategory, subsubcategory } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "fileName and fileType are required"
            });
        }

        const result = await generatePresignedUploadUrl(
            fileName,
            fileType,
            category,
            subcategory,
            subsubcategory
        );

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Presigned URL generated successfully",
            data: result
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Error generating presigned URL",
            error: error.message
        });
    }
};

// Delete file from S3
export const deleteFile = async (req, res) => {
    try {
        const { s3Key } = req.body;

        if (!s3Key) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "s3Key is required"
            });
        }

        await deleteS3Object(s3Key);

        return res.status(200).json({
            status: 200,
            success: true,
            message: "File deleted successfully from S3"
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Error deleting file",
            error: error.message
        });
    }
};