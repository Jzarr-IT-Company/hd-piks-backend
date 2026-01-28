import {
  initiateMultipartUpload,
  getMultipartPresignedUrl,
  completeMultipartUpload,
  abortMultipartUpload
} from '../utils/s3.multipart.utils.js';

// Service: Initiate multipart upload
export const initiateS3MultipartUploadService = async ({ fileName, fileType, category }) => {
  return await initiateMultipartUpload({ fileName, fileType, category });
};

// Service: Get presigned URL for a part
export const getS3MultipartPresignedUrlService = async ({ key, uploadId, partNumber }) => {
  return await getMultipartPresignedUrl({ key, uploadId, partNumber });
};

// Service: Complete multipart upload
export const completeS3MultipartUploadService = async ({ key, uploadId, parts }) => {
  return await completeMultipartUpload({ key, uploadId, parts });
};

// Service: Abort multipart upload
export const abortS3MultipartUploadService = async ({ key, uploadId }) => {
  return await abortMultipartUpload({ key, uploadId });
};
