import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Number,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  saleGroupId: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0.0
  },
  discount: {
    type: Number,
    default: 0.0
  }
});

export const History = mongoose.model('History', historySchema);
