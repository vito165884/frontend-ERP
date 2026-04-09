import { salesFetch, salesFetchJson } from "@/lib/http";

export type Banque = {
  id: number;
  nom: string;
};

function normalizeBanque(raw: unknown): Banque {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    nom: String(r.nom ?? r.Nom ?? ""),
  };
}

export async function getBanques(): Promise<Banque[]> {
  const raw = await salesFetchJson<unknown>(`/banque`);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeBanque);
}

export async function createBanque(nom: string): Promise<{ id?: number } | null> {
  const res = await salesFetch(`/banque`, {
    method: "POST",
    body: JSON.stringify({ nom }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const loc = res.headers.get("location") ?? res.headers.get("Location") ?? "";
  const id = loc.match(/\/banque\/(\d+)/i)?.[1];
  return id ? { id: Number(id) } : null;
}

