// Update image/asset by creator (PATCH /images/:id)
import db from '../modules/index.js';
const { images: Images } = db;

export const updateCreatorImageController = async (req, res) => {
    try {
        const user = req.user;
        const creatorId = user?.creatorId;
        const imageId = req.params.id;
        if (!creatorId) {
            return res.status(403).json({ status: 403, success: false, message: 'Not a creator' });
        }
        const image = await Images.findById(imageId);
        if (!image) {
            return res.status(404).json({ status: 404, success: false, message: 'Asset not found' });
        }
        if (image.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({ status: 403, success: false, message: 'Not owner of asset' });
        }
        // Only allow updating certain fields
        const allowedFields = [
            'title','description','category','subcategory','subsubcategory','keywords','tags','imageUrl','s3Key','s3Url','fileMetadata','mediaVariants','zipfolder','zipfolderurl','approved','rejected','rejectionReason','freePremium'
        ];
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                image[key] = req.body[key];
            }
        }
        // If imageUrl is updated, also update imageData for backward compatibility
        if (req.body.imageUrl) {
            image.imageData = [
                {
                    url: req.body.imageUrl,
                    s3Key: req.body.s3Key || '',
                    fileName: req.body.fileMetadata?.fileName || '',
                    fileSize: req.body.fileMetadata?.fileSize || '',
                    mimeType: req.body.fileMetadata?.mimeType || '',
                    uploadedAt: req.body.fileMetadata?.uploadedAt || new Date()
                }
            ];
        }
        await image.save();
        return res.status(200).json({ status: 200, success: true, data: image });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

// Delete image/asset by creator (DELETE /images/:id)
export const deleteCreatorImageController = async (req, res) => {
    try {
        const user = req.user;
        const creatorId = user?.creatorId;
        const imageId = req.params.id;
        if (!creatorId) {
            return res.status(403).json({ status: 403, success: false, message: 'Not a creator' });
        }
        const image = await Images.findById(imageId);
        if (!image) {
            return res.status(404).json({ status: 404, success: false, message: 'Asset not found' });
        }
        if (image.creatorId.toString() !== creatorId.toString()) {
            return res.status(403).json({ status: 403, success: false, message: 'Not owner of asset' });
        }
        await image.deleteOne();
        return res.status(200).json({ status: 200, success: true, message: 'Asset deleted' });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};
import { deleteImagesFIlesObjects, filterationByAll, getallData, getAllImagesfromDataBase, getAllUserImageById, saveImagesDataonDB, searchApiFromDBForImagesFilteration, updateImageApprovalOrRejectService, updateImageRejectService, getCreatorByUser } from "../services/images.services.js";


const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4'];
const MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_VIDEO_BYTES = 120 * 1024 * 1024; // 120 MB

const validateUploadPayload = (body) => {
    const errors = [];
    // Use creatorId instead of userId
    const requiredFields = ['creatorId', 'imageUrl', 'category', 'title', 'description'];

    requiredFields.forEach((field) => {
        if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
            errors.push(`${field} is required`);
        }
    });

    if (!Array.isArray(body.keywords) || body.keywords.filter(Boolean).length < 5) {
        errors.push('At least 5 keywords are required');
    }

    if (!body.termsConditions) {
        errors.push('Terms must be accepted');
    }

    if (body.title && body.title.trim().length < 3) {
        errors.push('Title must be at least 3 characters');
    }

    if (body.description && body.description.trim().length < 20) {
        errors.push('Description must be at least 20 characters');
    }

    // File metadata validation
    if (body.fileMetadata) {
        const meta = body.fileMetadata;
        if (!meta.mimeType || !ALLOWED_MIME_TYPES.includes(meta.mimeType)) {
            errors.push('Invalid mimeType');
        }
        if (meta.fileSize !== null && meta.fileSize !== undefined) {
            const sizeNum = Number(meta.fileSize);
            if (Number.isNaN(sizeNum) || sizeNum <= 0) {
                errors.push('Invalid fileSize');
            } else {
                const isVideo = meta.mimeType === 'video/mp4' || (meta.mimeType && meta.mimeType.startsWith('video/'));
                const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
                if (sizeNum > limit) {
                    errors.push(`File too large. Max ${isVideo ? '120MB' : '30MB'}`);
                }
            }
        }
    }

    return errors;
};

import Category from '../modules/category.js';

const saveImages = async (req, res) => {
    try {
        const { imagesize, imagetype, imageUrl, imageDetail, category, subcategory, subsubcategory, title, description, freePremium, expireimagedate, zipfolder, zipfolderurl, termsConditions, permissionLetter, keywords, imageData, s3Key, s3Url, fileMetadata } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ status: 401, success: false, message: 'unauthorized' });
        }
        const creator = await getCreatorByUser(user._id);
        const isApprovedCreator = user.role === 'creator' || creator?.status === 'approved';
        if (!isApprovedCreator) {
            return res.status(403).json({ status: 403, success: false, message: 'creator_required' });
        }
        // Validate category IDs
        const catIds = [category, subcategory, subsubcategory].filter(Boolean);
        for (const catId of catIds) {
            if (catId) {
                const exists = await Category.findById(catId);
                if (!exists) {
                    return res.status(400).json({ status: 400, success: false, message: `Invalid category ID: ${catId}` });
                }
            }
        }
        // Use creatorId for image
        const obj = { imagesize, imagetype, imageUrl, imageDetail, creatorId: creator?._id, category, subcategory, subsubcategory, title, description, freePremium, expireimagedate, zipfolder, zipfolderurl, termsConditions, permissionLetter, keywords, imageData, s3Key, s3Url, fileMetadata };
        const validationErrors = validateUploadPayload(obj);
        if (validationErrors.length) {
            return res.status(400).json({ status: 400, success: false, message: 'validation_failed', errors: validationErrors });
        }
        await saveImagesDataonDB(obj);
        return res.status(200).json({ status: 200, success: true, message: "success" })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

const AllImagesfromDB = async (req, res) => {
    try {
        // Always fetch fresh data from MongoDB, never cache
        const response = await Images.find({ approved: true })
            .populate('category subcategory subsubcategory')
            .exec();
        return res.status(200).json({ status: 200, message: 'success', data: response })
    } catch (error) {
        console.log("SERVER ERROR", error.message)
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

const getAllImages = async (req, res) => {
    try {
        const { id } = req.body;
        const response = await getAllUserImageById(id)
        return res.status(200).json({ status: 200, success: true, message: "success", data: response })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "server error", errormessage: error.message })
    }
}

const fileObjectDelete = async (req, res) => {
    try {
        const { id } = req.body;
        console.log("onject id", id)
        const response = await deleteImagesFIlesObjects(id)
        return res.status(200).json({ status: 200, message: "file Object Delete success" })
    } catch (error) {
        console.log("ERROR FORM DELETE IMAGES OBJECT", error.message)
        return res.status(500).json({ status: 500, message: "server error", errormessage: error.message })
    }
}

const searchFilterationImages = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        const response = await searchApiFromDBForImagesFilteration(searchQuery)
        return res.status(200).json({ status: 200, message: 'successful', success: true, data: response })
    } catch (error) {
        console.log("ERROR MESSAGE", error.message)
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

const approvedimages = async (req, res) => {
    try {
        const { id } = req.body;
        const response = await updateImageApprovalOrRejectService(id);
        return res.status(200).json({ status: 200, success: true, message: "success" })
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}
const rejectedimages = async (req, res) => {
    try {
        const { id, reason } = req.body;
        const response = await updateImageRejectService(id, reason);
        return res.status(200).json({ status: 200, success: true, message: "success rejected" })
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

const getDataAllFromDB = async (req, res) => {
    try {
        const response = await getallData()
        return res.status(200).json({ status: 200, message: 'success', data: response })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "server error", errormessage: error.message })
    }
}

const filterationByWord = async (req,res) => {
    try {
        const searchTerm = req.query.searchTerm?.trim().toLowerCase();
        const response = await filterationByAll(searchTerm);
        return res.status(200).json({ status: 200, success: true, message: 'success', data: response })
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

export {
    saveImages,
    getAllImages,
    AllImagesfromDB,
    fileObjectDelete,
    searchFilterationImages,
    approvedimages,
    rejectedimages,
    getDataAllFromDB,
    filterationByWord
}