import {
    addAssetToCollection,
    createCollection,
    getCollectionsByUser,
    updateCollection,
    deleteCollection,
    removeAssetFromCollection,
    getCollectionItems
} from "../services/collections.services.js";

const createUserCollection = async (req, res) => {
    try {
        const { userId, name, description } = req.body;
        if (!userId || !name) {
            return res.status(400).json({ status: 400, success: false, message: "userId and name are required" });
        }
        const response = await createCollection({ userId, name, description });
        return res.status(200).json({ status: 200, success: true, data: response });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};

const getUserCollections = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ status: 400, success: false, message: "userId is required" });
        }
        const response = await getCollectionsByUser(userId);
        return res.status(200).json({ status: 200, success: true, data: response });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};

const addToCollection = async (req, res) => {
    try {
        const { collectionId, assetId } = req.body;
        if (!collectionId || !assetId) {
            return res.status(400).json({ status: 400, success: false, message: "collectionId and assetId are required" });
        }
        await addAssetToCollection(collectionId, assetId);
        return res.status(200).json({ status: 200, success: true, message: "Asset added to collection" });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};



const updateUserCollection = async (req, res) => {
    try {
        const { collectionId, name, description } = req.body;
        if (!collectionId || (!name && !description)) {
            return res.status(400).json({ status: 400, success: false, message: "collectionId and at least one field to update are required" });
        }
        const update = {};
        if (name) update.name = name;
        if (description) update.description = description;
        const response = await updateCollection(collectionId, update);
        return res.status(200).json({ status: 200, success: true, data: response });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};

const deleteUserCollection = async (req, res) => {
    try {
        const { collectionId } = req.body;
        if (!collectionId) {
            return res.status(400).json({ status: 400, success: false, message: "collectionId is required" });
        }
        await deleteCollection(collectionId);
        return res.status(200).json({ status: 200, success: true, message: "Collection deleted" });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};

const removeFromCollection = async (req, res) => {
    try {
        const { collectionId, assetId } = req.body;
        if (!collectionId || !assetId) {
            return res.status(400).json({ status: 400, success: false, message: "collectionId and assetId are required" });
        }
        await removeAssetFromCollection(collectionId, assetId);
        return res.status(200).json({ status: 200, success: true, message: "Asset removed from collection" });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};

const getCollectionAssets = async (req, res) => {
    try {
        const { collectionId } = req.query;
        if (!collectionId) {
            return res.status(400).json({ status: 400, success: false, message: "collectionId is required" });
        }
        const items = await getCollectionItems(collectionId);
        return res.status(200).json({ status: 200, success: true, data: items });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message });
    }
};

export {
    createUserCollection,
    getUserCollections,
    addToCollection,
    updateUserCollection,
    deleteUserCollection,
    removeFromCollection,
    getCollectionAssets
};
