const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;

const isS3Configured = Boolean(accessKeyId && secretAccessKey && bucketName);

let s3Client = null;
if (isS3Configured) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    console.log(`[S3 Service] AWS S3 upload enabled for bucket: ${bucketName} in region: ${region}`);
  } catch (err) {
    console.error('[S3 Service] Failed to initialize S3 client:', err.message);
  }
} else {
  console.log('[S3 Service] AWS S3 credentials not configured. Using database base64 fallback.');
}

/**
 * Uploads a base64 image or Buffer to AWS S3 bucket.
 * If S3 is not configured or fails, returns the original image string/data (base64 fallback).
 * 
 * @param {string} imageData Base64 string or image URL
 * @param {number|string} userId User ID for folder organization
 * @returns {Promise<string>} S3 URL or Base64 string
 */
async function uploadTradeScreenshot(imageData, userId = 'default') {
  if (!imageData || typeof imageData !== 'string') {
    return imageData;
  }

  // If already an HTTP/HTTPS URL (e.g. existing S3 URL), no re-upload needed
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  if (!isS3Configured || !s3Client) {
    return imageData; // Fallback to storing base64
  }

  try {
    let contentType = 'image/jpeg';
    let base64Body = imageData;

    if (imageData.includes(';base64,')) {
      const parts = imageData.split(';base64,');
      contentType = parts[0].replace('data:', '') || 'image/jpeg';
      base64Body = parts[1];
    }

    const buffer = Buffer.from(base64Body, 'base64');
    const ext = contentType.split('/')[1] || 'jpg';
    const randomHash = crypto.randomBytes(8).toString('hex');
    const key = `trades/user_${userId}/${Date.now()}_${randomHash}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    });

    await s3Client.send(command);

    // Construct public S3 URL
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    console.log(`[S3 Service] Screenshot successfully uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (error) {
    console.error('[S3 Service] S3 upload error, falling back to base64:', error.message);
    return imageData; // Graceful fallback
  }
}

module.exports = {
  isS3Configured: () => isS3Configured,
  uploadTradeScreenshot
};
