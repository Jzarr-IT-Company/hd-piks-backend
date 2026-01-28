import db from "../modules/index.js"; 

const { collections: Collections, images: Images } = db; // this is mongoose collection models 


const createCollection = async (payload) => {  // create new collection
    const doc = await Collections({ ...payload });
    return doc.save();
};

const getCollectionsByUser = async (userId) => {  // get all collections for a userID
    return Collections.find({ userId }).sort({ createdAt: -1 }).exec();
};

const addAssetToCollection = async (collectionId, assetId) => { // add asset to collection
    await Collections.findByIdAndUpdate(
        collectionId,
        { $addToSet: { items: assetId } },
        { new: true }
    );
    await Images.findByIdAndUpdate(
        assetId,
        { $addToSet: { collections: collectionId } }
    );
    return true;
};

const updateCollection = async (collectionId, update) => {  // update collection details
    return Collections.findByIdAndUpdate(collectionId, update, { new: true });
};

const deleteCollection = async (collectionId) => {  // delete a collection
    // Remove collection reference from images
    const collection = await Collections.findById(collectionId);
    if (collection) {
        await Images.updateMany(
            { _id: { $in: collection.items } },
            { $pull: { collections: collectionId } }
        );
    }
    return Collections.findByIdAndDelete(collectionId);
};

const removeAssetFromCollection = async (collectionId, assetId) => {  // remove asset from collection
    await Collections.findByIdAndUpdate(
        collectionId,
        { $pull: { items: assetId } },
        { new: true }
    );
    await Images.findByIdAndUpdate(
        assetId,
        { $pull: { collections: collectionId } }
    );
    return true;
};

const getCollectionItems = async (collectionId) => {  // get items of a collection
    const collection = await Collections.findById(collectionId).populate('items');
    return collection ? collection.items : [];
};

export {
    createCollection,
    getCollectionsByUser,
    addAssetToCollection,
    updateCollection,
    deleteCollection,
    removeAssetFromCollection,
    getCollectionItems
};
