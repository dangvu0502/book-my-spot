import { Input } from "@/components/ui/input";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  businessHours: { start: number; end: number; defaultDuration: number };
}

export function TimeInput({ value, onChange, businessHours }: TimeInputProps) {
  const minTime = `${businessHours.start.toString().padStart(2, "0")}:00`;
  const maxTime = `${(businessHours.end - 1).toString().padStart(2, "0")}:30`;

  return (
    <div className="space-y-2">
      <label htmlFor="time-input" className="text-sm font-medium">
        Select Time
      </label>
      <div className="flex items-center gap-4">
        <Input
          id="time-input"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minTime}
          max={maxTime}
          className="text-lg font-medium h-12 w-32"
          step="300"
        />
        <div className="text-sm text-muted-foreground">
          <span>{businessHours.defaultDuration} min</span>
          <span className="mx-2">•</span>
          <span>
            {businessHours.start}:00-{businessHours.end}:00
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter any time (e.g., 9:17, 14:03, 16:42)
      </p>
    </div>
  );
}
