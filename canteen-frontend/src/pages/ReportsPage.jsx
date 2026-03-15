import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';

const COLORS = ['#f59e0b','#ef4444','#3b82f6','#10b981','#8b5cf6','#f97316'];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary]     = useState(null);
  const [daily, setDaily]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [topItems, setTopItems]   = useState([]);
  const [trend, setTrend]         = useState([]);

  const fetchAll = () => {
    const params = { from: dateFrom, to: dateTo };
    api.get('/reports/summary', { params }).then(r => setSummary(r.data));
    api.get('/reports/daily', { params: { days: 30 } }).then(r => setDaily(r.data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(d.revenue),
      orders: parseInt(d.order_count),
    }))));
    api.get('/reports/categories', { params }).then(r => setCategories(r.data.map(c => ({
      name: c.name, value: parseFloat(c.revenue),
    }))));
    api.get('/reports/top-items', { params: { ...params, limit: 10 } }).then(r => setTopItems(r.data));
    api.get('/reports/order-trend', { params: { days: 30 } }).then(r => setTrend(r.data.map(d => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      orders: parseInt(d.total_orders),
      completed: parseInt(d.completed),
    }))));
  };

  useEffect(() => { fetchAll(); }, []);

  const exportCSV = () => {
    if (!topItems.length) return;
    const csv = [
      ['Item', 'Units Sold', 'Revenue'],
      ...topItems.map(i => [i.name, i.total_qty, i.total_revenue]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = 'report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <button onClick={fetchAll}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition">
            Apply
          </button>
          <button onClick={exportCSV}
            className="px-4 py-2 border border-amber-400 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-50 transition">
            📥 Export CSV
          </button>
        </div>
      </div>

     
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₱${parseFloat(summary.total_revenue).toLocaleString()}`, icon: '💰', color: 'border-amber-400' },
            { label: 'Total Orders', value: summary.total_orders, icon: '📋', color: 'border-blue-400' },
            { label: 'Avg Order Value', value: `₱${parseFloat(summary.avg_order_value).toFixed(2)}`, icon: '🧾', color: 'border-green-400' },
            { label: "Today's Revenue", value: `₱${parseFloat(summary.today_revenue).toFixed(0)}`, icon: '📅', color: 'border-purple-400' },
          ].map(card => (
            <div key={card.label} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${card.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Daily Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => `₱${v.toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `₱${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Order Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={false} name="Total Orders" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Top 10 Best Sellers</h3>
          <div className="space-y-2 overflow-y-auto max-h-56">
            {topItems.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                  i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-500'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{item.name}</div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: `${Math.min(100, (item.total_qty / (topItems[0]?.total_qty || 1)) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-xs text-right shrink-0">
                  <div className="font-bold text-gray-800">{item.total_qty} sold</div>
                  <div className="text-amber-600">₱{parseFloat(item.total_revenue).toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
