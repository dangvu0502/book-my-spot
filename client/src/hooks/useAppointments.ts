import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { calculateAvailableSlots } from '@/lib/slotUtils';
import type { InsertAppointment } from '@shared/schema';

export const useAppointments = (date: string) => {
  return useQuery({
    queryKey: [appointmentApi.baseUrl, date],
    queryFn: () => appointmentApi.getAppointments(date),
    enabled: !!date,
  });
};

export const useAvailableSlots = (date: string) => {
  return useQuery({
    queryKey: [appointmentApi.baseUrl, date],
    queryFn: () => appointmentApi.getAppointments(date),
    enabled: !!date,
    select: (data) => {
      const appointments = data.appointments || [];
      return calculateAvailableSlots(appointments, date);
    }
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: InsertAppointment) => appointmentApi.createAppointment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [appointmentApi.baseUrl] });
      toast({
        title: "Success!",
        description: `Appointment booked successfully! Confirmation: ${data.appointment.confirmationCode}`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to book appointment";
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentApi.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [appointmentApi.baseUrl] });  
      toast({
        title: "Cancelled",
        description: "Appointment cancelled successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to cancel appointment";
      toast({
        title: "Cancellation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
