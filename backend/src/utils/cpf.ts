export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function isValidCpf(cpf: string): boolean {
  const cleaned = cleanCpf(cpf);
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (parseInt(cleaned[9]) !== digit) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (parseInt(cleaned[10]) !== digit) return false;

  return true;
}

export function maskCpf(cpf: string): string {
  const cleaned = cleanCpf(cpf);
  return `***.***.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}
