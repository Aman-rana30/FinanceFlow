import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Calendar, 
  Users, 
  Star,
  CheckCircle,
  Clock,
  Flame,
  Award,
  TrendingUp,
  DollarSign,
  Zap,
  Shield,
  Gift,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Crown,
  Medal,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { MaskedNumber } from "@/components/dashboard/KpiCard";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'saving' | 'spending' | 'investment' | 'habit';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in days
  targetAmount?: number;
  currentAmount?: number;
  participants: number;
  reward: {
    points: number;
    badge?: string;
    cashback?: number;
  };
  status: 'available' | 'active' | 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
  progress: number;
  streak?: number;
  category: string;
}

interface UserStats {
  totalPoints: number;
  completedChallenges: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  badges: string[];
  level: number;
  nextLevelPoints: number;
}

const difficultyColors = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444'
};

const typeIcons = {
  saving: DollarSign,
  spending: TrendingUp,
  investment: Target,
  habit: Zap
};

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: '30-Day No Dining Out',
    description: 'Cook all your meals at home for 30 days and save money while building healthy habits.',
    type: 'spending',
    difficulty: 'medium',
    duration: 30,
    targetAmount: 5000,
    currentAmount: 1200,
    participants: 1247,
    reward: { points: 500, badge: 'Home Chef', cashback: 100 },
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    progress: 24,
    streak: 8,
    category: 'Food & Dining'
  },
  {
    id: '2',
    title: 'Emergency Fund Builder',
    description: 'Save ₹1000 every week for 12 weeks to build your emergency fund.',
    type: 'saving',
    difficulty: 'easy',
    duration: 84,
    targetAmount: 12000,
    currentAmount: 8000,
    participants: 892,
    reward: { points: 800, badge: 'Safety Net', cashback: 200 },
    status: 'active',
    startDate: '2023-11-01',
    endDate: '2024-01-24',
    progress: 67,
    category: 'Emergency Fund'
  },
  {
    id: '3',
    title: 'Investment Streak',
    description: 'Invest at least ₹500 every day for 21 days to build a consistent investment habit.',
    type: 'investment',
    difficulty: 'hard',
    duration: 21,
    targetAmount: 10500,
    participants: 456,
    reward: { points: 1000, badge: 'Consistent Investor', cashback: 300 },
    status: 'available',
    progress: 0,
    category: 'Investment'
  },
  {
    id: '4',
    title: 'Coffee Shop Detox',
    description: 'Skip expensive coffee purchases for 14 days and make coffee at home.',
    type: 'spending',
    difficulty: 'easy',
    duration: 14,
    targetAmount: 700,
    participants: 2341,
    reward: { points: 200, badge: 'Caffeine Saver' },
    status: 'available',
    progress: 0,
    category: 'Food & Dining'
  },
  {
    id: '5',
    title: 'Subscription Audit',
    description: 'Review and cancel at least 3 unused subscriptions this month.',
    type: 'spending',
    difficulty: 'easy',
    duration: 7,
    participants: 1876,
    reward: { points: 300, badge: 'Subscription Slayer', cashback: 150 },
    status: 'completed',
    progress: 100,
    category: 'Bills & Utilities'
  },
  {
    id: '6',
    title: 'SIP Booster',
    description: 'Increase your SIP amount by 20% for the next 6 months.',
    type: 'investment',
    difficulty: 'medium',
    duration: 180,
    participants: 634,
    reward: { points: 1200, badge: 'Growth Hacker', cashback: 500 },
    status: 'available',
    progress: 0,
    category: 'Investment'
  }
];

const mockUserStats: UserStats = {
  totalPoints: 3450,
  completedChallenges: 12,
  currentStreak: 8,
  longestStreak: 23,
  rank: 47,
  badges: ['Home Chef', 'Safety Net', 'Subscription Slayer', 'Early Bird', 'Consistent Saver'],
  level: 5,
  nextLevelPoints: 4000
};

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const panic = useUIStore((s) => s.panic);

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, status: 'active', startDate: new Date().toISOString(), currentAmount: 0 }
        : challenge
    ));
    setShowJoinDialog(false);
    toast.success('Challenge joined successfully! Good luck! 🎯');
  };

  const pauseChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, status: 'available' }
        : challenge
    ));
    toast.info('Challenge paused. You can resume anytime!');
  };

  const filteredChallenges = challenges.filter(challenge => challenge.status === activeTab);

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-neon-lime to-green-400';
    if (progress >= 50) return 'from-neon-teal to-blue-400';
    if (progress >= 25) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-neon-teal" />
            Financial Challenges
          </h1>
          <p className="text-muted-foreground mt-1">Build better money habits through gamified challenges</p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-teal/10 to-neon-violet/10 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Level</p>
            <Crown className="w-4 h-4 text-neon-teal" />
          </div>
          <div className="text-2xl font-bold">{userStats.level}</div>
          <div className="text-sm text-muted-foreground">
            {userStats.totalPoints}/{userStats.nextLevelPoints} XP
          </div>
          <Progress 
            value={(userStats.totalPoints / userStats.nextLevelPoints) * 100} 
            className="mt-2 h-1" 
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <Coins className="w-4 h-4 text-neon-lime" />
          </div>
          <div className="text-2xl font-bold text-neon-lime">{userStats.totalPoints.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">XP earned</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">{userStats.currentStreak}</div>
          <div className="text-sm text-muted-foreground">days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Completed</p>
            <CheckCircle className="w-4 h-4 text-neon-violet" />
          </div>
          <div className="text-2xl font-bold text-neon-violet">{userStats.completedChallenges}</div>
          <div className="text-sm text-muted-foreground">challenges</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Rank</p>
            <Medal className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">#{userStats.rank}</div>
          <div className="text-sm text-muted-foreground">global</div>
        </motion.div>
      </div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-neon-teal" />
          Your Badges ({userStats.badges.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          {userStats.badges.map((badge, index) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-neon-teal/20 to-neon-violet/20 border border-neon-teal/30"
            >
              <Star className="w-4 h-4 text-neon-teal" />
              <span className="text-sm font-medium">{badge}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 backdrop-blur-xl border border-white/10">
        {(['available', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-neon-teal text-black' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({filteredChallenges.length})
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredChallenges.map((challenge, index) => {
            const TypeIcon = typeIcons[challenge.type];
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-teal/20 to-neon-violet/20 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-neon-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyBadge(challenge.difficulty)}`}>
                          {challenge.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">{challenge.duration} days</span>
                      </div>
                    </div>
                  </div>
                  
                  {challenge.status === 'active' && challenge.streak && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{challenge.streak}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

                {challenge.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{challenge.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getProgressColor(challenge.progress)} transition-all duration-500`}
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                    {challenge.targetAmount && challenge.currentAmount !== undefined && (
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">
                          <MaskedNumber value={challenge.currentAmount.toLocaleString()} prefix="₹" />
                        </span>
                        <span className="text-muted-foreground">
                          / ₹{challenge.targetAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants.toLocaleString()} participants</span>
                  </div>
                  <div className="flex items-center gap-1 text-neon-lime">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-bold">{challenge.reward.points} XP</span>
                  </div>
                </div>

                {challenge.reward.badge && (
                  <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-gradient-to-r from-neon-teal/10 to-neon-violet/10 border border-neon-teal/20">
                    <Award className="w-4 h-4 text-neon-teal" />
                    <span className="text-sm font-medium">Badge: {challenge.reward.badge}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {challenge.status === 'available' && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setShowJoinDialog(true);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join Challenge
                    </Button>
                  )}
                  
                  {challenge.status === 'active' && (
                    <>
                      <Button variant="outline" className="flex-1">
                        <Target className="w-4 h-4 mr-2" />
                        Update Progress
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => pauseChallenge(challenge.id)}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {challenge.status === 'completed' && (
                    <div className="flex-1 flex items-center justify-center gap-2 text-neon-lime">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed!</span>
                    </div>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No {activeTab} challenges</h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === 'available' && "All challenges are either active or completed"}
            {activeTab === 'active' && "Join a challenge to start building better financial habits"}
            {activeTab === 'completed' && "Complete some challenges to see them here"}
          </p>
          {activeTab !== 'available' && (
            <Button onClick={() => setActiveTab('available')}>
              Browse Available Challenges
            </Button>
          )}
        </div>
      )}

      {/* Join Challenge Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Join Challenge</DialogTitle>
          </DialogHeader>
          {selectedChallenge && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <h3 className="font-semibold text-lg mb-2">{selectedChallenge.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{selectedChallenge.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{selectedChallenge.duration} days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className={`ml-2 font-medium ${
                      selectedChallenge.difficulty === 'easy' ? 'text-green-400' :
                      selectedChallenge.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedChallenge.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="ml-2 font-medium">{selectedChallenge.participants.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reward:</span>
                    <span className="ml-2 font-medium text-neon-lime">{selectedChallenge.reward.points} XP</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-neon-teal/10 to-neon-violet/10 border border-neon-teal/20">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-neon-teal" />
                  <span className="font-semibold">Rewards</span>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• {selectedChallenge.reward.points} XP points</li>
                  {selectedChallenge.reward.badge && <li>• "{selectedChallenge.reward.badge}" badge</li>}
                  {selectedChallenge.reward.cashback && <li>• ₹{selectedChallenge.reward.cashback} cashback</li>}
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => joinChallenge(selectedChallenge.id)} 
                  className="flex-1"
                >
                  Join Challenge
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinDialog(false)}
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