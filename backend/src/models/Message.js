const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'contact', 'sticker', 'system'],
      default: 'text',
    },
    content: {
      type: String,
      default: '',
    },
    fileName: String,
    fileSize: Number,
    fileUrl: String,
    filePublicId: String,
    mimeType: String,
    thumbnailUrl: String,
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    forwardCount: { type: Number, default: 0 },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'seen', 'failed'],
      default: 'sent',
    },
    statusTimestamps: {
      sent: Date,
      delivered: Date,
      seen: Date,
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    isSystemMessage: { type: Boolean, default: false },
    callReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Call',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
