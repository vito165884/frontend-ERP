'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, CheckCircle2, Search } from 'lucide-react';
import { ProviderCombobox } from '@/components/inputs/provider-combobox';
import { TagsMultiSelect } from '@/components/inputs/tags-multi-select';
import { toast } from '@/hooks/use-toast';
import {
  fetchRetourMarchandiseFournisseurBaseInfos,
  validateRetoursMarchandiseFournisseur,
  type RetourMarchandiseFournisseurBaseInfo,
} from '@/lib/api/retour-marchandise-fournisseur';

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

function statusBadgeClass(statut: number): string {
  switch (statut) {
    case 0:
      return 'bg-gray-400/20 text-gray-300';
    case 1:
      return 'bg-emerald-400/20 text-emerald-300';
    case 2:
      return 'bg-amber-400/20 text-amber-300';
    case 3:
      return 'bg-blue-400/20 text-blue-300';
    case 4:
      return 'bg-purple-400/20 text-purple-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function SupplierReturnsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>('CurrentMonth');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>('all');

  const [rows, setRows] = useState<RetourMarchandiseFournisseurBaseInfo[]>([]);
  const [selected, setSelected] = useState<RetourMarchandiseFournisseurBaseInfo[]>([]);

  useEffect(() => {
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setStartDate(s);
    setEndDate(e);
  }, []);

  useEffect(() => {
    const now = new Date();
    if (period === 'CurrentMonth') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
      setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));
    } else if (period === 'CurrentYear') {
      setStartDate(new Date(now.getFullYear(), 0, 1, 0, 0, 0));
      setEndDate(new Date(now.getFullYear(), 11, 31, 23, 59, 59));
    }
  }, [period]);

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchRetourMarchandiseFournisseurBaseInfos({
        startDate,
        endDate,
        providerId,
        tagIds: tagIds.length ? tagIds : undefined,
      });
      setRows(list);
      setSelected([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load supplier returns';
      setError(msg);
      setRows([]);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, providerId, tagIds]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    if (status === 'all') return rows;
    const n = Number(status);
    return rows.filter((r) => r.statut === n);
  }, [rows, status]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.gross += r.grossAmount;
        acc.vat += r.vatAmount;
        acc.net += r.netAmount;
        return acc;
      },
      { gross: 0, vat: 0, net: 0 }
    );
  }, [filteredRows]);

  const columns: Column<RetourMarchandiseFournisseurBaseInfo>[] = useMemo(
    () => [
      {
        key: 'statut',
        label: 'Status',
        sortable: true,
        width: '140px',
        render: (_v, row) => (
          <Badge className={statusBadgeClass(row.statut)}>{row.statutLibelle || `(${row.statut})`}</Badge>
        ),
      },
      {
        key: 'number',
        label: 'Return #',
        sortable: true,
        width: '120px',
        render: (v) => (
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{String(v)}</span>
          </div>
        ),
      },
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        width: '130px',
        render: (v) => {
          const dt = v ? new Date(String(v)) : null;
          return <span className="text-muted-foreground">{dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleDateString() : '—'}</span>;
        },
      },
      { key: 'providerName', label: 'Supplier', sortable: true, render: (v) => v ?? '—' },
      {
        key: 'grossAmount',
        label: 'Total HT',
        sortable: true,
        width: '120px',
        render: (v) => <span>{formatMoney(Number(v))}</span>,
      },
      {
        key: 'vatAmount',
        label: 'TVA',
        sortable: true,
        width: '110px',
        render: (v) => <span className="text-muted-foreground">{formatMoney(Number(v))}</span>,
      },
      {
        key: 'netAmount',
        label: 'Net',
        sortable: true,
        width: '120px',
        render: (v) => <span className="font-medium">{formatMoney(Number(v))}</span>,
      },
      {
        id: 'actions',
        key: 'number',
        label: 'Actions',
        sortable: false,
        width: '110px',
        render: (_v, row) => (
          <Button
            variant="outline"
            size="sm"
            disabled={row.statut !== 0 || loading}
            onClick={async () => {
              try {
                if (!confirm(`Validate supplier return #${row.number}?`)) return;
                await validateRetoursMarchandiseFournisseur([row.number]);
                await load();
                toast({ title: 'Validated' });
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Validate failed';
                toast({ title: 'Validate failed', description: msg, variant: 'destructive' });
              }
            }}
          >
            Validate
          </Button>
        ),
      },
    ],
    [load, loading]
  );

  async function onValidateSelection() {
    const nums = selected.filter((r) => r.statut === 0).map((r) => r.number);
    if (!nums.length) {
      toast({ title: 'Nothing to validate', description: 'Select draft return(s).', variant: 'destructive' });
      return;
    }
    if (!confirm(`Validate ${nums.length} return(s)?`)) return;
    try {
      await validateRetoursMarchandiseFournisseur(nums);
      await load();
      toast({ title: 'Validated', description: `${nums.length} return(s).` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Validate failed';
      setError(msg);
      toast({ title: 'Validate failed', description: msg, variant: 'destructive' });
    }
  }

  const inProgress = useMemo(() => filteredRows.filter((r) => r.statut !== 4).length, [filteredRows]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Supplier returns</h1>
          <p className="text-muted-foreground mt-2">
            Retour marchandise fournisseur — OData list and POST /retour-marchandise-fournisseur/validate.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={onValidateSelection} disabled={loading || !selected.length}>
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current month</SelectItem>
                <SelectItem value="CurrentYear">Current year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <div className="text-sm text-muted-foreground">Supplier</div>
            <ProviderCombobox value={providerId} onChange={(id) => setProviderId(id)} />
          </div>
          <div className="space-y-1 md:col-span-3">
            <div className="text-sm text-muted-foreground">Status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Draft</SelectItem>
                <SelectItem value="1">Validated</SelectItem>
                <SelectItem value="2">In repair</SelectItem>
                <SelectItem value="3">Partial receipt</SelectItem>
                <SelectItem value="4">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <div className="text-sm text-muted-foreground">Tags</div>
            <TagsMultiSelect value={tagIds} onChange={setTagIds} />
          </div>
          <div className="md:col-span-1 flex justify-end">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => void load()} disabled={loading} title="Refresh">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total HT</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totals.gross)}</p>
        </Card>
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total TVA</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totals.vat)}</p>
        </Card>
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Net</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totals.net)}</p>
        </Card>
        <Card className="p-5 border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Rows (filtered)</p>
          <p className="text-2xl font-bold mt-1">{filteredRows.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Not closed: {inProgress}</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        title="Supplier returns"
        description="Goods returns to suppliers (max 500 rows per request)"
        loading={loading}
        selectable
        rowId={(r) => r.number}
        onSelectionChange={setSelected}
      />

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}
