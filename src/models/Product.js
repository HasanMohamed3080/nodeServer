import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  origin: {
    type: String,
    required: false
  },
  supplier: {
    type: String,
    required: false
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number,
    required: false
  },
  quantity: {
    type: Number,
    required: false,
    default: 0
  },
  alternatives: {
    type: [String],
    required: false,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now , 
    required: false
  },
  updatedAt: {
    type: Date,
    default: Date.now , 
    required: false
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;