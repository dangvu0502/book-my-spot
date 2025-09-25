import type {
  InsertAppointment,
  CreateAppointmentResponse,
  GetAppointmentsByDateResponse,
  CancelAppointmentResponse
} from "@shared/schema";
import { apiRequest } from "./queryClient";

export const appointmentApi = {
  baseUrl: `/api/appointments`,

  async createAppointment(data: InsertAppointment): Promise<CreateAppointmentResponse> {
    const response = await apiRequest("POST", `${this.baseUrl}`, data);
    return await response.json();
  },

  async getAppointments(date: string): Promise<GetAppointmentsByDateResponse> {
    const response = await apiRequest("GET", `${this.baseUrl}?date=${date}`);
    return await response.json();
  },

  async cancelAppointment(id: string, reason?: string): Promise<CancelAppointmentResponse> {
    const response = await apiRequest("DELETE", `${this.baseUrl}/${id}`, { reason });
    return await response.json();
  },

};
