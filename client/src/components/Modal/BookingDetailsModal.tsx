import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Mail, MessageSquare, Hash } from "lucide-react";
import { formatTime } from "@/lib/dateUtils";
import type { Appointment } from "@shared/schema";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export function BookingDetailsModal({ isOpen, onClose, appointment }: BookingDetailsModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={appointment.status === 'active' ? 'default' : 'secondary'}>
              {appointment.status === 'active' ? 'Active' : 'Cancelled'}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Hash className="h-4 w-4" />
              {appointment.id}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{appointment.customerName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {appointment.customerEmail}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p>{formatDate(appointment.date)}</p>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
            </div>

            {appointment.notes && (
              <div className="flex gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}