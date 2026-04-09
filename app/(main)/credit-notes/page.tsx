'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/ui/data-table';
import { CustomerCombobox } from '@/components/inputs/customer-combobox';
import { validateCreditNotes, getCreditNotesWithSummaries, type CreditNoteBaseInfo } from '@/lib/api/credit-notes';
import { cn } from '@/lib/utils';
import { CheckCircle2, Pencil, Plus, Printer, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreditNotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>('CurrentYear');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [rows, setRows] = useState<CreditNoteBaseInfo[]>([]);
  const [totals, setTotals] = useState<{ totalNetAmount: number; totalVatAmount: number; totalIncludingTaxAmount: number } | null>(
    null
  );
  const [selected, setSelected] = useState<CreditNoteBaseInfo[]>([]);

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

  async function load() {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getCreditNotesWithSummaries({
        pageNumber: 1,
        pageSize: 100,
        clientId,
        sortOrder: 'desc',
        sortProperty: 'Num',
        searchKeyword: searchKeyword.trim() ? searchKeyword.trim() : null,
        startDate,
        endDate,
        status: status === 'all' ? null : Number(status),
      });
      setRows(resp.avoirs?.items ?? []);
      setTotals({
        totalNetAmount: Number(resp.totalNetAmount ?? 0),
        totalVatAmount: Number(resp.totalVatAmount ?? 0),
        totalIncludingTaxAmount: Number(resp.totalIncludingTaxAmount ?? 0),
      });
      setSelected([]);
    } catch (e: any) {
      setRows([]);
      setTotals(null);
      setSelected([]);
      setError(e?.message || 'Failed to load credit notes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!startDate || !endDate) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate?.toISOString(), endDate?.toISOString()]);

  const columns = useMemo(() => {
    const cols: Column<CreditNoteBaseInfo>[] = [
      {
        key: 'statut',
        label: 'Status',
        sortable: true,
        width: '120px',
        render: (_v, row) => (
          <Badge className={row.statut === 1 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-gray-400/20 text-gray-300'}>
            {row.statut === 1 ? 'Validated' : 'Draft'}
          </Badge>
        ),
      },
      { key: 'num', label: 'Number', sortable: true, width: '140px', render: (v) => <span className="text-foreground font-medium">{String(v)}</span> },
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        width: '160px',
        render: (v) => {
          const dt = v ? new Date(String(v)) : null;
          return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : '-'}</span>;
        },
      },
      { key: 'clientName', label: 'Client', sortable: true, width: '240px', render: (v) => <span className="text-foreground">{v ?? '-'}</span> },
      {
        key: 'totalExcludingTaxAmount',
        label: 'Total Net',
        sortable: true,
        width: '140px',
        render: (v) => <span className="text-muted-foreground">{Number(v).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>,
      },
      {
        key: 'totalVATAmount',
        label: 'Total VAT',
        sortable: true,
        width: '140px',
        render: (v) => <span className="text-muted-foreground">{Number(v).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>,
      },
      {
        key: 'totalIncludingTaxAmount',
        label: 'Total TTC',
        sortable: true,
        width: '140px',
        render: (v) => <span className="text-muted-foreground">{Number(v).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>,
      },
      {
        id: 'actions',
        key: 'num',
        label: 'Actions',
        sortable: false,
        width: '140px',
        render: (_v, row) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              title="Print"
              onClick={() => {
                // Razor prints via print engine; we will implement API-backed printing when endpoint is confirmed.
                alert('Print credit note: not implemented yet');
              }}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Edit"
              disabled={row.statut === 1}
              onClick={() => router.push(`/AddOrUpdateAvoir/${row.num}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Validate"
              disabled={row.statut === 1}
              onClick={async () => {
                await validateCreditNotes([row.num]);
                await load();
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];
    return cols;
  }, [router, startDate, endDate, clientId, status, searchKeyword]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Credit notes</h1>
          <p className="text-muted-foreground">Customer credit notes (avoirs).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => router.push('/manage-credit-notes')}>
            Manage
          </Button>
          <Button className="gap-2" onClick={() => router.push('/AddOrUpdateAvoir')}>
            <Plus className="h-4 w-4" />
            Add credit note
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Current Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current Month</SelectItem>
                <SelectItem value="CurrentYear">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm text-muted-foreground">Client</div>
            <CustomerCombobox value={clientId} onChange={(id) => setClientId(id)} placeholder="Select a customer" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Draft</SelectItem>
                <SelectItem value="1">Validated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-1">
            <div className="text-sm text-muted-foreground">Search</div>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={cn(
                'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              )}
              placeholder="Search..."
            />
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={load} disabled={loading} title="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={async () => {
                await validateCreditNotes(selected.map((s) => s.num));
                await load();
              }}
              disabled={loading || selected.length === 0}
              title="Validate selection"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={rows}
            title="Credit notes"
            description="Avoirs list"
            searchPlaceholder="Search..."
            onSearchChange={() => {}}
            loading={loading}
            selectable
            rowId={(r) => r.num}
            onSelectionChange={(items) => setSelected(items)}
          />
        </div>
        <Card className="p-6 border-border h-fit">
          <div className="text-sm font-semibold text-foreground mb-3">Totals</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total Net</span>
              <span className="text-foreground font-semibold">
                {Number(totals?.totalNetAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total VAT</span>
              <span className="text-foreground font-semibold">
                {Number(totals?.totalVatAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total TTC</span>
              <span className="text-foreground font-semibold">
                {Number(totals?.totalIncludingTaxAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
