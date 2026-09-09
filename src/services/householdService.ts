import { request } from './apiClient.ts';

export interface HouseholdMember {
  id: string;
  householdId: string;
  name: string;
  age: number;
  relationship: string;
  category: 'ADULT' | 'CHILD' | 'ELDERLY';
  expectedLocations?: any[];
  emergencyStatuses?: any[];
}

export interface Household {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  userId: string;
  members: HouseholdMember[];
  stats?: {
    totalMembers: number;
    adults: number;
    children: number;
    elderly: number;
  };
}

export const householdService = {
  async getMyHousehold(): Promise<Household> {
    return request<Household>('/my-household');
  },

  async getHousehold(id: string): Promise<Household> {
    return request<Household>(`/households/${id}`);
  },

  async updateHousehold(id: string, data: Partial<Household>): Promise<Household> {
    return request<Household>(`/households/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async addMember(
    householdId: string,
    member: { name: string; age: number; relationship: string; category?: string }
  ): Promise<HouseholdMember> {
    return request<HouseholdMember>(`/households/${householdId}/members`, {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  async updateMember(
    householdId: string,
    memberId: string,
    data: Partial<HouseholdMember>
  ): Promise<HouseholdMember> {
    return request<HouseholdMember>(`/households/${householdId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMember(householdId: string, memberId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/households/${householdId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },

  async getDisasterOccupancy(disasterId: string): Promise<any> {
    return request(`/my-household/disaster/${disasterId}/occupancy`);
  },
};
