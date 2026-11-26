export const IS_DEMO_BUILD =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_DEMO_MODE === 'true';

// Free Trial allows Stages 1..3 (indices 0..2) and up to Qi Refining Peak (realmId 2)
export const DEMO_MAX_STAGE_INDEX = 2;
export const DEMO_MAX_REALM_ID = 2;

const VALID_CODES = new Set([
  'XIUXIAN-2026-VIP',
  'XIUXIAN-DAO-888',
  'AFDIAN-XIUXIAN-99',
  'XIUXIAN-FULL-666',
  'XIUXIAN-STEAM-01',
]);

export function isDemoLocked(fullUnlocked?: boolean): boolean {
  return IS_DEMO_BUILD && !fullUnlocked;
}

export function verifyActivationCode(raw: string): boolean {
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, '');
  return VALID_CODES.has(normalized);
}
