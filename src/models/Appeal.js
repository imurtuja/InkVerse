import mongoose from "mongoose";

const AppealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Appeal message is required"],
      maxlength: [1000, "Appeal cannot exceed 1000 characters"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      default: null,
      maxlength: [1000, "Response cannot exceed 1000 characters"],
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Appeal || mongoose.model("Appeal", AppealSchema);
