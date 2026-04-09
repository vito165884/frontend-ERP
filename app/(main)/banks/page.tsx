'use client';

import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building } from 'lucide-react';
import { createBanque, getBanques, type Banque } from '@/lib/api/banques';

const columns: Column<Banque>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '100px',
    render: (value) => <span className="font-mono text-xs text-muted-foreground">{value}</span>,
  },
  {
    key: 'nom',
    label: 'Bank Name',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
];

export default function BanksPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Banque[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await getBanques();
      setRows(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const canCreate = useMemo(() => createName.trim().length > 0, [createName]);

  async function doCreate() {
    if (!canCreate) return;
    await createBanque(createName.trim());
    setCreateName('');
    setCreateOpen(false);
    await load();
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-end gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create bank</Button>
          </DialogTrigger>
          <DialogContent className="w-[min(96vw,720px)] max-w-none">
            <DialogHeader>
              <DialogTitle>Create bank</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
              <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Bank name" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void doCreate()} disabled={!canCreate}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Banks</p>
            <p className="text-4xl font-bold text-foreground mt-3">{rows.length}</p>
          </Card>
        </div>
      </Card>

      <DataTable
        columns={columns as any}
        data={rows as any}
        title="Bank List"
        description="View and manage all banks"
        loading={loading}
      />
    </div>
  );
}
