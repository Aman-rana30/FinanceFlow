import { Request, Response } from "express";
import { Investment } from "../models/Investment";
import { Expense } from "../models/Expense";
import { Goal } from "../models/Goal";

export const seedData = async (req: Request, res: Response) => {
  try {
    const userId = '507f1f77bcf86cd799439011'; // Mock user ID

    // Clear existing data
    await Promise.all([
      Investment.deleteMany({ userId }),
      Expense.deleteMany({ userId }),
      Goal.deleteMany({ userId })
    ]);

    // Seed Investments
    const investments = [
      {
        userId,
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        type: 'stock',
        quantity: 50,
        avgPrice: 2800,
        currentPrice: 2875.50,
        totalInvested: 140000,
        currentValue: 143775,
        gainLoss: 3775,
        gainLossPercent: 2.7,
        sector: 'Energy',
        purchaseDate: new Date('2023-06-15'),
        lastUpdated: new Date()
      },
      {
        userId,
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd',
        type: 'stock',
        quantity: 25,
        avgPrice: 3900,
        currentPrice: 3980.25,
        totalInvested: 97500,
        currentValue: 99506.25,
        gainLoss: 2006.25,
        gainLossPercent: 2.06,
        sector: 'Information Technology',
        purchaseDate: new Date('2023-07-20'),
        lastUpdated: new Date()
      },
      {
        userId,
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        type: 'stock',
        quantity: 75,
        avgPrice: 1650,
        currentPrice: 1678.90,
        totalInvested: 123750,
        currentValue: 125917.50,
        gainLoss: 2167.50,
        gainLossPercent: 1.75,
        sector: 'Financial Services',
        purchaseDate: new Date('2023-08-10'),
        lastUpdated: new Date()
      }
    ];

    await Investment.insertMany(investments);

    // Seed Expenses
    const expenses = [];
    const categories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
      'Bills & Utilities', 'Healthcare', 'Groceries', 'Personal Care'
    ];
    const merchants = [
      'Starbucks', 'Uber', 'Amazon', 'Netflix', 'Electricity Board', 
      'Apollo Pharmacy', 'Big Bazaar', 'Salon'
    ];
    const paymentMethods = ['upi', 'card', 'cash', 'bank_transfer'];

    // Generate expenses for the last 3 months
    for (let i = 0; i < 150; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90));
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.floor(Math.random() * 2000) + 50;
      
      expenses.push({
        userId,
        title: `${category} expense`,
        amount,
        category,
        description: `Payment at ${merchant}`,
        date: randomDate,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        isRecurring: Math.random() > 0.8,
        tags: ['personal'],
        merchant,
        isEssential: ['Bills & Utilities', 'Healthcare', 'Groceries'].includes(category)
      });
    }

    await Expense.insertMany(expenses);

    // Seed Goals
    const goals = [
      {
        userId,
        title: 'Emergency Fund',
        description: 'Build an emergency fund covering 6 months of expenses',
        targetAmount: 300000,
        currentAmount: 180000,
        category: 'emergency_fund',
        priority: 'high',
        targetDate: new Date('2024-12-31'),
        status: 'active',
        monthlyContribution: 15000,
        autoSave: true,
        milestones: [
          { percentage: 25, amount: 75000, isAchieved: true, achievedDate: new Date('2023-09-15') },
          { percentage: 50, amount: 150000, isAchieved: true, achievedDate: new Date('2023-12-20') },
          { percentage: 75, amount: 225000, isAchieved: false },
          { percentage: 100, amount: 300000, isAchieved: false }
        ]
      },
      {
        userId,
        title: 'Dream Vacation',
        description: 'Save for a 2-week Europe trip',
        targetAmount: 200000,
        currentAmount: 45000,
        category: 'vacation',
        priority: 'medium',
        targetDate: new Date('2024-06-30'),
        status: 'active',
        monthlyContribution: 8000,
        autoSave: false,
        milestones: [
          { percentage: 25, amount: 50000, isAchieved: false },
          { percentage: 50, amount: 100000, isAchieved: false },
          { percentage: 75, amount: 150000, isAchieved: false },
          { percentage: 100, amount: 200000, isAchieved: false }
        ]
      },
      {
        userId,
        title: 'House Down Payment',
        description: 'Save for down payment on a new house',
        targetAmount: 1000000,
        currentAmount: 250000,
        category: 'house',
        priority: 'critical',
        targetDate: new Date('2025-03-31'),
        status: 'active',
        monthlyContribution: 25000,
        autoSave: true,
        milestones: [
          { percentage: 25, amount: 250000, isAchieved: true, achievedDate: new Date('2023-11-30') },
          { percentage: 50, amount: 500000, isAchieved: false },
          { percentage: 75, amount: 750000, isAchieved: false },
          { percentage: 100, amount: 1000000, isAchieved: false }
        ]
      }
    ];

    await Goal.insertMany(goals);

    res.json({ 
      message: 'Sample data seeded successfully',
      data: {
        investments: investments.length,
        expenses: expenses.length,
        goals: goals.length
      }
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
};