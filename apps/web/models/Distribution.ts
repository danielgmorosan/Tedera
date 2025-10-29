import { Schema, models, model, Types } from "mongoose";

export interface IDistribution {
  property: Types.ObjectId;
  totalAmount: number;
  description?: string;
  executedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const DistributionSchema = new Schema<IDistribution>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    totalAmount: { type: Number, required: true },
    description: { type: String },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Distribution =
  models.Distribution ||
  model<IDistribution>("Distribution", DistributionSchema);
