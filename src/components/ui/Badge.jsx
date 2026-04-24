import clsx from 'clsx';

const variants = {
  // Lead status
  NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONTACTED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  QUALIFIED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',

  // Temperature
  HOT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  WARM: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  COLD: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',

  // Task status
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

  // Priority
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',

  // Roles
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SALESPERSON: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const temperatureIcons = {
  HOT: '🔥',
  WARM: '⚠️',
  COLD: '❄️',
};

export default function Badge({ value, showIcon = false, className }) {
  const variant = variants[value] || 'bg-gray-100 text-gray-600';
  const icon = showIcon && temperatureIcons[value];

  return (
    <span className={clsx('badge', variant, className)}>
      {icon && <span className="mr-1">{icon}</span>}
      {value}
    </span>
  );
}
