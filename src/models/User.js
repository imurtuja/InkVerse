import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ name: "text", username: "text" });

/** Role may only be changed in MongoDB directly — never via app APIs or Mongoose updates. */
function stripRoleFromMongoUpdate(update) {
  if (!update || typeof update !== "object") return;
  if ("role" in update) delete update.role;
  if (update.$set && typeof update.$set === "object" && "role" in update.$set) {
    delete update.$set.role;
  }
  if (update.$unset && typeof update.$unset === "object" && "role" in update.$unset) {
    delete update.$unset.role;
  }
}

UserSchema.pre("save", async function () {
  try {
    if (this.isNew) {
      this.role = "user";
      return;
    }
    if (!this.isModified("role")) return;
    const prev = await this.constructor.findById(this._id).select("role").lean();
    if (prev) this.role = prev.role;
  } catch (err) {
    throw err;
  }
});

UserSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function () {
  stripRoleFromMongoUpdate(this.getUpdate());
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
