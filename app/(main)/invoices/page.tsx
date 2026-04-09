'use client';

import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle2, FileDown, Table, FileType } from 'lucide-react';
import { CustomerCombobox } from '@/components/inputs/customer-combobox';
import { TagsMultiSelect } from '@/components/inputs/tags-multi-select';
import {
  exportInvoicesExcel,
  exportInvoicesPdf,
  exportInvoicesSage,
  getInvoicesList,
  validateInvoices,
  type InvoiceBaseInfo,
} from '@/lib/api/invoices';

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

function downloadBlob(blob: Blob, fallbackFilename: string) {
  const filename = (blob as any).__filename || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const columns: Column<InvoiceBaseInfo>[] = [
  {
    key: 'number',
    label: 'Invoice #',
    sortable: true,
    width: '150px',
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  {
    key: 'customerName',
    label: 'Customer',
    sortable: true,
    render: (value) => <span className="text-foreground">{value ?? '-'}</span>,
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: (value) => {
      const raw = String(value ?? '');
      const dt = raw ? new Date(raw) : null;
      return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : '-'}</span>;
    },
  },
  {
    key: 'netAmount',
    label: 'Total (HT)',
    sortable: true,
    render: (value) => (
      <span className="font-semibold text-foreground">{formatMoney(Number(value))}</span>
    ),
  },
  {
    key: 'vatAmount',
    label: 'TVA',
    sortable: true,
    render: (value) => <span className="text-muted-foreground">{formatMoney(Number(value))}</span>,
  },
  {
    key: 'statut',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const v = Number(value);
      const colors: Record<string, string> = {
        validated: 'bg-emerald-400/20 text-emerald-300',
        draft: 'bg-gray-400/20 text-gray-300',
      };
      const label = v === 1 ? 'validated' : 'draft';
      return (
        <Badge className={colors[label]}>{label}</Badge>
      );
    },
  },
];

export default function InvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>('CurrentMonth');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string>('all'); // all | 0 | 1

  const [invoices, setInvoices] = useState<InvoiceBaseInfo[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceBaseInfo[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<InvoiceBaseInfo[]>([]);

  const totals = useMemo(() => {
    const net = filteredInvoices.reduce((sum, i) => sum + (i.netAmount ?? 0), 0);
    const vat = filteredInvoices.reduce((sum, i) => sum + (i.vatAmount ?? 0), 0);
    return { net, vat, ttc: net + vat };
  }, [filteredInvoices]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const resp = await getInvoicesList({
        startDate,
        endDate,
        customerId: selectedCustomerId,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
        status: status === 'all' ? null : Number(status),
        page: 1,
        pageSize: 50,
        sortBy: 'Number',
        sortDescending: false,
      });
      const items = resp.invoices ?? [];
      setInvoices(items);
      setFilteredInvoices(items);
      setSelectedInvoices([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load invoices');
      setInvoices([]);
      setFilteredInvoices([]);
      setSelectedInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Razor default is CurrentMonth in invoices list.
    const now = new Date();
    const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setPeriod('CurrentMonth');
    setStartDate(s);
    setEndDate(e);
    void (async () => {
      await getInvoicesList({
        startDate: s,
        endDate: e,
        customerId: null,
        tagIds: null,
        status: null,
        page: 1,
        pageSize: 50,
        sortBy: 'Number',
        sortDescending: false,
      })
        .then((resp) => {
          const items = resp.invoices ?? [];
          setInvoices(items);
          setFilteredInvoices(items);
        })
        .catch((e: any) => setError(e?.message || 'Failed to load invoices'))
        .finally(() => setLoading(false));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSearch = (searchTerm: string) => {
    const t = searchTerm.trim().toLowerCase();
    const filtered = invoices.filter(
      (i) =>
        String(i.number).includes(t) ||
        (i.customerName ?? '').toLowerCase().includes(t) ||
        (i.statutLibelle ?? '').toLowerCase().includes(t)
    );
    setFilteredInvoices(filtered);
  };

  async function onValidateSelection() {
    try {
      const ids = selectedInvoices.map((i) => i.number);
      if (!ids.length) return;
      if (!confirm(`Validate ${ids.length} invoice(s)?`)) return;
      await validateInvoices(ids);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to validate invoices');
    }
  }

  async function onValidateOne(invoiceNumber: number) {
    try {
      if (!confirm(`Validate invoice #${invoiceNumber}?`)) return;
      await validateInvoices([invoiceNumber]);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to validate invoice');
    }
  }

  async function onExportExcel() {
    try {
      const blob = await exportInvoicesExcel({
        startDate,
        endDate,
        customerId: selectedCustomerId,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
        status: status === 'all' ? null : Number(status),
        selectedColumns: ['Number', 'Date', 'CustomerName', 'NetAmount', 'VatAmount'],
      });
      downloadBlob(blob, 'Factures.xlsx');
    } catch (e: any) {
      setError(e?.message || 'Export Excel failed');
    }
  }

  async function onExportPdf() {
    try {
      const blob = await exportInvoicesPdf({
        startDate,
        endDate,
        customerId: selectedCustomerId,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
        status: status === 'all' ? null : Number(status),
        selectedColumns: ['Number', 'Date', 'CustomerName', 'NetAmount', 'VatAmount'],
      });
      downloadBlob(blob, 'Factures.pdf');
    } catch (e: any) {
      setError(e?.message || 'Export PDF failed');
    }
  }

  async function onExportSage() {
    try {
      const blob = await exportInvoicesSage({
        startDate,
        endDate,
        customerId: selectedCustomerId,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
      });
      downloadBlob(blob, 'Factures_Sage.txt');
    } catch (e: any) {
      setError(e?.message || 'Export Sage failed');
    }
  }

  return (
    <div className="page-content bg-black">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="page-header border-l-4 border-l-blue-500 pl-5 flex-1">
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Search, validate, and export invoices (same endpoints as Razor).</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400" onClick={onValidateSelection} disabled={!selectedInvoices.length || loading}>
            <CheckCircle2 className="h-4 w-4" />
            Validate selection
          </Button>
          <Button variant="outline" className="gap-2 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400" onClick={onExportSage} disabled={loading}>
            <FileDown className="h-4 w-4" />
            Export Sage
          </Button>
          <Button variant="outline" className="gap-2 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400" onClick={onExportExcel} disabled={loading}>
            <Table className="h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" className="gap-2 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-400" onClick={onExportPdf} disabled={loading}>
            <FileType className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border border-l-4 border-l-blue-500 hover:border-blue-500/60 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Period</div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Current Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CurrentMonth">Current Month</SelectItem>
                <SelectItem value="CurrentYear">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Customer</div>
            <CustomerCombobox
              value={selectedCustomerId}
              onChange={(id) => setSelectedCustomerId(id)}
              placeholder="Select a customer"
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
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
            <TagsMultiSelect value={selectedTagIds} onChange={(ids) => setSelectedTagIds(ids)} />
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button onClick={load} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </div>
        </div>
      </Card>
      <DataTable
        columns={[
          ...columns,
          {
            id: 'actions',
            key: 'number',
            label: 'Actions',
            sortable: false,
            render: (_value, row) => (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50 disabled:opacity-50"
                  disabled={row.statut === 1 || loading}
                  onClick={() => onValidateOne(row.number)}
                  title="Validate"
                >
                  Validate
                </Button>
              </div>
            ),
          } as Column<InvoiceBaseInfo>,
        ]}
        data={filteredInvoices}
        title="Invoice List"
        description="View and manage all sales invoices"
        searchPlaceholder="Search by invoice #, customer, or status..."
        onSearchChange={handleSearch}
        loading={loading}
        selectable
        rowId={(row) => row.number}
        onSelectionChange={setSelectedInvoices}
      />

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}
