const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const transactionSchema = new Schema({
  userId: { type : Schema.Types.ObjectId, ref : 'User', required: true },
  amount: { type: Number },
  txId: { type: String },
  status: { type: String, enum: ['initiated', 'pending', 'approved', 'processing', 'confirmed', 'failed'] }, // pending, approved and processing to use as pending
});

transactionSchema.set('timestamps', true)
transactionSchema.index({"createdAt": 1});
transactionSchema.index({"updatedAt": 1});

module.exports = mongoose.model('Transaction', transactionSchema); 