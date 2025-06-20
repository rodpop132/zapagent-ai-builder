
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const calculateStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    
    return score;
  };

  const getStrengthLevel = (score: number) => {
    if (score <= 2) return { level: 'Fácil', percentage: 33, color: 'bg-red-500' };
    if (score <= 4) return { level: 'Médio', percentage: 66, color: 'bg-yellow-500' };
    return { level: 'Difícil', percentage: 100, color: 'bg-green-500' };
  };

  if (!password) return null;

  const score = calculateStrength(password);
  const { level, percentage, color } = getStrengthLevel(score);

  return (
    <div className="mt-2 space-y-2">
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
        <span className={`font-medium ${
          level === 'Fácil' ? 'text-red-600 dark:text-red-400' :
          level === 'Médio' ? 'text-yellow-600 dark:text-yellow-400' :
          'text-green-600 dark:text-green-400'
        }`}>
          {level}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
