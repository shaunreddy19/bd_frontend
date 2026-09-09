import { request } from './apiClient.ts';

export interface AffectedZone {
  id: string;
  disasterId: string;
  name: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  polygonGeoJson: string;
  radiusKm: number;
}

export interface DisasterEvent {
  id: string;
  type: 'FLOOD' | 'CYCLONE' | 'EARTHQUAKE' | 'LANDSLIDE' | 'OTHER';
  title: string;
  description: string;
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  predictedStartTime: string;
  predictedEndTime: string;
  status: 'PREDICTED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  createdById?: string;
  affectedZones?: AffectedZone[];
}

export interface BuildingIntelligence {
  buildingName: string;
  address: string;
  latitude: number;
  longitude: number;
  isAffected: boolean;
  riskLevel: string;
  zoneName: string;
  registeredPopulation: number;
  adults: number;
  children: number;
  elderly: number;
  expectedHome: number;
  expectedShelter: number;
  expectedElsewhere: number;
  unknown: number;
  expectedOccupancy: number;
  confirmedSafe: number;
  inDistress: number;
  unaccounted: number;
  activeRequests: any[];
}

export const disasterService = {
  async getDisasters(): Promise<DisasterEvent[]> {
    return request<DisasterEvent[]>('/disasters');
  },

  async getDisasterById(id: string): Promise<DisasterEvent> {
    return request<DisasterEvent>(`/disasters/${id}`);
  },

  async createDisaster(data: Partial<DisasterEvent>): Promise<DisasterEvent> {
    return request<DisasterEvent>('/disasters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateDisaster(id: string, data: Partial<DisasterEvent>): Promise<DisasterEvent> {
    return request<DisasterEvent>(`/disasters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAffectedZones(disasterId: string): Promise<AffectedZone[]> {
    return request<AffectedZone[]>(`/disasters/${disasterId}/zones`);
  },

  async addAffectedZone(disasterId: string, data: Partial<AffectedZone>): Promise<AffectedZone> {
    return request<AffectedZone>(`/disasters/${disasterId}/zones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAffectedHouseholds(disasterId: string): Promise<any[]> {
    return request<any[]>(`/disasters/${disasterId}/affected-households`);
  },

  async setExpectedLocations(
    disasterId: string,
    locations: Array<{
      memberId: string;
      expectedType: 'HOME' | 'SHELTER' | 'OTHER_CITY' | 'UNKNOWN';
      shelterId?: string | null;
      otherCity?: string | null;
    }>
  ): Promise<any> {
    return request(`/disasters/${disasterId}/expected-locations`, {
      method: 'POST',
      body: JSON.stringify({ locations }),
    });
  },

  async getExpectedLocations(disasterId: string): Promise<any[]> {
    return request<any[]>(`/disasters/${disasterId}/expected-locations`);
  },

  async getBuildingIntelligence(disasterId: string): Promise<BuildingIntelligence[]> {
    return request<BuildingIntelligence[]>(`/disasters/${disasterId}/buildings`);
  },

  async getZoneSummary(disasterId: string): Promise<any> {
    return request(`/disasters/${disasterId}/zone-summary`);
  },

  async submitReconfirmation(
    disasterId: string,
    choice: 'SAME_PLAN' | 'CHANGE_LOCATION' | 'NOT_SURE'
  ): Promise<any> {
    return request(`/disasters/${disasterId}/reconfirm`, {
      method: 'POST',
      body: JSON.stringify({ choice }),
    });
  },

  async getReconfirmationStatus(disasterId: string): Promise<any> {
    return request(`/disasters/${disasterId}/reconfirmation-status`);
  },
};
