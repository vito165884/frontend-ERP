'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: number;
  isActive: boolean;
}

const mockRoles: Role[] = [
  {
    id: 'ROLE-001',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    userCount: 1,
    permissions: 45,
    isActive: true,
  },
  {
    id: 'ROLE-002',
    name: 'Manager',
    description: 'Can manage departments, users, and reports',
    userCount: 3,
    permissions: 32,
    isActive: true,
  },
  {
    id: 'ROLE-003',
    name: 'Sales Representative',
    description: 'Can view and manage customer information and invoices',
    userCount: 8,
    permissions: 18,
    isActive: true,
  },
  {
    id: 'ROLE-004',
    name: 'Analyst',
    description: 'Can view reports and analytics',
    userCount: 2,
    permissions: 12,
    isActive: true,
  },
  {
    id: 'ROLE-005',
    name: 'Operator',
    description: 'Can perform basic operations and data entry',
    userCount: 5,
    permissions: 8,
    isActive: false,
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground mt-2">
            Define user roles and manage their permissions.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
          <p className="text-3xl font-bold text-foreground mt-2">{roles.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {roles.filter((r) => r.isActive).length} active roles
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {roles.reduce((sum, r) => sum + r.userCount, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Across all roles
          </p>
        </Card>
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {roles.filter((r) => r.isActive).length}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            In current use
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="border-border">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {role.name}
                    </h3>
                    <Badge
                      className={
                        role.isActive
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                      }
                    >
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {role.description}
                  </p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Users</p>
                      <p className="font-semibold text-foreground">
                        {role.userCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Permissions</p>
                      <p className="font-semibold text-foreground">
                        {role.permissions}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
