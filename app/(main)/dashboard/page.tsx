'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const salesData = [
  { month: 'Jan', sales: 45000, purchases: 32000, target: 50000 },
  { month: 'Feb', sales: 52000, purchases: 38000, target: 50000 },
  { month: 'Mar', sales: 48000, purchases: 35000, target: 50000 },
  { month: 'Apr', sales: 61000, purchases: 42000, target: 50000 },
  { month: 'May', sales: 55000, purchases: 38000, target: 50000 },
  { month: 'Jun', sales: 67000, purchases: 45000, target: 50000 },
];

const productData = [
  { name: 'Product A', value: 35, color: '#3b82f6' },
  { name: 'Product B', value: 28, color: '#60a5fa' },
  { name: 'Product C', value: 20, color: '#93c5fd' },
  { name: 'Product D', value: 17, color: '#bfdbfe' },
];

const customerData = [
  { name: 'Enterprise', value: 42, color: '#3b82f6' },
  { name: 'SMB', value: 38, color: '#60a5fa' },
  { name: 'Startup', value: 20, color: '#93c5fd' },
];

const recentTransactions = [
  { id: 'INV-001', customer: 'Acme Corp', amount: 15000, date: '2024-01-15', status: 'Completed' },
  { id: 'INV-002', customer: 'Tech Solutions', amount: 8500, date: '2024-01-14', status: 'Completed' },
  { id: 'INV-003', customer: 'Global Industries', amount: 22000, date: '2024-01-13', status: 'Pending' },
  { id: 'INV-004', customer: 'Innovation Labs', amount: 5300, date: '2024-01-12', status: 'Completed' },
  { id: 'INV-005', customer: 'Future Dynamics', amount: 12800, date: '2024-01-11', status: 'Pending' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8 bg-black">
      {/* Page Header */}
      <div className="space-y-3 border-l-4 border-l-blue-500 pl-5">
        <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 text-sm font-medium">
          Monitor your business metrics and key performance indicators in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <KPICard
          title="Total Revenue"
          value="$328,000"
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 12.5, direction: 'up', label: 'from last month' }}
          color="blue"
        />
        <KPICard
          title="Total Purchases"
          value="$230,000"
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={{ value: 8.2, direction: 'up', label: 'from last month' }}
          color="orange"
        />
        <KPICard
          title="Active Customers"
          value="234"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 5.1, direction: 'up', label: 'from last month' }}
          color="green"
        />
        <KPICard
          title="Products in Stock"
          value="1,240"
          icon={<Package className="h-6 w-6" />}
          trend={{ value: 2.3, direction: 'down', label: 'from last month' }}
          color="red"
        />
        <KPICard
          title="Monthly Growth"
          value="8.5%"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 1.2, direction: 'up', label: 'vs last month' }}
          color="blue"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Sales vs Purchases"
            description="Monthly comparison of sales and purchase trends"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  animationDuration={1000}
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPurchases)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="Sales by Product"
            description="Distribution of sales volume"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Monthly Revenue Trend"
          description="Revenue progression over the year"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Customer Segments"
          description="Distribution by customer type"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" />
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#ffffff" radius={[0, 8, 8, 0]}>
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
              <p className="text-base text-muted-foreground mt-1.5">Latest invoices and transactions</p>
            </div>
            <Button variant="outline" className="border-border hover:bg-secondary">View All</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Invoice</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition-all duration-200">
                    <td className="px-5 py-4 font-semibold text-foreground text-sm">{tx.id}</td>
                    <td className="px-5 py-4 text-muted-foreground text-base">{tx.customer}</td>
                    <td className="px-5 py-4 text-right font-bold text-foreground text-base">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-base">{tx.date}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-md text-xs font-bold ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-400/20 text-emerald-300'
                            : 'bg-yellow-400/20 text-yellow-300'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
