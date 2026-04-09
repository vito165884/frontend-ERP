'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Users,
  Truck,
  Package,
  Receipt,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface QuickAccessItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  actions?: { label: string; href: string }[];
}

const quickAccessItems: QuickAccessItem[] = [
  {
    title: 'Delivery Notes',
    description: 'Manage shipments and deliveries',
    href: '/delivery-notes',
    icon: <Truck className="h-6 w-6" />,
    color: 'from-blue-600/20 to-blue-500/10',
    actions: [
      { label: 'View All', href: '/delivery-notes' },
      { label: 'Create New', href: '/delivery-notes/new' },
    ],
  },
  {
    title: 'Quotations',
    description: 'Create and manage quotes',
    href: '/quotations',
    icon: <ClipboardList className="h-6 w-6" />,
    color: 'from-blue-600/20 to-blue-500/10',
    actions: [
      { label: 'View All', href: '/quotations' },
      { label: 'Create New', href: '/quotations/new' },
    ],
  },
  {
    title: 'Invoices',
    description: 'Sales invoices and billing',
    href: '/invoices',
    icon: <FileText className="h-6 w-6" />,
    color: 'from-blue-600/20 to-blue-500/10',
    actions: [
      { label: 'View All', href: '/invoices' },
      { label: 'Create New', href: '/invoices/new' },
    ],
  },
  {
    title: 'Products',
    description: 'Product catalog and inventory',
    href: '/products',
    icon: <Package className="h-6 w-6" />,
    color: 'from-blue-600/20 to-blue-500/10',
    actions: [
      { label: 'View All', href: '/products' },
      { label: 'Add Product', href: '/products/new' },
    ],
  },
  {
    title: 'Customers',
    description: 'Customer accounts directory',
    href: '/customers',
    icon: <Users className="h-6 w-6" />,
    color: 'from-blue-600/20 to-blue-500/10',
    actions: [
      { label: 'View All', href: '/customers' },
      { label: 'Add Customer', href: '/customers/new' },
    ],
  },
  {
    title: 'Purchase Orders',
    description: 'Supplier orders and procurement',
    href: '/purchase-orders',
    icon: <ShoppingCart className="h-6 w-6" />,
    color: 'from-blue-600/20 to-blue-500/10',
    actions: [
      { label: 'View All', href: '/purchase-orders' },
      { label: 'Create Order', href: '/purchase-orders/new' },
    ],
  },
];

const secondaryItems = [
  {
    title: 'Customer Payments',
    description: 'Record and track payments',
    href: '/customer-payments',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: 'Receipt Notes',
    description: 'Goods receiving',
    href: '/receipt-notes',
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    title: 'Dashboard',
    description: 'KPIs and analytics',
    href: '/dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    description: 'System configuration',
    href: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function HomePage() {
  return (
    <div className="page-content bg-black">
      {/* Page Header */}
      <div className="page-header border-l-4 border-l-blue-500 pl-5">
        <h1 className="page-title">Welcome to Silk Road</h1>
        <p className="page-subtitle">
          Quick access to your most used features and tools
        </p>
      </div>

      {/* Primary Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quickAccessItems.map((item) => (
          <Card
            key={item.title}
            className={`card-interactive group relative overflow-hidden border-l-4 border-l-blue-500`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-40`} />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 group-hover:bg-blue-600/40 transition-colors">
                  {item.icon}
                </div>
                <Link
                  href={item.href}
                  className="text-blue-400 hover:text-blue-300 transition-colors group-hover:translate-x-1 transform duration-200"
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{item.description}</p>
              {item.actions && (
                <div className="flex gap-3">
                  {item.actions.map((action, idx) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                        idx === 0
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10'
                      }`}
                    >
                      {idx === 1 && <Plus className="h-3 w-3 inline mr-1" />}
                      {action.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary Quick Access */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 border-l-2 border-l-blue-500 pl-3">More Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="p-4 border-border hover:border-blue-500/50 hover:bg-blue-600/10 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6 border-border hover:border-blue-500/40 transition-colors">
          <h3 className="text-lg font-bold text-foreground mb-4 border-l-2 border-l-blue-500 pl-3">Recent Documents</h3>
          <div className="space-y-3">
            {[
              { type: 'Invoice', id: 'INV-2024-001', customer: 'Acme Corp', amount: '$15,000' },
              { type: 'Delivery Note', id: 'DN-2024-005', customer: 'Tech Solutions', amount: '$8,500' },
              { type: 'Quotation', id: 'QT-2024-012', customer: 'Global Industries', amount: '$22,000' },
            ].map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{doc.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} - {doc.customer}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground">{doc.amount}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-border hover:border-blue-500/40 transition-colors">
          <h3 className="text-lg font-bold text-foreground mb-4 border-l-2 border-l-blue-500 pl-3">Pending Tasks</h3>
          <div className="space-y-3">
            {[
              { task: '3 invoices pending validation', priority: 'high' },
              { task: '5 delivery notes to process', priority: 'medium' },
              { task: '2 quotations awaiting response', priority: 'low' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    item.priority === 'high'
                      ? 'bg-red-400'
                      : item.priority === 'medium'
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  }`}
                />
                <p className="text-sm text-muted-foreground">{item.task}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
