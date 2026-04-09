'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerCombobox } from '@/components/inputs/customer-combobox';
import { Printer, Search, AlertTriangle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { getAccountingYears, type AccountingYearOption } from '@/lib/api/accounting-years';
import { getSoldeClient, type SoldeClientResponse } from '@/lib/api/soldes';

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

function docTypeLabel(t: string): string {
  switch (t) {
    case 'Facture':
      return 'Invoice';
    case 'BonDeLivraison':
      return 'Delivery note';
    case 'Avoir':
      return 'Credit note';
    case 'FactureAvoir':
      return 'Invoice credit';
    default:
      return t || 'Document';
  }
}

export default function CustomerBalancesPage() {
  const [customerId, setCustomerId] = useState<number | null>(null);
  /** `active` = omit param → API uses active fiscal year */
  const [accountingYearId, setAccountingYearId] = useState<string>('active');
  const [years, setYears] = useState<AccountingYearOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SoldeClientResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await getAccountingYears();
        if (!cancelled) setYears(list);
      } catch {
        if (!cancelled) setYears([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (customerId == null) {
      setError('Select a customer.');
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ay = accountingYearId === 'active' ? null : Number(accountingYearId);
      const solde = await getSoldeClient(customerId, Number.isFinite(ay) ? ay : null);
      setData(solde);
    } catch (e: unknown) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Could not load balance');
    } finally {
      setLoading(false);
    }
  }, [customerId, accountingYearId]);

  const solde = data?.solde ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Customer balances</h1>
          <p className="text-muted-foreground">Account statement from GET /soldes/client/{'{id}'}.</p>
        </div>
        {data ? (
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        ) : null}
      </div>

      <Card className="p-6 border-border">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 min-w-[240px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Customer</label>
            <CustomerCombobox value={customerId} onChange={(id) => setCustomerId(id)} placeholder="Choose customer" />
          </div>
          <div className="w-full md:w-[220px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Fiscal year</label>
            <Select value={accountingYearId} onValueChange={setAccountingYearId}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active year (server default)</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>
                    {y.year}
                    {y.isActive ? ' (active)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="gap-2" onClick={() => void load()} disabled={loading || customerId == null}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Load balance
          </Button>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-destructive/40">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : null}

      {data ? (
        <>
          <Card className="p-6 border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{data.clientNom}</h2>
                <p className="text-sm text-muted-foreground">Accounting year id: {data.accountingYearId}</p>
              </div>
              <div
                className={`text-right px-6 py-3 rounded-xl ${
                  solde > 0 ? 'bg-green-500/10' : solde < 0 ? 'bg-red-500/10' : 'bg-muted/30'
                }`}
              >
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Balance</p>
                <p
                  className={`text-3xl font-bold ${
                    solde > 0 ? 'text-green-400' : solde < 0 ? 'text-red-400' : 'text-foreground'
                  }`}
                >
                  {formatMoney(Math.abs(solde))}
                  {solde > 0 && <span className="text-sm ml-2 font-normal">Due</span>}
                  {solde < 0 && <span className="text-sm ml-2 font-normal">Credit</span>}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Invoices</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatMoney(data.totalFactures)}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Uninvoiced BL</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatMoney(data.totalBonsLivraisonNonFactures)}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Credit notes</span>
                </div>
                <p className="text-xl font-bold text-red-400">-{formatMoney(data.totalAvoirs)}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Invoice credits</span>
                </div>
                <p className="text-xl font-bold">{formatMoney(data.totalFacturesAvoir)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {solde > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  <span className="text-xs font-bold text-muted-foreground uppercase">Payments</span>
                </div>
                <p className="text-xl font-bold text-green-400">-{formatMoney(data.totalPaiements)}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Documents</h3>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {data.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents.</p>
                ) : (
                  data.documents.map((doc) => (
                    <div
                      key={`${doc.type}-${doc.id}-${doc.numero}`}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className="shrink-0">
                          {docTypeLabel(doc.type)}
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">#{doc.numero}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.date ? new Date(doc.date).toLocaleDateString() : '—'}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold shrink-0">{formatMoney(Number(doc.montant))}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Payments</h3>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {data.paiements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments.</p>
                ) : (
                  data.paiements.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className="bg-green-500/10 text-green-400 shrink-0">{p.methodePaiement}</Badge>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">#{p.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString() : '—'}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-green-400 shrink-0">{formatMoney(p.montant)}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        !loading && (
          <Card className="p-12 text-center border-border">
            <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Load a customer balance</h3>
            <p className="text-muted-foreground">
              Pick a customer and fiscal year, then use <strong>Load balance</strong>.
            </p>
          </Card>
        )
      )}
    </div>
  );
}
