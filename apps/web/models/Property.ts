import { Schema, models, model, Types } from "mongoose";

export interface IProperty {
  name: string;
  location?: string;
  description?: string;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  createdBy: Types.ObjectId;
  // Additional marketplace fields
  type?: "forest" | "solar" | "real-estate";
  image?: string;
  expectedYield?: number;
  sustainabilityScore?: number;
  tags?: string[];
  area?: string;
  established?: string;
  lastDistribution?: string;
  nextDistribution?: string;
  status?: "open" | "closed";
  revenueGenerated?: number;
  // Blockchain fields
  tokenAddress?: string;
  evmTokenAddress?: string;
  saleContractAddress?: string;
  dividendContractAddress?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    totalShares: { type: Number, required: true },
    availableShares: { type: Number, required: true },
    pricePerShare: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Additional marketplace fields
    type: { type: String, enum: ["forest", "solar", "real-estate"], default: "real-estate" },
    image: { type: String },
    expectedYield: { type: Number, default: 8.5 },
    sustainabilityScore: { type: Number, default: 85 },
    tags: [{ type: String }],
    area: { type: String },
    established: { type: String },
    lastDistribution: { type: String },
    nextDistribution: { type: String },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    revenueGenerated: { type: Number, default: 0 },
    // Blockchain fields
    tokenAddress: { type: String },
    evmTokenAddress: { type: String },
    saleContractAddress: { type: String },
    dividendContractAddress: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export const Property =
  models.Property || model<IProperty>("Property", PropertySchema);
