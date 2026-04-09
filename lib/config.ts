export function salesApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SALES_API_BASE_URL?.trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function tenantId(): string | null {
  const t = process.env.NEXT_PUBLIC_TENANT_ID?.trim();
  return t ? t : null;
}

