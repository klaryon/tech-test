const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var kycSchema = new Schema({
  kycId: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const userSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  kyc: [{ type : Schema.Types.ObjectId, ref : 'KYC' }], // Array 
});

userSchema.set("timestamps", true);
kycSchema.set('timestamps', true)

module.exports = {
  KYC: mongoose.model('KYC', kycSchema),
  User: mongoose.model("User", userSchema),
};