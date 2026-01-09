import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  fullNames: String,
  identityNumber: String,
  verificationMethod: String,
  otherVerification: String,
  telephoneNumbers: [String],
  vehicleRegistration: String,
  contactAddress: String,
  goodsDescription: String,
  additionalNotes: String,
  createdAt: { type: Date, default: Date.now },
  formattedCreatedAt: String
});

export default mongoose.model("Record", recordSchema);
