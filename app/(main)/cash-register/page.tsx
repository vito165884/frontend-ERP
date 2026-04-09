'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Printer,
  Banknote,
  CreditCard,
  Building,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
} from 'lucide-react';
import { getPaiementsClient, type PaiementClientRow } from '@/lib/api/paiement-client';
import { getDeliveryNotesWithSummaries, type DeliveryNoteBaseInfo } from '@/lib/api/delivery-notes';
import { getCreditNotesWithSummaries, type CreditNoteBaseInfo } from '@/lib/api/credit-notes';

const METHOD = {
  Espece: 'Espece',
  Cheque: 'Cheque',
  Traite: 'Traite',
  Virement: 'Virement',
  Tpe: 'Tpe',
} as const;

function localDayBounds(ymd: string): { start: Date; end: Date } {
  const [y, m, d] = ymd.split('-').map((x) => Number(x));
  if (!y || !m || !d) {
    const t = new Date();
    return {
      start: new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0),
      end: new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59),
    };
  }
  return {
    start: new Date(y, m - 1, d, 0, 0, 0),
    end: new Date(y, m - 1, d, 23, 59, 59),
  };
}

function ymdLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function sumByMethod(rows: PaiementClientRow[], method: string): number {
  return rows
    .filter((p) => String(p.methodePaiement ?? '').toLowerCase() === method.toLowerCase())
    .reduce((s, p) => s + Number(p.montant ?? 0), 0);
}

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

const PAGE = 50;

async function fetchPaiementsDay(ymd: string): Promise<PaiementClientRow[]> {
  const { start, end } = localDayBounds(ymd);
  const all: PaiementClientRow[] = [];
  let page = 1;
  while (true) {
    const res = await getPaiementsClient({
      pageNumber: page,
      pageSize: PAGE,
      datePaiementFrom: start.toISOString(),
      datePaiementTo: end.toISOString(),
    });
    all.push(...res.items);
    if (res.items.length < PAGE) break;
    if (all.length >= res.totalCount) break;
    page += 1;
    if (page > 500) break;
  }
  return all;
}

async function fetchDeliveryNotesDay(ymd: string): Promise<{ rows: DeliveryNoteBaseInfo[]; totalNet: number }> {
  const { start, end } = localDayBounds(ymd);
  const startStr = ymdLocal(start);
  const endStr = ymdLocal(end);
  const rows: DeliveryNoteBaseInfo[] = [];
  let page = 1;
  let totalNet = 0;
  while (true) {
    const res = await getDeliveryNotesWithSummaries({
      pageNumber: page,
      pageSize: PAGE,
      sortOrder: 'asc',
      sortProperty: 'Number',
      startDate: startStr,
      endDate: endStr,
      customerId: null,
      invoiceId: null,
      isInvoiced: null,
      status: null,
      technicianId: null,
      tagIds: null,
    });
    if (page === 1) totalNet = Number(res.totalNetAmount ?? 0);
    const chunk = res.getDeliveryNoteBaseInfos?.items ?? [];
    rows.push(...chunk);
    const total = res.getDeliveryNoteBaseInfos?.totalCount ?? rows.length;
    if (chunk.length < PAGE || rows.length >= total) break;
    page += 1;
    if (page > 500) break;
  }
  return { rows, totalNet };
}

async function fetchAvoirsDay(ymd: string): Promise<{ rows: CreditNoteBaseInfo[]; totalTtc: number }> {
  const { start, end } = localDayBounds(ymd);
  const rows: CreditNoteBaseInfo[] = [];
  let page = 1;
  let totalTtc = 0;
  while (true) {
    const res = await getCreditNotesWithSummaries({
      pageNumber: page,
      pageSize: PAGE,
      startDate: start,
      endDate: end,
      clientId: null,
      status: null,
    });
    if (page === 1) totalTtc = Number(res.totalIncludingTaxAmount ?? 0);
    const chunk = res.avoirs?.items ?? [];
    rows.push(...chunk);
    const total = res.avoirs?.totalCount ?? rows.length;
    if (chunk.length < PAGE || rows.length >= total) break;
    page += 1;
    if (page > 500) break;
  }
  return { rows, totalTtc };
}

export default function CashRegisterClosePage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => ymdLocal(new Date()));
  const [showBlDetail, setShowBlDetail] = useState(false);
  const [showAvoirDetail, setShowAvoirDetail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paiements, setPaiements] = useState<PaiementClientRow[]>([]);
  const [blList, setBlList] = useState<DeliveryNoteBaseInfo[]>([]);
  const [avoirsList, setAvoirsList] = useState<CreditNoteBaseInfo[]>([]);
  const [totalBl, setTotalBl] = useState(0);
  const [totalAvoirs, setTotalAvoirs] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pay, bl, av] = await Promise.all([
        fetchPaiementsDay(selectedDate),
        fetchDeliveryNotesDay(selectedDate),
        fetchAvoirsDay(selectedDate),
      ]);
      setPaiements(pay);
      setBlList(bl.rows);
      setTotalBl(bl.totalNet);
      setAvoirsList(av.rows);
      setTotalAvoirs(av.totalTtc);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load cash register data');
      setPaiements([]);
      setBlList([]);
      setAvoirsList([]);
      setTotalBl(0);
      setTotalAvoirs(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const sommeEspece = useMemo(() => sumByMethod(paiements, METHOD.Espece), [paiements]);
  const sommeCheque = useMemo(() => sumByMethod(paiements, METHOD.Cheque), [paiements]);
  const sommeTraite = useMemo(() => sumByMethod(paiements, METHOD.Traite), [paiements]);
  const sommeVirement = useMemo(() => sumByMethod(paiements, METHOD.Virement), [paiements]);
  const sommeTpe = useMemo(() => sumByMethod(paiements, METHOD.Tpe), [paiements]);
  const totalPaiements = useMemo(() => paiements.reduce((s, p) => s + Number(p.montant ?? 0), 0), [paiements]);
  const resultatCloture = totalBl - totalAvoirs;

  const methodCards = [
    { key: 'cash', label: 'Cash (Espèce)', icon: <Banknote className="h-5 w-5" />, amount: sommeEspece, color: 'text-green-400' },
    { key: 'chk', label: 'Check', icon: <CreditCard className="h-5 w-5" />, amount: sommeCheque, color: 'text-blue-400' },
    { key: 'tr', label: 'Traite', icon: <CreditCard className="h-5 w-5" />, amount: sommeTraite, color: 'text-cyan-400' },
    { key: 'vir', label: 'Transfer', icon: <Building className="h-5 w-5" />, amount: sommeVirement, color: 'text-purple-400' },
    { key: 'tpe', label: 'Card (TPE)', icon: <Smartphone className="h-5 w-5" />, amount: sommeTpe, color: 'text-orange-400' },
  ];

  return (
    <div id="cash-register-print-root" className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Cash register close</h1>
          <p className="text-muted-foreground">
            Daily recap: customer payments, delivery notes, and credit notes (same data as Razor cloture caisse).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={loading}
            onClick={() => {
              window.print();
            }}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-secondary/30 w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
          <Badge variant="secondary" className="font-normal">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total payments</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{formatMoney(totalPaiements)}</p>
          <p className="text-sm text-muted-foreground mt-2">{paiements.length} lines</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Delivery notes (net)</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{formatMoney(totalBl)}</p>
          <p className="text-sm text-muted-foreground mt-2">{blList.length} lines</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Closure result</p>
          <p className="text-3xl font-bold text-foreground mt-2">{formatMoney(resultatCloture)}</p>
          <p className="text-sm text-muted-foreground mt-2">BL net − credit notes total (Razor formula)</p>
        </Card>
      </div>

      <Card className="p-6 border-border">
        <h2 className="text-lg font-bold text-foreground mb-4">Payments by method</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {methodCards.map((m) => (
            <div key={m.key} className="p-4 rounded-lg border border-border bg-secondary/20">
              <div className={`flex items-center gap-2 mb-2 ${m.color}`}>{m.icon}</div>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{formatMoney(m.amount)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-between">
          <span className="font-semibold text-foreground">Total payments</span>
          <span className="text-xl font-bold text-green-400">{formatMoney(totalPaiements)}</span>
        </div>
      </Card>

      <Card className="p-6 border-border">
        <h2 className="text-lg font-bold text-foreground mb-3">Customer payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paiements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-muted-foreground">
                    No payments for this date.
                  </td>
                </tr>
              ) : (
                paiements.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2 pr-4">{p.clientNom ?? '—'}</td>
                    <td className="py-2 pr-4">
                      {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2 pr-4">{p.methodePaiement}</td>
                    <td className="py-2 text-right font-medium">{formatMoney(Number(p.montant))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 border-border">
        <div className="flex flex-wrap justify-between gap-2 items-center">
          <div>
            <h2 className="text-lg font-bold text-foreground">Delivery notes</h2>
            <p className="text-sm text-muted-foreground">Total net: {formatMoney(totalBl)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowBlDetail((v) => !v)}>
            {showBlDetail ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showBlDetail ? 'Hide detail' : 'Show detail'}
          </Button>
        </div>
        {showBlDetail ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {blList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted-foreground">
                      No delivery notes for this date.
                    </td>
                  </tr>
                ) : (
                  blList.map((bl) => (
                    <tr key={bl.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{bl.number}</td>
                      <td className="py-2 pr-4">{bl.date ? new Date(String(bl.date)).toLocaleDateString() : '—'}</td>
                      <td className="py-2 pr-4">{bl.customerName ?? '—'}</td>
                      <td className="py-2 text-right">{formatMoney(Number(bl.netAmount))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 border-border">
        <div className="flex flex-wrap justify-between gap-2 items-center">
          <div>
            <h2 className="text-lg font-bold text-foreground">Credit notes (avoirs)</h2>
            <p className="text-sm text-muted-foreground">Total TTC: {formatMoney(totalAvoirs)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowAvoirDetail((v) => !v)}>
            {showAvoirDetail ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showAvoirDetail ? 'Hide detail' : 'Show detail'}
          </Button>
        </div>
        {showAvoirDetail ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 text-right">TTC</th>
                </tr>
              </thead>
              <tbody>
                {avoirsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted-foreground">
                      No credit notes for this date.
                    </td>
                  </tr>
                ) : (
                  avoirsList.map((a) => (
                    <tr key={a.num} className="border-b border-border/50">
                      <td className="py-2 pr-4">{a.num}</td>
                      <td className="py-2 pr-4">{a.date ? new Date(String(a.date)).toLocaleDateString() : '—'}</td>
                      <td className="py-2 pr-4">{a.clientName ?? '—'}</td>
                      <td className="py-2 text-right">{formatMoney(Number(a.totalIncludingTaxAmount))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 border-dashed border-border bg-muted/20">
        <div className="flex gap-3 items-start">
          <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">PDF export</p>
            <p>
              The Blazor app generates the official PDF via the web server print service. This page uses live API data;
              use <strong>Print</strong> for a printable view, or add a Sales API endpoint later to mirror the Razor PDF.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
