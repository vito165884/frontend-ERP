"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  createDeliveryNote,
  getDeliveryNoteByNum,
  updateDeliveryNote,
  validateDeliveryNote,
  type DeliveryNoteItem,
  type CreateOrUpdateDeliveryNoteRequest,
} from "@/lib/api/delivery-notes";
import { getQuotationByNum } from "@/lib/api/quotations";

function nowTimeOnly(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toInputDateValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toIsoFromInputDateValue(v: string): string {
  const [y, m, d] = v.split("-").map((x) => Number(x));
  if (!y || !m || !d) return new Date().toISOString();
  return new Date(y, m - 1, d, 0, 0, 0).toISOString();
}

function computeLine(item: DeliveryNoteItem): DeliveryNoteItem {
  const qty = Number(item.quantity || 0);
  const unit = Number(item.unitPriceExcludingTax || 0);
  const discount = Number(item.discountPercentage || 0);
  const vat = Number(item.vatPercentage || 0);

  const base = qty * unit;
  const netHt = base * (1 - discount / 100);
  const vatAmount = netHt * (vat / 100);
  const ttc = netHt + vatAmount;

  return {
    ...item,
    totalExcludingTax: Number(netHt.toFixed(3)),
    totalIncludingTax: Number(ttc.toFixed(3)),
  };
}

function computeTotals(items: DeliveryNoteItem[]) {
  const totalExcludingTax = items.reduce((s, i) => s + (i.totalExcludingTax || 0), 0);
  const totalAmount = items.reduce((s, i) => s + (i.totalIncludingTax || 0), 0);
  const totalVat = totalAmount - totalExcludingTax;
  return {
    totalExcludingTax: Number(totalExcludingTax.toFixed(3)),
    totalVat: Number(totalVat.toFixed(3)),
    totalAmount: Number(totalAmount.toFixed(3)),
  };
}

function emptyItem(): DeliveryNoteItem {
  return computeLine({
    id: 0,
    productReference: "",
    description: "",
    quantity: 1,
    deliveredQuantity: 1,
    unitPriceExcludingTax: 0,
    discountPercentage: 0,
    totalExcludingTax: 0,
    vatPercentage: 19,
    totalIncludingTax: 0,
  });
}

export default function AddOrUpdateDeliveryNotePage({
  params,
}: {
  params: { num?: string[] };
}) {
  const router = useRouter();
  const num = useMemo(() => {
    const raw = params?.num?.[0];
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState<number | null>(num);
  const [statut, setStatut] = useState<number>(0);

  const [dateIso, setDateIso] = useState<string>(new Date().toISOString());
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<number | null>(null);
  const [installationTechnicianId, setInstallationTechnicianId] = useState<number | null>(null);
  const [deliveryCarId, setDeliveryCarId] = useState<number | null>(null);
  const [items, setItems] = useState<DeliveryNoteItem[]>([emptyItem()]);

  const isReadOnly = statut === 1;

  useEffect(() => {
    let cancelled = false;
    async function maybePrefillFromQuotation() {
      try {
        if (typeof window === "undefined") return;
        if (num) return; // edit mode; do not prefill
        const raw = window.sessionStorage.getItem("deliveryNoteFromQuotation");
        if (!raw) return;
        window.sessionStorage.removeItem("deliveryNoteFromQuotation");

        const quotationNum = Number(raw);
        if (!Number.isFinite(quotationNum)) return;

        const q = await getQuotationByNum(quotationNum);
        if (cancelled) return;

        setCustomerId(q.customerId ?? null);
        setDateIso(new Date().toISOString());
        setInvoiceNumber(null);
        setInstallationTechnicianId(null);
        setDeliveryCarId(null);
        setItems(
          (q.items?.length ? q.items : [])
            .filter((i) => i.productReference?.trim())
            .map((i) =>
              computeLine({
                id: 0,
                productReference: i.productReference,
                description: i.description,
                quantity: i.quantity,
                deliveredQuantity: i.quantity,
                unitPriceExcludingTax: i.unitPriceExcludingTax,
                discountPercentage: i.discountPercentage,
                totalExcludingTax: i.totalExcludingTax,
                vatPercentage: i.vatPercentage,
                totalIncludingTax: i.totalIncludingTax,
              })
            )
            .concat([])
            .slice(0, 500) || [emptyItem()]
        );
      } catch {
        // ignore; prefill is best-effort
      }
    }
    void maybePrefillFromQuotation();
    return () => {
      cancelled = true;
    };
  }, [num]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!num) {
          setDeliveryNoteNumber(null);
          setStatut(0);
          setDateIso(new Date().toISOString());
          setCustomerId(null);
          setInvoiceNumber(null);
          setInstallationTechnicianId(null);
          setDeliveryCarId(null);
          setItems([emptyItem()]);
          return;
        }

        const dn = await getDeliveryNoteByNum(num);
        if (cancelled) return;

        setDeliveryNoteNumber(dn.deliveryNoteNumber);
        setStatut(dn.statut);
        setDateIso(dn.date);
        setCustomerId(dn.customerId ?? null);
        setInvoiceNumber(dn.invoiceNumber ?? null);
        setInstallationTechnicianId(dn.installationTechnicianId ?? null);
        setDeliveryCarId(dn.deliveryCarId ?? null);
        setItems((dn.items?.length ? dn.items : [emptyItem()]).map(computeLine));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load delivery note");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [num]);

  const totals = useMemo(() => computeTotals(items), [items]);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const payload: CreateOrUpdateDeliveryNoteRequest = {
        date: dateIso,
        totalExcludingTax: totals.totalExcludingTax,
        totalVat: totals.totalVat,
        totalAmount: totals.totalAmount,
        deliveryTime: nowTimeOnly(),
        invoiceNumber,
        customerId,
        installationTechnicianId,
        deliveryCarId,
        items,
      };

      if (deliveryNoteNumber) {
        await updateDeliveryNote(deliveryNoteNumber, payload);
      } else {
        const created = await createDeliveryNote(payload);
        router.replace(`/AddOrUpdateDeliveryNote/${created}`);
        return;
      }
    } catch (e: any) {
      setError(e?.message || "Failed to save delivery note");
    } finally {
      setSaving(false);
    }
  }

  async function onValidate() {
    if (!deliveryNoteNumber) return;
    setSaving(true);
    setError(null);
    try {
      await validateDeliveryNote(deliveryNoteNumber);
      const dn = await getDeliveryNoteByNum(deliveryNoteNumber);
      setStatut(dn.statut);
      setItems((dn.items?.length ? dn.items : [emptyItem()]).map(computeLine));
    } catch (e: any) {
      setError(e?.message || "Failed to validate delivery note");
    } finally {
      setSaving(false);
    }
  }

  function updateItem(idx: number, patch: Partial<DeliveryNoteItem>) {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = computeLine({ ...next[idx], ...patch });
      return next;
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Note</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Number: {deliveryNoteNumber ?? "New"}
            </span>
            {isReadOnly ? (
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Validated</Badge>
            ) : (
              <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">Draft</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/delivery-notes")}>
            Back to list
          </Button>
          {!isReadOnly ? (
            <Button onClick={onSave} disabled={saving || loading}>
              {saving ? "Saving..." : "Save"}
            </Button>
          ) : null}
          {!isReadOnly && deliveryNoteNumber ? (
            <Button onClick={onValidate} disabled={saving || loading} className="bg-green-600 text-white hover:bg-green-700">
              Validate
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <Card className="p-4 border-border">
          <div className="text-sm text-red-600">{error}</div>
        </Card>
      ) : null}

      <Card className="p-6 border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Date</div>
            <Input
              type="date"
              value={toInputDateValue(dateIso)}
              onChange={(e) => setDateIso(toIsoFromInputDateValue(e.target.value))}
              disabled={loading || isReadOnly}
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Customer ID</div>
            <Input
              type="number"
              value={customerId ?? ""}
              onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || isReadOnly}
              placeholder="e.g. 12"
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Invoice #</div>
            <Input
              type="number"
              value={invoiceNumber ?? ""}
              onChange={(e) => setInvoiceNumber(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || isReadOnly}
              placeholder="optional"
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Technician ID</div>
            <Input
              type="number"
              value={installationTechnicianId ?? ""}
              onChange={(e) => setInstallationTechnicianId(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || isReadOnly}
              placeholder="optional"
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Delivery Car ID</div>
            <Input
              type="number"
              value={deliveryCarId ?? ""}
              onChange={(e) => setDeliveryCarId(e.target.value ? Number(e.target.value) : null)}
              disabled={loading || isReadOnly}
              placeholder="optional"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="text-lg font-semibold text-foreground">Line items</div>
            <div className="text-sm text-muted-foreground">Add products and quantities.</div>
          </div>
          {!isReadOnly ? (
            <Button
              variant="outline"
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
              disabled={loading}
            >
              Add line
            </Button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-2">Ref</th>
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2 w-[90px]">Qty</th>
                <th className="py-2 pr-2 w-[110px]">Delivered</th>
                <th className="py-2 pr-2 w-[120px]">Unit HT</th>
                <th className="py-2 pr-2 w-[110px]">Discount %</th>
                <th className="py-2 pr-2 w-[90px]">VAT %</th>
                <th className="py-2 pr-2 w-[140px]">Total HT</th>
                <th className="py-2 pr-2 w-[140px]">Total TTC</th>
                {!isReadOnly ? <th className="py-2 pr-2 w-[90px]">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="py-2 pr-2">
                    <Input
                      value={it.productReference}
                      onChange={(e) => updateItem(idx, { productReference: e.target.value })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      value={it.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value || 0) })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={it.deliveredQuantity ?? ""}
                      onChange={(e) => updateItem(idx, { deliveredQuantity: e.target.value ? Number(e.target.value) : null })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={it.unitPriceExcludingTax}
                      onChange={(e) => updateItem(idx, { unitPriceExcludingTax: Number(e.target.value || 0) })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={it.discountPercentage}
                      onChange={(e) => updateItem(idx, { discountPercentage: Number(e.target.value || 0) })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      type="number"
                      value={it.vatPercentage}
                      onChange={(e) => updateItem(idx, { vatPercentage: Number(e.target.value || 0) })}
                      disabled={loading || isReadOnly}
                    />
                  </td>
                  <td className="py-2 pr-2 font-medium">{it.totalExcludingTax.toFixed(3)}</td>
                  <td className="py-2 pr-2 font-medium">{it.totalIncludingTax.toFixed(3)}</td>
                  {!isReadOnly ? (
                    <td className="py-2 pr-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setItems((prev) => prev.filter((_, i) => i !== idx).length ? prev.filter((_, i) => i !== idx) : [emptyItem()])
                        }
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase">Total HT</div>
            <div className="text-2xl font-bold text-foreground mt-2">{totals.totalExcludingTax.toFixed(3)}</div>
          </Card>
          <Card className="p-4 border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase">Total TVA</div>
            <div className="text-2xl font-bold text-foreground mt-2">{totals.totalVat.toFixed(3)}</div>
          </Card>
          <Card className="p-4 border-border bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase">Total TTC</div>
            <div className="text-2xl font-bold text-foreground mt-2">{totals.totalAmount.toFixed(3)}</div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

