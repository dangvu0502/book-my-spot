import { useToast } from '@/hooks';
import { appointmentApi } from '@/lib/api';
import type {
  CancelAppointmentResponse,
  CreateAppointmentResponse,
  GetAppointmentsByDateResponse,
  InsertAppointment
} from '@shared/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAppointments = (date: string) => {
  return useQuery<GetAppointmentsByDateResponse>({
    queryKey: [appointmentApi.baseUrl, date],
    queryFn: () => appointmentApi.getAppointments(date),
    enabled: !!date,
  });
};


export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<CreateAppointmentResponse, Error, InsertAppointment>({
    mutationFn: (data: InsertAppointment) => appointmentApi.createAppointment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [appointmentApi.baseUrl] });
      toast({
        title: "Success!",
        description: `Appointment booked successfully for ${data.appointment.date} at ${data.appointment.startTime}`,
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

  return useMutation<CancelAppointmentResponse, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentApi.cancelAppointment(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [appointmentApi.baseUrl] });
      toast({
        title: "Cancelled",
        description: data.message,
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
