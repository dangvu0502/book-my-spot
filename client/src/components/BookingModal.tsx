import { useState, useRef } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InsertAppointment, TimeSlot } from "@shared/schema";
import { formatTime } from "@/lib/dateUtils";
import { useCreateAppointment } from "@/hooks/useAppointments";
import {
  useKeyboardNavigation,
  useFocusTrap,
} from "@/hooks/useKeyboardNavigation";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: TimeSlot | null;
  selectedDate: Date;
  onSuccess: (appointment: any) => void;
}

export function BookingModal({
  isOpen,
  onClose,
  selectedSlot,
  selectedDate,
  onSuccess,
}: BookingModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
  }>({});

  const createAppointment = useCreateAppointment();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate name
    if (!customerName.trim()) {
      newErrors.customerName = "Name is required";
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = "Name must be at least 2 characters";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!emailRegex.test(customerEmail)) {
      newErrors.customerEmail = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!selectedSlot || !selectedDate) {
      return;
    }

    try {
      // Format date in local timezone, not UTC
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      const appointmentData: InsertAppointment = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        date: localDateString,
        startTime: selectedSlot.time,
        notes: notes.trim() || undefined,
        timezoneOffset: new Date().getTimezoneOffset(),
      };

      const result = await createAppointment.mutateAsync(appointmentData);
      onSuccess(result.appointment);
      handleClose();
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setCustomerEmail("");
    setNotes("");
    setAcceptedTerms(false);
    setErrors({});
    onClose();
  };

  // Add keyboard navigation
  useKeyboardNavigation({
    onEscape: handleClose,
    enabled: isOpen,
  });

  // Add focus trap for modal
  useFocusTrap(dialogRef, isOpen);

  if (!selectedSlot) return null;

  const isFormValid =
    customerName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) &&
    acceptedTerms;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        ref={dialogRef}
        className="sm:max-w-md modal-backdrop"
        aria-describedby="booking-form-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book Appointment</span>
          </DialogTitle>
          <p
            className="text-sm text-muted-foreground"
            data-testid="text-selected-datetime"
            id="booking-form-description"
          >
            Booking appointment for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at {formatTime(selectedSlot.time)}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) {
                  setErrors((prev) => ({ ...prev, customerName: undefined }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isFormValid) {
                  handleSubmit();
                }
              }}
              placeholder="Enter your full name"
              data-testid="input-customer-name"
              aria-describedby={
                errors.customerName ? "customerName-error" : undefined
              }
              aria-invalid={!!errors.customerName}
            />
            {errors.customerName && (
              <p
                className="text-sm text-destructive mt-1"
                id="customerName-error"
                role="alert"
              >
                {errors.customerName}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (errors.customerEmail) {
                  setErrors((prev) => ({ ...prev, customerEmail: undefined }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isFormValid) {
                  handleSubmit();
                }
              }}
              placeholder="Enter your email"
              data-testid="input-customer-email"
              aria-describedby={
                errors.customerEmail ? "customerEmail-error" : undefined
              }
              aria-invalid={!!errors.customerEmail}
            />
            {errors.customerEmail && (
              <p
                className="text-sm text-destructive mt-1"
                id="customerEmail-error"
                role="alert"
              >
                {errors.customerEmail}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Any special requests or requirements"
              data-testid="textarea-notes"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) =>
                setAcceptedTerms(checked as boolean)
              }
              data-testid="checkbox-terms"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <button
                type="button"
                className="text-primary underline hover:text-primary/80"
                onClick={(e) => {
                  e.preventDefault();
                  // In production, this should open terms modal or navigate to terms page
                }}
              >
                terms and conditions
              </button>
            </Label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-booking"
              tabIndex={0}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || createAppointment.isPending}
              data-testid="button-confirm-booking"
              className="flex-1"
              tabIndex={0}
            >
              {createAppointment.isPending ? (
                <>
                  <span className="loading-spinner" />
                  Booking...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Book Appointment
                </>
              )}
            </Button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          aria-label="Close dialog"
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
