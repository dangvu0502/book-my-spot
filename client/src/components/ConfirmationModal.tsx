import { CheckCircle, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatTime } from "@/lib/dateUtils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
}

export function ConfirmationModal({ isOpen, onClose, appointment }: ConfirmationModalProps) {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const addToCalendar = () => {
    const startDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
    const endDateTime = new Date(`${appointment.date}T${appointment.endTime}:00`);
    
    const startISO = startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endISO = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Appointment')}&dates=${startISO}/${endISO}&details=${encodeURIComponent(`Confirmation: ${appointment.confirmationCode}`)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md modal-backdrop">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Appointment Confirmed!
          </h3>
          <p className="text-muted-foreground mb-4">
            Your appointment has been successfully booked.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="text-foreground font-medium" data-testid="text-confirmed-datetime">
                  {formattedDate} at {formatTime(appointment.startTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground font-medium">30 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmation Code:</span>
                <span className="text-foreground font-medium font-mono" data-testid="text-confirmation-code">
                  {appointment.confirmationCode}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={addToCalendar}
              data-testid="button-add-to-calendar"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            <Button
              className="flex-1"
              onClick={onClose}
              data-testid="button-close-confirmation"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
