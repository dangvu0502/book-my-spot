import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCancelAppointment } from "@/hooks/useAppointments";
import { formatTime } from "@/lib/dateUtils";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  customerName: string;
  time: string;
  date: string;
}

export function CancelModal({
  isOpen,
  onClose,
  appointmentId,
  customerName,
  time,
  date
}: CancelModalProps) {
  const [reason, setReason] = useState("");
  const cancelAppointment = useCancelAppointment();

  const handleCancel = async () => {
    try {
      await cancelAppointment.mutateAsync({
        id: appointmentId,
        reason: reason.trim() || undefined
      });
      setReason("");
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Customer:</strong> {customerName}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Date:</strong> {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Time:</strong> {formatTime(time)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">
              Cancellation Reason (Optional)
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please provide a reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelAppointment.isPending}
          >
            {cancelAppointment.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Cancelling...
              </>
            ) : (
              "Cancel Appointment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}