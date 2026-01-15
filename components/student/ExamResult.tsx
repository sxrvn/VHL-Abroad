import React from 'react';
import { Card, Button, Badge } from '../ui';

interface ExamResultProps {
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  onBackToExams: () => void;
  onViewResults: () => void;
}

const ExamResult: React.FC<ExamResultProps> = ({
  examTitle,
  score,
  totalMarks,
  percentage,
  onBackToExams,
  onViewResults,
}) => {
  const passed = percentage >= 50;
  const grade = 
    percentage >= 90 ? 'A+' :
    percentage >= 80 ? 'A' :
    percentage >= 70 ? 'B' :
    percentage >= 60 ? 'C' :
    percentage >= 50 ? 'D' : 'F';

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
      <div className="max-w-2xl w-full">
        <Card className="relative overflow-hidden">
          {/* Decorative Background */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${passed ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full blur-3xl`}></div>
          <div className={`absolute bottom-0 left-0 w-64 h-64 ${passed ? 'bg-emerald-500/10' : 'bg-pink-500/10'} rounded-full blur-3xl`}></div>
          
          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Success/Fail Icon */}
            <div className="text-center mb-6">
              <div className={`size-20 sm:size-24 mx-auto rounded-full ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-pink-500'} flex items-center justify-center text-white shadow-xl ${passed ? 'shadow-green-500/20' : 'shadow-red-500/20'} mb-4`}>
                <span className="material-symbols-outlined text-5xl sm:text-6xl">
                  {passed ? 'check_circle' : 'cancel'}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-2">
                {passed ? 'Congratulations!' : 'Keep Trying!'}
              </h2>
              <p className="text-lg sm:text-xl opacity-70 mb-4">
                {passed ? 'You have passed the exam!' : 'You can do better next time!'}
              </p>
              <Badge variant={passed ? 'success' : 'error'} size="lg" icon={passed ? 'check' : 'close'}>
                {passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>

            {/* Exam Title */}
            <div className="text-center mb-8">
              <p className="text-sm opacity-60 mb-1">Exam Name</p>
              <h3 className="text-xl sm:text-2xl font-bold">{examTitle}</h3>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 sm:p-6 bg-gray-50 dark:bg-white/10 rounded-xl border-2 border-gray-200 dark:border-white/10">
                <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Score</p>
                <p className="text-2xl sm:text-3xl font-black">
                  {score}
                  <span className="text-base opacity-50">/{totalMarks}</span>
                </p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gray-50 dark:bg-white/10 rounded-xl border-2 border-gray-200 dark:border-white/10">
                <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Percentage</p>
                <p className="text-2xl sm:text-3xl font-black">{percentage.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gray-50 dark:bg-white/10 rounded-xl border-2 border-gray-200 dark:border-white/10">
                <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Grade</p>
                <p className={`text-2xl sm:text-3xl font-black ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {grade}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold opacity-60">Performance</span>
                <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                    passed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Success Message */}
            <div className={`${passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} rounded-xl p-4 mb-6`}>
              <div className="flex gap-3">
                <span className={`material-symbols-outlined ${passed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {passed ? 'celebration' : 'trending_up'}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${passed ? 'text-green-800 dark:text-green-400' : 'text-orange-800 dark:text-orange-400'}`}>
                    {passed ? 'Excellent Performance!' : 'Keep Practicing!'}
                  </p>
                  <p className={`text-xs mt-1 ${passed ? 'text-green-700 dark:text-green-500' : 'text-orange-700 dark:text-orange-500'}`}>
                    {passed 
                      ? 'Your hard work has paid off. Keep up the great work!' 
                      : 'Review your study materials and try again. You\'ll do better next time!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onBackToExams}
                variant="secondary"
                icon="arrow_back"
                fullWidth
                size="lg"
              >
                Back to Exams
              </Button>
              <Button
                onClick={onViewResults}
                variant="primary"
                icon="grade"
                fullWidth
                size="lg"
              >
                View All Results
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExamResult;
