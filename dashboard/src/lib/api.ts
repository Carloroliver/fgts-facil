const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getOverview: () => fetchApi<any>('/metrics/overview'),
  getLeads: (params?: string) => fetchApi<any>(`/leads${params ? '?' + params : ''}`),
  getLead: (id: string) => fetchApi<any>(`/leads/${id}`),
  getDailyMetrics: (days?: number) => fetchApi<any>(`/metrics/daily?days=${days || 30}`),
  getWhatsAppStatus: () => fetchApi<any>('/whatsapp/status'),
  setupWhatsApp: () => fetchApi<any>('/whatsapp/setup', { method: 'POST' }),
  getQrCode: () => fetchApi<any>('/whatsapp/qrcode'),
  getConfig: () => fetchApi<any>('/config'),
  updateConfig: (data: any) => fetchApi<any>('/config', { method: 'PUT', body: JSON.stringify(data) }),
};
