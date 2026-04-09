import { salesFetchJson } from "@/lib/http";

export type AccountingYearOption = {
  id: number;
  year: number;
  isActive: boolean;
};

export async function getAccountingYears(): Promise<AccountingYearOption[]> {
  const raw = await salesFetchJson<unknown[]>(`/accountingYear`);
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      id: Number(o.id ?? o.Id ?? 0),
      year: Number(o.year ?? o.Year ?? 0),
      isActive: Boolean(o.isActive ?? o.IsActive ?? false),
    };
  });
}
