import { salesFetch, salesFetchJson } from "@/lib/http";

export type BankTransactionImport = {
  id: number;
  compteBancaireId: number;
  compteBancaireLibelle?: string | null;
  fileName: string;
  importedAt: string;
  rowCount: number;
};

function normalizeImport(raw: unknown): BankTransactionImport {
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r.id ?? r.Id ?? 0),
    compteBancaireId: Number(r.compteBancaireId ?? r.CompteBancaireId ?? 0),
    compteBancaireLibelle: (r.compteBancaireLibelle ?? r.CompteBancaireLibelle ?? null) as string | null,
    fileName: String(r.fileName ?? r.FileName ?? ""),
    importedAt: String(r.importedAt ?? r.ImportedAt ?? ""),
    rowCount: Number(r.rowCount ?? r.RowCount ?? 0),
  };
}

export async function getBankTransactionImports(params?: { compteBancaireId?: number | null }): Promise<BankTransactionImport[]> {
  const qs = new URLSearchParams();
  if (params?.compteBancaireId != null) qs.set("compteBancaireId", String(params.compteBancaireId));
  const suffix = qs.toString();
  const raw = await salesFetchJson<unknown>(`/api/bank-transactions/imports${suffix ? `?${suffix}` : ""}`);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeImport);
}

export async function importBankTransactions(form: FormData): Promise<void> {
  // Must include `compteBancaireId` as query param (see backend endpoint).
  const compteBancaireId = form.get("compteBancaireId");
  const id = typeof compteBancaireId === "string" ? compteBancaireId : String(compteBancaireId ?? "");
  form.delete("compteBancaireId");

  const res = await salesFetch(`/api/bank-transactions/import?compteBancaireId=${encodeURIComponent(id)}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

