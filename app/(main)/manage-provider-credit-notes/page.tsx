"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Layers, Link2 } from "lucide-react";

export default function ManageProviderCreditNotesPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-foreground">Manage provider credit notes</h1>
        <p className="text-muted-foreground">
          Entry point for supplier avoir lines, credit invoices (facture avoir fournisseur), and linking them to supplier invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <div className="font-semibold text-foreground">Supplier credit notes (avoir fournisseur)</div>
              <p className="text-sm text-muted-foreground">List and validate individual supplier credit note documents.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/supplier-credit-notes">Open list</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <div className="flex items-start gap-3">
            <Plus className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <div className="font-semibold text-foreground">Add supplier credit note</div>
              <p className="text-sm text-muted-foreground">Create a draft avoir with at least one line (valid product reference required).</p>
              <Button asChild size="sm">
                <Link href="/supplier-credit-notes/create">Add credit note</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <div className="font-semibold text-foreground">Supplier credit invoices</div>
              <p className="text-sm text-muted-foreground">Facture avoir fournisseur — grouped credit invoices.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/supplier-credit-invoices">Open list</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border">
          <div className="flex items-start gap-3">
            <Link2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <div className="font-semibold text-foreground">Manage supplier credit invoices</div>
              <p className="text-sm text-muted-foreground">Attach or detach credit invoices from a supplier invoice (facture fournisseur).</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/manage-supplier-credit-invoices">Open manager</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
