'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/ui/data-table';
import { getFournisseursAvecProblemesSolde, type FournisseurSoldeProblemeRow } from '@/lib/api/soldes';
import { getAccountingYears, type AccountingYearOption } from '@/lib/api/accounting-years';
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

const columns: Column<FournisseurSoldeProblemeRow>[] = [
  {
    key: 'fournisseurNom',
    label: 'Supplier',
    sortable: true,
    render: (v, row) => (
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        <span className="font-medium truncate">{String(v ?? '')}</span>
        <span className="text-xs text-muted-foreground shrink-0">#{row.fournisseurId}</span>
      </div>
    ),
  },
  {
    key: 'solde',
    label: 'Balance',
    sortable: true,
    render: (v) => {
      const n = Number(v);
      return (
        <span className={n !== 0 ? 'text-amber-400 font-semibold' : 'text-foreground font-semibold'}>{formatMoney(n)}</span>
      );
    },
  },
  {
    key: 'totalFactures',
    label: 'Invoices total',
    sortable: true,
    render: (v) => formatMoney(Number(v ?? 0)),
  },
  {
    key: 'totalPaiements',
    label: 'Payments total',
    sortable: true,
    render: (v) => formatMoney(Number(v ?? 0)),
  },
  {
    key: 'totalFacturesAvoir',
    label: 'Invoice credits',
    sortable: true,
    render: (v) => formatMoney(Number(v ?? 0)),
  },
  {
    key: 'totalAvoirsFinanciers',
    label: 'Financial credits',
    sortable: true,
    render: (v) => formatMoney(Number(v ?? 0)),
  },
  {
    key: 'dateDernierDocument',
    label: 'Last document',
    sortable: true,
    render: (v) => {
      if (v == null || v === '') return '—';
      const d = new Date(String(v));
      return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
    },
  },
];

export default function SupplierBalanceIssuesPage() {
  const [years, setYears] = useState<AccountingYearOption[]>([]);
  const [accountingYearId, setAccountingYearId] = useState<string>('active');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<FournisseurSoldeProblemeRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  const yearParam = useMemo(() => {
    if (accountingYearId === 'active') return null;
    const n = Number(accountingYearId);
    return Number.isFinite(n) ? n : null;
  }, [accountingYearId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFournisseursAvecProblemesSolde({
        pageNumber: page,
        pageSize,
        accountingYearId: yearParam,
      });
      setRows(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(Math.max(1, res.totalPages));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, yearParam]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [accountingYearId]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Suppliers with balance issues</h1>
          <p className="text-muted-foreground max-w-2xl">
            Non-zero supplier balances — GET /soldes/fournisseurs-avec-problemes (paged).
          </p>
        </div>
      </div>

      <Card className="p-4 border-border flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="space-y-1 w-full sm:w-[280px]">
          <label className="text-xs font-medium text-muted-foreground">Fiscal year</label>
          <Select value={accountingYearId} onValueChange={setAccountingYearId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active year (default filter)</SelectItem>
              {years.map((y) => (
                <SelectItem key={y.id} value={String(y.id)}>
                  {y.year}
                  {y.isActive ? ' (active)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground pb-1">
          Total matching: <span className="text-foreground font-medium">{totalCount}</span>
        </p>
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

      <DataTable
        columns={columns}
        data={rows}
        title="Suppliers with balance issues"
        description="Paged list from the Sales API"
        loading={loading}
      />

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
