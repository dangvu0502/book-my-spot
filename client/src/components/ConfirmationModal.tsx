import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatTime } from "@/lib/dateUtils";
import { Calendar, CheckCircle, Clock, Mail, User } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
}

export function ConfirmationModal({ isOpen, onClose, appointment }: ConfirmationModalProps) {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center p-4">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mb-2">Appointment Confirmed!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your appointment has been successfully booked
          </p>

          {/* Details */}
          <div className="w-full space-y-3 mb-6 text-sm">
            <div className="flex items-center justify-between px-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </span>
              <span className="font-medium">{formatTime(appointment.startTime)}</span>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </span>
              <span className="font-medium">{appointment.customerName}</span>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </span>
              <span className="font-medium text-sm">{appointment.customerEmail}</span>
            </div>
          </div>
          {/* Action Button */}
          <Button
            className="w-full"
            onClick={onClose}
            data-testid="button-close-confirmation"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
