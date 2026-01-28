// Middleware to allow both admin and creator roles
export const adminOrCreatorAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const jwt = await import('jsonwebtoken');
    const db = (await import('../modules/index.js')).default;
    const serverConfig = (await import('../config/server.config.js')).default;
    const decoded = jwt.default.verify(token, serverConfig.secretKey);
    console.log('Decoded token:', decoded);
    const user = await db.users.findById(decoded.id);
    console.log('User found:', user);
    if (!user) {
      return res.status(403).json({ message: 'Forbidden: User not found' });
    }
    // Allow if admin
    if (user.role === 'admin') {
      req.user = user;
      return next();
    }
    // Allow if user has a related creator document
    const creator = await db.creators.findOne({ userId: user._id });
    if (creator) {
      req.user = user;
      req.creator = creator;
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admins or Creators only' });
  } catch (err) {
    console.log('adminOrCreatorAuth error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
