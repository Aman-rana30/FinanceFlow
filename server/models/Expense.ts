import mongoose, { Schema } from "mongoose";

export interface IExpense extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  location?: string;
  merchant?: string;
  isEssential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true, index: true },
    paymentMethod: { 
      type: String, 
      required: true, 
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'] 
    },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'yearly'] 
    },
    tags: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    merchant: { type: String, trim: true },
    isEssential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for better query performance
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });
ExpenseSchema.index({ userId: 1, isRecurring: 1 });

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);