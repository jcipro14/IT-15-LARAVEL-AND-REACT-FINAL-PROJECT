import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';


export default function SalesChart({ data = [], title = 'Daily Revenue' }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">
          No sales data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${v}`} />
          <Tooltip
            formatter={(v, name) => [
              name === 'revenue' ? `₱${parseFloat(v).toFixed(2)}` : v,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
          />
          <Bar dataKey="revenue" name="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
