import mongoose from 'mongoose';

const staticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  dailySales: {
    type: Number,
    default: 0
  },
  monthlySales: {
    type: Number,
    default: 0
  },
  capital: {
    type: Number,
    default: 0
  },
  inventoryCount: {
    type: Number,
    default: 0
  },
  lowStockCount: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  monthlyTransactions: {
    type: Number,
    default: 0
  },
  dailyTransactions: {
    type: Number,
    default: 0
  },

  customerCount: {
    type: Number,
    default: 0
  },
  customerValue: {
    type: Number,
    default: 0
  },
  supplierCount: {
    type: Number,
    default: 0
  },
  supplierValue: {
    type: Number,
    default: 0
  }

});


staticsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
}
);

const Statics = mongoose.model('Statics', staticsSchema);
export default Statics;