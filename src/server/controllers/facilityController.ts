import { Response } from 'express';
import prisma from '../config/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function createFacility(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, type, address, latitude, longitude, contactNumber } = req.body;

    if (!name || !type || !address || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Name, type, address, latitude, and longitude are required.' });
      return;
    }

    const facility = await prisma.emergencyFacility.create({
      data: {
        name: String(name).trim(),
        type,
        address: String(address).trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        contactNumber: String(contactNumber || '').trim(),
      },
    });

    res.status(201).json(facility);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create emergency facility.' });
  }
}

export async function getFacilities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { type } = req.query;

    const facilities = await prisma.emergencyFacility.findMany({
      where: type ? { type: String(type) } : undefined,
      orderBy: { name: 'asc' },
    });

    res.json(facilities);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch facilities.' });
  }
}

export async function getFacilityById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const facility = await prisma.emergencyFacility.findUnique({
      where: { id },
    });

    if (!facility) {
      res.status(404).json({ error: 'Facility not found.' });
      return;
    }

    res.json(facility);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch facility.' });
  }
}

export async function updateFacility(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, type, address, latitude, longitude, contactNumber } = req.body;

    const updated = await prisma.emergencyFacility.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : undefined,
        type: type || undefined,
        address: address ? String(address).trim() : undefined,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        contactNumber: contactNumber !== undefined ? String(contactNumber).trim() : undefined,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update facility.' });
  }
}

export async function deleteFacility(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.emergencyFacility.delete({ where: { id } });
    res.json({ message: 'Facility deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete facility.' });
  }
}
