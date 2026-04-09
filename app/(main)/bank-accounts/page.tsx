'use client';

import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Building, Trash2 } from 'lucide-react';
import { getBanques, type Banque } from '@/lib/api/banques';
import { createCompteBancaire, deleteCompteBancaire, getComptesBancaires, type CompteBancaire } from '@/lib/api/comptes-bancaires';

type BankAccount = CompteBancaire;

const columns = (onDelete: (id: number) => void): Column<BankAccount>[] => [
  {
    key: 'libelle',
    label: 'Account',
    sortable: true,
    width: '200px',
    render: (value) => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{value || '-'}</span>
      </div>
    ),
  },
  {
    key: 'banqueNom',
    label: 'Bank',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Building className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{value || '-'}</span>
      </div>
    ),
  },
  {
    key: 'numeroCompte',
    label: 'Account #',
    sortable: true,
    render: (value) => (
      <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
        {value}
      </code>
    ),
  },
  {
    key: 'codeEtablissement',
    label: 'Estab.',
    sortable: false,
  },
  { key: 'codeAgence', label: 'Agency', sortable: false },
  { key: 'cleRib', label: 'RIB', sortable: false },
  {
    id: 'actions',
    key: 'id',
    label: '',
    sortable: false,
    width: '70px',
    render: (value) => (
      <Button variant="ghost" size="icon" onClick={() => onDelete(Number(value))} title="Delete">
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function BankAccountsPage() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);
  const [banques, setBanques] = useState<Banque[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [banqueId, setBanqueId] = useState<number | null>(null);
  const [libelle, setLibelle] = useState('');
  const [codeEtablissement, setCodeEtablissement] = useState('');
  const [codeAgence, setCodeAgence] = useState('');
  const [numeroCompte, setNumeroCompte] = useState('');
  const [cleRib, setCleRib] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([getComptesBancaires(), getBanques()]);
      setAccounts(c);
      setFilteredAccounts(c);
      setBanques(b);
      if (banqueId == null && b.length) setBanqueId(b[0].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCreate = useMemo(
    () =>
      banqueId != null &&
      codeEtablissement.trim() &&
      codeAgence.trim() &&
      numeroCompte.trim() &&
      cleRib.trim(),
    [banqueId, codeEtablissement, codeAgence, numeroCompte, cleRib]
  );

  async function doCreate() {
    if (!canCreate || banqueId == null) return;
    await createCompteBancaire({
      banqueId,
      codeEtablissement: codeEtablissement.trim(),
      codeAgence: codeAgence.trim(),
      numeroCompte: numeroCompte.trim(),
      cleRib: cleRib.trim(),
      libelle: libelle.trim() || null,
    });
    setCreateOpen(false);
    setLibelle('');
    setCodeEtablissement('');
    setCodeAgence('');
    setNumeroCompte('');
    setCleRib('');
    await load();
  }

  async function onDelete(id: number) {
    await deleteCompteBancaire(id);
    await load();
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Bank Accounts</h1>
        <p className="text-muted-foreground text-base">
          Manage company bank accounts
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create account</Button>
          </DialogTrigger>
          <DialogContent className="w-[min(96vw,900px)] max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create bank account</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Bank</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={banqueId ?? ''}
                  onChange={(e) => setBanqueId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select…</option>
                  {banques.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Label</label>
                <Input value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Code établissement</label>
                <Input value={codeEtablissement} onChange={(e) => setCodeEtablissement(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Code agence</label>
                <Input value={codeAgence} onChange={(e) => setCodeAgence(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Numéro compte</label>
                <Input value={numeroCompte} onChange={(e) => setNumeroCompte(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Clé RIB</label>
                <Input value={cleRib} onChange={(e) => setCleRib(e.target.value)} />
              </div>
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

      <DataTable
        columns={columns(onDelete) as any}
        data={filteredAccounts}
        title="Account List"
        description="View and manage all company bank accounts"
        searchPlaceholder="Search by account name, bank, or number..."
        loading={loading}
        onSearchChange={(searchTerm) => {
          const term = searchTerm.trim().toLowerCase();
          if (!term) return setFilteredAccounts(accounts);
          setFilteredAccounts(
            accounts.filter((a) =>
              (a.libelle ?? '').toLowerCase().includes(term) ||
              (a.banqueNom ?? '').toLowerCase().includes(term) ||
              a.numeroCompte.includes(searchTerm)
            )
          );
        }}
      />
    </div>
  );
}
