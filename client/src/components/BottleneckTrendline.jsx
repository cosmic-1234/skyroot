import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BottleneckTrendline({ inventoryData = [] }) {
  const monthMap = {};
  inventoryData.forEach(item => {
    const month = item.snapshot_date?.slice(0, 7) || 'unknown';
    if (!monthMap[month]) monthMap[month] = { month, items: [] };
    monthMap[month].items.push(item);
  });

  const matCounts = {};
  inventoryData.forEach(i => { matCounts[i.material_name] = (matCounts[i.material_name] || 0) + 1; });
  const topMaterials = Object.entries(matCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);

  const chartData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(entry => {
      const row = { month: entry.month };
      topMaterials.forEach(mat => {
        const item = entry.items.find(i => i.material_name === mat);
        row[mat] = item ? parseFloat(item.days_of_supply) : null;
      });
      return row;
    });

  const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-card/95 backdrop-blur-2xl border border-border rounded-xl p-3 shadow-2xl shadow-black/40">
        <p className="text-[10px] text-text-dim font-mono mb-2 font-light">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
              <span className="text-[11px] text-text-secondary truncate max-w-[180px]">{p.name}</span>
            </div>
            <span className="text-[11px] text-text-primary font-mono font-medium">{p.value?.toFixed(1)}d</span>
          </div>
        ))}
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <div className="h-52 flex items-center justify-center text-text-dim text-[13px]">
        No inventory data available
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
        {topMaterials.map((mat, i) => (
          <div key={mat} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[i] }} />
            <span className="text-[10px] text-text-dim truncate max-w-[160px] font-light">{mat}</span>
          </div>
        ))}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              {topMaterials.map((mat, i) => (
                <linearGradient key={mat} id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[i]} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={colors[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.05)" strokeDasharray="none" vertical={false} />
            <XAxis dataKey="month" stroke="#3e4c5e" fontSize={10} fontFamily="'JetBrains Mono'" tickLine={false} axisLine={false} />
            <YAxis stroke="#3e4c5e" fontSize={10} fontFamily="'JetBrains Mono'" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {topMaterials.map((mat, i) => (
              <Area key={mat} type="monotone" dataKey={mat} name={mat}
                stroke={colors[i]} fill={`url(#g-${i})`} strokeWidth={1.5}
                dot={false} activeDot={{ r: 3, fill: colors[i], strokeWidth: 0 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-text-dim mt-2">
        Materials below 15 days of supply enter the critical zone and may delay production.
      </p>
    </div>
  );
}
