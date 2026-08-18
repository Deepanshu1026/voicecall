const Banner = require('../models/Banner');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const getBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.getSingleton();
  ApiResponse.success(res, banner);
});

const updateBanner = asyncHandler(async (req, res) => {
  const { enabled, imageUrl, altText, link } = req.body;

  const update = {};
  if (typeof enabled === 'boolean') update.enabled = enabled;
  if (imageUrl !== undefined) update.imageUrl = imageUrl;
  if (altText !== undefined) update.altText = altText;
  if (link !== undefined) update.link = link;

  if (Object.keys(update).length === 0) {
    throw new AppError('No valid fields provided', 400);
  }

  if (update.imageUrl && !isValidUrl(update.imageUrl)) {
    throw new AppError('Invalid image URL', 400);
  }
  if (update.link && !isValidUrl(update.link)) {
    throw new AppError('Invalid link URL', 400);
  }

  const banner = await Banner.getSingleton();
  Object.assign(banner, update);
  await banner.save();

  ApiResponse.success(res, banner, 'Banner updated');
});

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  getBanner,
  updateBanner,
};
