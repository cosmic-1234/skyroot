import { useState } from 'react';
import { postSimulate } from '../api/client';
import { Zap, Factory, TrendingUp, Rocket, Loader2, ChevronDown, ChevronUp, DollarSign, Clock, Package } from 'lucide-react';

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
      const affected = DEMO_MATERIALS.map(m => ({
        name: m.name, category: m.category, criticality: m.criticality,
        cost_per_unit: m.cost_per_unit, safety_stock: m.safety_stock,
        lead_time_days: m.lead_time,
        delay_days: scenario === 'supplier_failure' ? Math.ceil(m.lead_time * (1 + sevFactor)) : 0,
        cost_impact: Math.round(m.cost_per_unit * m.safety_stock * sevFactor),
      }));
      const totalCost = affected.reduce((s, a) => s + a.cost_impact, 0);
      const overhead = scenario === 'supplier_failure' ? Math.round(15000000 * sevFactor * 0.1) : 0;
      const totalVariance = scenario === 'demand_spike' ? Math.round(15000000 * sevFactor * 0.35) : totalCost + overhead;
      const maxDelay = scenario === 'price_surge' ? 0 : scenario === 'demand_spike' ? Math.ceil(severity / 3) : Math.max(...affected.map(a => a.delay_days));
      setResult({
        scenario, severity_percent: severity,
        projected_cost_to_orbit_variance_usd: totalVariance, max_delay_days: maxDelay,
        system_overhead: overhead, affected_materials: affected,
        base_cost_to_orbit: 15000000, projected_cost_to_orbit: 15000000 + totalVariance,
        note: 'Demo mode — backend not connected',
      });
    }
    setLoading(false);
  };

  const scenarios = [
    { value: 'supplier_failure', label: 'Supplier Failure', icon: Factory },
    { value: 'price_surge', label: 'Price Surge', icon: TrendingUp },
    { value: 'demand_spike', label: 'Production Ramp-up', icon: Rocket },
  ];

  const fmt = (n) => n ? `$${(n / 1_000_000).toFixed(2)}M` : '—';
  const fmtK = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  return (
    <div className="card">
      <div className="card-inner p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="relative">
            <Zap size={13} className="text-cyan" />
            <div className="absolute -inset-1 rounded-full bg-cyan/15 blur-sm -z-10" />
          </div>
          <h3 className="text-[11px] font-semibold text-text-primary tracking-wide uppercase">Stress Test</h3>
        </div>

        {/* Scenario selector */}
        <div className="space-y-1 mb-5">
          {scenarios.map(s => {
            const Icon = s.icon;
            const active = scenario === s.value;
            return (
              <button key={s.value} onClick={() => setScenario(s.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-300
                  ${active
                    ? 'bg-cyan/8 text-cyan border border-cyan/20'
                    : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover/40 border border-transparent'}`}>
                <Icon size={11} className={active ? 'text-cyan' : 'text-text-dim'} />
                <span className="font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Severity slider */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-text-dim uppercase tracking-[0.1em] font-medium">Severity</span>
            <span className="text-[11px] font-mono font-semibold text-text-primary">{severity}%</span>
          </div>
          <div className="relative">
            <input type="range" min="5" max="100" step="5" value={severity}
              onChange={e => setSeverity(Number(e.target.value))}
              className="w-full h-[3px] bg-bg-hover rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-bg-base [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan/30" />
          </div>
        </div>

        {/* Run button */}
        <button onClick={handleRun} disabled={loading}
          className="w-full py-2.5 rounded-xl bg-cyan/10 border border-cyan/20 text-cyan text-[11px] font-semibold
            transition-all duration-300 hover:bg-cyan/15 hover:border-cyan/30 hover:shadow-lg hover:shadow-cyan/10
            disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={12} className="animate-spin" /> Running...</> : 'Run Simulation'}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-4 space-y-3">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-bg-glass border border-border p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <DollarSign size={9} className="text-yellow" />
                  <p className="text-[8px] text-text-dim uppercase tracking-[0.1em]">Cost Variance</p>
                </div>
                <p className="text-[14px] font-semibold text-yellow font-mono">+{fmt(result.projected_cost_to_orbit_variance_usd)}</p>
              </div>
              <div className="rounded-xl bg-bg-glass border border-border p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock size={9} className="text-red" />
                  <p className="text-[8px] text-text-dim uppercase tracking-[0.1em]">Max Delay</p>
                </div>
                <p className="text-[14px] font-semibold text-red font-mono">{result.max_delay_days || 0}d</p>
              </div>
            </div>

            {/* Projected total */}
            {result.projected_cost_to_orbit && (
              <div className="rounded-xl bg-bg-glass border border-border p-3">
                <p className="text-[8px] text-text-dim uppercase tracking-[0.1em] mb-1">Projected Cost-to-Orbit</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-semibold text-text-primary font-mono">{fmt(result.projected_cost_to_orbit)}</span>
                  <span className="text-[10px] text-text-dim font-mono font-light">from {fmt(result.base_cost_to_orbit)}</span>
                </div>
              </div>
            )}

            {/* View Details toggle */}
            {result.affected_materials?.length > 0 && (
              <button onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-medium text-cyan/80 hover:bg-cyan/5 transition-all duration-300 border border-border">
                <Package size={9} />
                {showDetails ? 'Hide' : 'View'} Breakdown ({result.affected_materials.length})
                {showDetails ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
              </button>
            )}

            {/* Detailed breakdown */}
            {showDetails && result.affected_materials && (
              <div className="rounded-xl bg-bg-glass border border-border overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <div className="grid grid-cols-12 text-[7px] text-text-dim uppercase tracking-[0.1em] font-medium">
                    <span className="col-span-5">Material</span>
                    <span className="col-span-2 text-right">Unit $</span>
                    <span className="col-span-2 text-right">Impact</span>
                    <span className="col-span-3 text-right">Delay</span>
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  {result.affected_materials.map((m, i) => (
                    <div key={i} className={`px-3 py-2 grid grid-cols-12 items-center gap-1 text-[10px] border-b border-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-bg-surface/30'}`}>
                      <div className="col-span-5 min-w-0">
                        <p className="text-text-secondary truncate font-medium">{m.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[7px] text-text-dim">{m.category}</span>
                          {m.criticality === 'Critical' && (
                            <span className="text-[6px] font-semibold text-red bg-red/8 px-1 py-px rounded-full">CRIT</span>
                          )}
                        </div>
                      </div>
                      <span className="col-span-2 text-right text-text-dim font-mono font-light">{fmtK(m.cost_per_unit)}</span>
                      <span className="col-span-2 text-right text-yellow font-mono font-medium">{fmtK(m.cost_impact)}</span>
                      <span className={`col-span-3 text-right font-mono font-medium ${m.delay_days > 30 ? 'text-red' : m.delay_days > 0 ? 'text-orange' : 'text-text-dim'}`}>
                        {m.delay_days > 0 ? `+${m.delay_days}d` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-border">
                  <div className="grid grid-cols-12 text-[10px] font-semibold">
                    <span className="col-span-5 text-text-muted">Total</span>
                    <span className="col-span-2" />
                    <span className="col-span-2 text-right text-yellow font-mono">{fmtK(result.affected_materials.reduce((s, m) => s + m.cost_impact, 0))}</span>
                    <span className="col-span-3 text-right text-red font-mono">+{Math.max(...result.affected_materials.map(m => m.delay_days))}d</span>
                  </div>
                </div>
              </div>
            )}

            {result.note && <p className="text-[9px] text-text-dim font-light">{result.note}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
