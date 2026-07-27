const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Agent ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Template content is required'],
      trim: true,
      maxlength: [2000, 'Content must be at most 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

messageTemplateSchema.index({ agentId: 1, createdAt: -1 });

const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);
module.exports = MessageTemplate;
