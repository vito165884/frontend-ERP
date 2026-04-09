'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartCard } from '@/components/dashboard/chart-card';
import { TrendingUp, Download, Filter } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', sales: 45000, purchases: 32000, profit: 13000 },
  { month: 'Feb', sales: 52000, purchases: 38000, profit: 14000 },
  { month: 'Mar', sales: 48000, purchases: 35000, profit: 13000 },
  { month: 'Apr', sales: 61000, purchases: 42000, profit: 19000 },
  { month: 'May', sales: 55000, purchases: 38000, profit: 17000 },
  { month: 'Jun', sales: 67000, purchases: 45000, profit: 22000 },
];

const categoryData = [
  { name: 'Category A', sales: 32, purchases: 28, color: '#3b82f6' },
  { name: 'Category B', sales: 28, purchases: 22, color: '#10b981' },
  { name: 'Category C', sales: 22, purchases: 18, color: '#f59e0b' },
  { name: 'Category D', sales: 18, purchases: 14, color: '#8b5cf6' },
];

const profitMarginData = [
  { month: 'Jan', margin: 28.9 },
  { month: 'Feb', margin: 26.9 },
  { month: 'Mar', margin: 27.1 },
  { month: 'Apr', margin: 31.1 },
  { month: 'May', margin: 30.9 },
  { month: 'Jun', margin: 32.8 },
];

export default function RecapSalesPurchasesPage() {
  const totalSales = monthlyData.reduce((sum, m) => sum + m.sales, 0);
  const totalPurchases = monthlyData.reduce((sum, m) => sum + m.purchases, 0);
  const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);
  const avgProfitMargin = (
    (totalProfit / totalSales) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales & Purchases Recap</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of your sales and purchasing activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            ${totalSales.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400 text-sm">
            <TrendingUp className="h-4 w-4" />
            Up 12.5% from last period
          </div>
        </Card>

        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            ${totalPurchases.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400 text-sm">
            <TrendingUp className="h-4 w-4" />
            Up 8.2% from last period
          </div>
        </Card>

        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            ${totalProfit.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Net after all expenses
          </p>
        </Card>

        <Card className="p-6 border-border">
          <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {avgProfitMargin}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Average across period
          </p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Sales vs Purchases"
          description="Comparison of sales revenue and purchase costs"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="purchases" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Profit Trend"
          description="Monthly profit analysis and progression"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Sales by Category"
          description="Distribution of sales across product categories"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="purchases" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Profit Margin Trend"
          description="Percentage profit margin over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitMarginData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${Number(value).toFixed(1)}%`}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detailed Statistics */}
      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Period Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">Highest Sales Month</p>
            <p className="text-lg font-bold text-foreground mt-1">June</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              $67,000
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">Highest Profit Month</p>
            <p className="text-lg font-bold text-foreground mt-1">June</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              $22,000
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">Average Monthly Sales</p>
            <p className="text-lg font-bold text-foreground mt-1">
              ${(totalSales / monthlyData.length).toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across 6 months
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">Cost of Goods Sold</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {((totalPurchases / totalSales) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Of sales revenue
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
