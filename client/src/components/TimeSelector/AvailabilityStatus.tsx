interface AvailabilityStatusProps {
  isAvailable: boolean | null;
}

export function AvailabilityStatus({ isAvailable }: AvailabilityStatusProps) {
  if (isAvailable === null) return null;

  return (
    <div className={`p-3 rounded-lg border ${
      isAvailable
        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
    }`}>
      <div className={`text-sm font-medium flex items-center gap-2 ${
        isAvailable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
      }`}>
        {isAvailable ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Available at selected time
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            This time slot is not available
          </>
        )}
      </div>
    </div>
  );
}