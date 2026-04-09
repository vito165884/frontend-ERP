"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, Trash2 } from "lucide-react";
import {
  deleteTiersDepenseFonctionnement,
  getTiersDepensesFonctionnement,
  type TiersDepenseFonctionnement,
} from "@/lib/api/tiers-depenses-fonctionnement";

type Row = {
  id: number;
  nom: string;
  tel?: string | null;
  mail?: string | null;
  adresse?: string | null;
  exonereRetenueSource: boolean;
};

function toRow(t: TiersDepenseFonctionnement): Row {
  return {
    id: t.id,
    nom: t.nom,
    tel: t.tel ?? null,
    mail: t.mail ?? null,
    adresse: t.adresse ?? null,
    exonereRetenueSource: Boolean(t.exonereRetenueSource),
  };
}

const columns = (onDelete: (id: number) => void): Column<Row>[] => [
  {
    key: "nom",
    label: "Name",
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  { key: "tel", label: "Phone", sortable: false },
  { key: "mail", label: "Email", sortable: false },
  {
    key: "adresse",
    label: "Address",
    sortable: false,
    render: (value) => <span className="text-muted-foreground truncate max-w-[360px] block">{value}</span>,
  },
  {
    key: "exonereRetenueSource",
    label: "Withholding exempt",
    sortable: true,
    render: (value) => <span className="text-muted-foreground">{value ? "Yes" : "No"}</span>,
  },
  {
    key: "id",
    label: "",
    sortable: false,
    width: "70px",
    render: (value) => (
      <Button variant="ghost" size="icon" onClick={() => onDelete(Number(value))} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function ExpenseVendorsPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await getTiersDepensesFonctionnement({
        pageNumber: 1,
        pageSize: 50,
        searchKeyword: search || null,
      });
      setRows(res.items.map(toRow));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(id: number) {
    await deleteTiersDepenseFonctionnement(id);
    await load();
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Expense Vendors</h1>
        <p className="text-muted-foreground text-base">Manage third parties for operating expenses.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => void load()} disabled={loading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <DataTable
          title="Expense Vendor List"
          description="View and manage all expense vendors"
          data={rows as any}
          columns={columns(onDelete) as any}
          loading={loading}
          searchPlaceholder="Search by name..."
          onSearchChange={(v) => {
            setSearch(v);
            void (async () => {
              setLoading(true);
              try {
                const res = await getTiersDepensesFonctionnement({
                  pageNumber: 1,
                  pageSize: 50,
                  searchKeyword: v || null,
                });
                setRows(res.items.map(toRow));
              } finally {
                setLoading(false);
              }
            })();
          }}
        />
      </Card>
    </div>
  );
}
