"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, ListOrdered, Package } from "lucide-react";

export default function PurchaseOrderPage() {
  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-foreground">Purchase order</h1>
        <p className="text-muted-foreground">
          Same entry point as the Razor AddOrUpdateOrder screen: create and edit supplier orders (commandes). Full line editor lives in the Sales web app for now.
        </p>
      </div>

      <Card className="p-6 border-border">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Full line editor, price history, tags, and print parity with the Blazor screen are not ported here yet. Use the Sales web app for
              complete editing, or create orders via the Sales API (POST /orders) from integrations.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/purchase-orders" className="inline-flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" />
                  Orders list
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/receipt-notes" className="inline-flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Receipt notes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
