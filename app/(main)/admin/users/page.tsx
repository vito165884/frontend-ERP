'use client';

import { useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  joinDate: string;
}

const mockUsers: User[] = [
  {
    id: 'USER-001',
    name: 'John Administrator',
    email: 'john.admin@silkroad.com',
    role: 'Administrator',
    status: 'active',
    lastLogin: '2024-01-20 10:30',
    joinDate: '2023-01-15',
  },
  {
    id: 'USER-002',
    name: 'Sarah Manager',
    email: 'sarah.manager@silkroad.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2024-01-20 09:15',
    joinDate: '2023-06-20',
  },
  {
    id: 'USER-003',
    name: 'Mike Sales',
    email: 'mike.sales@silkroad.com',
    role: 'Sales Representative',
    status: 'active',
    lastLogin: '2024-01-19 16:45',
    joinDate: '2023-09-10',
  },
  {
    id: 'USER-004',
    name: 'Emma Analyst',
    email: 'emma.analyst@silkroad.com',
    role: 'Analyst',
    status: 'active',
    lastLogin: '2024-01-20 11:20',
    joinDate: '2024-01-05',
  },
  {
    id: 'USER-005',
    name: 'David Operator',
    email: 'david.operator@silkroad.com',
    role: 'Operator',
    status: 'inactive',
    lastLogin: '2024-01-10 14:30',
    joinDate: '2023-12-01',
  },
];

const columns: Column<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    width: '180px',
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
  },
  {
    key: 'lastLogin',
    label: 'Last Login',
    sortable: true,
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const colors = {
        active: 'bg-green-500/10 text-green-600 dark:text-green-400',
        inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
        suspended: 'bg-red-500/10 text-red-600 dark:text-red-400',
      };
      return (
        <Badge className={colors[value as keyof typeof colors]}>
          {value}
        </Badge>
      );
    },
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);

  const handleSearch = (searchTerm: string) => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system users and their access permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold text-foreground mt-2">{users.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {users.filter((u) => u.status === 'active').length} active
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Administrators</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {users.filter((u) => u.role === 'Administrator').length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Full system access
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {users.filter((u) => u.status === 'active').length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Currently available
          </p>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        title="User List"
        description="Manage all system users and their permissions"
        searchPlaceholder="Search by name, email, or role..."
        onSearchChange={handleSearch}
        onAddClick={() => console.log('Add user')}
      />
    </div>
  );
}
