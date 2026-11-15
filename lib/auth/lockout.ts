export const WINDOW_MINUTES = 15;
/** Failures from one IP for one email: the normal "wrong password" limit. */
export const PAIR_LIMIT = 5;
/** Failures from one IP across any emails: someone guessing accounts. */
export const IP_LIMIT = 20;
/**
 * Failures for one email across all IPs. Kept high so that a stranger who knows the
 * owner's email can't keep them locked out with a handful of bad attempts.
 */
export const EMAIL_LIMIT = 50;

export type FailureCounts = { pair: number; ip: number; email: number; last: string | null };

/** Minutes until sign-in is allowed again; 0 when not locked. Counts cover the last WINDOW_MINUTES. */
export function lockMinutes(c: FailureCounts, now: number = Date.now()): number {
  const locked = c.pair >= PAIR_LIMIT || c.ip >= IP_LIMIT || c.email >= EMAIL_LIMIT;
  if (!locked || !c.last) return 0;
  const unlockAt = Date.parse(c.last) + WINDOW_MINUTES * 60_000;
  return Math.max(1, Math.ceil((unlockAt - now) / 60_000));
}
