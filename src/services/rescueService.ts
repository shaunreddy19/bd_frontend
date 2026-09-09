import { request } from './apiClient.ts';
import { EmergencyRequest } from './emergencyService.ts';

export interface RescueAssignment {
  id: string;
  emergencyRequestId: string;
  teamName: string;
  assignedByUserId?: string;
  assignedAt: string;
  status: string;
  notes?: string;
}

export interface PriorityConfig {
  id: string;
  conditionType: string;
  weight: number;
  isActive: boolean;
}

export const rescueService = {
  async assignTeam(
    requestId: string,
    teamName: string,
    notes?: string
  ): Promise<{ message: string; assignment: RescueAssignment; request: EmergencyRequest }> {
    return request(`/emergency-requests/${requestId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ teamName, notes }),
    });
  },

  async updateRescueStatus(
    requestId: string,
    rescueStatus: 'PENDING' | 'TEAM_ASSIGNED' | 'SAFELY_RESCUED' | 'NOT_FOUND',
    notes?: string
  ): Promise<EmergencyRequest> {
    return request(`/emergency-requests/${requestId}/rescue-status`, {
      method: 'PUT',
      body: JSON.stringify({ rescueStatus, notes }),
    });
  },

  async getPriorityConfigs(): Promise<PriorityConfig[]> {
    return request<PriorityConfig[]>('/priority-config');
  },

  async updatePriorityConfig(id: string, weight: number, isActive?: boolean): Promise<PriorityConfig> {
    return request<PriorityConfig>(`/priority-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ weight, isActive }),
    });
  },
};
