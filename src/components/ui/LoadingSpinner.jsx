import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'rounded-full border-gray-200 dark:border-gray-700 border-t-primary-600 animate-spin',
          sizes[size]
        )}
      />
    </div>
  );
}
