import { salesApiBaseUrl, tenantId } from "./config";
import { authService } from "./auth";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function joinUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function salesFetch(inputPath: string, init?: RequestInit): Promise<Response> {
  const base = salesApiBaseUrl();
  if (!base) throw new Error("NEXT_PUBLIC_SALES_API_BASE_URL is not set");

  const headers = new Headers(init?.headers);
  headers.set("accept", headers.get("accept") ?? "application/json");

  const token = authService.getAccessToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const t = tenantId();
  if (t) headers.set("X-Tenant-Id", t);

  return fetch(joinUrl(base, inputPath), { ...init, headers });
}

export async function salesFetchJson<T = Json>(inputPath: string, init?: RequestInit): Promise<T> {
  const res = await salesFetch(inputPath, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

