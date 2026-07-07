import React from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { Tab } from '../types.ts';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { 
  DollarSign, TrendingUp, Clock, FileText, CheckCircle, Package, 
  ArrowUpRight, ShoppingCart, ShieldAlert, FolderOpen, Plus 
} from 'lucide-react';

interface DashboardProps {
  onNavigateToTab: (tab: Tab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  const { order, recentOrders, savedDocuments, customer, companyInfo, currencySymbol, currencyCode, formatCurrency } = useData();

  // Financial metrics
  const totalRevenue = order.total + recentOrders.length * 1250;
  const totalPaid = order.amountPaid + recentOrders.length * 1250;
  const outstandingDue = order.amountDue;
  const totalDocsCount = savedDocuments.length;

  // Chart Data: Spending & Revenue Timeline
  const monthlyData = [
    { month: 'Apr', spending: 1450, orders: 1 },
    { month: 'May', spending: 890, orders: 2 },
    { month: 'Jun', spending: 2100, orders: 3 },
    { month: 'Jul', spending: 1750, orders: 2 },
    { month: 'Aug', spending: 185.00, orders: 1 },
    { month: 'Sep', spending: order.total || 2000, orders: 2 }
  ];

  // Chart Data: Order Status Breakdown
  const statusCounts = {
    Confirmed: 1,
    Delivered: 1,
    Pending: order.amountDue > 0 ? 1 : 0,
    Shipped: 0
  };
  
  recentOrders.forEach(r => {
    statusCounts[r.status as keyof typeof statusCounts] = (statusCounts[r.status as keyof typeof statusCounts] || 0) + 1;
  });

  const pieData = [
    { name: 'Confirmed', value: statusCounts.Confirmed || 1, color: '#3b82f6' },
    { name: 'Delivered', value: statusCounts.Delivered || 1, color: '#10b981' },
    { name: 'Pending / Due', value: statusCounts.Pending || 1, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/30 dark:bg-slate-700 px-3 py-1 rounded-full border border-blue-400/30">
            Active Profile: {companyInfo.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3">
            Financial & Order Analytics
          </h1>
          <p className="text-blue-100 dark:text-gray-400 text-sm mt-1 max-w-xl">
            Real-time insights into your furniture orders, payment schedules, spending trends, and archived documents.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigateToTab(Tab.INVOICE)}
            className="px-4 py-2.5 bg-white text-blue-700 dark:bg-slate-700 dark:text-white font-semibold rounded-xl text-sm shadow hover:bg-blue-50 dark:hover:bg-slate-600 transition inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> View Current Invoice
          </button>
          <button
            onClick={() => onNavigateToTab(Tab.DOCUMENTS)}
            className="px-4 py-2.5 bg-blue-700/60 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-xl text-sm border border-blue-400/30 transition inline-flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" /> Open Vault ({totalDocsCount})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Order Spending
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs previous quarter
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Amount Paid
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalPaid)}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Across {recentOrders.length + 1} active orders
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Outstanding Balance Due
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-4 text-2xl font-bold ${outstandingDue > 0 ? 'text-amber-600 dark:text-amber-400 font-mono' : 'text-gray-900 dark:text-white'}`}>
            {formatCurrency(outstandingDue)}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {outstandingDue > 0 ? `Due by ${order.dueDate}` : 'Fully settled'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Archived Documents
            </span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {totalDocsCount} <span className="text-sm font-normal text-gray-400">saved</span>
          </div>
          <button
            onClick={() => onNavigateToTab(Tab.DOCUMENTS)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Search Vault <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Monthly Spending & Order Value ({currencySymbol})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Expenditure trends over the past 6 months
              </p>
            </div>
            <span className="text-xs font-semibold bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-slate-700">
              2026 Season
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  formatter={(val: any) => [`${formatCurrency(Number(val))}`, 'Spending']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="spending" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Order Status Summary
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Distribution of recent furniture orders
            </p>
          </div>
          <div className="h-60 w-full flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Active profile order history up to date
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Timeline Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Order Activity & Timelines
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Latest order events and production updates for {customer.name}
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab(Tab.CONFIRMATION)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Open Active Order <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                ORD
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {order.orderNumber} - {order.items[0]?.description || 'Custom Sofa Order'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ordered on {order.date} • Status: <span className="font-semibold text-blue-600 dark:text-blue-400">{order.status}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(order.total)}
              </p>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Paid: {formatCurrency(order.amountPaid, 0)}
              </span>
            </div>
          </div>

          {recentOrders.map(ro => (
            <div key={ro.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs">
                  REC
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {ro.orderNumber} - {ro.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ordered on {ro.date} • Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{ro.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(1250)}
                </p>
                <span className="text-[11px] font-medium text-gray-400">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
