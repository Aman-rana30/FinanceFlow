import { Request, Response } from "express";
import { Expense } from "../models/Expense";

// Get all expenses for a user with filtering and pagination
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011'; // Mock user ID
    const { 
      page = 1, 
      limit = 20, 
      category, 
      startDate, 
      endDate, 
      isRecurring,
      isEssential 
    } = req.query;
    
    const filter: any = { userId };
    
    if (category) filter.category = category;
    if (isRecurring !== undefined) filter.isRecurring = isRecurring === 'true';
    if (isEssential !== undefined) filter.isEssential = isEssential === 'true';
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const totalExpenses = await Expense.countDocuments(filter);
    
    // Calculate summary statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyExpenses = await Expense.find({
      userId,
      date: { $gte: currentMonth }
    });
    
    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryBreakdown = monthlyExpenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    // Get spending trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const trendData = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);
    
    res.json({
      expenses,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalExpenses / Number(limit)),
        totalItems: totalExpenses,
        hasNext: Number(page) * Number(limit) < totalExpenses,
        hasPrev: Number(page) > 1
      },
      summary: {
        monthlyTotal,
        categoryBreakdown,
        trendData,
        averageDaily: monthlyTotal / new Date().getDate()
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Add new expense
export const addExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011'; // Mock user ID
    const expenseData = { ...req.body, userId };
    
    const expense = new Expense(expenseData);
    await expense.save();
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// Update expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Delete expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Get expense categories and their statistics
export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const categories = await Expense.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          lastExpense: { $max: "$date" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    // Predefined categories with icons and colors
    const categoryMeta = {
      'Food & Dining': { icon: '🍽️', color: '#FF6B6B', essential: true },
      'Transportation': { icon: '🚗', color: '#4ECDC4', essential: true },
      'Shopping': { icon: '🛍️', color: '#45B7D1', essential: false },
      'Entertainment': { icon: '🎬', color: '#96CEB4', essential: false },
      'Bills & Utilities': { icon: '💡', color: '#FFEAA7', essential: true },
      'Healthcare': { icon: '🏥', color: '#DDA0DD', essential: true },
      'Education': { icon: '📚', color: '#98D8C8', essential: true },
      'Travel': { icon: '✈️', color: '#F7DC6F', essential: false },
      'Groceries': { icon: '🛒', color: '#82E0AA', essential: true },
      'Personal Care': { icon: '💄', color: '#F8C471', essential: true },
      'Other': { icon: '📦', color: '#BDC3C7', essential: false }
    };
    
    const enrichedCategories = categories.map(cat => ({
      ...cat,
      ...categoryMeta[cat._id as keyof typeof categoryMeta] || categoryMeta['Other']
    }));
    
    res.json(enrichedCategories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
};

// Get expense insights and analytics
export const getExpenseInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] || '507f1f77bcf86cd799439011';
    
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    // Current month vs last month comparison
    const [currentMonthExpenses, lastMonthExpenses] = await Promise.all([
      Expense.find({ userId, date: { $gte: currentMonth } }),
      Expense.find({ userId, date: { $gte: lastMonth, $lte: lastMonthEnd } })
    ]);
    
    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    // Weekly spending pattern
    const weeklyPattern = currentMonthExpenses.reduce((acc: any, exp) => {
      const dayOfWeek = exp.date.getDay();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = days[dayOfWeek];
      acc[day] = (acc[day] || 0) + exp.amount;
      return acc;
    }, {});
    
    // Top merchants/vendors
    const topMerchants = currentMonthExpenses
      .filter(exp => exp.merchant)
      .reduce((acc: any, exp) => {
        acc[exp.merchant!] = (acc[exp.merchant!] || 0) + exp.amount;
        return acc;
      }, {});
    
    const sortedMerchants = Object.entries(topMerchants)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, amount]) => ({ name, amount }));
    
    // Spending velocity (daily average)
    const daysInMonth = currentDate.getDate();
    const dailyAverage = currentMonthTotal / daysInMonth;
    const projectedMonthly = dailyAverage * new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    res.json({
      monthlyComparison: {
        current: currentMonthTotal,
        previous: lastMonthTotal,
        change: monthlyChange,
        changeDirection: monthlyChange > 0 ? 'increase' : 'decrease'
      },
      weeklyPattern,
      topMerchants: sortedMerchants,
      spendingVelocity: {
        dailyAverage,
        projectedMonthly,
        daysRemaining: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - daysInMonth
      },
      recommendations: [
        {
          type: 'category_alert',
          message: 'Your dining expenses are 23% higher than last month',
          action: 'Consider meal planning to reduce costs',
          priority: 'medium'
        },
        {
          type: 'recurring_savings',
          message: 'You could save ₹1,200/month by switching to a different mobile plan',
          action: 'Review subscription services',
          priority: 'low'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching expense insights:', error);
    res.status(500).json({ error: 'Failed to fetch expense insights' });
  }
};