'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerCombobox } from '@/components/inputs/customer-combobox';
import { TagsMultiSelect } from '@/components/inputs/tags-multi-select';
import { ClipboardList, CheckCircle2, FileText, Search, CalendarDays, Copy, Pencil } from 'lucide-react';
import { salesFetchJson } from '@/lib/http';
import { duplicateQuotation, validateQuotations } from '@/lib/api/quotations';

type QuotationBaseInfo = {
  number: number;
  date: string;
  customerId: number;
  customerName?: string | null;
  totalTtc: number;
  statut: number;
  statutLibelle: string;
};

type ODataEnvelope<T> = {
  value: T[];
  ['@odata.count']?: number;
};

function toApiDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function normalizeQuotationBaseInfo(i: unknown): QuotationBaseInfo {
  const r = i as Record<string, unknown>;
  return {
    number: Number(r.number ?? r.Number ?? 0),
    date: String(r.date ?? r.Date ?? ''),
    customerId: Number(r.customerId ?? r.CustomerId ?? 0),
    customerName: (r.customerName ?? r.CustomerName ?? null) as string | null,
    totalTtc: Number(r.totalTtc ?? r.TotalTtc ?? 0),
    statut: Number(r.statut ?? r.Statut ?? 0),
    statutLibelle: String(r.statutLibelle ?? r.StatutLibelle ?? ''),
  };
}

const baseColumns: Column<QuotationBaseInfo>[] = [
  {
    key: 'number',
    label: 'Quotation #',
    sortable: true,
    width: '140px',
    render: (value) => (
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  {
    key: 'customerName',
    label: 'Customer',
    sortable: true,
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: (value) => (
      <span className="text-muted-foreground">
        {new Date(String(value)).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: 'totalTtc',
    label: 'Total TTC',
    sortable: true,
    render: (value) => (
      <span className="font-semibold text-foreground">
        {Number(value).toFixed(3)}
      </span>
    ),
  },
  {
    key: 'statut',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const colors = {
        0: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
        1: 'bg-green-500/10 text-green-600 dark:text-green-400',
      };
      const v = Number(value);
      return (
        <Badge className={colors[v as 0 | 1] ?? 'bg-muted text-foreground'}>
          {v === 1 ? 'validated' : 'draft'}
        </Badge>
      );
    },
  },
];

export default function QuotationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>('CurrentYear');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>('all');

  const [quotations, setQuotations] = useState<QuotationBaseInfo[]>([]);
  const [selected, setSelected] = useState<QuotationBaseInfo[]>([]);
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    const now = new Date();
    setStartDate(new Date(now.getFullYear(), 0, 1, 0, 0, 0));
    setEndDate(new Date(now.getFullYear(), 11, 31, 23, 59, 59));
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

  const loadRange = useCallback(
    async (sd: Date, ed: Date) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        qs.set('$top', '500');
        qs.set('$orderby', 'Number desc');
        qs.set('startDate', toApiDateTime(sd));
        qs.set('endDate', toApiDateTime(ed));
        if (customerId) qs.set('customerId', String(customerId));
        if (tagIds.length) tagIds.forEach((id) => qs.append('tagIds', String(id)));

        const res = await salesFetchJson<ODataEnvelope<QuotationBaseInfo>>(`/odata/QuotationBaseInfos?${qs.toString()}`);
        const items = (res.value ?? []).map(normalizeQuotationBaseInfo);
        setQuotations(items);
        setSelected([]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load quotations';
        setError(msg);
        setQuotations([]);
        setSelected([]);
      } finally {
        setLoading(false);
      }
    },
    [customerId, tagIds]
  );

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    await loadRange(startDate, endDate);
  }, [startDate, endDate, loadRange]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    void loadRange(startDate, endDate);
  }, [startDate, endDate, loadRange]);

  const filteredRows = useMemo(() => {
    let rows =
      status === 'all' ? quotations : quotations.filter((q) => (status === 'validated' ? q.statut === 1 : q.statut !== 1));

    const t = tableSearch.trim().toLowerCase();
    if (t) {
      rows = rows.filter(
        (q) =>
          String(q.number).includes(t) ||
          (q.customerName ?? '').toLowerCase().includes(t)
      );
    }
    return rows;
  }, [quotations, status, tableSearch]);

  const totalValue = useMemo(() => quotations.reduce((sum, q) => sum + q.totalTtc, 0), [quotations]);
  const validatedCount = useMemo(() => quotations.filter((q) => q.statut === 1).length, [quotations]);
  const draftCount = useMemo(() => quotations.filter((q) => q.statut !== 1).length, [quotations]);

  const tableColumns: Column<QuotationBaseInfo>[] = useMemo(() => {
    const cols: Column<QuotationBaseInfo>[] = [
      ...baseColumns,
      {
        id: 'actions',
        key: 'number',
        label: 'Actions',
        sortable: false,
        width: '200px',
        render: (_v, row) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => router.push(`/AddOrUpdateQuotation/${row.number}`)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            {row.statut !== 1 ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={async () => {
                  if (!window.confirm(`Validate quotation #${row.number}?`)) return;
                  try {
                    await validateQuotations([row.number]);
                    await load();
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : 'Validation failed');
                  }
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Validate
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={async () => {
                try {
                  const created = await duplicateQuotation(row.number);
                  router.push(`/AddOrUpdateQuotation/${created}`);
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : 'Duplicate failed');
                }
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Duplicate
            </Button>
          </div>
        ),
      },
    ];
    return cols;
  }, [router, load]);

  return (
    <div className="page-content bg-black">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="page-header border-l-4 border-l-blue-500 pl-5">
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Customer quotations (OData list), validate and duplicate.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={loading}
            onClick={async () => {
              const draftIds = selected.filter((s) => s.statut !== 1).map((s) => s.number);
              if (draftIds.length === 0) {
                setError('Select at least one draft quotation to validate.');
                return;
              }
              if (!window.confirm(`Validate ${draftIds.length} quotation(s)?`)) return;
              setError(null);
              try {
                await validateQuotations(draftIds);
                await load();
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Validation failed');
              }
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Validate selected
          </Button>
          <Button className="gap-2" onClick={() => router.push('/AddOrUpdateQuotation')}>
            <FileText className="h-4 w-4" />
            New quotation
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Current year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current month</SelectItem>
                <SelectItem value="CurrentYear">Current year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Customer</div>
            <CustomerCombobox value={customerId} onChange={(id) => setCustomerId(id)} placeholder="All customers" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Tags</div>
            <TagsMultiSelect value={tagIds} onChange={(ids) => setTagIds(ids)} />
          </div>
          <div className="flex gap-2 md:justify-end md:col-span-6">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={async () => {
                const today = new Date();
                const s = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                const e = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                setStartDate(s);
                setEndDate(e);
                await loadRange(s, e);
              }}
              disabled={loading}
              title="Today"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => void load()} disabled={loading} title="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total quotations</p>
          <p className="text-3xl font-bold text-foreground mt-2">{quotations.length}</p>
          <p className="text-xs text-muted-foreground mt-2">{totalValue.toFixed(3)} TTC (loaded range)</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Validated</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{validatedCount}</p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Draft</p>
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">{draftCount}</p>
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
        title="Quotation list"
        description="Filter by period and tags, then search within the grid."
        searchPlaceholder="Search by # or customer..."
        onSearchChange={(v) => setTableSearch(v)}
        onAddClick={() => router.push('/AddOrUpdateQuotation')}
        loading={loading}
        selectable
        rowId={(r) => r.number}
        onSelectionChange={(items) => setSelected(items)}
      />
    </div>
  );
}
