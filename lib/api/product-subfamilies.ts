import { salesFetch, salesFetchJson } from "@/lib/http";

export type ProductSubFamily = {
  id: number;
  nom: string;
  familleProduitId: number;
  familleProduitNom?: string | null;
};

function normalizeSubFamily(raw: unknown): ProductSubFamily {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    nom: String(r.nom ?? r.Nom ?? ""),
    familleProduitId: Number(r.familleProduitId ?? r.FamilleProduitId ?? 0),
    familleProduitNom: (r.familleProduitNom ?? r.FamilleProduitNom ?? null) as string | null,
  };
}

export async function getProductSubFamilies(params?: { familleProduitId?: number | null }): Promise<ProductSubFamily[]> {
  const qs = new URLSearchParams();
  if (params?.familleProduitId != null) qs.set("familleProduitId", String(params.familleProduitId));
  const suffix = qs.toString();
  const raw = await salesFetchJson<unknown>(`/product-subfamilies${suffix ? `?${suffix}` : ""}`);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSubFamily);
}

export async function updateProductSubFamily(id: number, payload: { nom: string; familleProduitId: number }): Promise<void> {
  const res = await salesFetch(`/product-subfamilies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

