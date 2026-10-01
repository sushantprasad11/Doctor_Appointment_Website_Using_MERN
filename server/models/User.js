const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PATIENT,
      required: true,
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// passport-local-mongoose uses 'username' by default; configure it to use 'email'
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    UserExistsError: 'A user with the given email is already registered.',
    IncorrectPasswordError: 'Password is incorrect.',
    IncorrectUsernameError: 'No account found with this email.',
    MissingUsernameError: 'Email is required.',
    MissingPasswordError: 'Password is required.',
  },
});

/**
 * Instance method: return user data safe for client consumption.
 * Strips password hash and sensitive fields.
 */
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profileImage: this.profileImage,
    phone: this.phone,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
