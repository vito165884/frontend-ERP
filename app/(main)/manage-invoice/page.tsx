"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerCombobox } from "@/components/inputs/customer-combobox";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { createInvoice, getInvoicesByCustomerWithSummary } from "@/lib/api/invoices";
import {
  attachDeliveryNotesToInvoice,
  detachDeliveryNotesFromInvoice,
  getDeliveryNotesWithSummaries,
  type DeliveryNoteBaseInfo,
} from "@/lib/api/delivery-notes";

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);
  } catch {
    return String(n);
  }
}

type InvoiceRow = {
  number: number;
  date: string;
  totalIncludingTaxAmount: number;
  hasRetenueSource?: boolean;
};

export default function ManageInvoicePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("Confirm");
  const [confirmDescription, setConfirmDescription] = useState<string | null>(null);
  const [confirmActionLabel, setConfirmActionLabel] = useState("Continue");
  const [onConfirm, setOnConfirm] = useState<(() => Promise<void>) | null>(null);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null);

  const [invoiceDeliveryNotes, setInvoiceDeliveryNotes] = useState<DeliveryNoteBaseInfo[]>([]);
  const [selectedDetach, setSelectedDetach] = useState<DeliveryNoteBaseInfo[]>([]);

  const [uninvoicedNotes, setUninvoicedNotes] = useState<DeliveryNoteBaseInfo[]>([]);
  const [selectedAttach, setSelectedAttach] = useState<DeliveryNoteBaseInfo[]>([]);

  const invoiceTotals = useMemo(() => {
    const ttc = invoices.reduce((sum, i) => sum + (i.totalIncludingTaxAmount ?? 0), 0);
    return { ttc };
  }, [invoices]);

  const uninvoicedTotals = useMemo(() => {
    const net = uninvoicedNotes.reduce((sum, n) => sum + (n.netAmount ?? 0), 0);
    const gross = uninvoicedNotes.reduce((sum, n) => sum + (n.grossAmount ?? 0), 0);
    const vat = uninvoicedNotes.reduce((sum, n) => sum + (n.vatAmount ?? 0), 0);
    return { net, gross, vat };
  }, [uninvoicedNotes]);

  async function loadInvoicesAndNotes(cid: number) {
    setLoading(true);
    setError(null);
    try {
      const resp = await getInvoicesByCustomerWithSummary({
        customerId: cid,
        pageNumber: 1,
        pageSize: 10,
        sortOrder: "asc",
        sortProprety: "Number",
      });

      const items = resp?.invoices?.items ?? resp?.Invoices?.Items ?? resp?.Invoices?.items ?? [];
      const mapped: InvoiceRow[] = (items as any[]).map((i) => ({
        number: i.number ?? i.Number,
        date: String(i.date ?? i.Date ?? new Date().toISOString()),
        totalIncludingTaxAmount: Number(i.totalIncludingTaxAmount ?? i.TotalIncludingTaxAmount ?? 0),
        hasRetenueSource: Boolean(i.hasRetenueSource ?? i.HasRetenueSource),
      }));

      setInvoices(mapped);
      setSelectedInvoice(null);
      setInvoiceDeliveryNotes([]);
      setSelectedDetach([]);

      const dnResp = await getDeliveryNotesWithSummaries({
        customerId: cid,
        invoiceId: null,
        isInvoiced: false,
        pageNumber: 1,
        pageSize: 50,
        sortProperty: "Number",
        sortOrder: "asc",
      });
      const dnItems = dnResp.getDeliveryNoteBaseInfos?.items ?? [];
      setUninvoicedNotes(dnItems);
      setSelectedAttach([]);
    } catch (e: any) {
      setError(e?.message || "Failed to load manage-invoice data");
      setInvoices([]);
      setSelectedInvoice(null);
      setInvoiceDeliveryNotes([]);
      setUninvoicedNotes([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDeliveryNotesForInvoice(cid: number, invoiceNumber: number) {
    try {
      const resp = await getDeliveryNotesWithSummaries({
        customerId: cid,
        invoiceId: invoiceNumber,
        isInvoiced: true,
        pageNumber: 1,
        pageSize: 50,
        sortProperty: "Number",
        sortOrder: "asc",
      });
      setInvoiceDeliveryNotes(resp.getDeliveryNoteBaseInfos?.items ?? []);
      setSelectedDetach([]);
    } catch (e: any) {
      setError(e?.message || "Failed to load invoice delivery notes");
      setInvoiceDeliveryNotes([]);
      setSelectedDetach([]);
    }
  }

  useEffect(() => {
    if (!customerId) return;
    void loadInvoicesAndNotes(customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const invoiceColumns: Column<InvoiceRow>[] = [
    { key: "number", label: "Invoice Number", sortable: true, width: "160px" },
    {
      key: "date",
      label: "Date",
      sortable: true,
      width: "140px",
      render: (v) => {
        const dt = v ? new Date(String(v)) : null;
        return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
      },
    },
    {
      key: "totalIncludingTaxAmount",
      label: "Total Incl. Tax",
      sortable: true,
      width: "180px",
      render: (v) => <span className="text-foreground font-medium">{formatMoney(Number(v))}</span>,
    },
    {
      key: "hasRetenueSource",
      label: "retenue_status",
      sortable: false,
      width: "160px",
      render: (v) =>
        v ? (
          <Badge className="bg-emerald-400/20 text-emerald-300">exists</Badge>
        ) : (
          <Badge className="bg-gray-400/20 text-gray-300">-</Badge>
        ),
    },
    {
      id: "actions",
      key: "number",
      label: "Actions",
      sortable: false,
      width: "140px",
      render: (_v, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!customerId) return;
            setSelectedInvoice(row);
            void loadDeliveryNotesForInvoice(customerId, row.number);
          }}
        >
          Select
        </Button>
      ),
    },
  ];

  const dnColumns: Column<DeliveryNoteBaseInfo>[] = [
    { key: "number", label: "Number", sortable: true, width: "140px" },
    {
      key: "date",
      label: "Date",
      sortable: true,
      width: "140px",
      render: (v) => {
        const dt = v ? new Date(String(v)) : null;
        return <span className="text-muted-foreground">{dt ? dt.toLocaleDateString() : "-"}</span>;
      },
    },
    {
      key: "grossAmount",
      label: "Total Excl. Tax",
      sortable: true,
      width: "160px",
      render: (v) => <span className="text-foreground">{formatMoney(Number(v))}</span>,
    },
    {
      key: "netAmount",
      label: "Net to Pay",
      sortable: true,
      width: "160px",
      render: (v) => <span className="text-foreground font-medium">{formatMoney(Number(v))}</span>,
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            {confirmDescription ? <AlertDialogDescription>{confirmDescription}</AlertDialogDescription> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={async () => {
                setConfirmOpen(false);
                if (onConfirm) await onConfirm();
              }}
            >
              {confirmActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Manage invoices</h1>
          <p className="text-muted-foreground mt-2">
            Customer-centric workbench (attach/detach delivery notes) like Razor.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!selectedInvoice}
            onClick={() =>
              toast({
                title: "Not implemented yet",
                description: "Withholding printing will be added next (needs print endpoints wiring).",
              })
            }
          >
            Withholding
          </Button>
          <Button
            variant="outline"
            disabled={!selectedInvoice}
            onClick={() =>
              toast({
                title: "Not implemented yet",
                description: "Invoice printing will be added next (needs print endpoints wiring).",
              })
            }
          >
            Invoice
          </Button>
        </div>
      </div>

      <Card className="p-6 border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Select a customer</div>
            <CustomerCombobox value={customerId} onChange={(id) => setCustomerId(id)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              disabled={!customerId || loading}
              onClick={async () => {
                if (!customerId) return;

                setConfirmTitle("Create new invoice");
                setConfirmDescription("Create a new invoice for the selected customer (today)?");
                setConfirmActionLabel("Create");
                setOnConfirm(() => async () => {
                  setLoading(true);
                  try {
                    const created = await createInvoice({
                      date: new Date().toISOString(),
                      clientId: customerId,
                    });
                    await loadInvoicesAndNotes(customerId);
                    toast({
                      title: "Invoice created",
                      description: `Invoice #${created} was created successfully.`,
                    });
                  } catch (e: any) {
                    setError(e?.message || "Create invoice failed");
                    toast({
                      title: "Create invoice failed",
                      description: e?.message || "Unexpected error",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                });
                setConfirmOpen(true);
              }}
            >
              Create new invoice
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border">
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          title="Customer Invoice Details"
          description="Select an invoice to load its delivery notes"
          loading={loading}
          rowId={(r) => r.number}
        />
        <div className="mt-3 text-sm text-muted-foreground flex justify-end gap-6 flex-wrap">
          <span>
            Total Net: <strong className="text-foreground">{formatMoney(invoiceTotals.ttc)}</strong>
          </span>
        </div>
      </Card>

      <Card className="p-6 border-border">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <div className="text-lg font-semibold text-foreground">Invoice Delivery Notes</div>
            <div className="text-sm text-muted-foreground">
              {selectedInvoice ? `Invoice #${selectedInvoice.number}` : "Select an invoice first"}
            </div>
          </div>
          <Button
            variant="destructive"
            disabled={!selectedInvoice || !selectedDetach.length || loading || !customerId}
            onClick={async () => {
              if (!selectedInvoice || !customerId) return;

              setConfirmTitle("Detach delivery notes");
              setConfirmDescription(
                `Detach ${selectedDetach.length} delivery note(s) from invoice #${selectedInvoice.number}?`
              );
              setConfirmActionLabel("Detach");
              setOnConfirm(() => async () => {
                setLoading(true);
                try {
                  await detachDeliveryNotesFromInvoice({
                    invoiceId: selectedInvoice.number,
                    deliveryNoteIds: selectedDetach.map((d) => d.number),
                  });
                  await loadDeliveryNotesForInvoice(customerId, selectedInvoice.number);
                  const dnResp = await getDeliveryNotesWithSummaries({
                    customerId,
                    invoiceId: null,
                    isInvoiced: false,
                    pageNumber: 1,
                    pageSize: 50,
                    sortProperty: "Number",
                    sortOrder: "asc",
                  });
                  setUninvoicedNotes(dnResp.getDeliveryNoteBaseInfos?.items ?? []);
                  toast({
                    title: "Detached",
                    description: "Delivery notes detached from invoice.",
                  });
                } catch (e: any) {
                  setError(e?.message || "Detach failed");
                  toast({
                    title: "Detach failed",
                    description: e?.message || "Unexpected error",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              });
              setConfirmOpen(true);
            }}
          >
            Detach from invoice
          </Button>
        </div>

        <DataTable
          columns={dnColumns}
          data={invoiceDeliveryNotes}
          title="Delivery notes in invoice"
          selectable
          rowId={(r) => r.number}
          onSelectionChange={setSelectedDetach}
          loading={loading}
        />
      </Card>

      <Card className="p-6 border-border">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <div className="text-lg font-semibold text-foreground">Uninvoiced Delivery Notes Details</div>
            <div className="text-sm text-muted-foreground">Select delivery notes and attach to selected invoice</div>
          </div>
          <Button
            disabled={!selectedInvoice || !selectedAttach.length || loading || !customerId}
            onClick={async () => {
              if (!selectedInvoice || !customerId) return;

              setConfirmTitle("Attach delivery notes");
              setConfirmDescription(
                `Attach ${selectedAttach.length} delivery note(s) to invoice #${selectedInvoice.number}?`
              );
              setConfirmActionLabel("Attach");
              setOnConfirm(() => async () => {
                setLoading(true);
                try {
                  await attachDeliveryNotesToInvoice({
                    invoiceId: selectedInvoice.number,
                    deliveryNoteIds: selectedAttach.map((d) => d.number),
                  });
                  await loadDeliveryNotesForInvoice(customerId, selectedInvoice.number);
                  const dnResp = await getDeliveryNotesWithSummaries({
                    customerId,
                    invoiceId: null,
                    isInvoiced: false,
                    pageNumber: 1,
                    pageSize: 50,
                    sortProperty: "Number",
                    sortOrder: "asc",
                  });
                  setUninvoicedNotes(dnResp.getDeliveryNoteBaseInfos?.items ?? []);
                  setSelectedAttach([]);
                  toast({
                    title: "Attached",
                    description: "Delivery notes attached to invoice.",
                  });
                } catch (e: any) {
                  setError(e?.message || "Attach failed");
                  toast({
                    title: "Attach failed",
                    description: e?.message || "Unexpected error",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              });
              setConfirmOpen(true);
            }}
          >
            Attach to invoice
          </Button>
        </div>

        <DataTable
          columns={dnColumns}
          data={uninvoicedNotes}
          title="Uninvoiced delivery notes"
          selectable
          rowId={(r) => r.number}
          onSelectionChange={setSelectedAttach}
          loading={loading}
        />
        <div className="mt-3 text-sm text-muted-foreground flex justify-end gap-6 flex-wrap">
          <span>
            Total Net: <strong className="text-foreground">{formatMoney(uninvoicedTotals.net)}</strong>
          </span>
          <span>
            Total Gross: <strong className="text-foreground">{formatMoney(uninvoicedTotals.gross)}</strong>
          </span>
          <span>
            Total VAT: <strong className="text-foreground">{formatMoney(uninvoicedTotals.vat)}</strong>
          </span>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}
    </div>
  );
}

