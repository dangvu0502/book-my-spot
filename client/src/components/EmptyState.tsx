import { Calendar, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  type: 'no-slots' | 'error' | 'no-appointments';
  onAction?: () => void;
  message?: string;
}

export function EmptyState({ type, onAction, message }: EmptyStateProps) {
  const configs = {
    'no-slots': {
      icon: Clock,
      title: "No Available Time Slots",
      description: message || "All time slots for this date are currently booked. Try selecting a different date or check back later.",
      actionText: "Find Next Available",
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full animate-pulse-slow"></div>
          <Clock className="absolute inset-4 h-24 w-24 text-blue-500 dark:text-blue-400" />
        </div>
      )
    },
    'error': {
      icon: AlertCircle,
      title: "Something Went Wrong",
      description: message || "We couldn't load the appointment slots. Please try again or contact support if the problem persists.",
      actionText: "Try Again",
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full animate-shake"></div>
          <AlertCircle className="absolute inset-4 h-24 w-24 text-red-500 dark:text-red-400" />
        </div>
      )
    },
    'no-appointments': {
      icon: Calendar,
      title: "No Appointments Yet",
      description: message || "You don't have any appointments scheduled. Book your first appointment to get started!",
      actionText: "Book Appointment",
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 rounded-full"></div>
          <Calendar className="absolute inset-4 h-24 w-24 text-green-500 dark:text-green-400 animate-scale-bounce" />
        </div>
      )
    }
  };

  const config = configs[type];

  return (
    <Card className="p-8 text-center animate-fade-in">
      {config.illustration}

      <h3 className="text-lg font-semibold mb-2 animate-slide-up">
        {config.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
        {config.description}
      </p>

      {onAction && (
        <Button
          onClick={onAction}
          className="animate-slide-up hover-lift button-press"
          style={{ animationDelay: '200ms' }}
        >
          {config.actionText}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}