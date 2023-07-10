import { Schema, model } from "mongoose";

const UserServiceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
    conversationName: {
      type: String,
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    deletedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("UserService", UserServiceSchema);
