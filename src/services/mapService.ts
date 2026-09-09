import { request } from './apiClient.ts';
import { Shelter } from './shelterService.ts';
import { EmergencyFacility } from './facilityService.ts';
import { AffectedZone } from './disasterService.ts';

export interface Road {
  id: string;
  name: string;
  status: 'OPEN' | 'FLOODED' | 'BLOCKED' | 'RESTRICTED';
  coordinatesJson: string;
}

export interface CitizenMapResponse {
  registeredHome: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    membersCount: number;
    members: any[];
  };
  radiusKm: number;
  shelters: (Shelter & { distanceKm: number })[];
  facilities: {
    hospitals: (EmergencyFacility & { distanceKm: number })[];
    fireStations: (EmergencyFacility & { distanceKm: number })[];
    policeStations: (EmergencyFacility & { distanceKm: number })[];
    checkpoints: (EmergencyFacility & { distanceKm: number })[];
  };
  roads: Road[];
  zones: AffectedZone[];
}

export interface RescuerMapResponse {
  households: any[];
  shelters: Shelter[];
  facilities: EmergencyFacility[];
  roads: Road[];
  zones: AffectedZone[];
  emergencyRequests: any[];
}

export const mapService = {
  async getCitizenMap(disasterId?: string): Promise<CitizenMapResponse> {
    return request<CitizenMapResponse>(`/map/citizen${disasterId ? `?disasterId=${disasterId}` : ''}`);
  },

  async getRescuerMap(disasterId?: string): Promise<RescuerMapResponse> {
    return request<RescuerMapResponse>(`/map/rescuer${disasterId ? `?disasterId=${disasterId}` : ''}`);
  },
};
