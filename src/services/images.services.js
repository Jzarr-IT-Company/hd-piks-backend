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
import db from '../modules/index.js';
const { images: Images, creators: Creators } = db;

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
}

const getAllUserImageById = async (id) => {
    try {
        // Now filter by creatorId instead of userId
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
}



const getallData = async () => {
    try {
        const response = await Images.find({}).exec();
        return response
    } catch (error) {
        throw error;
    }
}

const deleteImagesFIlesObjects = async (_id) => {
    try {
        const response = await Images.findByIdAndDelete({ _id });
        return response;
    } catch (error) {
        throw error;
    }
}

// const searchApiFromDBForImagesFilteration =async(searchQuery)=>{
//     try {
//         const response = await Images.find({
//             $or: [
//                 { category: new RegExp(`^${searchQuery}`, 'i') },
//                 { subcategory: new RegExp(`^${searchQuery}`, 'i') },
//                 { subsubcategory: new RegExp(`^${searchQuery}`, 'i') },
//                 { title: new RegExp(searchQuery, 'i') },
//                 { description: new RegExp(searchQuery, 'i') },
//                 { keywords: { $in: [new RegExp(searchQuery, 'i')] } }
//             ]
//         });
//         return response
//     } catch (error) {
//         throw error;
//     }
// }

// const searchApiFromDBForImagesFilteration = async (searchQuery) => {
//     try {
//         const query = new RegExp(searchQuery, 'i'); // 'i' flag makes it case-insensitive

//         const response = await Images.find({
//             $or: [
//                 { category: query },
//                 { subcategory: query },
//                 { subsubcategory: query },
//                 { title: query },
//                 { description: query },
//                 { keywords: { $in: [query] } }
//             ]
//         })
//         // .sort({ relevanceScore: { $meta: "textScore" } });

//         return response;
//     } catch (error) {
//         throw error;
//     }
// };

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

// const filterationByAll = async (searchTerm) => {
//     try {
//         const query = {
//             $or: [
//                 { category: { $regex: searchTerm, $options: 'i' } },
//                 { subcategory: { $regex: searchTerm, $options: 'i' } },
//                 { subsubcategory: { $regex: searchTerm, $options: 'i' } },
//                 { keywords: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
//             ]
//         };
//         const results = await Images.find(query).exec();
//         return results;  // Return the filtered results
//     } catch (error) {
//         throw error;
//     }
// };


const filterationByAll = async (searchTerm) => {
    // try {
    //     // Try to find exact matches first
    //     const exactQuery = {
    //         $or: [
    //             { title: { $regex: `^${searchTerm}`, $options: 'i' } },
    //             { category: { $regex: `^${searchTerm}`, $options: 'i' } },
    //             { subcategory: { $regex: `^${searchTerm}`, $options: 'i' } },
    //             { subsubcategory: { $regex: `^${searchTerm}`, $options: 'i' } },
    //             { keywords: { $elemMatch: { $regex: `^${searchTerm}`, $options: 'i' } } },
    //         ],
    //     };

    //     let results = await Images.find(exactQuery).exec();

    //     // Perform a broader search only if no exact matches are found
    //     if (results.length === 0) {
    //         const words = searchTerm.split(" "); // Split search term into words
    //         const regexPatterns = words.map(word => new RegExp(word, 'i')); // Create regex for each word

    //         const broadQuery = {
    //             $or: [
    //                 { title: { $regex: new RegExp(words.join("|"), 'i') } },
    //                 { category: { $regex: new RegExp(words.join("|"), 'i') } },
    //                 { subcategory: { $regex: new RegExp(words.join("|"), 'i') } },
    //                 { subsubcategory: { $regex: new RegExp(words.join("|"), 'i') } },
    //                 { keywords: { $elemMatch: { $regex: new RegExp(words.join("|"), 'i') } } },
    //             ],
    //         };

    //         results = await Images.find(broadQuery).exec(); // Update results only if broad search is executed
    //     }

    //     return results; // Return the filtered results
    // } catch (error) {
    //     throw error; // Handle errors
    // }
    try {
        const response = await Images.find({}).exec();
        return response
    } catch (error) {
        throw error;
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
    filterationByAll
}