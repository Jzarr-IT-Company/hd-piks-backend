import { saveLikesDataOnDB, unlikeServices, getLikeCountForImage, getUserLikeStatus } from "../services/like.services.js"
// Get like status for a user and asset (imageId, userId)
const getLikeStatusController = async (req, res) => {
    try {
        const { imageId, userId } = req.query;
        if (!imageId || !userId) {
            return res.status(400).json({ status: 400, success: false, message: 'imageId and userId are required' });
        }
        const liked = await getUserLikeStatus(imageId, userId);
        return res.status(200).json({ status: 200, success: true, liked });
    } catch (error) {
        console.log("ERROR", error.message);
        return res.status(500).json({ status: 500, success: false, message: 'server error', errormessage: error.message });
    }
}
// Get like count for an asset (imageId)
const getLikeCountController = async (req, res) => {
    try {
        const { imageId } = req.query;
        if (!imageId) {
            return res.status(400).json({ status: 400, success: false, message: 'imageId is required' });
        }
        const count = await getLikeCountForImage(imageId);
        return res.status(200).json({ status: 200, success: true, count });
    } catch (error) {
        console.log("ERROR", error.message);
        return res.status(500).json({ status: 500, success: false, message: 'server error', errormessage: error.message });
    }
}

const saveLikes = async (req, res) => {
    try {
        const { imageId, userId } = req.body;
        const obj = { imageId, userId };
        const response = await saveLikesDataOnDB(obj)
        return res.status(200).json({ status: 200, success: true, message: 'success' })
    } catch (error) {
        console.log("ERROR", error.message)
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

const unLikController = async (req, res) => {
    try {
        const { imageId, userId } = req.body;
        if (!imageId || !userId) {
            return res.status(400).json({ status: 400, success: false, message: 'imageId and userId are required' });
        }
        const response = await unlikeServices({ imageId, userId });
        return res.status(200).json({ status: 200, success: true, message: "success" });
    } catch (error) {
        console.log("ERROR", error.message);
        return res.status(500).json({ status: 500, success: false, message: 'server error', errormessage: error.message });
    }
}

export {
    saveLikes,
    unLikController,
    getLikeCountController,
    getLikeStatusController
}