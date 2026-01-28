

import db from "../modules/index.js";
import { applyCreator, getCreatorByUser, updateCreatorStatus as updateCreatorStatusCreator } from "./creators.services.js";
const { users: Users, token: Token } = db;

// CREATE a new user
async function createUser(payload) {
    if (!payload || !payload.email) throw new Error("User payload with email is required");
    try {
        const user = new Users({ ...payload });
        return await user.save();
    } catch (error) {
        throw error;
    }
}

// READ: Get user by ID
async function getUserById(id) {
    if (!id) throw new Error("User ID is required");
    try {
        return await Users.findById(id).exec();
    } catch (error) {
        throw error;
    }
}

// READ: Get user by email
async function getUserByEmail(email) {
    if (!email) throw new Error("Email is required");
    try {
        return await Users.findOne({ email }).exec();
    } catch (error) {
        throw error;
    }
}

// READ: Get all users
async function getAllUsers() {
    try {
        return await Users.find({}).exec();
    } catch (error) {
        throw error;
    }
}

// UPDATE: Update user by ID
async function updateUserById(id, update) {
    if (!id) throw new Error("User ID is required");
    if (!update || typeof update !== 'object') throw new Error("Update object is required");
    try {
        return await Users.findByIdAndUpdate(id, { ...update }, { new: true }).exec();
    } catch (error) {
        throw error;
    }
}

// DELETE: Delete user by ID
async function deleteUserById(id) {
    if (!id) throw new Error("User ID is required");
    try {
        return await Users.findByIdAndDelete(id).exec();
    } catch (error) {
        throw error;
    }
}

// TOKEN: Save a token for a user
async function tokenSave(payload) {
    if (!payload || !payload.token || !payload.user) throw new Error("Token payload with token and user is required");
    try {
        const token = new Token({ ...payload });
        return await token.save();
    } catch (error) {
        throw error;
    }
}

// AUTH: Logout user (delete all tokens for user)
async function logoutUser(uid) {
    if (!uid) throw new Error("User ID is required for logout");
    try {
        return await Token.deleteMany({ user: uid });
    } catch (error) {
        throw error;
    }
}

// Contributor/Creator helpers (unchanged)
async function applyContributor(_id, contributorProfile) {
    return applyCreator(_id, contributorProfile);
}
async function getContributorStatus(_id) {
    return getCreatorByUser(_id);
}
async function updateContributorStatus(_id, status, reviewerId = null, reason = null) {
    return updateCreatorStatusCreator({ userId: _id, status, reviewerId, reason });
}

export {
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUserById,
    deleteUserById,
    tokenSave,
    logoutUser,
    applyContributor,
    getContributorStatus,
    updateContributorStatus
};

const getAllUsersData = async (email) => {
    try {
        const response = await Users.find({ email: email }).exec();
        return response
    } catch (error) {
        throw error
    }
}
const isACtiveUpdate = async (id) => {
    try {
        console.log(id)
        const response = await Users.updateOne(
            { _id: id },
            {
                $set: { isActive: true },
            },
            { upsert: true }
        );
        console.log(response)
        return response
    } catch (error) {
        throw error
    }
}

 
const changePass = async (id, password) => {
    try {
        const response = await Users.updateOne(
            { _id: id },
            { password: password },
        );
        console.log(response)
        return response
    } catch (error) {
        throw error;
    }
}
const getAllSTudentsDetails = async () => {
    try {
        const res = await Users.find();
        return res
    } catch (error) {
        throw error
    }
}

const deleteStudentById = async (_id) => {
    try {
        const response = await Users.findByIdAndDelete(_id)
    } catch (error) {
        throw error;
    }
}



const updateUserProfileData = async (_id, payload) => {
    try {
        console.log(payload)
        const response = await Users.findByIdAndUpdate(
            _id,
            { ...payload },
            // { new: true } // To return the updated document
        );
        console.log("SUCCESSFULL RESPONSE", response)
        return response; // Return the response data
    } catch (error) {
        throw error;
    }
};


const getUserDataById = async (_id) => {
    try {
        const response = await Users.findById({ _id }).exec();
        return response
    } catch (error) {
        throw error;
    }
}

const getUser = async () => {
    try {
        const response = await Users.find({}).exec();
        return response;
    } catch (error) {
        throw error;
    }
}

// Legacy contributor functions now delegate to creators service
// const applyContributor = async (_id, contributorProfile) => applyCreator(_id, contributorProfile);

// const getContributorStatus = async (_id) => getCreatorByUser(_id);

// const updateContributorStatus = async (_id, status, reviewerId = null, reason = null) => updateCreatorStatusCreator({ userId: _id, status, reviewerId, reason });

// Only export legacy functions that are not already exported above
export {
    getAllUsersData,
    isACtiveUpdate,
    changePass,
    getAllSTudentsDetails,
    deleteStudentById,
    updateUserProfileData,
    getUserDataById,
    getUser
};