import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f97316'];

/**
 * CategoryPieChart — Pie chart showing revenue distribution by food category.
 *
 * Props:
 *   data  — array of { name: string, value: number }
 *   title — optional heading override
 */
export default function CategoryPieChart({ data = [], title = 'Sales by Category' }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[220px] text-gray-300 text-sm">
          No category data yet
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={75}
            innerRadius={35}
            paddingAngle={3}
            label={({ name, percent }) =>
              percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`₱${parseFloat(v).toFixed(2)}`, name]}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 && (
        <p className="text-center text-xs text-gray-400 mt-1">
          Total: ₱{total.toFixed(2)}
        </p>
      )}
    </div>
  );
}
