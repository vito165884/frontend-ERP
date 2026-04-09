import { salesFetch, salesFetchJson } from "@/lib/http";

export type ProductFamily = {
  id: number;
  nom: string;
};

function normalizeFamily(raw: unknown): ProductFamily {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    nom: String(r.nom ?? r.Nom ?? ""),
  };
}

export async function getProductFamilies(): Promise<ProductFamily[]> {
  const raw = await salesFetchJson<unknown>(`/product-families`);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeFamily);
}

export async function updateProductFamily(id: number, nom: string): Promise<void> {
  const res = await salesFetch(`/product-families/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nom }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

