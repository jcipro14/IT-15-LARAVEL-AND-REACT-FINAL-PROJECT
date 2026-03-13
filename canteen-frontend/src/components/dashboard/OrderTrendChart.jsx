import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

/**
 * OrderTrendChart — Line chart showing order volume over the last N days.
 *
 * Props:
 *   data  — array of { date: string, total: number, completed: number, cancelled: number }
 *   title — optional heading override
 */
export default function OrderTrendChart({ data = [], title = 'Order Volume Trend' }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">
          No trend data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip />
          <Legend
            formatter={(value) => (
              <span className="text-xs capitalize text-gray-600">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="total"
            stroke="#6b7280"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="completed"
            name="completed"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="cancelled"
            name="cancelled"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
