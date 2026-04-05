import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hashedToken: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "5m" } 
  }
}, {
  timestamps: true
});

export default mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);
