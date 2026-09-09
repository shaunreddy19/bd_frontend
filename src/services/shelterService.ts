import { request } from './apiClient.ts';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  contactNumber: string;
  status: 'ACTIVE' | 'NEAR_CAPACITY' | 'FULL' | 'CLOSED' | 'AVAILABLE' | 'OVER_CAPACITY';
}

export interface ShelterOccupancy extends Omit<Shelter, 'status'> {
  expectedArrivals: number;
  remainingCapacity: number;
  occupancyPercentage: number;
  status: 'AVAILABLE' | 'NEAR_CAPACITY' | 'FULL' | 'OVER_CAPACITY' | 'ACTIVE' | 'CLOSED';
}

export const shelterService = {
  async getShelters(): Promise<Shelter[]> {
    return request<Shelter[]>('/shelters');
  },

  async getShelterOccupancy(disasterId: string): Promise<ShelterOccupancy[]> {
    return request<ShelterOccupancy[]>(`/disasters/${disasterId}/shelter-occupancy`);
  },

  async createShelter(data: Partial<Shelter>): Promise<Shelter> {
    return request<Shelter>('/shelters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateShelter(id: string, data: Partial<Shelter>): Promise<Shelter> {
    return request<Shelter>(`/shelters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
