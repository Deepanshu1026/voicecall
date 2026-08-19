const pushNotificationService = require('./pushNotificationService');
const FcmToken = require('../models/FcmToken');
const Notification = require('../models/Notification');
const { getAccountById } = require('../utils/account');

const DEFAULT_AVATAR_PATH = '/images/user/avatar.webp';

function normalizeAvatarPath(avatar) {
  let path = '';
  if (typeof avatar === 'string' && avatar.trim()) {
    path = avatar.trim();
  } else if (avatar && typeof avatar === 'object' && avatar.url) {
    path = avatar.url.trim();
  }

  const lower = path.toLowerCase();
  if (
    lower === 'img/userdemo.webp' ||
    lower === '/img/userdemo.webp' ||
    lower === '/images/user/userdemo.webp'
  ) {
    return DEFAULT_AVATAR_PATH;
  }

  // Return the path as-is; the app will join it with its static asset base.
  return path;
}

function buildMessageBody(message) {
  if (message.isSystemMessage) return message.content || 'System update';
  if (message.fileUrl || message.type === 'file') {
    const isImage =
      message.type === 'image' ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(message.fileName || message.fileUrl || '');
    if (isImage) return '📷 Image';
    return `📎 File${message.fileName ? ': ' + message.fileName : ''}`;
  }
  if (message.type === 'audio') return '🎤 Voice message';
  if (message.type === 'video') return '🎥 Video';
  if (message.type === 'location') return '📍 Location';
  return (message.content || '').trim().substring(0, 100) || 'New message';
}

async function createChatNotification({ recipientId, sender, message, conversationId }) {
  try {
    const senderDoc = sender?._id
      ? sender
      : await getAccountById(sender || message.sender, 'displayName username');
    const senderName = senderDoc?.displayName || senderDoc?.username || senderDoc?.name || 'Someone';
    const body = buildMessageBody(message);

    await Notification.create({
      userId: recipientId,
      title: `New message from ${senderName}`,
      message: body,
      type: 'chat',
      link: conversationId ? conversationId.toString() : '',
      isRead: false,
    });
  } catch (err) {
    console.error('[MessageNotification] in-app notification failed:', err.message);
  }
}

async function notifyMessageReceived({ recipientId, sender, message, conversationId }) {
  if (!recipientId || !message) {
    return { success: false, error: 'Missing recipient or message' };
  }

  if (message.isSystemMessage) {
    return { success: false, error: 'System message skipped' };
  }

  // Always create an in-app notification record for the recipient
  await createChatNotification({ recipientId, sender, message, conversationId });

  const fcm = pushNotificationService.isConfigured();
  if (!fcm) {
    return { success: false, error: 'FCM not configured' };
  }

  const tokens = await FcmToken.find({ userId: recipientId }).select('token').lean();
  if (!tokens.length) {
    return { success: false, error: 'No FCM tokens for recipient' };
  }

  const senderDoc = sender?._id
    ? sender
    : await getAccountById(sender || message.sender, 'displayName username avatar');
  const senderName = senderDoc?.displayName || senderDoc?.username || senderDoc?.name || 'Someone';
  const senderId = senderDoc?._id
    ? senderDoc._id.toString()
    : message.sender
    ? message.sender.toString()
    : '';
  const senderProfile = normalizeAvatarPath(senderDoc?.avatar);

  const title = senderName;
  const body = buildMessageBody(message);
  const data = {
    type: 'chat',
    sender_id: senderId,
    sender_name: senderName,
    sender_profile: senderProfile,
    conversation_id: conversationId.toString(),
    message_id: message._id.toString(),
    ...(message.content ? { content: message.content.substring(0, 100) } : {}),
    ...(message.fileUrl ? { file_url: message.fileUrl } : {}),
  };

  const imageUrl =
    message.fileUrl && message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? message.fileUrl : undefined;

  return pushNotificationService.sendMulticast({
    tokens: tokens.map((t) => t.token),
    title,
    body,
    data,
    imageUrl,
  });
}

module.exports = { notifyMessageReceived };
