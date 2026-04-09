'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerCombobox } from '@/components/inputs/customer-combobox';
import { TechnicianCombobox } from '@/components/inputs/technician-combobox';
import { TagsMultiSelect } from '@/components/inputs/tags-multi-select';
import { cn } from '@/lib/utils';
import {
  FileDown,
  Search,
  Table2,
  CheckCircle2,
  CalendarDays,
  Eye,
  Pencil,
  Printer,
  Truck,
} from 'lucide-react';
import {
  exportDeliveryNotesExcel,
  exportDeliveryNotesPdf,
  getDeliveryNotesWithSummaries,
  validateDeliveryNotes,
  type DeliveryNoteBaseInfo,
} from '@/lib/api/delivery-notes';

const columns: Column<DeliveryNoteBaseInfo>[] = [
  {
    key: 'number',
    label: 'Delivery Note',
    sortable: true,
    width: '130px',
    render: (value) => (
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-muted-foreground" />
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
    render: (value) => {
      const d = new Date(String(value));
      return (
        <span className="text-foreground">
          {Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    key: 'netAmount',
    label: 'Total Net',
    sortable: true,
    render: (value) => (
      <span className="font-medium text-foreground">
        {Number(value).toFixed(3)}
      </span>
    ),
  },
  {
    key: 'numFacture',
    label: 'Invoice #',
    sortable: false,
    render: (value) => (
      <span className="text-foreground">{value ?? '-'}</span>
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

export default function DeliveryNotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>('CurrentYear');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [technicianId, setTechnicianId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [notes, setNotes] = useState<DeliveryNoteBaseInfo[]>([]);
  const [totals, setTotals] = useState<{ totalNetAmount: number; totalVatAmount: number; totalGrossAmount: number } | null>(null);
  const [selected, setSelected] = useState<DeliveryNoteBaseInfo[]>([]);

  function downloadBlob(blob: Blob, fallbackFilename: string) {
    const filename = (blob as any).__filename || fallbackFilename;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

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

  const validatedCount = useMemo(
    () => notes.filter((n) => Number(n.statut) === 1).length,
    [notes]
  );
  const draftCount = useMemo(
    () => notes.filter((n) => Number(n.statut) !== 1).length,
    [notes]
  );

  async function load() {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getDeliveryNotesWithSummaries({
        pageNumber: 1,
        pageSize: 100,
        customerId,
        technicianId,
        tagIds: tagIds.length ? tagIds : null,
        status: status === 'all' ? null : Number(status),
        searchKeyword: searchKeyword.trim() || null,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        sortProperty: 'Number',
        sortOrder: 'asc',
      });
      const items = resp.getDeliveryNoteBaseInfos?.items ?? [];
      setNotes(items);
      setTotals({
        totalNetAmount: Number(resp.totalNetAmount ?? 0),
        totalVatAmount: Number(resp.totalVatAmount ?? 0),
        totalGrossAmount: Number(resp.totalGrossAmount ?? 0),
      });
      setSelected([]);
    } catch (e: any) {
      setNotes([]);
      setTotals(null);
      setSelected([]);
      setError(e?.message || 'Failed to load delivery notes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!startDate || !endDate) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate?.toISOString(), endDate?.toISOString()]);

  const tableColumns = useMemo(() => {
    const cols: Column<DeliveryNoteBaseInfo>[] = [
      ...columns,
      {
        id: 'actions',
        key: 'number',
        label: 'Actions',
        sortable: false,
        width: '180px',
        render: (_v, row) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              title={Number(row.statut) === 1 ? 'View' : 'Edit'}
              onClick={() => router.push(`/AddOrUpdateDeliveryNote/${row.number}`)}
            >
              {Number(row.statut) === 1 ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Print"
              onClick={() => alert('Print delivery note: not implemented yet')}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];
    return cols;
  }, [router]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground">Delivery notes</h1>
          <p className="text-muted-foreground">Bon de livraison list with filters, validate, exports.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const blob = await exportDeliveryNotesExcel({
                startDate,
                endDate,
                customerId,
                technicianId,
                tagIds: tagIds.length ? tagIds : null,
                status: status === 'all' ? null : Number(status),
              });
              downloadBlob(blob, 'DeliveryNotes.xlsx');
            }}
            disabled={loading}
            title="Export Excel"
          >
            <Table2 className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              const blob = await exportDeliveryNotesPdf({
                startDate,
                endDate,
                customerId,
                technicianId,
                tagIds: tagIds.length ? tagIds : null,
                status: status === 'all' ? null : Number(status),
              });
              downloadBlob(blob, 'DeliveryNotes.pdf');
            }}
            disabled={loading}
            title="Export PDF"
          >
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
          <p className="text-3xl font-bold text-foreground mt-2">{notes.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {validatedCount} validated / {draftCount} draft
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Validated</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {validatedCount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Posted documents
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Draft</p>
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
            {draftCount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Needs validation
          </p>
        </Card>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

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
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Client</div>
            <CustomerCombobox value={customerId} onChange={(id) => setCustomerId(id)} placeholder="Select a customer" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Installer</div>
            <TechnicianCombobox value={technicianId} onChange={(id) => setTechnicianId(id)} />
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
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Tags</div>
            <TagsMultiSelect value={tagIds} onChange={(ids) => setTagIds(ids)} />
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={async () => {
                const today = new Date();
                const s = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                const e = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                setPeriod('Custom');
                setStartDate(s);
                setEndDate(e);
                await load();
              }}
              disabled={loading}
              title="Today"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={load} disabled={loading} title="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={async () => {
                await validateDeliveryNotes(selected.map((s) => s.number));
                await load();
              }}
              disabled={loading || selected.length === 0}
              title="Validate selection"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={cn(
              'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
            placeholder="Search by number, customer, or invoice #..."
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={tableColumns}
            data={notes}
            title="Delivery notes"
            description="List"
            searchPlaceholder="Search..."
            onSearchChange={() => {}}
            loading={loading}
            selectable
            rowId={(r) => r.number}
            onSelectionChange={(items) => setSelected(items)}
            onAddClick={() => router.push('/AddOrUpdateDeliveryNote')}
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
              <span className="text-muted-foreground">Total Gross</span>
              <span className="text-foreground font-semibold">
                {Number(totals?.totalGrossAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
