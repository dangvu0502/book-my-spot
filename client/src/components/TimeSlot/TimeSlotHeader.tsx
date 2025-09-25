interface TimeSlotHeaderProps {
  selectedDate: Date;
  availableSlots: number;
  totalSlots: number;
}

export function TimeSlotHeader({ selectedDate, availableSlots, totalSlots }: TimeSlotHeaderProps) {
  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimezoneInfo = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset <= 0 ? '+' : '-';
    const gmtOffset = `GMT${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    return `${tz} (${gmtOffset})`;
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Available Time Slots</h2>
        <p className="text-sm text-muted-foreground" data-testid="text-selected-date">
          {formatSelectedDate()}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 dark:bg-slate-300 rounded" />
          <span className="text-muted-foreground">
            Available (<span data-testid="text-available-count">{availableSlots}</span>)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-destructive dark:bg-slate-400 rounded" />
          <span className="text-muted-foreground">
            Booked (<span data-testid="text-booked-count">{totalSlots - availableSlots}</span>)
          </span>
        </div>

        <div className="text-muted-foreground text-xs sm:text-sm">
          {getTimezoneInfo()}
        </div>
      </div>
    </div>
  );
}