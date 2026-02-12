import express from "express";
const router = express.Router();
import * as s3MultipartController from "../controllers/s3.multipart.controllers.js";
// S3 multipart upload endpoints
router.post('/s3/multipart/initiate', s3MultipartController.initiateMultipartUploadController);
router.get('/s3/multipart/part-url', s3MultipartController.getMultipartPresignedUrlController);
router.post('/s3/multipart/complete', s3MultipartController.completeMultipartUploadController);
router.post('/s3/multipart/abort', s3MultipartController.abortMultipartUploadController);
import { updateCreatorImageController, deleteCreatorImageController, getCreatorImageById } from "../controllers/images.controllers.js";
// Creator update/delete asset endpoints
router.patch('/images/:id', checkAuth, updateCreatorImageController);
router.delete('/images/:id', checkAuth, deleteCreatorImageController);
// NEW: get single image for edit
router.get('/images/:id', checkAuth, getCreatorImageById);
import { deleteUser, deleteUserAccount, getAllUsersData, getSignleUserData, getUserData, login, logout, signup, updateUserData, applyContributorController, updateContributorStatusController, getContributorStatusController } from "../controllers/signup.controlller.js";
import { adminLogin } from "../controllers/admin.controller.js";
// Admin login route
router.post('/admin/login', adminLogin);
import { applyCreatorController, getMyCreatorController, updateCreatorStatusController, getAllCreatorsController, saveCreatorProfileImageUrl, updateMyCreatorProfileController } from "../controllers/creators.controllers.js";

import { addPaymentDetail, deletePayment, getPaymentDetail, jazzcash, payment, paymentDetailGetByID } from "../controllers/payment.controllers.js";
import checkAuth from "../middleware/check-auth.middleware.js";
import { adminAuth } from "../middleware/adminAuth.js";
import * as followController from "../controllers/follow.controllers.js";
import { AllImagesfromDB, approvedimages, fileObjectDelete, filterationByWord, getAllImages, getDataAllFromDB, rejectedimages, saveImages, searchFilterationImages, getAssetsPaginated } from "../controllers/images.controllers.js";
import { saveLikes, unLikController, getLikeCountController, getLikeStatusController } from "../controllers/likes.controllers.js";
router.get('/like/status', getLikeStatusController)
import { getPresignedUploadUrl, deleteFile, getPresignedProfileImageUrl, saveProfileImageUrl, proxyDownload } from "../controllers/s3.controller.js"; 
import { getImageKitAuthParams, saveEditedImageAsset } from "../controllers/imagekit.controllers.js";
import {
	addToCollection,
	createUserCollection,
	getUserCollections,
	updateUserCollection,
	deleteUserCollection,
	removeFromCollection,
	getCollectionAssets
} from "../controllers/collections.controllers.js";
//const router = express.Router();
// User routes
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.post('/updateUserData', updateUserData) //
// router.get('/users', getAllUsersData) // Disabled: use /admin/users for admin-only access
router.get('/user/:id', checkAuth, getUserData) // get user data by id
router.post('/updateUserData', updateUserData)
router.delete('/user/:id', deleteUser)

router.post('/payment', payment)
router.post('/addPaymentDetail', addPaymentDetail)
router.post('/jazzcashpayment', jazzcash)
router.post('/paymentDetailGetByID', paymentDetailGetByID)
router.post('/saveImages', checkAuth, saveImages)
// ImageKit editor routes	
router.get('/imagekit/auth', checkAuth, getImageKitAuthParams);
router.post('/imagekit/edited-asset', checkAuth, saveEditedImageAsset);
// getCourses
router.get('/getPaymentDetail', getPaymentDetail)

router.post('/deleteUserAccount', deleteUserAccount)
router.post('/getSignleUserData', getSignleUserData)
router.post('/saveLikes', saveLikes)
router.post('/unLikController', unLikController)
router.get('/like/count', getLikeCountController)
router.post('/applyContributor', checkAuth, applyContributorController)
router.post('/getContributorStatus', checkAuth, getContributorStatusController)
router.post('/updateContributorStatus', checkAuth, updateContributorStatusController)

// New creator routes (separate creator record)
router.post('/creator/apply', checkAuth, applyCreatorController)
router.get('/creator/me', checkAuth, getMyCreatorController)
// PATCH for updating creator profile
router.patch('/creator/me', checkAuth, updateMyCreatorProfileController)
// router.get('/creators', getAllCreatorsController) // Disabled: use /admin/creators for admin-only access
router.patch('/admin/creator/status', adminAuth, updateCreatorStatusController)
// Save S3 profile image URL to creator profile
router.post('/creator/saveProfileImageUrl', checkAuth, saveCreatorProfileImageUrl);

// Collections routes
router.post('/collections', createUserCollection);
router.get('/collections', getUserCollections);
router.post('/collections/addAsset', addToCollection);
router.patch('/collections/update', updateUserCollection);
router.delete('/collections/delete', deleteUserCollection);
router.delete('/collections/removeAsset', removeFromCollection);
router.get('/collections/items', getCollectionAssets);
// Image routes
router.post('/getAllImages', getAllImages)
router.post('/approvedimages', approvedimages)
router.post('/rejectedimages',rejectedimages)
router.get('/AllImagesfromDB', AllImagesfromDB)
router.get('/getDataAllFromDB',getDataAllFromDB)
router.get("/searchFilterationImages", searchFilterationImages)
router.get('/filterationByWord',filterationByWord)
router.delete('/fileObjectDelete', fileObjectDelete)

// AWS S3 Routes for getting presigned url and deleting file from s3 bucket
router.post('/getPresignedUploadUrl', getPresignedUploadUrl);
// S3 profile image upload (user-specific folder)
router.post('/getPresignedProfileImageUrl', checkAuth, getPresignedProfileImageUrl);
// Save S3 profile image URL to user model
router.post('/saveProfileImageUrl', checkAuth, saveProfileImageUrl);
router.post('/deleteS3File', deleteFile);

// NEW: proxy download route (no auth, used for public downloads)
router.get('/download', proxyDownload);

// Follow system routes
router.post('/follow', checkAuth, followController.followUser);
router.post('/unfollow', checkAuth, followController.unfollowUser);
router.get('/followers/:userId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);
import blogRoutes from './blog.routes.js';
router.use('/blogs', blogRoutes);
import adminRoutes from './admin.routes.js';
router.use('/admin', adminRoutes);
import categoryRoutes from './category.routes.js';
// mount category routes on this router (which your main app mounts)
router.use('/', categoryRoutes);

// NEW: sub‑category collections routes (admin + public)
import subCategoryCollectionRoutes from './subCatgoryCollection.routes.js';
router.use('/', subCategoryCollectionRoutes);

// Import DB to access creators collection
import db from "../modules/index.js";

// Public: get a single creator by ID (used by frontend to show creator name on assets)
router.get('/creators/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const creator = await db.creators.findById(id).lean();

		if (!creator) {
			return res.status(404).json({ success: false, message: 'Creator not found' });
		}

		return res.json({ success: true, data: creator });
	} catch (err) {
		console.error('[GET /creators/:id] Failed to load creator', err);
		return res.status(500).json({ success: false, message: 'Failed to load creator' });
	}
});

// Public paginated assets endpoint for HomeGallery and other galleries
router.get("/assets", getAssetsPaginated);

export default router
