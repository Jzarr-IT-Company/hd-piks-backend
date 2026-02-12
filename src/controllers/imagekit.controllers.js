import crypto from "crypto";
import db from "../modules/index.js";
import serverConfig from "../config/server.config.js";
import { getCreatorByUser } from "../services/creators.services.js";

const { images: Images } = db;

const formatBytes = (bytes) => {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return null;
    const units = ["B", "KB", "MB", "GB"];
    let value = n;
    let idx = 0;
    while (value >= 1024 && idx < units.length - 1) {
        value /= 1024;
        idx += 1;
    }
    return `${value.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
};

const mimeFromUrl = (url, fallback = "image/png") => {
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        if (pathname.endsWith(".png")) return "image/png";
        if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
        if (pathname.endsWith(".webp")) return "image/webp";
        if (pathname.endsWith(".gif")) return "image/gif";
        if (pathname.endsWith(".avif")) return "image/avif";
        return fallback;
    } catch {
        return fallback;
    }
};

export const getImageKitAuthParams = async (req, res) => {
    try {
        const { publicKey, privateKey, urlEndpoint } = serverConfig.imagekit || {};
        if (!publicKey || !privateKey || !urlEndpoint) {
            return res.status(500).json({
                success: false,
                message: "ImageKit is not configured on server",
            });
        }

        const token = crypto.randomUUID();
        const expire = Math.floor(Date.now() / 1000) + 60 * 10; // 10 min
        const signature = crypto
            .createHmac("sha1", privateKey)
            .update(token + expire)
            .digest("hex");

        return res.status(200).json({
            success: true,
            data: {
                publicKey,
                urlEndpoint,
                authenticationParameters: {
                    token,
                    expire,
                    signature,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate ImageKit auth parameters",
            error: error.message,
        });
    }
};

export const saveEditedImageAsset = async (req, res) => {
    try {
        const user = req.user;
        if (!user?._id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const creator = await getCreatorByUser(user._id);
        if (!creator?._id) {
            return res.status(403).json({ success: false, message: "Creator profile is required" });
        }

        const {
            sourceImageId,
            imageUrl,
            s3Key = null,
            s3Url = null,
            title,
            description,
            keywords,
            category,
            subcategory,
            subsubcategory,
            freePremium = "free",
            fileMetadata = {},
            editConfig = null,
            zipfolder = [],
            zipfolderurl = "",
        } = req.body || {};

        const source = sourceImageId ? await Images.findById(sourceImageId).lean() : null;
        if (sourceImageId && !source) {
            return res.status(404).json({ success: false, message: "Source image not found" });
        }

        const finalCategory = category || source?.category;
        if (!finalCategory) {
            return res.status(400).json({ success: false, message: "category is required" });
        }

        const finalImageUrl = imageUrl || source?.imageUrl;
        if (!finalImageUrl) {
            return res.status(400).json({ success: false, message: "imageUrl is required" });
        }

        const normalizedKeywords = Array.isArray(keywords)
            ? keywords
            : source?.keywords || [];

        const normalizedFileMetadata = {
            mimeType:
                (fileMetadata.mimeType && fileMetadata.mimeType.includes("/")
                    ? fileMetadata.mimeType
                    : null) ||
                mimeFromUrl(finalImageUrl, source?.fileMetadata?.mimeType || "image/png"),
            fileSize: Number(fileMetadata.fileSize || source?.fileMetadata?.fileSize || 0) || null,
            fileSizeFormatted:
                fileMetadata.fileSizeFormatted ||
                formatBytes(fileMetadata.fileSize) ||
                source?.fileMetadata?.fileSizeFormatted ||
                null,
            dimensions: {
                width: fileMetadata?.dimensions?.width ?? source?.fileMetadata?.dimensions?.width ?? null,
                height: fileMetadata?.dimensions?.height ?? source?.fileMetadata?.dimensions?.height ?? null,
            },
            duration: fileMetadata.duration ?? source?.fileMetadata?.duration ?? null,
            uploadedAt: new Date(),
            uploadedBy: user._id,
        };

        const payload = {
            imageUrl: finalImageUrl,
            s3Key,
            s3Url,
            category: finalCategory,
            subcategory: subcategory ?? source?.subcategory ?? null,
            subsubcategory: subsubcategory ?? source?.subsubcategory ?? null,
            title: title || source?.title || "Edited Asset",
            description: description ?? source?.description ?? null,
            keywords: normalizedKeywords,
            freePremium,
            imagesize: normalizedFileMetadata.fileSizeFormatted || null,
            imagetype: normalizedFileMetadata.mimeType || null,
            fileMetadata: normalizedFileMetadata,
            expireimagedate: "",
            zipfolder,
            zipfolderurl,
            imageData: [
                {
                    url: finalImageUrl,
                    s3Key: s3Key || null,
                    fileName: finalImageUrl.split("/").pop() || "edited-image",
                    fileSize: normalizedFileMetadata.fileSize,
                    mimeType: normalizedFileMetadata.mimeType,
                    uploadedAt: new Date().toISOString(),
                },
            ],
            termsConditions: true,
            permissionLetter: true,
            approved: false,
            rejected: false,
            rejectionReason: null,
            creatorId: creator._id,
            views: 0,
            downloads: 0,
            likes: 0,
            tags: source?.tags || [],
            collections: [],
            mediaVariants: [
                {
                    variant: "original",
                    url: finalImageUrl,
                    s3Key: s3Key || null,
                    dimensions: {
                        width: normalizedFileMetadata?.dimensions?.width || null,
                        height: normalizedFileMetadata?.dimensions?.height || null,
                    },
                    fileSize: normalizedFileMetadata.fileSize || null,
                },
            ],
            isEdited: true,
            originalImageId: source?._id || null,
            editConfig,
            sourceProvider: "imagekit",
        };

        const created = await Images.create(payload);
        return res.status(201).json({
            success: true,
            message: "Edited image asset saved",
            data: created,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to save edited image asset",
            error: error.message,
        });
    }
};
