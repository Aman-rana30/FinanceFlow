import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Tag, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  Camera,
  Mic,
  MapPin,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { toast } from "sonner";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  isRecurring: boolean;
  tags: string[];
  merchant?: string;
  location?: string;
  isEssential: boolean;
  receipt?: string;
}

interface ExpenseFormData {
  title: string;
  amount: string;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  isRecurring: boolean;
  tags: string[];
  merchant: string;
  location: string;
  isEssential: boolean;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Groceries',
  'Personal Care',
  'Education',
  'Travel',
  'Investment',
  'Other'
];

const paymentMethodIcons = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  bank_transfer: Building2
};

const paymentMethodColors = {
  cash: 'text-green-400',
  card: 'text-blue-400',
  upi: 'text-purple-400',
  bank_transfer: 'text-orange-400'
};

interface ExpenseTrackerProps {
  onExpenseAdded?: (expense: Expense) => void;
  onExpenseUpdated?: (expense: Expense) => void;
  onExpenseDeleted?: (expenseId: string) => void;
}

export default function ExpenseTracker({ onExpenseAdded, onExpenseUpdated, onExpenseDeleted }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isListening, setIsListening] = useState(false);

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi',
    isRecurring: false,
    tags: [],
    merchant: '',
    location: '',
    isEssential: false
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: '507f1f77bcf86cd799439011' // Mock user ID
      };

      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        const savedExpense = await response.json();
        
        if (editingExpense) {
          setExpenses(prev => prev.map(exp => exp._id === editingExpense._id ? savedExpense : exp));
          onExpenseUpdated?.(savedExpense);
          toast.success('Expense updated successfully');
        } else {
          setExpenses(prev => [savedExpense, ...prev]);
          onExpenseAdded?.(savedExpense);
          toast.success('Expense added successfully');
        }
        
        resetForm();
        setShowAddDialog(false);
        setEditingExpense(null);
      } else {
        throw new Error('Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpenses(prev => prev.filter(exp => exp._id !== expenseId));
        onExpenseDeleted?.(expenseId);
        toast.success('Expense deleted successfully');
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'upi',
      isRecurring: false,
      tags: [],
      merchant: '',
      location: '',
      isEssential: false
    });
  };

  const startEdit = (expense: Expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      isRecurring: expense.isRecurring,
      tags: expense.tags,
      merchant: expense.merchant || '',
      location: expense.location || '',
      isEssential: expense.isEssential
    });
    setEditingExpense(expense);
    setShowAddDialog(true);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak your expense details');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        parseVoiceInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const parseVoiceInput = (transcript: string) => {
    // Simple parsing logic - can be enhanced with NLP
    const words = transcript.toLowerCase().split(' ');
    
    // Extract amount
    const amountMatch = transcript.match(/(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      setFormData(prev => ({ ...prev, amount: amountMatch[1] }));
    }

    // Extract category based on keywords
    const categoryKeywords = {
      'food': 'Food & Dining',
      'restaurant': 'Food & Dining',
      'coffee': 'Food & Dining',
      'uber': 'Transportation',
      'taxi': 'Transportation',
      'bus': 'Transportation',
      'grocery': 'Groceries',
      'medicine': 'Healthcare',
      'doctor': 'Healthcare',
      'movie': 'Entertainment',
      'shopping': 'Shopping'
    };

    for (const [keyword, category] of Object.entries(categoryKeywords)) {
      if (words.includes(keyword)) {
        setFormData(prev => ({ ...prev, category }));
        break;
      }
    }

    // Set title as the transcript
    setFormData(prev => ({ ...prev, title: transcript }));
    
    toast.success('Voice input processed! Please review and submit.');
  };

  const getFilteredAndSortedExpenses = () => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           expense.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesPaymentMethod = filterPaymentMethod === 'all' || expense.paymentMethod === filterPaymentMethod;
      
      return matchesSearch && matchesCategory && matchesPaymentMethod;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      if (sortBy === 'date') {
        return (new Date(aValue as string).getTime() - new Date(bValue as string).getTime()) * multiplier;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier;
      }
      
      return ((aValue as number) - (bValue as number)) * multiplier;
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Food & Dining': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Transportation': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Shopping': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Bills & Utilities': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Healthcare': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Groceries': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Personal Care': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const filteredExpenses = getFilteredAndSortedExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expense Tracker</h2>
          <p className="text-muted-foreground">Track and manage your daily expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startVoiceInput}
            disabled={isListening}
            className="border-neon-teal/30 hover:bg-neon-teal/10"
          >
            <Mic className={`w-4 h-4 mr-2 ${isListening ? 'animate-pulse text-red-400' : ''}`} />
            {isListening ? 'Listening...' : 'Voice Input'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredExpenses.map((expense, index) => {
            const PaymentIcon = paymentMethodIcons[expense.paymentMethod];
            
            return (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-teal/20 to-neon-violet/20 flex items-center justify-center">
                      <PaymentIcon className={`w-6 h-6 ${paymentMethodColors[expense.paymentMethod]}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{expense.title}</h3>
                        {expense.isEssential && (
                          <Badge variant="outline" className="text-xs border-red-400/30 text-red-400">
                            Essential
                          </Badge>
                        )}
                        {expense.isRecurring && (
                          <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-400">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                        
                        {expense.merchant && (
                          <div className="flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            {expense.merchant}
                          </div>
                        )}
                        
                        {expense.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {expense.location}
                          </div>
                        )}
                      </div>
                      
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                      )}
                      
                      {expense.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {expense.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        <MaskedNumber value={expense.amount.toFixed(2)} prefix="₹" />
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {expense.paymentMethod.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(expense)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredExpenses.length === 0 && !loading && (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterCategory !== 'all' || filterPaymentMethod !== 'all'
                ? 'Try adjusting your filters'
                : 'Start tracking your expenses by adding your first expense'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Lunch at restaurant"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Merchant</label>
                <Input
                  value={formData.merchant}
                  onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
                  placeholder="e.g., Starbucks"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details..."
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isEssential}
                  onChange={(e) => setFormData(prev => ({ ...prev, isEssential: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Essential expense</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Recurring expense</span>
              </label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingExpense(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}