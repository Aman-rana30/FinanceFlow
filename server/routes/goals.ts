import { Request, Response } from "express";
import { Goal } from "../models/Goal";

// Get all goals for a user
export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011'; // Mock user ID
    const { status, category } = req.query;
    
    const filter: any = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const goals = await Goal.find(filter).sort({ priority: 1, targetDate: 1 });
    
    // Calculate overall progress
    const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    // Group by status
    const statusBreakdown = goals.reduce((acc: any, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate monthly savings needed
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const totalMonthlySavingsNeeded = activeGoals.reduce((sum, goal) => {
      const monthsRemaining = Math.max(1, Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const remainingAmount = goal.targetAmount - goal.currentAmount;
      return sum + (remainingAmount / monthsRemaining);
    }, 0);
    
    res.json({
      goals,
      summary: {
        totalGoals: goals.length,
        totalTargetAmount,
        totalCurrentAmount,
        overallProgress,
        statusBreakdown,
        totalMonthlySavingsNeeded
      }
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

// Add new goal
export const addGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011'; // Mock user ID
    const goalData = { ...req.body, userId };
    
    // Create default milestones if not provided
    if (!goalData.milestones || goalData.milestones.length === 0) {
      goalData.milestones = [
        { percentage: 25, amount: goalData.targetAmount * 0.25, isAchieved: false },
        { percentage: 50, amount: goalData.targetAmount * 0.50, isAchieved: false },
        { percentage: 75, amount: goalData.targetAmount * 0.75, isAchieved: false },
        { percentage: 100, amount: goalData.targetAmount, isAchieved: false }
      ];
    }
    
    const goal = new Goal(goalData);
    await goal.save();
    
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error adding goal:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
};

// Update goal
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Update milestone achievements
    goal.milestones.forEach(milestone => {
      if (goal.currentAmount >= milestone.amount && !milestone.isAchieved) {
        milestone.isAchieved = true;
        milestone.achievedDate = new Date();
      }
    });
    
    // Mark as completed if target reached
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// Add contribution to goal
export const addContribution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const goal = await Goal.findOne({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    goal.currentAmount += amount;
    
    // Update milestone achievements
    goal.milestones.forEach(milestone => {
      if (goal.currentAmount >= milestone.amount && !milestone.isAchieved) {
        milestone.isAchieved = true;
        milestone.achievedDate = new Date();
      }
    });
    
    // Mark as completed if target reached
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ error: 'Failed to add contribution' });
  }
};

// Delete goal
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

// Get goal insights and recommendations
export const getGoalInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const goals = await Goal.find({ userId, status: 'active' });
    
    const insights = goals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysRemaining = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
      const remainingAmount = goal.targetAmount - goal.currentAmount;
      const requiredMonthlySaving = remainingAmount / monthsRemaining;
      
      let status = 'on_track';
      let recommendation = '';
      
      if (daysRemaining < 0) {
        status = 'overdue';
        recommendation = 'This goal is overdue. Consider extending the deadline or adjusting the target amount.';
      } else if (progress < 25 && monthsRemaining < 6) {
        status = 'behind';
        recommendation = `You need to save ₹${requiredMonthlySaving.toFixed(0)} per month to reach this goal on time.`;
      } else if (progress > 75) {
        status = 'ahead';
        recommendation = 'Great progress! You\'re on track to achieve this goal early.';
      } else {
        recommendation = `Save ₹${requiredMonthlySaving.toFixed(0)} monthly to stay on track.`;
      }
      
      return {
        goalId: goal._id,
        title: goal.title,
        progress,
        daysRemaining,
        monthsRemaining,
        requiredMonthlySaving,
        status,
        recommendation,
        priority: goal.priority
      };
    });
    
    // Overall insights
    const totalMonthlySavingsNeeded = insights.reduce((sum, insight) => sum + insight.requiredMonthlySaving, 0);
    const goalsAtRisk = insights.filter(insight => insight.status === 'behind' || insight.status === 'overdue').length;
    const goalsOnTrack = insights.filter(insight => insight.status === 'on_track' || insight.status === 'ahead').length;
    
    res.json({
      goalInsights: insights,
      summary: {
        totalMonthlySavingsNeeded,
        goalsAtRisk,
        goalsOnTrack,
        totalActiveGoals: goals.length
      },
      recommendations: [
        {
          type: 'savings_optimization',
          message: `You need to save ₹${totalMonthlySavingsNeeded.toFixed(0)} monthly to achieve all your goals`,
          priority: totalMonthlySavingsNeeded > 10000 ? 'high' : 'medium'
        },
        {
          type: 'goal_prioritization',
          message: goalsAtRisk > 0 ? `${goalsAtRisk} goals are at risk. Consider prioritizing high-priority goals.` : 'All goals are on track!',
          priority: goalsAtRisk > 0 ? 'high' : 'low'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching goal insights:', error);
    res.status(500).json({ error: 'Failed to fetch goal insights' });
  }
};