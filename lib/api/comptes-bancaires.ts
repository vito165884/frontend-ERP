import { salesFetch, salesFetchJson } from "@/lib/http";

export type CompteBancaire = {
  id: number;
  banqueId: number;
  banqueNom?: string | null;
  codeEtablissement: string;
  codeAgence: string;
  numeroCompte: string;
  cleRib: string;
  libelle?: string | null;
};

function normalizeCompte(raw: unknown): CompteBancaire {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    banqueId: Number(r.banqueId ?? r.BanqueId ?? 0),
    banqueNom: (r.banqueNom ?? r.BanqueNom ?? null) as string | null,
    codeEtablissement: String(r.codeEtablissement ?? r.CodeEtablissement ?? ""),
    codeAgence: String(r.codeAgence ?? r.CodeAgence ?? ""),
    numeroCompte: String(r.numeroCompte ?? r.NumeroCompte ?? ""),
    cleRib: String(r.cleRib ?? r.CleRib ?? ""),
    libelle: (r.libelle ?? r.Libelle ?? null) as string | null,
  };
}

export async function getComptesBancaires(): Promise<CompteBancaire[]> {
  const raw = await salesFetchJson<unknown>(`/compte-bancaire`);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeCompte);
}

export async function createCompteBancaire(body: {
  banqueId: number;
  codeEtablissement: string;
  codeAgence: string;
  numeroCompte: string;
  cleRib: string;
  libelle?: string | null;
}): Promise<{ id?: number } | null> {
  const res = await salesFetch(`/compte-bancaire`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const loc = res.headers.get("location") ?? res.headers.get("Location") ?? "";
  const id = loc.match(/\/compte-bancaire\/(\d+)/i)?.[1];
  return id ? { id: Number(id) } : null;
}

export async function updateCompteBancaire(
  id: number,
  body: {
    banqueId: number;
    codeEtablissement: string;
    codeAgence: string;
    numeroCompte: string;
    cleRib: string;
    libelle?: string | null;
  }
): Promise<void> {
  const res = await salesFetch(`/compte-bancaire/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function deleteCompteBancaire(id: number): Promise<void> {
  const res = await salesFetch(`/compte-bancaire/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

