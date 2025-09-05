import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Edit,
  Trash2,
  Trophy,
  Flag,
  Home,
  Car,
  GraduationCap,
  Plane,
  Shield,
  PiggyBank
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Goal {
  _id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  priority: string;
  targetDate: string;
  status: string;
  monthlyContribution: number;
  autoSave: boolean;
  milestones: Array<{
    percentage: number;
    amount: number;
    achievedDate?: string;
    isAchieved: boolean;
  }>;
}

interface GoalSummary {
  totalGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
  statusBreakdown: Record<string, number>;
  totalMonthlySavingsNeeded: number;
}

const categoryIcons = {
  emergency_fund: Shield,
  vacation: Plane,
  house: Home,
  car: Car,
  education: GraduationCap,
  retirement: PiggyBank,
  investment: TrendingUp,
  other: Target
};

const categoryColors = {
  emergency_fund: '#EF4444',
  vacation: '#F59E0B',
  house: '#10B981',
  car: '#3B82F6',
  education: '#8B5CF6',
  retirement: '#06FFA5',
  investment: '#00FFD1',
  other: '#6B7280'
};

const priorityColors = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626'
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary>({
    totalGoals: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    overallProgress: 0,
    statusBreakdown: {},
    totalMonthlySavingsNeeded: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [contributionAmount, setContributionAmount] = useState('');
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: 'emergency_fund',
    priority: 'medium',
    targetDate: '',
    monthlyContribution: '',
    autoSave: false
  });

  const panic = useUIStore((s) => s.panic);

  useEffect(() => {
    fetchGoals();
  }, [filterStatus, filterCategory]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      
      const response = await fetch(`/api/goals?${params}`);
      const data = await response.json();
      setGoals(data.goals || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGoal,
          targetAmount: parseFloat(newGoal.targetAmount),
          monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0
        })
      });
      
      if (response.ok) {
        toast.success('Goal created successfully');
        setShowAddDialog(false);
        setNewGoal({
          title: '',
          description: '',
          targetAmount: '',
          category: 'emergency_fund',
          priority: 'medium',
          targetDate: '',
          monthlyContribution: '',
          autoSave: false
        });
        fetchGoals();
      } else {
        toast.error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const addContribution = async () => {
    if (!selectedGoal || !contributionAmount) return;
    
    try {
      const response = await fetch(`/api/goals/${selectedGoal._id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(contributionAmount) })
      });
      
      if (response.ok) {
        toast.success('Contribution added successfully');
        setShowContributeDialog(false);
        setContributionAmount('');
        setSelectedGoal(null);
        fetchGoals();
      } else {
        toast.error('Failed to add contribution');
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  const updateGoalStatus = async (goalId: string, status: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Goal ${status}`);
        fetchGoals();
      } else {
        toast.error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Goal deleted successfully');
        fetchGoals();
      } else {
        toast.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
    if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
    return true;
  });

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Today', color: 'text-neon-lime' };
    if (diffDays === 1) return { text: '1 day left', color: 'text-orange-400' };
    if (diffDays < 30) return { text: `${diffDays} days left`, color: 'text-orange-400' };
    if (diffDays < 365) return { text: `${Math.ceil(diffDays / 30)} months left`, color: 'text-neon-teal' };
    return { text: `${Math.ceil(diffDays / 365)} years left`, color: 'text-muted-foreground' };
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const timeRemaining = getTimeRemaining(goal.targetDate);
    
    if (goal.status === 'completed') return { icon: CheckCircle, color: 'text-neon-lime', text: 'Completed' };
    if (goal.status === 'paused') return { icon: Pause, color: 'text-orange-400', text: 'Paused' };
    if (timeRemaining.text === 'Overdue') return { icon: AlertTriangle, color: 'text-red-400', text: 'Overdue' };
    if (progress < 25 && timeRemaining.color === 'text-orange-400') return { icon: AlertTriangle, color: 'text-orange-400', text: 'At Risk' };
    return { icon: Target, color: 'text-neon-teal', text: 'On Track' };
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track your progress towards financial milestones</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-neon-teal to-neon-violet hover:from-neon-teal/80 hover:to-neon-violet/80">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Goal Title *</label>
                  <input
                    className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                    placeholder="Emergency Fund, Dream Vacation, etc."
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Description</label>
                  <textarea
                    className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60 resize-none"
                    rows={2}
                    placeholder="Describe your goal..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Target Amount *</label>
                    <input
                      type="number"
                      className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                      placeholder="50000"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Target Date *</label>
                    <input
                      type="date"
                      className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <select
                      className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="emergency_fund">Emergency Fund</option>
                      <option value="vacation">Vacation</option>
                      <option value="house">House</option>
                      <option value="car">Car</option>
                      <option value="education">Education</option>
                      <option value="retirement">Retirement</option>
                      <option value="investment">Investment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Priority</label>
                    <select
                      className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Monthly Contribution (Optional)</label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                    placeholder="5000"
                    value={newGoal.monthlyContribution}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSave"
                    checked={newGoal.autoSave}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, autoSave: e.target.checked }))}
                    className="rounded border-white/20 bg-white/10"
                  />
                  <label htmlFor="autoSave" className="text-sm">Enable automatic savings</label>
                </div>
                
                <Button onClick={addGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Goals</p>
            <Target className="w-4 h-4 text-neon-teal" />
          </div>
          <div className="text-2xl font-bold">{summary.totalGoals}</div>
          <div className="text-sm text-muted-foreground">Active goals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Target Amount</p>
            <Flag className="w-4 h-4 text-neon-violet" />
          </div>
          <div className="text-2xl font-bold">
            <MaskedNumber value={summary.totalTargetAmount.toLocaleString()} prefix="₹" />
          </div>
          <div className="text-sm text-muted-foreground">Total target</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Saved So Far</p>
            <DollarSign className="w-4 h-4 text-neon-lime" />
          </div>
          <div className="text-2xl font-bold">
            <MaskedNumber value={summary.totalCurrentAmount.toLocaleString()} prefix="₹" />
          </div>
          <div className="text-sm text-neon-lime">
            {summary.overallProgress.toFixed(1)}% complete
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Needed</p>
            <Calendar className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">
            <MaskedNumber value={summary.totalMonthlySavingsNeeded.toFixed(0)} prefix="₹" />
          </div>
          <div className="text-sm text-muted-foreground">To stay on track</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          className="rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
        
        <select
          className="rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="emergency_fund">Emergency Fund</option>
          <option value="vacation">Vacation</option>
          <option value="house">House</option>
          <option value="car">Car</option>
          <option value="education">Education</option>
          <option value="retirement">Retirement</option>
          <option value="investment">Investment</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal, index) => {
            const CategoryIcon = categoryIcons[goal.category as keyof typeof categoryIcons];
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const timeRemaining = getTimeRemaining(goal.targetDate);
            const status = getGoalStatus(goal);
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${categoryColors[goal.category as keyof typeof categoryColors]}20` }}
                    >
                      <CategoryIcon 
                        className="w-6 h-6" 
                        style={{ color: categoryColors[goal.category as keyof typeof categoryColors] }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${priorityColors[goal.priority as keyof typeof priorityColors]}20`,
                            color: priorityColors[goal.priority as keyof typeof priorityColors]
                          }}
                        >
                          {goal.priority.toUpperCase()}
                        </span>
                        <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{status.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteGoal(goal._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="font-semibold">
                        <MaskedNumber value={goal.currentAmount.toLocaleString()} prefix="₹" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Target</div>
                      <div className="font-semibold">
                        <MaskedNumber value={goal.targetAmount.toLocaleString()} prefix="₹" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className={timeRemaining.color}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {timeRemaining.text}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="flex items-center justify-between">
                    {goal.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          milestone.isAchieved ? 'bg-neon-lime' : 'bg-white/20'
                        }`}
                        title={`${milestone.percentage}% - ₹${milestone.amount.toLocaleString()}`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowContributeDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Money
                    </Button>
                    
                    {goal.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGoalStatus(goal._id, 'paused')}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : goal.status === 'paused' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGoalStatus(goal._id, 'active')}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-4">Create your first financial goal to start tracking progress</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>
      )}

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <h3 className="font-semibold">{selectedGoal.title}</h3>
                <div className="text-sm text-muted-foreground">
                  Current: ₹{selectedGoal.currentAmount.toLocaleString()} / ₹{selectedGoal.targetAmount.toLocaleString()}
                </div>
                <Progress value={(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100} className="mt-2" />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Contribution Amount</label>
                <input
                  type="number"
                  className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
                  placeholder="1000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addContribution} className="flex-1">
                  Add Contribution
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowContributeDialog(false);
                    setContributionAmount('');
                    setSelectedGoal(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}