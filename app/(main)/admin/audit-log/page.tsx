'use client';

import { useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, RefreshCw, User, FileText, Settings } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout';
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2024-01-22 14:35:22',
    user: 'john.admin@silkroad.com',
    action: 'create',
    entityType: 'Invoice',
    entityId: 'INV-2024-015',
    description: 'Created new invoice for Acme Corporation',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'LOG-002',
    timestamp: '2024-01-22 14:20:15',
    user: 'sarah.manager@silkroad.com',
    action: 'update',
    entityType: 'Customer',
    entityId: 'CUST-003',
    description: 'Updated contact information',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'LOG-003',
    timestamp: '2024-01-22 13:55:08',
    user: 'mike.sales@silkroad.com',
    action: 'view',
    entityType: 'Quotation',
    entityId: 'QT-2024-012',
    description: 'Viewed quotation details',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'LOG-004',
    timestamp: '2024-01-22 13:30:45',
    user: 'john.admin@silkroad.com',
    action: 'delete',
    entityType: 'DeliveryNote',
    entityId: 'DN-2024-008',
    description: 'Deleted draft delivery note',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'LOG-005',
    timestamp: '2024-01-22 12:00:00',
    user: 'emma.analyst@silkroad.com',
    action: 'login',
    entityType: 'Session',
    entityId: 'SES-2024-089',
    description: 'User logged in',
    ipAddress: '192.168.1.103',
  },
  {
    id: 'LOG-006',
    timestamp: '2024-01-22 11:45:30',
    user: 'david.operator@silkroad.com',
    action: 'logout',
    entityType: 'Session',
    entityId: 'SES-2024-088',
    description: 'User logged out',
    ipAddress: '192.168.1.104',
  },
];

const columns: Column<AuditLogEntry>[] = [
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
    render: (value) => (
      <div className="flex items-center gap-2">
        <User className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{value}</span>
      </div>
    ),
  },
  {
    key: 'action',
    label: 'Action',
    sortable: true,
    render: (value) => {
      const colors = {
        create: 'bg-green-500/10 text-green-400',
        update: 'bg-blue-500/10 text-blue-400',
        delete: 'bg-red-500/10 text-red-400',
        view: 'bg-gray-500/10 text-gray-400',
        login: 'bg-purple-500/10 text-purple-400',
        logout: 'bg-orange-500/10 text-orange-400',
      };
      return (
        <Badge className={colors[value as keyof typeof colors]}>
          {value}
        </Badge>
      );
    },
  },
  {
    key: 'entityType',
    label: 'Entity Type',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span>{value}</span>
      </div>
    ),
  },
  {
    key: 'entityId',
    label: 'Entity ID',
    sortable: true,
    render: (value) => (
      <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
        {value}
      </code>
    ),
  },
  {
    key: 'description',
    label: 'Description',
    sortable: false,
    render: (value) => (
      <span className="text-muted-foreground truncate max-w-[200px] block">
        {value}
      </span>
    ),
  },
  {
    key: 'ipAddress',
    label: 'IP Address',
    sortable: true,
    render: (value) => (
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    ),
  },
];

export default function AuditLogPage() {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const handleSearch = (searchTerm: string) => {
    let filtered = logs;
    
    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedAction !== 'all') {
      filtered = filtered.filter((log) => log.action === selectedAction);
    }
    
    if (selectedUser !== 'all') {
      filtered = filtered.filter((log) => log.user === selectedUser);
    }
    
    setFilteredLogs(filtered);
  };

  const uniqueUsers = [...new Set(logs.map((l) => l.user))];
  const actionCounts = {
    create: logs.filter((l) => l.action === 'create').length,
    update: logs.filter((l) => l.action === 'update').length,
    delete: logs.filter((l) => l.action === 'delete').length,
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground text-base">
            Track system changes and user activities
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
              Entity Type
            </label>
            <Input placeholder="e.g., Invoice" className="bg-secondary/30" />
          </div>
          <div className="w-[150px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Entity ID
            </label>
            <Input placeholder="ID" className="bg-secondary/30" />
          </div>
          <div className="w-[150px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Action
            </label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              User
            </label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
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
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Entries</p>
          <p className="text-4xl font-bold text-foreground mt-3">{logs.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Audit records</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Creates</p>
          <p className="text-4xl font-bold text-green-400 mt-3">{actionCounts.create}</p>
          <p className="text-sm text-muted-foreground mt-2">New records</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Updates</p>
          <p className="text-4xl font-bold text-blue-400 mt-3">{actionCounts.update}</p>
          <p className="text-sm text-muted-foreground mt-2">Modifications</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Deletes</p>
          <p className="text-4xl font-bold text-red-400 mt-3">{actionCounts.delete}</p>
          <p className="text-sm text-muted-foreground mt-2">Removed records</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        title="Activity Log"
        description="View all system activities and changes"
        searchPlaceholder="Search by description, entity ID, or type..."
        onSearchChange={handleSearch}
      />
    </div>
  );
}
