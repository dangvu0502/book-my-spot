import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface QuickActionsProps {
  onFindNext: () => void;
  isLoading: boolean;
}

export function QuickActions({
  onFindNext,
  isLoading
}: QuickActionsProps) {
  return (
    <div className="space-y-3">
      <Button
        onClick={onFindNext}
        variant="secondary"
        className="w-full h-11"
        disabled={isLoading}
      >
        <Rocket className="mr-2 h-4 w-4" />
        Find Next Available Slot
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">
            or select a specific time
          </span>
        </div>
      </div>
    </div>
  );
}