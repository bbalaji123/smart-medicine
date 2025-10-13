import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index }) => {
  const progressPercentage = (achievement.progress / achievement.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`card p-4 transition-all duration-200 ${
        achievement.unlocked
          ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
          : 'border border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${
          achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
        }`}>
          <achievement.icon className={`h-6 w-6 ${
            achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
          }`} />
        </div>
        {achievement.unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium"
          >
            Unlocked!
          </motion.div>
        )}
      </div>

      <h3 className={`font-semibold mb-1 ${
        achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
      }`}>
        {achievement.title}
      </h3>
      
      <p className={`text-sm mb-3 ${
        achievement.unlocked ? 'text-gray-600' : 'text-gray-500'
      }`}>
        {achievement.description}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className={`font-medium ${
            achievement.unlocked ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {achievement.progress}/{achievement.target}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`h-2 rounded-full ${
              achievement.unlocked 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                : 'bg-gray-400'
            }`}
          />
        </div>
      </div>

      {achievement.unlocked && achievement.unlockedAt && (
        <p className="text-xs text-gray-500 mt-2">
          Unlocked on {achievement.unlockedAt.toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
};

const GamificationSection: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Perfect Week',
      description: 'Take all medications on time for 7 days',
      icon: TrophyIcon,
      progress: 7,
      target: 7,
      unlocked: true,
      unlockedAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintain a 14-day adherence streak',
      icon: FireIcon,
      progress: 12,
      target: 14,
      unlocked: false,
    },
    {
      id: '3',
      title: 'Health Champion',
      description: 'Log health metrics for 30 days',
      icon: StarIcon,
      progress: 18,
      target: 30,
      unlocked: false,
    },
    {
      id: '4',
      title: 'Early Bird',
      description: 'Take morning medication on time for 10 days',
      icon: TrophyIcon,
      progress: 10,
      target: 10,
      unlocked: true,
      unlockedAt: new Date('2024-01-08'),
    },
    {
      id: '5',
      title: 'Consistency King',
      description: 'Achieve 95% adherence for a month',
      icon: StarIcon,
      progress: 23,
      target: 30,
      unlocked: false,
    },
    {
      id: '6',
      title: 'Data Tracker',
      description: 'Record 50 health journal entries',
      icon: TrophyIcon,
      progress: 32,
      target: 50,
      unlocked: false,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        <span className="text-sm text-gray-600">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GamificationSection;