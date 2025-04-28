import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  used: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const License = mongoose.model('License', licenseSchema);

export default License;