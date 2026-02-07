import db from '../modules/index.js';
// If you ever need the Category model directly in this file, import it from:
// import Category from '../modules/category.js';

import sharp from 'sharp';
import serverConfig from '../config/server.config.js';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const { images: Images, creators: Creators } = db;

// S3 client reused for variant generation
const s3Client = new S3Client({
	region: serverConfig.aws.region,
	credentials: {
		accessKeyId: serverConfig.aws.accessKeyId,
		secretAccessKey: serverConfig.aws.secretAccessKey,
	},
});

// Update image status by admin (approve/reject)
const updateImageStatusById = async (id, status, reason = null) => {
    if (status === 'approved') {
        return updateImageApprovalOrRejectService(id);
    } else if (status === 'rejected') {
        return updateImageRejectService(id, reason);
    } else {
        // Optionally handle 'pending' or other statuses
        return Images.findByIdAndUpdate(
            id,
            { $set: { approved: false, rejected: false, rejectionReason: null } },
            { new: true }
        );
    }
};

export const getCreatorByUser = async (userId) => {
    return Creators.findOne({ userId });
};

const saveImagesDataonDB = async (payload) => {
    try {
        const dataResponse = await Images({ ...payload });
        return await dataResponse.save()
    } catch (error) {
        throw error;
    }
};

const getAllUserImageById = async (id) => {
    try {
        const response = await Images.find({ creatorId: id }).exec();
        return response;
    } catch (error) {
        throw error;
    }
};

const getAllImagesfromDataBase = async () => {
    try {
        // Remove caching temporarily to test
        const response = await Images.find({ approved: true }).exec();
        console.log("Fetched from DB:", response.map(x => x.category)); // Add this line
        return response;
    } catch (error) {
        throw error;
    }
};

const getallData = async () => {
    try {
        const response = await Images.find({}).exec();
        return response
    } catch (error) {
        throw error;
    }
};

const deleteImagesFIlesObjects = async (_id) => {
    try {
        const response = await Images.findByIdAndDelete({ _id });
        return response;
    } catch (error) {
        throw error;
    }
};

const searchApiFromDBForImagesFilteration = async (searchQuery) => {
    try {
        if (!searchQuery) return [];
        const queryWords = searchQuery.trim().split(" ").map(word => new RegExp(word, 'i'));
        const response = await Images.find({
            $or: [
                { category: { $in: queryWords } },
                { subcategory: { $in: queryWords } },
                { subsubcategory: { $in: queryWords } },
                { title: { $in: queryWords } },
                { description: { $in: queryWords } },
                { keywords: { $in: queryWords } }
            ]
        })
            .limit(50)
            .exec();
        return response.length > 0 ? response : [];
    } catch (error) {
        console.error("Error searching images:", error);
        throw error;
    }
};

const updateImageApprovalOrRejectService = async (_id) => {
    try {
        const response = await Images.findByIdAndUpdate(
            _id,
            {
                $set: {
                    rejected: false,
                    approved: true
                }
            },
            { new: true }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

const updateImageRejectService = async (_id, reason = null) => {
    try {
        const update = {
            rejected: true,
            approved: false
        };
        if (reason) update.rejectionReason = reason;
        const response = await Images.findByIdAndUpdate(
            _id,
            { $set: update },
            { new: true }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

const filterationByAll = async (searchTerm) => {
    try {
        const response = await Images.find({}).exec();
        return response
    } catch (error) {
        throw error;
    }
};

export const generateImageVariants = async (imageDoc) => {
	try {
		if (!imageDoc || !imageDoc.s3Key) return;

		const mime = imageDoc.fileMetadata?.mimeType || '';
		// Only generate variants for images (skip videos and others)
		if (!mime.startsWith('image/')) return;

		// 1) Download original from S3
		const getCmd = new GetObjectCommand({
			Bucket: serverConfig.aws.bucket,
			Key: imageDoc.s3Key,
		});
		const resp = await s3Client.send(getCmd);

		const chunks = [];
		for await (const chunk of resp.Body) {
			chunks.push(chunk);
		}
		const originalBuffer = Buffer.concat(chunks);
		const originalMeta = await sharp(originalBuffer).metadata();
		const originalWidth = originalMeta.width || 0;

		// 2) Define desired sizes (always generate all; clamp to originalWidth to avoid upscaling)
		const sizeDefs = [
			{ variant: 'thumbnail', width: 300 },
			{ variant: 'small', width: 800 },
			{ variant: 'medium', width: 1400 },
			{ variant: 'large', width: 2000 },
		];

		const ext = mime === 'image/png' ? 'png' : 'jpg';
		const variants = [];

		// 3) Generate and upload each resized variant
		for (const def of sizeDefs) {
			// If original is smaller, don't upscale; use originalWidth
			const targetWidth = originalWidth && originalWidth < def.width ? originalWidth : def.width;

			const resized = await sharp(originalBuffer)
				.resize({ width: targetWidth })
				.toBuffer();
			const resizedMeta = await sharp(resized).metadata();

			const key = `images/${imageDoc.creatorId}/${imageDoc._id}/variants/${def.variant}.${ext}`;

			const putCmd = new PutObjectCommand({
				Bucket: serverConfig.aws.bucket,
				Key: key,
				Body: resized,
				ContentType: mime,
			});
			await s3Client.send(putCmd);

			variants.push({
				variant: def.variant,
				url: `https://${serverConfig.aws.domain}/${key}`,
				s3Key: key,
				dimensions: {
					width: resizedMeta.width || null,
					height: resizedMeta.height || null,
				},
				fileSize: resized.length,
			});
		}

		// 4) Add original as a variant entry
		variants.push({
			variant: 'original',
			url: imageDoc.s3Url || imageDoc.imageUrl,
			s3Key: imageDoc.s3Key,
			dimensions: {
				width: imageDoc.fileMetadata?.dimensions?.width || originalMeta.width || null,
				height: imageDoc.fileMetadata?.dimensions?.height || originalMeta.height || null,
			},
			fileSize: imageDoc.fileMetadata?.fileSize || originalBuffer.length,
		});

		// 5) Persist mediaVariants on the same image doc
		await Images.findByIdAndUpdate(
			imageDoc._id,
			{ mediaVariants: variants },
			{ new: true }
		);
	} catch (err) {
		console.error('[generateImageVariants] failed for image', imageDoc?._id, err);
	}
};

export {
    saveImagesDataonDB,
    getAllUserImageById,
    getAllImagesfromDataBase,
    deleteImagesFIlesObjects,
    searchApiFromDBForImagesFilteration,
    updateImageApprovalOrRejectService,
    updateImageRejectService,
    updateImageStatusById,
    getallData,
    filterationByAll,
    // ensure generateImageVariants is exported
};