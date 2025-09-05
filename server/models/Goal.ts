import mongoose, { Schema } from "mongoose";

export interface IGoal extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  category: 'emergency_fund' | 'vacation' | 'house' | 'car' | 'education' | 'retirement' | 'investment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  monthlyContribution: number;
  autoSave: boolean;
  milestones: {
    percentage: number;
    amount: number;
    achievedDate?: Date;
    isAchieved: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    category: { 
      type: String, 
      required: true, 
      enum: ['emergency_fund', 'vacation', 'house', 'car', 'education', 'retirement', 'investment', 'other'] 
    },
    priority: { 
      type: String, 
      required: true, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    targetDate: { type: Date, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active'
    },
    monthlyContribution: { type: Number, default: 0, min: 0 },
    autoSave: { type: Boolean, default: false },
    milestones: [{
      percentage: { type: Number, required: true, min: 0, max: 100 },
      amount: { type: Number, required: true, min: 0 },
      achievedDate: { type: Date },
      isAchieved: { type: Boolean, default: false }
    }]
  },
  { timestamps: true }
);

// Indexes for better query performance
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });
GoalSchema.index({ userId: 1, priority: 1 });

export const Goal = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);