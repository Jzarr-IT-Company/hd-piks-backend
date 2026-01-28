import db from '../modules/index.js';

const { likes: Like } = db;

const saveLikesDataOnDB = async (payload) => {
    try {
        const response = await Like({ ...payload });
        return response.save();
    } catch (error) {
        throw error;
    }
}

const unlikeServices = async ({ imageId, userId }) => {
    try {
        // Remove like by imageId and userId
        const response = await Like.findOneAndDelete({ imageId, userId });
        return response;
    } catch (error) {
        throw error;
    }
}

const getUserLikeStatus = async (imageId, userId) => {
    try {
        const like = await Like.findOne({ imageId, userId });
        return !!like;
    } catch (error) {
        throw error;
    }
}

const getLikeCountForImage = async (imageId) => {
    try {
        return await Like.countDocuments({ imageId });
    } catch (error) {
        throw error;
    }
}

export {
    saveLikesDataOnDB,
    unlikeServices,
    getLikeCountForImage,
    getUserLikeStatus
}