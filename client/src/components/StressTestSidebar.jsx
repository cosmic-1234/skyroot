import { useState } from 'react';
import { postSimulate } from '../api/client';
import { Zap, Factory, TrendingUp, Rocket, Loader2, ChevronDown, ChevronUp, AlertTriangle, DollarSign, Clock, Package } from 'lucide-react';

// Detailed material breakdown for demo mode
const DEMO_MATERIALS = [
  { name: 'Star Tracker Sensor', category: 'Avionics', criticality: 'Critical', cost_per_unit: 62000, safety_stock: 2, lead_time: 56 },
  { name: 'Payload Fairing Half-Shell', category: 'Structural', criticality: 'Critical', cost_per_unit: 55000, safety_stock: 2, lead_time: 42 },
  { name: 'IMU (Inertial Measurement Unit)', category: 'Avionics', criticality: 'Critical', cost_per_unit: 45000, safety_stock: 3, lead_time: 42 },
  { name: 'Interstage Adapter Ring', category: 'Structural', criticality: 'Critical', cost_per_unit: 42000, safety_stock: 2, lead_time: 35 },
  { name: 'COPV Helium Tank', category: 'Fluid', criticality: 'Critical', cost_per_unit: 38000, safety_stock: 3, lead_time: 35 },
  { name: 'Nozzle Extension Segment', category: 'Propulsion', criticality: 'Critical', cost_per_unit: 35000, safety_stock: 3, lead_time: 42 },
  { name: 'Composite Overwrap Tank', category: 'Structural', criticality: 'Critical', cost_per_unit: 32000, safety_stock: 3, lead_time: 35 },
  { name: 'Flight Computer Board', category: 'Avionics', criticality: 'Critical', cost_per_unit: 32000, safety_stock: 4, lead_time: 28 },
  { name: 'Turbopump Impeller Casting', category: 'Propulsion', criticality: 'Critical', cost_per_unit: 28000, safety_stock: 4, lead_time: 42 },
  { name: 'Aft Skirt Structure', category: 'Structural', criticality: 'High', cost_per_unit: 28000, safety_stock: 2, lead_time: 28 },
];

export default function StressTestSidebar() {
  const [scenario, setScenario] = useState('supplier_failure');
  const [severity, setSeverity] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setShowDetails(false);
    const sevFactor = severity / 100;
    try {
      const data = await postSimulate({ scenario, severity_percent: severity });
      setResult(data);
    } catch {
      // Generate detailed demo breakdown
      const affected = DEMO_MATERIALS.map(m => ({
        name: m.name,
        category: m.category,
        criticality: m.criticality,
        cost_per_unit: m.cost_per_unit,
        safety_stock: m.safety_stock,
        lead_time_days: m.lead_time,
        delay_days: scenario === 'supplier_failure' ? Math.ceil(m.lead_time * (1 + sevFactor)) : 0,
        cost_impact: Math.round(m.cost_per_unit * m.safety_stock * sevFactor),
      }));
      const totalCost = affected.reduce((s, a) => s + a.cost_impact, 0);
      const overhead = scenario === 'supplier_failure' ? Math.round(15000000 * sevFactor * 0.1) : 0;
      const totalVariance = scenario === 'demand_spike'
        ? Math.round(15000000 * sevFactor * 0.35)
        : totalCost + overhead;
      const maxDelay = scenario === 'price_surge'
        ? 0
        : scenario === 'demand_spike'
          ? Math.ceil(severity / 3)
          : Math.max(...affected.map(a => a.delay_days));

      setResult({
        scenario, severity_percent: severity,
        projected_cost_to_orbit_variance_usd: totalVariance,
        max_delay_days: maxDelay,
        system_overhead: overhead,
        affected_materials: affected,
        base_cost_to_orbit: 15000000,
        projected_cost_to_orbit: 15000000 + totalVariance,
        note: 'Demo mode — backend not connected',
      });
    }
    setLoading(false);
  };

  const scenarios = [
    { value: 'supplier_failure', label: 'Supplier Failure', icon: Factory },
    { value: 'price_surge', label: 'Price Surge', icon: TrendingUp },
    { value: 'demand_spike', label: 'Production Ramp-up (1/yr → 1/mo)', icon: Rocket },
  ];

  const fmt = (n) => n ? `$${(n / 1_000_000).toFixed(2)}M` : '—';
  const fmtK = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  return (
    <div className="card">
      <div className="card-inner p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={13} className="text-blue" />
          <h3 className="text-[12px] font-semibold text-text-primary">Stress Test</h3>
        </div>

        <div className="space-y-1 mb-4">
          {scenarios.map(s => {
            const Icon = s.icon;
            const active = scenario === s.value;
            return (
              <button key={s.value} onClick={() => setScenario(s.value)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-medium transition-all
                  ${active
                    ? 'bg-blue/10 text-blue border border-blue/25'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent'}`}>
                <Icon size={12} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-text-muted">Severity</span>
            <span className="text-[11px] font-mono font-semibold text-text-primary">{severity}%</span>
          </div>
          <div className="relative">
            <input type="range" min="5" max="100" step="5" value={severity}
              onChange={e => setSeverity(Number(e.target.value))}
              className="w-full h-1 bg-bg-base rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-bg-base [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue/30" />
          </div>
        </div>

        <button onClick={handleRun} disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue to-cyan text-white text-[11px] font-semibold
            transition-all hover:shadow-md hover:shadow-blue/20 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={12} className="animate-spin" /> Running...</> : 'Run Simulation'}
        </button>

        {result && (
          <div className="mt-3 space-y-2">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-bg-base/60 border border-border p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign size={10} className="text-yellow" />
                  <p className="text-[9px] text-text-dim uppercase tracking-wider">Cost Variance</p>
                </div>
                <p className="text-[15px] font-bold text-yellow font-mono">+{fmt(result.projected_cost_to_orbit_variance_usd)}</p>
              </div>
              <div className="rounded-lg bg-bg-base/60 border border-border p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={10} className="text-red" />
                  <p className="text-[9px] text-text-dim uppercase tracking-wider">Max Delay</p>
                </div>
                <p className="text-[15px] font-bold text-red font-mono">{result.max_delay_days || 0}d</p>
              </div>
            </div>

            {/* Projected total */}
            {result.projected_cost_to_orbit && (
              <div className="rounded-lg bg-bg-base/60 border border-border p-2.5">
                <p className="text-[9px] text-text-dim uppercase tracking-wider mb-0.5">Projected Cost-to-Orbit</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-bold text-text-primary font-mono">{fmt(result.projected_cost_to_orbit)}</span>
                  <span className="text-[10px] text-text-dim font-mono">from {fmt(result.base_cost_to_orbit)} base</span>
                </div>
              </div>
            )}

            {/* View Details toggle */}
            {result.affected_materials?.length > 0 && (
              <button onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium text-blue hover:bg-blue/5 transition-colors border border-blue/15">
                <Package size={10} />
                {showDetails ? 'Hide' : 'View'} Material Breakdown ({result.affected_materials.length})
                {showDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}

            {/* Detailed material breakdown */}
            {showDetails && result.affected_materials && (
              <div className="rounded-lg bg-bg-base/60 border border-border overflow-hidden">
                <div className="px-2.5 py-2 border-b border-border bg-bg-card/50">
                  <div className="grid grid-cols-12 text-[8px] text-text-dim uppercase tracking-wider font-semibold">
                    <span className="col-span-5">Material</span>
                    <span className="col-span-2 text-right">Unit $</span>
                    <span className="col-span-2 text-right">Impact</span>
                    <span className="col-span-3 text-right">Delay</span>
                  </div>
                </div>
                <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                  {result.affected_materials.map((m, i) => (
                    <div key={i} className={`px-2.5 py-1.5 grid grid-cols-12 items-center gap-1 text-[10px] ${i % 2 === 0 ? '' : 'bg-bg-card/20'} border-b border-border/50 last:border-0`}>
                      <div className="col-span-5 min-w-0">
                        <p className="text-text-secondary truncate font-medium">{m.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[8px] text-text-dim">{m.category}</span>
                          {m.criticality === 'Critical' && (
                            <span className="text-[7px] font-semibold text-red bg-red/10 px-1 rounded">CRIT</span>
                          )}
                        </div>
                      </div>
                      <span className="col-span-2 text-right text-text-muted font-mono">{fmtK(m.cost_per_unit)}</span>
                      <span className="col-span-2 text-right text-yellow font-mono font-medium">{fmtK(m.cost_impact)}</span>
                      <span className={`col-span-3 text-right font-mono font-medium ${m.delay_days > 30 ? 'text-red' : m.delay_days > 0 ? 'text-orange' : 'text-text-dim'}`}>
                        {m.delay_days > 0 ? `+${m.delay_days}d` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Summary footer */}
                <div className="px-2.5 py-2 border-t border-border bg-bg-card/50">
                  <div className="grid grid-cols-12 text-[10px] font-semibold">
                    <span className="col-span-5 text-text-muted">Total ({result.affected_materials.length} materials)</span>
                    <span className="col-span-2"></span>
                    <span className="col-span-2 text-right text-yellow font-mono">
                      {fmtK(result.affected_materials.reduce((s, m) => s + m.cost_impact, 0))}
                    </span>
                    <span className="col-span-3 text-right text-red font-mono">
                      +{Math.max(...result.affected_materials.map(m => m.delay_days))}d max
                    </span>
                  </div>
                  {result.system_overhead > 0 && (
                    <div className="flex justify-between mt-1 text-[9px] text-text-dim">
                      <span>System overhead (10% of base)</span>
                      <span className="font-mono text-yellow">{fmtK(result.system_overhead)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.note && <p className="text-[10px] text-text-dim">{result.note}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
