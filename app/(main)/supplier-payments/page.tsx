'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProviderCombobox } from '@/components/inputs/provider-combobox';
import { CreditCard, Download, FileText, Search, Trash2 } from 'lucide-react';
import {
  deletePaiementFournisseur,
  exportPaiementsFournisseurExcel,
  exportPaiementsFournisseurPdf,
  getPaiementsFournisseur,
  type PaiementFournisseurRow,
} from '@/lib/api/paiement-fournisseur';
import { getAccountingYears, type AccountingYearOption } from '@/lib/api/accounting-years';

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

function downloadBlob(blob: Blob, fallbackFilename: string) {
  const filename = (blob as Blob & { __filename?: string }).__filename || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const columns: Column<PaiementFournisseurRow>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '90px',
    render: (value) => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  {
    key: 'fournisseurNom',
    label: 'Supplier',
    sortable: true,
    render: (v) => (v ? String(v) : '—'),
  },
  {
    key: 'datePaiement',
    label: 'Payment date',
    sortable: true,
    render: (value) => {
      const d = value ? new Date(String(value)) : null;
      return (
        <span className="text-muted-foreground">
          {d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : String(value ?? '—')}
        </span>
      );
    },
  },
  {
    key: 'dateEcheance',
    label: 'Due date',
    sortable: true,
    render: (value) => {
      if (value == null || value === '') return '—';
      const d = new Date(String(value));
      return (
        <span className="text-muted-foreground">
          {Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    key: 'montant',
    label: 'Amount',
    sortable: true,
    render: (value) => <span className="font-semibold text-foreground">{formatMoney(Number(value))}</span>,
  },
  {
    key: 'methodePaiement',
    label: 'Method',
    sortable: true,
    render: (value) => (
      <Badge variant="secondary" className="font-normal">
        {String(value ?? '—')}
      </Badge>
    ),
  },
  {
    key: 'numeroTransactionBancaire',
    label: 'Bank / ref.',
    sortable: false,
    render: (value, row) => (
      <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
        {value ? String(value) : row.numeroChequeTraite ? String(row.numeroChequeTraite) : '—'}
      </code>
    ),
  },
  {
    key: 'accountingYear',
    label: 'Fiscal year',
    sortable: true,
    width: '110px',
    render: (v) => <span>{v != null ? String(v) : '—'}</span>,
  },
];

export default function SupplierPaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PaiementFournisseurRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [fournisseurId, setFournisseurId] = useState<number | null>(null);
  const [accountingYearId, setAccountingYearId] = useState<string>('all');
  const [dateEcheanceFrom, setDateEcheanceFrom] = useState('');
  const [dateEcheanceTo, setDateEcheanceTo] = useState('');
  const [montantMin, setMontantMin] = useState('');
  const [montantMax, setMontantMax] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [years, setYears] = useState<AccountingYearOption[]>([]);

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
    setLoading(true);
    setError(null);
    try {
      const mMin = montantMin.trim() === '' ? null : Number(montantMin);
      const mMax = montantMax.trim() === '' ? null : Number(montantMax);
      const resp = await getPaiementsFournisseur({
        pageNumber: 1,
        pageSize: 50,
        fournisseurId,
        accountingYearIds:
          accountingYearId !== 'all' ? [Number(accountingYearId)].filter((n) => Number.isFinite(n)) : null,
        dateEcheanceFrom: dateEcheanceFrom || null,
        dateEcheanceTo: dateEcheanceTo || null,
        montantMin: mMin != null && Number.isFinite(mMin) ? mMin : null,
        montantMax: mMax != null && Number.isFinite(mMax) ? mMax : null,
      });
      setRows(resp.items);
      setTotalCount(resp.totalCount);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load payments');
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [fournisseurId, accountingYearId, dateEcheanceFrom, dateEcheanceTo, montantMin, montantMax]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const t = tableSearch.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) =>
        String(r.id).includes(t) ||
        (r.fournisseurNom ?? '').toLowerCase().includes(t) ||
        (r.numeroTransactionBancaire ?? '').toLowerCase().includes(t) ||
        (r.methodePaiement ?? '').toLowerCase().includes(t)
    );
  }, [rows, tableSearch]);

  const totalAmount = useMemo(() => rows.reduce((s, r) => s + Number(r.montant ?? 0), 0), [rows]);
  const avgAmount = rows.length ? totalAmount / rows.length : 0;

  const exportParams = useMemo(() => {
    const mMin = montantMin.trim() === '' ? null : Number(montantMin);
    const mMax = montantMax.trim() === '' ? null : Number(montantMax);
    return {
      fournisseurId,
      accountingYearIds:
        accountingYearId !== 'all' ? [Number(accountingYearId)].filter((n) => Number.isFinite(n)) : null,
      dateEcheanceFrom: dateEcheanceFrom || null,
      dateEcheanceTo: dateEcheanceTo || null,
      montantMin: mMin != null && Number.isFinite(mMin) ? mMin : null,
      montantMax: mMax != null && Number.isFinite(mMax) ? mMax : null,
    };
  }, [fournisseurId, accountingYearId, dateEcheanceFrom, dateEcheanceTo, montantMin, montantMax]);

  const tableColumns = useMemo(() => {
    const actionCol: Column<PaiementFournisseurRow> = {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      sortable: false,
      width: '100px',
      render: (_v, row) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-destructive border-destructive/40 hover:bg-destructive/10"
          onClick={async () => {
            if (!window.confirm(`Delete supplier payment #${row.id}?`)) return;
            try {
              await deletePaiementFournisseur(row.id);
              await load();
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Delete failed');
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      ),
    };
    return [...columns, actionCol];
  }, [load]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Supplier payments</h1>
          <p className="text-muted-foreground">GET /paiement-fournisseur — filters, exports, delete.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            disabled={loading}
            onClick={async () => {
              try {
                const blob = await exportPaiementsFournisseurExcel(exportParams);
                downloadBlob(blob, 'PaiementsFournisseur.xlsx');
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Export failed');
              }
            }}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={loading}
            onClick={async () => {
              try {
                const blob = await exportPaiementsFournisseurPdf(exportParams);
                downloadBlob(blob, 'PaiementsFournisseur.pdf');
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Export failed');
              }
            }}
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[220px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Supplier</label>
            <ProviderCombobox value={fournisseurId} onChange={(id) => setFournisseurId(id)} placeholder="All suppliers" />
          </div>
          <div className="w-[180px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Accounting year</label>
            <Select value={accountingYearId} onValueChange={setAccountingYearId}>
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>
                    {y.year}
                    {y.isActive ? ' (active)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[160px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Due from</label>
            <Input type="date" className="bg-secondary/30" value={dateEcheanceFrom} onChange={(e) => setDateEcheanceFrom(e.target.value)} />
          </div>
          <div className="w-[160px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Due to</label>
            <Input type="date" className="bg-secondary/30" value={dateEcheanceTo} onChange={(e) => setDateEcheanceTo(e.target.value)} />
          </div>
          <div className="w-[120px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Amount min</label>
            <Input
              className="bg-secondary/30"
              inputMode="decimal"
              placeholder="Min"
              value={montantMin}
              onChange={(e) => setMontantMin(e.target.value)}
            />
          </div>
          <div className="w-[120px] space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Amount max</label>
            <Input
              className="bg-secondary/30"
              inputMode="decimal"
              placeholder="Max"
              value={montantMax}
              onChange={(e) => setMontantMax(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => void load()} disabled={loading} title="Apply filters">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Loaded</p>
          <p className="text-4xl font-bold text-foreground mt-3">{rows.length}</p>
          <p className="text-sm text-muted-foreground mt-2">of {totalCount} matching (page size 50)</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total amount</p>
          <p className="text-4xl font-bold text-green-400 mt-3">{formatMoney(totalAmount)}</p>
          <p className="text-sm text-muted-foreground mt-2">Current page</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Average</p>
          <p className="text-4xl font-bold text-foreground mt-3">{rows.length ? formatMoney(avgAmount) : '—'}</p>
          <p className="text-sm text-muted-foreground mt-2">Per row (page)</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</p>
          <p className="text-4xl font-bold text-foreground mt-3">{loading ? '…' : 'OK'}</p>
          <p className="text-sm text-muted-foreground mt-2">{error ? 'Error' : 'API'}</p>
        </Card>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <DataTable
        columns={tableColumns}
        data={filteredRows}
        title="Payment list"
        description="Supplier payment receipts"
        searchPlaceholder="Search id, supplier, reference, method..."
        onSearchChange={(v) => setTableSearch(v)}
        loading={loading}
      />
    </div>
  );
}
