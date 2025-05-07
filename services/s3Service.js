const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

if (!BUCKET_NAME) {
    console.error('AWS_BUCKET_NAME is not set in environment variables');
    throw new Error('AWS_BUCKET_NAME is required');
}

/**
 * Upload a file to S3
 * @param {string} filePath - Local path to the file
 * @param {string} s3Key - Key (path) in S3 where the file will be stored
 * @returns {Promise<string>} - URL of the uploaded file
 */
const uploadFile = async (filePath, s3Key) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        
        const params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: 'image/jpeg'
        };
        
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
};

/**
 * Upload a buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} s3Key - Key (path) in S3 where the file will be stored
 * @returns {Promise<string>} - URL of the uploaded file
 */
const uploadBuffer = async (buffer, s3Key) => {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: 'image/jpeg'
        };
        
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('Error uploading buffer to S3:', error);
        throw error;
    }
};

/**
 * Generate a unique S3 key for a file
 * @param {string} userId - User ID
 * @param {string} runId - Run ID
 * @param {string} fileName - Original file name
 * @param {string} type - Type of file (original, detected, cropped)
 * @returns {string} - S3 key
 */
const generateS3Key = (userId, runId, fileName, type) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9.]/g, '_');
    
    if (type === 'cropped') {
        return `users/${userId}/runs/${runId}/cropped/${sanitizedFileName}`;
    } else {
        return `users/${userId}/runs/${runId}/${type}_${sanitizedFileName}`;
    }
};

module.exports = {
    uploadFile,
    uploadBuffer,
    generateS3Key
}; 