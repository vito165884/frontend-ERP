"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProviderCombobox } from "@/components/inputs/provider-combobox";
import { toast } from "@/hooks/use-toast";
import { createAvoirFournisseur } from "@/lib/api/provider-credit-notes";

export default function CreateSupplierCreditNotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [fournisseurId, setFournisseurId] = useState<number | null>(null);
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [numAvoirChezFournisseur, setNumAvoirChezFournisseur] = useState<string>("");
  const [numFactureAvoirFournisseur, setNumFactureAvoirFournisseur] = useState<string>("");

  const [refProduit, setRefProduit] = useState("");
  const [designationLi, setDesignationLi] = useState("");
  const [qteLi, setQteLi] = useState("1");
  const [prixHt, setPrixHt] = useState("0");
  const [remise, setRemise] = useState("0");
  const [tva, setTva] = useState("19");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fournisseurId) {
      toast({ title: "Supplier required", variant: "destructive" });
      return;
    }
    const numAv = Number(numAvoirChezFournisseur);
    if (!Number.isFinite(numAv) || numAv <= 0) {
      toast({ title: "Supplier credit note # invalid", variant: "destructive" });
      return;
    }
    if (!refProduit.trim()) {
      toast({ title: "Product reference required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const d = new Date(dateStr);
      const optFacture = numFactureAvoirFournisseur.trim() ? Number(numFactureAvoirFournisseur) : null;
      await createAvoirFournisseur({
        date: d.toISOString(),
        fournisseurId,
        numAvoirChezFournisseur: numAv,
        numFactureAvoirFournisseur: optFacture != null && Number.isFinite(optFacture) ? optFacture : null,
        lines: [
          {
            refProduit: refProduit.trim(),
            designationLi: designationLi.trim() || refProduit.trim(),
            qteLi: Math.max(1, Math.floor(Number(qteLi) || 1)),
            prixHt: Number(prixHt) || 0,
            remise: Number(remise) || 0,
            tva: Number(tva) || 0,
          },
        ],
      });
      toast({ title: "Credit note created" });
      router.push("/supplier-credit-notes");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Create failed";
      toast({ title: "Create failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Add supplier credit note</h1>
          <p className="text-muted-foreground mt-2">Creates an avoir fournisseur with one line. Product reference must exist in stock.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/supplier-credit-notes">Back</Link>
        </Button>
      </div>

      <Card className="p-6 border-border">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <ProviderCombobox value={fournisseurId} onChange={(id) => setFournisseurId(id)} />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="datetime-local" value={dateStr} onChange={(e) => setDateStr(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Credit note # (supplier)</Label>
              <Input value={numAvoirChezFournisseur} onChange={(e) => setNumAvoirChezFournisseur(e.target.value)} placeholder="Num avoir chez fournisseur" required />
            </div>
            <div className="space-y-2">
              <Label>Credit invoice id (optional)</Label>
              <Input
                value={numFactureAvoirFournisseur}
                onChange={(e) => setNumFactureAvoirFournisseur(e.target.value)}
                placeholder="Facture avoir fournisseur Id"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <div className="text-sm font-semibold text-foreground">Line 1</div>
            <div className="space-y-2">
              <Label>Product ref.</Label>
              <Input value={refProduit} onChange={(e) => setRefProduit(e.target.value)} placeholder="Ref produit" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={designationLi} onChange={(e) => setDesignationLi(e.target.value)} placeholder="Designation" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Qty</Label>
                <Input value={qteLi} onChange={(e) => setQteLi(e.target.value)} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label>Price HT</Label>
                <Input value={prixHt} onChange={(e) => setPrixHt(e.target.value)} inputMode="decimal" />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input value={remise} onChange={(e) => setRemise(e.target.value)} inputMode="decimal" />
              </div>
              <div className="space-y-2">
                <Label>VAT %</Label>
                <Input value={tva} onChange={(e) => setTva(e.target.value)} inputMode="decimal" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/manage-provider-credit-notes">Manage hub</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
