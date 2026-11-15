/**
 * Normalises a Pakistani phone number to E.164 (+92…). Accepts mobile
 * (0300 1234567, +92-300-1234567, 923001234567, 0092…) and landline
 * (042 35761234) formats. Returns null for anything else.
 */
export function normalizePkPhone(raw: string): string | null {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  if (!digits.startsWith("92")) return null;
  const national = digits.slice(2);
  if (national.length < 9 || national.length > 10 || national.startsWith("0")) return null;
  return `+${digits}`;
}

/** "+923001234567" → "0300 1234567" for display. */
export function displayPkPhone(e164: string): string {
  const national = e164.replace(/^\+92/, "0");
  if (/^03\d{9}$/.test(national)) return `${national.slice(0, 4)} ${national.slice(4)}`;
  return national;
}
