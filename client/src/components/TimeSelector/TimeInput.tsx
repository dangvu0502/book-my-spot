import { Input } from "@/components/ui/input";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  businessHours: { start: number; end: number };
}

export function TimeInput({
  value,
  onChange,
  businessHours
}: TimeInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="time-input" className="text-sm font-medium">Select Time</label>
      <div className="flex items-center gap-4">
        <Input
          id="time-input"
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="07:00"
          max="19:00"
          className="text-lg font-medium h-12 w-32"
          step="60"
        />
        <div className="text-sm text-muted-foreground">
          <span>30 min</span>
          <span className="mx-2">•</span>
          <span>{businessHours.start}:00-{businessHours.end}:00</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter any time (e.g., 9:17, 14:03, 16:42)
      </p>
    </div>
  );
}