import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const materialImages = [
  { name: 'Inconel 718', short: 'Inconel 718', img: '/images/inconel.png' },
  { name: 'HTPB Solid', short: 'HTPB Solid', img: null },
  { name: 'IMU Sensor', short: 'IMU Sensor', img: null },
  { name: 'Ti-6Al-4V', short: 'Ti-6Al-4V', img: null },
  { name: 'Carbon Fiber', short: 'Carbon Fiber', img: '/images/carbon_fiber.png' },
];

export default function MaterialInventory({ inventoryData = [] }) {
  const latest = {};
  inventoryData.forEach(item => {
    const key = item.material_name;
    if (!latest[key] || item.snapshot_date > latest[key].snapshot_date) {
      latest[key] = item;
    }
  });

  const chartData = Object.values(latest)
    .sort((a, b) => parseFloat(a.days_of_supply) - parseFloat(b.days_of_supply))
    .slice(0, 5)
    .map(item => ({
      name: item.material_name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
      fullName: item.material_name,
      dos: parseFloat(item.days_of_supply) || 0,
    }));

  const getBarColor = (dos) => {
    if (dos <= 5) return '#f87171';
    if (dos <= 10) return '#fb923c';
    if (dos <= 15) return '#fbbf24';
    return '#38bdf8';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-2xl shadow-black/40">
        <p className="text-[11px] font-medium text-text-primary">{d.fullName}</p>
        <p className="text-[10px] text-text-muted mt-1 font-light">Days of supply: <span className="font-mono font-semibold text-text-primary">{d.dos.toFixed(1)}</span></p>
      </div>
    );
  };

  return (
    <div>
      {/* Horizontal bar chart — cleaner than vertical */}
      <div className="space-y-2.5 mb-5">
        {chartData.map((d, i) => {
          const max = Math.max(...chartData.map(c => c.dos), 1);
          const pct = (d.dos / max) * 100;
          const color = getBarColor(d.dos);
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-secondary font-medium truncate">{d.name}</span>
                <span className="text-[10px] font-mono font-semibold shrink-0 ml-2" style={{ color }}>{d.dos.toFixed(1)}d</span>
              </div>
              <div className="h-[6px] rounded-full bg-bg-hover overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Material thumbnails — refined grid */}
      <div className="grid grid-cols-5 gap-2">
        {materialImages.map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-bg-surface flex items-center justify-center">
              {m.img ? (
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{
                  background: `radial-gradient(circle at 35% 35%, ${['#64748b','#78716c','#6b7280','#737373','#64748b'][i]}40, ${['#1e293b','#292524','#1f2937','#262626','#1e293b'][i]})`
                }} />
              )}
            </div>
            <span className="text-[7px] text-text-dim text-center leading-tight font-light">{m.short}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
