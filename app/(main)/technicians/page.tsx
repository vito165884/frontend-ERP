'use client';

import { useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Wrench, Phone, Mail } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  status: 'available' | 'busy' | 'off-duty';
  specialization: string;
  completedJobs: number;
  rating: number;
}

const mockTechnicians: Technician[] = [
  {
    id: 'TECH-001',
    name: 'John Smith',
    email: 'john.smith@silkroad.com',
    phone: '+1-555-0401',
    phone2: '+1-555-0402',
    status: 'available',
    specialization: 'HVAC Installation',
    completedJobs: 156,
    rating: 4.8,
  },
  {
    id: 'TECH-002',
    name: 'Maria Garcia',
    email: 'maria.garcia@silkroad.com',
    phone: '+1-555-0403',
    status: 'busy',
    specialization: 'Electrical Systems',
    completedJobs: 203,
    rating: 4.9,
  },
  {
    id: 'TECH-003',
    name: 'David Chen',
    email: 'david.chen@silkroad.com',
    phone: '+1-555-0404',
    phone2: '+1-555-0405',
    status: 'available',
    specialization: 'Plumbing',
    completedJobs: 89,
    rating: 4.6,
  },
  {
    id: 'TECH-004',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@silkroad.com',
    phone: '+1-555-0406',
    status: 'off-duty',
    specialization: 'General Maintenance',
    completedJobs: 245,
    rating: 4.7,
  },
  {
    id: 'TECH-005',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@silkroad.com',
    phone: '+1-555-0407',
    status: 'available',
    specialization: 'IT Equipment',
    completedJobs: 112,
    rating: 4.5,
  },
];

const columns: Column<Technician>[] = [
  {
    key: 'name',
    label: 'Technician',
    sortable: true,
    width: '200px',
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-white/10 text-foreground text-sm">
            {String(value).split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{row.specialization}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Mail className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{value}</span>
      </div>
    ),
  },
  {
    key: 'phone',
    label: 'Phone',
    sortable: false,
    render: (value, row) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
        {row.phone2 && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{row.phone2}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'completedJobs',
    label: 'Jobs',
    sortable: true,
    render: (value) => (
      <span className="font-semibold text-foreground">{value}</span>
    ),
  },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-1">
        <span className="font-semibold text-foreground">{value}</span>
        <span className="text-yellow-400">★</span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const colors = {
        available: 'bg-green-500/10 text-green-400',
        busy: 'bg-yellow-500/10 text-yellow-400',
        'off-duty': 'bg-gray-500/10 text-gray-400',
      };
      return (
        <Badge className={colors[value as keyof typeof colors]}>
          {value}
        </Badge>
      );
    },
  },
];

export default function TechniciansPage() {
  const [technicians] = useState<Technician[]>(mockTechnicians);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>(mockTechnicians);

  const handleSearch = (searchTerm: string) => {
    const filtered = technicians.filter((tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTechnicians(filtered);
  };

  const availableCount = technicians.filter((t) => t.status === 'available').length;
  const busyCount = technicians.filter((t) => t.status === 'busy').length;
  const totalJobs = technicians.reduce((sum, t) => sum + t.completedJobs, 0);
  const avgRating = (technicians.reduce((sum, t) => sum + t.rating, 0) / technicians.length).toFixed(1);

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Installation Technicians</h1>
        <p className="text-muted-foreground text-base">
          Manage technicians for delivery and installation operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Technicians</p>
          <p className="text-4xl font-bold text-foreground mt-3">{technicians.length}</p>
          <p className="text-sm text-muted-foreground mt-2">In the team</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Available</p>
          <p className="text-4xl font-bold text-green-400 mt-3">{availableCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Ready for assignment</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Completed Jobs</p>
          <p className="text-4xl font-bold text-foreground mt-3">{totalJobs}</p>
          <p className="text-sm text-muted-foreground mt-2">Total installations</p>
        </Card>
        <Card className="p-6 border-border hover:border-white/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Avg Rating</p>
          <div className="flex items-center gap-2 mt-3">
            <p className="text-4xl font-bold text-foreground">{avgRating}</p>
            <span className="text-2xl text-yellow-400">★</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Customer satisfaction</p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredTechnicians}
        title="Technician List"
        description="View and manage all installation technicians"
        searchPlaceholder="Search by name, email, or specialization..."
        onSearchChange={handleSearch}
        onAddClick={() => console.log('Add technician')}
      />
    </div>
  );
}
