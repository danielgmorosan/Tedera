import { Schema, models, model, Types } from "mongoose";

export interface IInvestment {
  user: Types.ObjectId;
  property: Types.ObjectId;
  shares: number;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    shares: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Investment =
  models.Investment || model<IInvestment>("Investment", InvestmentSchema);
