import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import type { InsertAppointment, TimeSlot } from "@shared/schema";
import { formatTime } from "@/lib/dateUtils";
import { useCreateAppointment } from "@/hooks/useAppointments";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: TimeSlot | null;
  selectedDate: Date;
  onSuccess: (appointment: any) => void;
}

export function BookingModal({ isOpen, onClose, selectedSlot, selectedDate, onSuccess }: BookingModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const createAppointment = useCreateAppointment();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      notes: "",
    },
  });

  const onSubmit = async (data: InsertAppointment) => {
    if (!selectedSlot || !acceptedTerms) return;

    const appointmentData: InsertAppointment = {
      ...data,
      date: selectedDate.toISOString().split('T')[0],
      startTime: selectedSlot.time,
    };

    try {
      const result = await createAppointment.mutateAsync(appointmentData);
      onSuccess(result.appointment);
      reset();
      setAcceptedTerms(false);
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    reset();
    setAcceptedTerms(false);
    onClose();
  };

  if (!selectedSlot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md modal-backdrop">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Book Appointment</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-selected-datetime">
            {selectedDate.toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'long', 
              day: 'numeric' 
            })} at {formatTime(selectedSlot.time)}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              {...register("customerName")}
              placeholder="Enter your full name"
              data-testid="input-customer-name"
            />
            {errors.customerName && (
              <p className="text-sm text-destructive mt-1">{errors.customerName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              {...register("customerEmail")}
              placeholder="Enter your email"
              data-testid="input-customer-email"
            />
            {errors.customerEmail && (
              <p className="text-sm text-destructive mt-1">{errors.customerEmail.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any additional notes or requirements"
              className="resize-none"
              rows={3}
              data-testid="input-notes"
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
              data-testid="checkbox-terms"
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <button type="button" className="text-primary hover:underline">
                terms and conditions
              </button>
            </Label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              data-testid="button-cancel-booking"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!acceptedTerms || createAppointment.isPending}
              data-testid="button-confirm-booking"
            >
              {createAppointment.isPending ? (
                "Booking..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Book Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
