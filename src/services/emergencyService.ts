import { request } from './apiClient.ts';

export interface EmergencyCondition {
  id: string;
  conditionType: string;
}

export interface EmergencyRequest {
  id: string;
  disasterId: string;
  householdMemberId: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  priorityScore: number;
  rescueStatus: 'PENDING' | 'TEAM_ASSIGNED' | 'SAFELY_RESCUED' | 'NOT_FOUND';
  createdAt: string;
  updatedAt: string;
  conditions: EmergencyCondition[];
  rescueAssignments?: any[];
  householdMember?: any;
}

export interface CommunityStatus {
  disasterId: string;
  totalPopulation: number;
  confirmedSafe: number;
  inDistress: number;
  unaccounted: number;
  emergencyRequests: {
    total: number;
    pending: number;
    teamAssigned: number;
    safelyRescued: number;
    notFound: number;
  };
}

export const emergencyService = {
  async getMyStatus(disasterId: string): Promise<any> {
    return request(`/disasters/${disasterId}/my-status`);
  },

  async updateStatus(
    disasterId: string,
    status: 'SAFE' | 'IN_DISTRESS' | 'UNACCOUNTED',
    memberIds?: string[]
  ): Promise<any> {
    return request(`/disasters/${disasterId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, memberIds }),
    });
  },

  async createEmergencyRequest(
    disasterId: string,
    data: {
      householdMemberId: string;
      latitude?: number;
      longitude?: number;
      address?: string;
      description?: string;
      conditions: string[];
    }
  ): Promise<EmergencyRequest> {
    return request<EmergencyRequest>(`/disasters/${disasterId}/emergency-requests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getEmergencyRequests(disasterId: string, status?: string): Promise<EmergencyRequest[]> {
    return request<EmergencyRequest[]>(
      `/disasters/${disasterId}/emergency-requests${status ? `?status=${status}` : ''}`
    );
  },

  async getEmergencyRequestById(requestId: string): Promise<EmergencyRequest> {
    return request<EmergencyRequest>(`/emergency-requests/${requestId}`);
  },

  async getCommunityStatus(disasterId: string): Promise<CommunityStatus> {
    return request<CommunityStatus>(`/disasters/${disasterId}/community-status`);
  },

  async getBuildingLiveStatus(disasterId: string, buildingId: string): Promise<any> {
    return request(`/disasters/${disasterId}/buildings/${buildingId}/live-status`);
  },

  async getZoneLiveStatus(disasterId: string, zoneId: string): Promise<any> {
    return request(`/disasters/${disasterId}/zones/${zoneId}/live-status`);
  },
};
