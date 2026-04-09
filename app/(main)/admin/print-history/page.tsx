'use client';

import { useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, RefreshCw, FileText, Download } from 'lucide-react';

interface PrintHistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  documentType: string;
  documentId: string;
  printMode: 'preview' | 'print' | 'pdf' | 'email';
  copies: number;
  status: 'success' | 'failed' | 'cancelled';
}

const mockPrintHistory: PrintHistoryEntry[] = [
  {
    id: 'PRINT-001',
    timestamp: '2024-01-22 15:30:22',
    user: 'john.admin@silkroad.com',
    documentType: 'Invoice',
    documentId: 'INV-2024-015',
    printMode: 'print',
    copies: 2,
    status: 'success',
  },
  {
    id: 'PRINT-002',
    timestamp: '2024-01-22 14:45:10',
    user: 'sarah.manager@silkroad.com',
    documentType: 'Quotation',
    documentId: 'QT-2024-012',
    printMode: 'pdf',
    copies: 1,
    status: 'success',
  },
  {
    id: 'PRINT-003',
    timestamp: '2024-01-22 14:20:05',
    user: 'mike.sales@silkroad.com',
    documentType: 'DeliveryNote',
    documentId: 'DN-2024-045',
    printMode: 'email',
    copies: 1,
    status: 'success',
  },
  {
    id: 'PRINT-004',
    timestamp: '2024-01-22 13:55:30',
    user: 'john.admin@silkroad.com',
    documentType: 'Invoice',
    documentId: 'INV-2024-014',
    printMode: 'print',
    copies: 3,
    status: 'failed',
  },
  {
    id: 'PRINT-005',
    timestamp: '2024-01-22 13:30:15',
    user: 'emma.analyst@silkroad.com',
    documentType: 'Report',
    documentId: 'RPT-2024-008',
    printMode: 'preview',
    copies: 1,
    status: 'success',
  },
  {
    id: 'PRINT-006',
    timestamp: '2024-01-22 12:15:45',
    user: 'sarah.manager@silkroad.com',
    documentType: 'CreditNote',
    documentId: 'CN-2024-003',
    printMode: 'print',
    copies: 1,
    status: 'cancelled',
  },
];

const columns: Column<PrintHistoryEntry>[] = [
  {
    key: 'timestamp',
    label: 'Timestamp',
    sortable: true,
    width: '160px',
    render: (value) => (
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    ),
  },
  {
    key: 'user',
    label: 'User',
    sortable: true,
  },
  {
    key: 'documentType',
    label: 'Document Type',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span>{value}</span>
      </div>
    ),
  },
  {
    key: 'documentId',
    label: 'Document ID',
    sortable: true,
    render: (value) => (
      <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
        {value}
      </code>
    ),
  },
  {
    key: 'printMode',
    label: 'Mode',
    sortable: true,
    render: (value) => {
      const colors = {
        preview: 'bg-gray-500/10 text-gray-400',
        print: 'bg-blue-500/10 text-blue-400',
        pdf: 'bg-red-500/10 text-red-400',
        email: 'bg-green-500/10 text-green-400',
      };
      const icons = {
        preview: 'Preview',
        print: 'Print',
        pdf: 'PDF',
        email: 'Email',
      };
      return (
        <Badge className={colors[value as keyof typeof colors]}>
          {icons[value as keyof typeof icons]}
        </Badge>
      );
    },
  },
  {
    key: 'copies',
    label: 'Copies',
    sortable: true,
    render: (value) => (
      <span className="font-semibold text-foreground">{value}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const colors = {
        success: 'bg-green-500/10 text-green-400',
        failed: 'bg-red-500/10 text-red-400',
        cancelled: 'bg-yellow-500/10 text-yellow-400',
      };
      return (
        <Badge className={colors[value as keyof typeof colors]}>
          {value}
        </Badge>
      );
    },
  },
];

export default function PrintHistoryPage() {
  const [history] = useState<PrintHistoryEntry[]>(mockPrintHistory);
  const [filteredHistory, setFilteredHistory] = useState<PrintHistoryEntry[]>(mockPrintHistory);
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const handleSearch = (searchTerm: string) => {
    let filtered = history;
    
    if (searchTerm) {
      filtered = filtered.filter((entry) =>
        entry.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.documentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDocType !== 'all') {
      filtered = filtered.filter((entry) => entry.documentType === selectedDocType);
    }
    
    if (selectedMode !== 'all') {
      filtered = filtered.filter((entry) => entry.printMode === selectedMode);
    }
    
    setFilteredHistory(filtered);
  };

  const uniqueDocTypes = [...new Set(history.map((h) => h.documentType))];
  const successCount = history.filter((h) => h.status === 'success').length;
  const failedCount = history.filter((h) => h.status === 'failed').length;
  const totalCopies = history.reduce((sum, h) => sum + h.copies, 0);

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Print History</h1>
          <p className="text-muted-foreground text-base">
            Track document printing and export activities
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-[180px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Document Type
            </label>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueDocTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Document ID
            </label>
            <Input placeholder="ID" className="bg-secondary/30" />
          </div>
          <div className="w-[150px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Print Mode
            </label>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="preview">Preview</SelectItem>
                <SelectItem value="print">Print</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Date From
            </label>
            <Input type="date" className="bg-secondary/30" />
          </div>
          <div className="w-[150px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Date To
            </label>
            <Input type="date" className="bg-secondary/30" />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Prints</p>
          <p className="text-4xl font-bold text-foreground mt-3">{history.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Print operations</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Successful</p>
          <p className="text-4xl font-bold text-green-400 mt-3">{successCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Completed successfully</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Failed</p>
          <p className="text-4xl font-bold text-red-400 mt-3">{failedCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Print errors</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Copies</p>
          <p className="text-4xl font-bold text-foreground mt-3">{totalCopies}</p>
          <p className="text-sm text-muted-foreground mt-2">Pages printed</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredHistory}
        title="Print Activity"
        description="View all document printing and export history"
        searchPlaceholder="Search by document ID, user, or type..."
        onSearchChange={handleSearch}
      />
    </div>
  );
}
