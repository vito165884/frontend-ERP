'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Upload, Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { getComptesBancaires, type CompteBancaire } from '@/lib/api/comptes-bancaires';
import { getBankTransactionImports, importBankTransactions, type BankTransactionImport } from '@/lib/api/bank-transactions';

type BankStatement = BankTransactionImport;

const columns: Column<BankStatement>[] = [
  {
    key: 'fileName',
    label: 'File Name',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 text-green-400" />
        <span className="font-medium text-foreground">{value}</span>
      </div>
    ),
  },
  {
    key: 'compteBancaireLibelle',
    label: 'Account',
    sortable: true,
  },
  {
    key: 'importedAt',
    label: 'Import Date',
    sortable: true,
  },
  {
    key: 'rowCount',
    label: 'Rows',
    sortable: true,
    render: (value) => (
      <span className="font-semibold text-foreground">{value}</span>
    ),
  },
];

export default function BankStatementsPage() {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<CompteBancaire[]>([]);
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [filteredStatements, setFilteredStatements] = useState<BankStatement[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const imports = await getBankTransactionImports({ compteBancaireId: selectedAccountId });
      setStatements(imports);
      setFilteredStatements(imports);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      const acc = await getComptesBancaires();
      setAccounts(acc);
      if (acc.length) setSelectedAccountId(acc[0].id);
    })();
  }, []);

  useEffect(() => {
    if (selectedAccountId == null) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  const totalRows = useMemo(() => statements.reduce((sum, s) => sum + s.rowCount, 0), [statements]);

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Bank Statements</h1>
        <p className="text-muted-foreground text-base">
          Import and manage bank statement files
        </p>
      </div>

      {/* Import Card */}
      <Card className="p-6 border-blue-500/30 bg-blue-500/5">
        <h3 className="text-lg font-bold text-foreground mb-4">Import Statement</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Select Account
            </label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedAccountId ?? ''}
              onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle || a.numeroCompte}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Statement File
            </label>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv,.txt"
              className="bg-secondary/30"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button
            disabled={!selectedAccountId || !file || isImporting}
            className="gap-2"
            onClick={async () => {
              if (!selectedAccountId || !file) return;
              setIsImporting(true);
              try {
                const form = new FormData();
                form.append('file', file);
                form.append('compteBancaireId', String(selectedAccountId));
                await importBankTransactions(form);
                setFile(null);
                await load();
              } finally {
                setIsImporting(false);
              }
            }}
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Supported formats: .xlsx, .xls, .csv, .txt
        </p>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Imports</p>
          <p className="text-4xl font-bold text-foreground mt-3">{statements.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Statement files</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Rows</p>
          <p className="text-4xl font-bold text-foreground mt-3">{totalRows}</p>
          <p className="text-sm text-muted-foreground mt-2">Transactions imported</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Selected account</p>
          <p className="text-2xl font-bold text-foreground mt-3">
            {accounts.find((a) => a.id === selectedAccountId)?.libelle || '-'}
          </p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredStatements}
        title="Imported Statements"
        description="View all imported bank statement files"
        searchPlaceholder="Search by file name or account..."
        loading={loading}
        onSearchChange={(searchTerm) => {
          const term = searchTerm.trim().toLowerCase();
          if (!term) return setFilteredStatements(statements);
          setFilteredStatements(
            statements.filter((s) =>
              s.fileName.toLowerCase().includes(term) ||
              (s.compteBancaireLibelle ?? '').toLowerCase().includes(term)
            )
          );
        }}
      />
    </div>
  );
}
