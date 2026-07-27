const MessageTemplate = require('../models/MessageTemplate');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const getTemplates = asyncHandler(async (req, res) => {
  const templates = await MessageTemplate.find({ agentId: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  ApiResponse.success(res, { templates }, 'Templates retrieved');
});

const createTemplate = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) {
    throw new AppError('Title and content are required', 400);
  }
  const template = await MessageTemplate.create({
    agentId: req.userId,
    title: title.trim(),
    content: content.trim(),
  });
  ApiResponse.success(res, { template }, 'Template created', 201);
});

const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) {
    throw new AppError('Title and content are required', 400);
  }
  const template = await MessageTemplate.findOneAndUpdate(
    { _id: id, agentId: req.userId },
    { title: title.trim(), content: content.trim() },
    { new: true, runValidators: true }
  );
  if (!template) {
    throw new AppError('Template not found or not authorized', 404);
  }
  ApiResponse.success(res, { template }, 'Template updated');
});

const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await MessageTemplate.findOneAndDelete({ _id: id, agentId: req.userId });
  if (!template) {
    throw new AppError('Template not found or not authorized', 404);
  }
  ApiResponse.success(res, null, 'Template deleted');
});

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
