import jwt from "jsonwebtoken";
import { deleteUserById, getUserByEmail, getAllUsers, getUserById, logoutUser, tokenSave, updateUserById, createUser, applyContributor, updateContributorStatus, getContributorStatus } from "../services/users.services.js";
import { compareHash, hashPassword } from "../utils/hash.util.js";
import serverConfig from "../config/server.config.js";



const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await getUserByEmail(email)
        if (existingUser) {
            return res.status(400).json({ status: 400, success: false, message: "User already exists with this email" });
        }
        const hashedPassword = await hashPassword(password);

        const signupData = {
            name, email, password: hashedPassword
        }
        const response = await createUser(signupData);
        const token = jwt.sign({ email: response.email, username: response.name }, serverConfig.secretKey)
        const tokenResponse = await tokenSave({ token, user: response.id })
        return res.status(200).json({
            status: 200,
            success: true,
            message: "User registered successfully",
            token: tokenResponse,
            response,
            id: response.id
        });
    } catch (error) {
        console.log("ERROR SIGNUP", error.message)
        return res.status(500).json({ status: 500, message: "Internal server error", errormessage: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)
        const existingUser = await getUserByEmail(email)
        console.log(existingUser)
        if (!existingUser) {
            return res.status(404).json({ status: 404, success: false, message: "No account found with this email address. Please sign up to create an account." });
        }
        const comparePassord = await compareHash(password, existingUser.password)
        if (!comparePassord) {
            return res.status(401).json({ status: 401, success: false, message: "Incorrect password" });
        }
        const token = jwt.sign({ email: existingUser.email, username: existingUser.name }, serverConfig.secretKey)
        const response = await tokenSave({ token, user: existingUser.id })
        return res.status(200).json({ status: 200, message: "success", token: response.token, id: existingUser.id })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", errormessage: error.message });
    }
}
// 03312428195 huma

const getUserData = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await getUserById(id);
        return res.status(200).json({ status: 200, message: "success", data: response });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", errormessage: error.message });
    }
}

const logout = async (req, res) => {
    try {
        const { id } = req.body;
        const response = await logoutUser(id)
        return res.status(200).json({ status: 200, message: "logout success" })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", errormessage: error.message });
    }
}

const deleteUserAccount = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        const response = await deleteUserById(user._id);
        return res.status(200).json({ status: 200, message: "ACCOUNT DELETE SUCCESSFULLY", id: user._id, response });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "SERVER ERROR", errormessage: error.message });
    }
}
 
const getAlllStudentsData = async (req, res) => {
    try {
        const { email } = req.body;
        const response = await getAllUsersData(email);
        return res.status(200).json({ status: 200, message: "success", response })
    } catch (error) {
        return res.status(500).json({ status: 500, message: "INTERNAL ERROR", errormessage: error.message })
    }
}
  
const getAllUsersData = async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json({ status: 200, message: "SUCCESS", data: users });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "SERVER ERROR", errormessage: error.message });
    }
}
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await deleteUserById(id);
        return res.status(200).json({ status: 200, message: "Success" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "SERVER ERROR", errormessage: error.message });
    }
}

const updateUserData = async (req, res) => {  // update user profile data
    try {
        const { id, name, city, gender, country, profileImage, Skills, PortfolioLink, SocialMediaLinks, isActive } = req.body;
        const obj = { name, city, gender, country, profileImage, Skills, PortfolioLink, SocialMediaLinks, isActive };
        console.log(obj)
        const response = await updateUserById(id, obj)
        console.log(response);
        return res.status(200).json({ status: 200, success: true, message: "successfull" })
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

const getSignleUserData = async (req, res) => { // get user data by id
    try {
        const { id } = req.body;
        const response = await getUserDataById(id)
        return res.status(200).json({ status: 200, message: "success", success: true, data: response })
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: "server error", errormessage: error.message })
    }
}

// allUserSData is now handled by getAllUsersData

// Legacy contributor endpoints (user document based). Prefer new /creator routes.
const applyContributorController = async (req, res) => {
    try {
        const userId = req?.user?._id || req.body?.id;
        const { contributorProfile } = req.body;
        if (!userId) {
            return res.status(400).json({ status: 400, success: false, message: "id is required" });
        }
        const response = await applyContributor(userId, contributorProfile || {});
        return res.status(200).json({ status: 200, success: true, data: response });
    } catch (error) {
        const code = error.status || 500;
        return res.status(code).json({ status: code, success: false, message: error.message });
    }
};

const getContributorStatusController = async (req, res) => {
    try {
        const userId = req?.user?._id || req.body?.id;
        if (!userId) {
            return res.status(400).json({ status: 400, success: false, message: "id is required" });
        }
        const response = await getContributorStatus(userId);
        return res.status(200).json({ status: 200, success: true, data: response });
    } catch (error) {
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

const updateContributorStatusController = async (req, res) => {
    try {
        const { id, status, reviewerId, reason } = req.body;
        if (!id || !status) {
            return res.status(400).json({ status: 400, success: false, message: "id and status are required" });
        }
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ status: 401, success: false, message: 'unauthorized' });
        }
        const decoded = jwt.verify(token.slice(7), serverConfig.secretKey);
        const actingUser = await getUserByEmail(decoded.email);
        if (!actingUser || actingUser.role !== 'admin') {
            return res.status(403).json({ status: 403, success: false, message: 'forbidden' });
        }

        const response = await updateContributorStatus(id, status, reviewerId || actingUser._id, reason);
        return res.status(200).json({ status: 200, success: true, data: response });
    } catch (error) {
        const code = error.status || 500;
        return res.status(code).json({ status: code, success: false, message: error.message })
    }
};

export {
    signup,
    login,
    logout,
    getUserData,
    getAllUsersData,
    deleteUser,
    deleteUserAccount,
    updateUserData,
    getSignleUserData,
    applyContributorController,
    getContributorStatusController,
    updateContributorStatusController
}