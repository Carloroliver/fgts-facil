export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

export function formatPhone(phone: string): string {
  const cleaned = normalizePhone(phone);
  const ddd = cleaned.slice(2, 4);
  const num = cleaned.slice(4);
  return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
}
