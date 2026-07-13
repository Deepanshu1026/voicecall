const cloudinary = require('cloudinary').v2;
const config = require('../config');
const fs = require('fs');

if (config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: options.folder || 'voicecall',
      resource_type: options.resourceType || 'auto',
      transformation: options.transformation || [],
    };

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);

    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete local file:', err);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
