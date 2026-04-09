'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Briefcase,
  Package,
  Settings,
  ChevronDown,
  X,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Overview',
    icon: <LayoutDashboard className="h-5 w-5" />,
    children: [
      { label: 'Home', href: '/home', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Dashboard', href: '/dashboard', icon: <TrendingUp className="h-4 w-4" /> },
      { label: 'Recap Sales & Purchases', href: '/recap-sales-purchases', icon: <TrendingUp className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Clients',
    icon: <Users className="h-5 w-5" />,
    children: [
      { label: 'Accounts', href: '/customers', icon: <Users className="h-4 w-4" /> },
      // Invoices (match Razor menu)
      { label: 'Manage invoices', href: '/manage-invoice', icon: <Users className="h-4 w-4" /> },
      { label: 'Invoices list', href: '/invoices', icon: <Users className="h-4 w-4" /> },
      { label: 'Advanced invoice list', href: '/invoices-advanced', icon: <Users className="h-4 w-4" /> },
      { label: 'Delivery Notes', href: '/delivery-notes', icon: <Truck className="h-4 w-4" /> },
      { label: 'Quotations', href: '/quotations', icon: <Users className="h-4 w-4" /> },
      { label: 'Credit Notes', href: '/credit-notes', icon: <Users className="h-4 w-4" /> },
      { label: 'Manage credit notes', href: '/manage-credit-notes', icon: <Users className="h-4 w-4" /> },
      { label: 'Payments', href: '/customer-payments', icon: <Users className="h-4 w-4" /> },
      { label: 'Customer Balances', href: '/customer-balances', icon: <Users className="h-4 w-4" /> },
      { label: 'Clients with balance issues', href: '/client-balance-issues', icon: <AlertTriangle className="h-4 w-4" /> },
      { label: 'Cash Register Close', href: '/cash-register', icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Providers',
    icon: <Briefcase className="h-5 w-5" />,
    children: [
      { label: 'Accounts', href: '/suppliers', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Manage supplier invoices', href: '/supplier-invoices', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Advanced supplier invoice list', href: '/supplier-invoices-advanced', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Supplier financial credit notes', href: '/supplier-financial-credit-notes', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Purchase order', href: '/purchase-order', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Orders list', href: '/purchase-orders', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Receipt notes list', href: '/receipt-notes', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Manage provider credit notes', href: '/manage-provider-credit-notes', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Supplier Credit Notes', href: '/supplier-credit-notes', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Supplier credit invoices', href: '/supplier-credit-invoices', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Manage supplier credit invoices', href: '/manage-supplier-credit-invoices', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Supplier Returns', href: '/supplier-returns', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Payments', href: '/supplier-payments', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Supplier Balances', href: '/supplier-balances', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Suppliers with balance issues', href: '/supplier-balance-issues', icon: <AlertTriangle className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Expenses',
    icon: <Briefcase className="h-5 w-5" />,
    children: [
      { label: 'Expense Vendors', href: '/expense-vendors', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Expense Invoices', href: '/expense-invoices', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Expense Payments', href: '/expense-payments', icon: <Briefcase className="h-4 w-4" /> },
      { label: 'Expense Balances', href: '/expense-balances', icon: <Briefcase className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Stock',
    icon: <Package className="h-5 w-5" />,
    children: [
      { label: 'Products', href: '/products', icon: <Package className="h-4 w-4" /> },
      { label: 'Product Families', href: '/product-families', icon: <Package className="h-4 w-4" /> },
      { label: 'Product Sub-families', href: '/product-subfamilies', icon: <Package className="h-4 w-4" /> },
      { label: 'Inventory', href: '/inventory', icon: <Package className="h-4 w-4" /> },
      { label: 'Technicians', href: '/technicians', icon: <Package className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Banking',
    icon: <Settings className="h-5 w-5" />,
    children: [
      { label: 'Banks', href: '/banks', icon: <Settings className="h-4 w-4" /> },
      { label: 'Bank Accounts', href: '/bank-accounts', icon: <Settings className="h-4 w-4" /> },
      { label: 'Bank Statements', href: '/bank-statements', icon: <Settings className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Administration',
    icon: <Settings className="h-5 w-5" />,
    children: [
      { label: 'Users', href: '/admin/users', icon: <Settings className="h-4 w-4" /> },
      { label: 'Roles', href: '/admin/roles', icon: <Settings className="h-4 w-4" /> },
      { label: 'Accounting Years', href: '/admin/accounting-years', icon: <Settings className="h-4 w-4" /> },
      { label: 'Parameters', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
      { label: 'Audit Log', href: '/admin/audit-log', icon: <Settings className="h-4 w-4" /> },
      { label: 'Print History', href: '/admin/print-history', icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  // Expand Clients by default so invoice/delivery-note links are visible without extra clicks.
  const [expandedItems, setExpandedItems] = useState<string[]>(['Overview', 'Clients', 'Providers']);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    // Exact match, or nested route match (e.g. /customers/123 should keep /customers active).
    // Avoid false positives like /invoices matching /invoices-advanced.
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'glass-sm fixed left-0 top-16 bottom-0 w-64 overflow-y-auto transition-all duration-300 lg:static lg:top-0 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-5 space-y-1">
          <div className="flex justify-between items-center lg:hidden mb-4">
            <h2 className="font-bold text-sidebar-foreground text-xs tracking-wide uppercase">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {menuItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => toggleExpanded(item.label)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg',
                  expandedItems.includes(item.label)
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                    : 'text-gray-400 hover:text-foreground hover:bg-white/8 hover:border-white/10 border border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-5 w-5 transition-all duration-200',
                    expandedItems.includes(item.label) ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                {item.children && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-300 text-muted-foreground',
                      expandedItems.includes(item.label) && 'rotate-180'
                    )}
                  />
                )}
              </button>

              {expandedItems.includes(item.label) && item.children && (
                <div className="space-y-1 mt-2 pb-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href || '#'}
                      onClick={onClose}
                      className={cn(
                        'block px-3 py-1.5 text-xs transition-all duration-200 ml-6 border-l-2 pl-3 rounded-r-lg font-medium',
                        isActive(child.href)
                          ? 'text-blue-400 border-l-blue-500 bg-blue-500/10 hover:bg-blue-500/15'
                          : 'text-gray-500 hover:text-gray-300 border-l-gray-600 hover:bg-white/5 hover:border-l-gray-500'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
