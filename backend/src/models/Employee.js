const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const employeeSchema = new mongoose.Schema(
  {
    sqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [100, 'Display name must be at most 100 characters'],
    },
    avatar: {
      type: String,
      default: '/images/user/userdemo.webp',
    },
    countryCode: {
      type: String,
      default: '+91',
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    workStatus: {
      type: String,
      enum: ['unavailable', 'on_call', 'active'],
      default: 'unavailable',
    },
    role: {
      type: String,
      enum: ['case_manager', 'manager', 'senior_manager', 'admin'],
      default: 'case_manager',
    },
    expertise: {
      type: String,
      default: '',
    },
    languages: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    totalOrder: {
      type: Number,
      default: 0,
      min: [0, 'Total order cannot be negative'],
    },
    callRate: {
      type: Number,
      default: 20,
      min: [0, 'Call rate cannot be negative'],
    },
    formSubmitted: {
      type: Boolean,
      default: false,
    },
    specialization: {
      type: String,
      default: '',
    },
    loginFrom: {
      type: String,
      enum: ['web', 'app'],
      default: 'web',
    },
    sessionToken: {
      type: String,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    refreshToken: { type: String, default: null },
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastPasswordChange: Date,
    isVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeSchema.index({ displayName: 'text', username: 'text' });
employeeSchema.index({ role: 1, status: 1 });

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.lastPasswordChange = new Date();
  }
  next();
});

employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.lastPasswordChange) {
    const changedTimestamp = parseInt(this.lastPasswordChange.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

employeeSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
