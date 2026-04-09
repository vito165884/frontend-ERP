import { salesFetch, salesFetchJson } from "@/lib/http";

function toApiDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export type RetourMarchandiseFournisseurBaseInfo = {
  number: number;
  date: string;
  providerId: number;
  providerName?: string | null;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  statut: number;
  statutLibelle: string;
};

type ODataEnvelope<T> = { value: T[]; ["@odata.count"]?: number };

export function normalizeRetourMarchandiseFournisseurBaseInfo(i: unknown): RetourMarchandiseFournisseurBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    number: Number(r.number ?? r.Number ?? 0),
    date: String(r.date ?? r.Date ?? ""),
    providerId: Number(r.providerId ?? r.ProviderId ?? 0),
    providerName: (r.providerName ?? r.ProviderName ?? null) as string | null,
    netAmount: Number(r.netAmount ?? r.NetAmount ?? 0),
    vatAmount: Number(r.vatAmount ?? r.VatAmount ?? 0),
    grossAmount: Number(r.grossAmount ?? r.GrossAmount ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: String(r.statutLibelle ?? r.StatutLibelle ?? ""),
  };
}

/** `ids` in the API body are return numbers (`RetourMarchandiseFournisseur.Num`). */
export async function validateRetoursMarchandiseFournisseur(nums: number[]): Promise<void> {
  if (!nums.length) return;
  const res = await salesFetch(`/retour-marchandise-fournisseur/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: nums }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function fetchRetourMarchandiseFournisseurBaseInfos(params: {
  startDate: Date;
  endDate: Date;
  providerId?: number | null;
  tagIds?: number[];
}): Promise<RetourMarchandiseFournisseurBaseInfo[]> {
  const qs = new URLSearchParams();
  qs.set("$top", "500");
  qs.set("$orderby", "Number desc");
  qs.set("startDate", toApiDateTime(params.startDate));
  qs.set("endDate", toApiDateTime(params.endDate));
  if (params.providerId != null) qs.set("providerId", String(params.providerId));
  if (params.tagIds?.length) params.tagIds.forEach((id) => qs.append("tagIds", String(id)));

  const res = await salesFetchJson<ODataEnvelope<unknown>>(`/odata/RetourMarchandiseFournisseurBaseInfos?${qs.toString()}`);
  return (res.value ?? []).map(normalizeRetourMarchandiseFournisseurBaseInfo);
}
