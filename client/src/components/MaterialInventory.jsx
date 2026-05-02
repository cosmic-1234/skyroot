import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const materialImages = [
  { name: 'Inconel 718', short: 'Inconel 718\nnickel alloy etched', img: '/images/inconel.png' },
  { name: 'HTPB Solid', short: 'HTPB Solid\nPropellant', img: null },
  { name: 'IMU Sensor', short: 'IMU Sensor\nUnit', img: null },
  { name: 'Ti-6Al-4V', short: 'Ti-6Al-4V\nBillet', img: null },
  { name: 'Carbon Fiber', short: 'Carbon Fiber\nComposite', img: '/images/carbon_fiber.png' },
];

export default function MaterialInventory({ inventoryData = [] }) {
  // Get latest snapshot per material
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
    if (dos <= 5) return '#ef4444';
    if (dos <= 10) return '#f97316';
    if (dos <= 15) return '#eab308';
    return '#3b82f6';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-bg-elevated border border-border rounded-lg p-3 shadow-xl">
        <p className="text-[12px] font-medium text-text-primary">{d.fullName}</p>
        <p className="text-[11px] text-text-muted mt-1">Days of supply: <span className="font-mono font-semibold text-text-primary">{d.dos.toFixed(1)}</span></p>
      </div>
    );
  };

  return (
    <div>
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
            <CartesianGrid stroke="rgba(30,41,59,0.5)" vertical={false} />
            <XAxis dataKey="name" stroke="#475569" fontSize={9} fontFamily="'Inter'" tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={10} fontFamily="'JetBrains Mono'" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
            <Bar dataKey="dos" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.dos)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Material images row */}
      <div className="flex items-start gap-2 justify-center">
        {materialImages.map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 w-[60px]">
            <div className="w-[48px] h-[48px] rounded-full overflow-hidden border border-border bg-bg-elevated flex items-center justify-center">
              {m.img ? (
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full" style={{
                  background: `radial-gradient(circle at 35% 35%, ${['#94a3b8','#78716c','#a3a3a3','#737373','#6b7280'][i]}, ${['#334155','#44403c','#525252','#404040','#374151'][i]})`
                }} />
              )}
            </div>
            <span className="text-[8px] text-text-muted text-center leading-tight whitespace-pre-line">{m.short}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
