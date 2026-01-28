import {
  initiateS3MultipartUploadService,
  getS3MultipartPresignedUrlService,
  completeS3MultipartUploadService,
  abortS3MultipartUploadService
} from '../services/s3.multipart.services.js';

export const initiateMultipartUploadController = async (req, res) => {
  try {
    const { fileName, fileType, category } = req.body;
    const result = await initiateS3MultipartUploadService({ fileName, fileType, category });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMultipartPresignedUrlController = async (req, res) => {
  try {
    const { key, uploadId, partNumber } = req.query;
    const url = await getS3MultipartPresignedUrlService({ key, uploadId, partNumber: Number(partNumber) });
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeMultipartUploadController = async (req, res) => {
  try {
    const { key, uploadId, parts } = req.body;
    const result = await completeS3MultipartUploadService({ key, uploadId, parts });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const abortMultipartUploadController = async (req, res) => {
  try {
    const { key, uploadId } = req.body;
    const result = await abortS3MultipartUploadService({ key, uploadId });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
