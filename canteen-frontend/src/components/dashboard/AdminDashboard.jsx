import { useState, useEffect } from 'react';
import api from '../../services/api';
import SalesChart from './SalesChart';
import CategoryPieChart from './CategoryPieChart';
import OrderTrendChart from './OrderTrendChart';
import LowStockAlert from '../inventory/LowStockAlert';
import LoadingSpinner from '../common/LoadingSpinner';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary,    setSummary]    = useState(null);
  const [daily,      setDaily]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [trend,      setTrend]      = useState([]);
  const [topItems,   setTopItems]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/daily',      { params: { days: 14 } }),
      api.get('/reports/categories'),
      api.get('/reports/order-trend', { params: { days: 30 } }),
      api.get('/reports/top-items',   { params: { limit: 5 } }),
    ]).then(([s, d, c, t, ti]) => {
      setSummary(s.data);
      setDaily(d.data.map(row => ({
        date:    new Date(row.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(row.revenue),
        orders:  parseInt(row.order_count),
      })));
      setCategories(c.data.map(row => ({ name: row.name, value: parseFloat(row.revenue) })));
      setTrend(t.data.map(row => ({
        date:      new Date(row.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        total:     parseInt(row.total_orders),
        completed: parseInt(row.completed),
        cancelled: parseInt(row.cancelled),
      })));
      setTopItems(ti.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading dashboard..." />;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      
      <LowStockAlert />

     
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="💰" label="Today's Revenue"
            value={`₱${parseFloat(summary.today_revenue).toFixed(0)}`}
            sub="Today only"
            color="border-amber-400"
          />
          <StatCard
            icon="📋" label="Today's Orders"
            value={summary.today_orders}
            sub="Completed today"
            color="border-blue-400"
          />
          <StatCard
            icon="📊" label="Monthly Revenue"
            value={`₱${parseFloat(summary.total_revenue).toFixed(0)}`}
            sub={`${summary.total_orders} orders this month`}
            color="border-green-400"
          />
          <StatCard
            icon="🧾" label="Avg Order Value"
            value={`₱${parseFloat(summary.avg_order_value).toFixed(2)}`}
            sub="This month"
            color="border-purple-400"
          />
        </div>
      )}

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={daily} title="Daily Revenue (Last 14 Days)" />
        <CategoryPieChart data={categories} title="Sales by Category" />
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderTrendChart data={trend} title="Order Volume (Last 30 Days)" />

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Top 5 Best Sellers</h3>
          {topItems.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-300 text-sm">
              No sales data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-300'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.total_qty} sold</div>
                  </div>
                  <div className="text-sm font-bold text-amber-600">
                    ₱{parseFloat(item.total_revenue).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
