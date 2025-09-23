import { apiRequest } from "./queryClient";
import type { InsertAppointment, AvailableSlotsResponse, AppointmentMetrics } from "@shared/schema";

export const appointmentApi = {
  async createAppointment(data: InsertAppointment) {
    const response = await apiRequest("POST", "/api/appointments", data);
    return await response.json();
  },

  async getAppointments(date: string) {
    const response = await apiRequest("GET", `/api/appointments?date=${date}`);
    return await response.json();
  },

  async cancelAppointment(id: string, reason?: string) {
    const response = await apiRequest("DELETE", `/api/appointments/${id}`, { reason });
    return await response.json();
  },

  async getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
    const response = await apiRequest("GET", `/api/appointments/slots?date=${date}`);
    return await response.json();
  },

  async getMetrics(): Promise<{ success: boolean; metrics: AppointmentMetrics }> {
    const response = await apiRequest("GET", "/api/metrics");
    return await response.json();
  },

  async healthCheck() {
    const response = await apiRequest("GET", "/api/health");
    return await response.json();
  }
};
