const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['audio', 'video'],
      default: 'audio',
    },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'ongoing', 'ended', 'missed', 'rejected', 'busy'],
      default: 'initiated',
    },
    duration: {
      type: Number,
      default: 0,
    },
    quality: {
      bitrate: Number,
      packetLoss: Number,
      latency: Number,
      jitter: Number,
    },
    iceServers: [
      {
        urls: String,
        username: String,
        credential: String,
      },
    ],
    startedAt: Date,
    endedAt: Date,
    rejectReason: String,
    isMuted: { type: Boolean, default: false },
    isSpeakerOn: { type: Boolean, default: true },
    isRecording: { type: Boolean, default: false },
    recordingUrl: String,
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    signalData: {
      offer: {
        type: String,
        sdp: String,
        iceCandidates: [mongoose.Schema.Types.Mixed],
      },
      answer: {
        type: String,
        sdp: String,
        iceCandidates: [mongoose.Schema.Types.Mixed],
      },
    },
  },
  {
    timestamps: true,
  }
);

callSchema.index({ caller: 1, receiver: 1 });
callSchema.index({ status: 1 });
callSchema.index({ createdAt: -1 });

const Call = mongoose.model('Call', callSchema);
module.exports = Call;
