export function whatsappLink(phoneE164: string, message: string): string {
  const number = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
