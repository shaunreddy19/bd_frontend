import prisma from '../config/database.ts';
import { EmergencyConditionType } from '../types/index.ts';

export const DEFAULT_PRIORITY_WEIGHTS: Record<EmergencyConditionType, number> = {
  FIRE: 30,
  HEAVILY_INJURED: 25,
  SERIOUSLY_UNWELL: 20,
  TRAPPED: 20,
  WATER_RISING: 15,
  NEED_RESCUE: 15,
  CHILDREN_INFANTS_PRESENT: 10,
  PHYSICALLY_DISABLED: 10,
  OTHER: 5,
};

/**
 * Calculates priority score capped at 100 based on active condition weights in the database
 */
export async function calculatePriorityScore(
  conditions: string[]
): Promise<{ score: number; breakdown: Record<string, number> }> {
  // Load weights from database or use defaults
  const dbConfigs = await prisma.priorityConfiguration.findMany({
    where: { isActive: true },
  });

  const weightMap: Record<string, number> = { ...DEFAULT_PRIORITY_WEIGHTS };
  for (const cfg of dbConfigs) {
    weightMap[cfg.conditionType] = cfg.weight;
  }

  let total = 0;
  const breakdown: Record<string, number> = {};

  for (const cond of conditions) {
    const weight = weightMap[cond] ?? 5;
    total += weight;
    breakdown[cond] = weight;
  }

  // Cap final score at 100
  const finalScore = Math.min(100, total);

  return {
    score: finalScore,
    breakdown,
  };
}
