"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TiersDepenseCombobox } from "@/components/inputs/tiers-depense-combobox";
import { getAccountingYears } from "@/lib/api/accounting-years";
import { getSoldeTiersDepense } from "@/lib/api/soldes";
import { RefreshCw } from "lucide-react";

export default function ExpenseBalancesPage() {
  const [tiersId, setTiersId] = useState<number | null>(null);
  const [accountingYearId, setAccountingYearId] = useState<number | null>(null);
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof getSoldeTiersDepense>> | null>(null);

  useEffect(() => {
    void (async () => {
      const ys = await getAccountingYears();
      setYears(ys.map((y) => ({ id: y.id, year: y.year })));
    })();
  }, []);

  async function load() {
    if (!tiersId) return;
    setLoading(true);
    try {
      const r = await getSoldeTiersDepense(tiersId, accountingYearId);
      setData(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Expense Balances</h1>
        <p className="text-muted-foreground text-base">Account statement / balance per expense vendor.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Vendor</label>
            <TiersDepenseCombobox value={tiersId} onChange={(id) => setTiersId(id)} />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Accounting year</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={accountingYearId ?? ""}
              onChange={(e) => setAccountingYearId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Active / default</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void load()} disabled={!tiersId || loading} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Load
            </Button>
          </div>
        </div>
      </Card>

      {!tiersId ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Select an expense vendor to view balance.</p>
        </Card>
      ) : data ? (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-2xl font-bold">{data.tiersDepenseFonctionnementNom}</div>
                <div className="text-sm text-muted-foreground">Year ID: {data.accountingYearId}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Balance</div>
                <div className="text-3xl font-bold">{data.solde.toLocaleString()}</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total invoices</div>
              <div className="text-2xl font-bold">{data.totalFacturesDepense.toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total payments</div>
              <div className="text-2xl font-bold">{data.totalPaiements.toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Documents</div>
              <div className="text-2xl font-bold">{data.documents.length}</div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="text-sm font-semibold mb-3">Documents</div>
            <div className="space-y-2">
              {data.documents.length ? (
                data.documents.map((d) => (
                  <div key={`${d.type}-${d.id}`} className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {d.type} #{d.numero} • {d.date}
                    </div>
                    <div className="font-medium">{Number(d.montant ?? 0).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No documents.</div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold mb-3">Payments</div>
            <div className="space-y-2">
              {data.paiements.length ? (
                data.paiements.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {p.datePaiement} • {p.methodePaiement} • {p.numeroTransactionBancaire || "-"}
                    </div>
                    <div className="font-medium">{Number(p.montant ?? 0).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No payments.</div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{loading ? "Loading…" : "Click Load to fetch balance."}</p>
        </Card>
      )}
    </div>
  );
}
