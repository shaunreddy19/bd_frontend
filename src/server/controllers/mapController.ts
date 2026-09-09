import { Response } from 'express';
import prisma from '../config/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { calculateHaversineDistance } from '../utils/geo.ts';

const DEFAULT_MAP_RADIUS_KM = 5.0;

export async function getCitizenMapData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { disasterId } = req.query;

    const household = await prisma.household.findFirst({
      where: { userId },
      include: {
        members: {
          include: {
            expectedLocations: disasterId
              ? { where: { disasterId: String(disasterId) } }
              : true,
            emergencyStatuses: disasterId
              ? { where: { disasterId: String(disasterId) } }
              : true,
          },
        },
      },
    });

    if (!household) {
      res.status(404).json({ error: 'Household not registered yet.' });
      return;
    }

    const homeLat = household.latitude;
    const homeLng = household.longitude;

    // Fetch all shelters and filter within 5 km
    const allShelters = await prisma.shelter.findMany();
    const sheltersWithinRadius = allShelters
      .map((s) => ({
        ...s,
        distanceKm: Math.round(calculateHaversineDistance(homeLat, homeLng, s.latitude, s.longitude) * 100) / 100,
      }))
      .filter((s) => s.distanceKm <= DEFAULT_MAP_RADIUS_KM);

    // Fetch all facilities within 5 km
    const allFacilities = await prisma.emergencyFacility.findMany();
    const facilitiesWithinRadius = allFacilities
      .map((f) => ({
        ...f,
        distanceKm: Math.round(calculateHaversineDistance(homeLat, homeLng, f.latitude, f.longitude) * 100) / 100,
      }))
      .filter((f) => f.distanceKm <= DEFAULT_MAP_RADIUS_KM);

    const hospitals = facilitiesWithinRadius.filter((f) => f.type === 'HOSPITAL');
    const fireStations = facilitiesWithinRadius.filter((f) => f.type === 'FIRE_STATION');
    const policeStations = facilitiesWithinRadius.filter((f) => f.type === 'POLICE_STATION');
    const checkpoints = facilitiesWithinRadius.filter((f) => f.type === 'CHECKPOINT');

    // Fetch roads
    const roads = await prisma.road.findMany();

    // Fetch affected zones if disasterId provided
    let zones: any[] = [];
    if (disasterId) {
      zones = await prisma.affectedZone.findMany({
        where: { disasterId: String(disasterId) },
      });
    }

    res.json({
      registeredHome: {
        id: household.id,
        name: household.name,
        address: household.address,
        latitude: household.latitude,
        longitude: household.longitude,
        membersCount: household.members.length,
        members: household.members,
      },
      radiusKm: DEFAULT_MAP_RADIUS_KM,
      shelters: sheltersWithinRadius,
      facilities: {
        hospitals,
        fireStations,
        policeStations,
        checkpoints,
      },
      roads,
      zones,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch citizen map data.' });
  }
}

export async function getRescuerMapData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { disasterId } = req.query;

    const households = await prisma.household.findMany({
      include: {
        members: {
          include: {
            expectedLocations: disasterId ? { where: { disasterId: String(disasterId) } } : true,
            emergencyStatuses: disasterId ? { where: { disasterId: String(disasterId) } } : true,
            emergencyRequests: disasterId
              ? {
                  where: { disasterId: String(disasterId) },
                  include: { conditions: true, rescueAssignments: true },
                }
              : { include: { conditions: true, rescueAssignments: true } },
          },
        },
      },
    });

    const shelters = await prisma.shelter.findMany();
    const facilities = await prisma.emergencyFacility.findMany();
    const roads = await prisma.road.findMany();

    let zones: any[] = [];
    let emergencyRequests: any[] = [];

    if (disasterId) {
      zones = await prisma.affectedZone.findMany({
        where: { disasterId: String(disasterId) },
      });
      emergencyRequests = await prisma.emergencyRequest.findMany({
        where: { disasterId: String(disasterId) },
        include: {
          householdMember: {
            include: { household: true },
          },
          conditions: true,
          rescueAssignments: true,
        },
      });
    } else {
      emergencyRequests = await prisma.emergencyRequest.findMany({
        include: {
          householdMember: {
            include: { household: true },
          },
          conditions: true,
          rescueAssignments: true,
        },
      });
    }

    // For each registered house, map facilities within 5km
    const housesWithNearbyFacilities = households.map((h) => {
      const nearbyFacilities = facilities.filter(
        (f) => calculateHaversineDistance(h.latitude, h.longitude, f.latitude, f.longitude) <= DEFAULT_MAP_RADIUS_KM
      );
      const nearbyShelters = shelters.filter(
        (s) => calculateHaversineDistance(h.latitude, h.longitude, s.latitude, s.longitude) <= DEFAULT_MAP_RADIUS_KM
      );

      // Building aggregated stats
      let safeCount = 0;
      let distressCount = 0;
      let unaccountedCount = 0;
      let expectedHome = 0;
      let expectedShelter = 0;

      for (const m of h.members) {
        const exp = m.expectedLocations[0];
        if (exp?.expectedType === 'HOME') expectedHome++;
        else if (exp?.expectedType === 'SHELTER') expectedShelter++;

        const em = m.emergencyStatuses[0];
        if (em?.status === 'SAFE') safeCount++;
        else if (em?.status === 'IN_DISTRESS') distressCount++;
        else unaccountedCount++;
      }

      return {
        id: h.id,
        name: h.name,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        registeredPopulation: h.members.length,
        expectedHome,
        expectedShelter,
        confirmedSafe: safeCount,
        inDistress: distressCount,
        unaccounted: unaccountedCount,
        hasEmergency: distressCount > 0,
        nearbyFacilitiesCount: nearbyFacilities.length,
        nearbySheltersCount: nearbyShelters.length,
      };
    });

    res.json({
      households: housesWithNearbyFacilities,
      shelters,
      facilities,
      roads,
      zones,
      emergencyRequests,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch rescuer map data.' });
  }
}
