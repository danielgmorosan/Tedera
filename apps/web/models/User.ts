import { Schema, models, model } from "mongoose";

export interface IUser {
  username: string;
  email?: string;
  passwordHash?: string;
  hederaAccountId?: string;
  isKYCVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, index: true },
    passwordHash: { type: String },
    hederaAccountId: { type: String, index: true },
    isKYCVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
