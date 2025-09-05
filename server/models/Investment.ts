import mongoose, { Schema } from "mongoose";

export interface IInvestment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  name: string;
  type: 'stock' | 'mutual_fund' | 'etf' | 'bond' | 'crypto' | 'real_estate';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  sector?: string;
  exchange?: string;
  purchaseDate: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['stock', 'mutual_fund', 'etf', 'bond', 'crypto', 'real_estate'] 
    },
    quantity: { type: Number, required: true, min: 0 },
    avgPrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    totalInvested: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, required: true, min: 0 },
    gainLoss: { type: Number, required: true },
    gainLossPercent: { type: Number, required: true },
    sector: { type: String },
    exchange: { type: String },
    purchaseDate: { type: Date, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for better query performance
InvestmentSchema.index({ userId: 1, symbol: 1 });
InvestmentSchema.index({ userId: 1, type: 1 });
InvestmentSchema.index({ userId: 1, sector: 1 });

export const Investment = mongoose.models.Investment || mongoose.model<IInvestment>("Investment", InvestmentSchema);