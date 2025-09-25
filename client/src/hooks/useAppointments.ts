import { useToast } from '@/hooks';
import { appointmentApi } from '@/lib/api';
import { convertFromUTCForDisplay } from '@shared/timeValidation';
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
    queryFn: async () => {
      const data = await appointmentApi.getAppointments(date);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Convert UTC appointments to local time for display
      const localAppointments = data.appointments.map(apt => {
        const { localDate, localTime } = convertFromUTCForDisplay(apt.date, apt.startTime, userTimezone);
        const { localTime: localEndTime } = convertFromUTCForDisplay(apt.date, apt.endTime, userTimezone);

        return {
          ...apt,
          date: localDate,
          startTime: localTime,
          endTime: localEndTime,
        };
      });

      return {
        ...data,
        appointments: localAppointments,
      };
    },
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

      // Convert UTC response back to local time for display
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { localDate, localTime } = convertFromUTCForDisplay(
        data.appointment.date,
        data.appointment.startTime,
        userTimezone
      );

      toast({
        title: "Success!",
        description: `Appointment booked successfully for ${localDate} at ${localTime}`,
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
