import jwt from "jsonwebtoken";
import serverConfig from "../config/server.config.js";
import db from "../modules/index.js";

const checkAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ success: false, message: 'unauthorized', data: null });
        }
        const decoded = jwt.verify(token.slice(7), serverConfig.secretKey);
        const user = await db.users.findOne({ email: decoded.email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'unauthorized', data: null });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'unauthorized', data: error.message });
    }
};

export default checkAuth;

