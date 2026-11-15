import bcrypt from "bcryptjs";

const COST = 12;
let dummyHash: Promise<string> | null = null;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

/**
 * Compares against the stored hash, or against a throwaway hash when the user
 * does not exist, so response time does not reveal which emails are registered.
 */
export async function checkPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    dummyHash ??= bcrypt.hash("not-a-real-password", COST);
    await bcrypt.compare(password, await dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}
