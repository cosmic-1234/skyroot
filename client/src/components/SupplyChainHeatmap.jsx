import { MapPin, ArrowRight } from 'lucide-react';

export default function SupplyChainHeatmap({ corridorData = [] }) {
  const regions = [
    { id: 'global', label: 'Global Imports', region: 'Global' },
    { id: 'nagpur', label: 'Nagpur', region: 'Nagpur', sub: 'Engine Testing · Propellant' },
    { id: 'pune', label: 'Pune', region: 'Pune', sub: 'Precision Machining' },
    { id: 'bangalore', label: 'Bangalore', region: 'Bangalore', sub: 'R&D Center' },
    { id: 'hyderabad', label: 'Hyderabad', region: 'Hyderabad', sub: 'Assembly · Avionics · QC' },
    { id: 'chennai', label: 'Chennai', region: 'Chennai', sub: 'Electronics Hub' },
    { id: 'sriharikota', label: 'Sriharikota', region: 'Sriharikota', sub: 'Launch Complex' },
  ];

  const getMetrics = (region) => {
    const d = corridorData.find(c => c.region === region);
    if (!d) return { reliability: 0, quality: 0, suppliers: 0, atRisk: 0 };
    return {
      reliability: parseFloat(d.avg_reliability) || 0,
      quality: parseFloat(d.avg_quality) || 0,
      suppliers: parseInt(d.total_suppliers) || 0,
      atRisk: parseInt(d.at_risk_suppliers) || 0,
    };
  };

  const getStatusColor = (rel) => {
    if (rel >= 0.88) return 'text-success';
    if (rel >= 0.75) return 'text-warning';
    return 'text-danger';
  };

  const getStatusBg = (rel) => {
    if (rel >= 0.88) return 'bg-success/10 border-success/20';
    if (rel >= 0.75) return 'bg-warning/10 border-warning/20';
    return 'bg-danger/10 border-danger/20';
  };

  const getStatusDot = (rel) => {
    if (rel >= 0.88) return 'bg-success';
    if (rel >= 0.75) return 'bg-warning';
    return 'bg-danger';
  };

  // Primary corridor flow
  const corridorFlow = ['nagpur', 'hyderabad', 'sriharikota'];

  return (
    <div className="space-y-4">
      {/* Primary corridor flow indicator */}
      <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-bg-elevated border border-border-primary">
        <span className="text-[11px] text-text-quaternary font-medium uppercase tracking-wider">Primary Corridor</span>
        <span className="flex-1 flex items-center justify-center gap-1">
          {corridorFlow.map((id, i) => {
            const r = regions.find(r => r.id === id);
            const m = getMetrics(r.region);
            return (
              <span key={id} className="flex items-center gap-1">
                <span className={`text-[12px] font-medium ${getStatusColor(m.reliability)}`}>{r.label}</span>
                <span className={`text-[11px] font-mono ${getStatusColor(m.reliability)}`}>
                  {(m.reliability * 100).toFixed(0)}%
                </span>
                {i < corridorFlow.length - 1 && <ArrowRight size={12} className="text-text-quaternary mx-1" />}
              </span>
            );
          })}
        </span>
      </div>

      {/* Region grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {regions.map(r => {
          const m = getMetrics(r.region);
          return (
            <div key={r.id}
              className={`rounded-lg border p-3.5 transition-colors hover:bg-bg-hover/50 ${getStatusBg(m.reliability)}`}>
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-text-tertiary" />
                  <span className="text-[13px] font-semibold text-text-primary">{r.label}</span>
                </div>
                <span className={`w-2 h-2 rounded-full mt-1 ${getStatusDot(m.reliability)}`} />
              </div>

              {r.sub && <p className="text-[11px] text-text-quaternary mb-3">{r.sub}</p>}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-text-tertiary">Reliability</span>
                  <span className={`text-[12px] font-mono font-semibold ${getStatusColor(m.reliability)}`}>
                    {(m.reliability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-bg-primary">
                  <div className={`h-1 rounded-full transition-all ${m.reliability >= 0.88 ? 'bg-success' : m.reliability >= 0.75 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${m.reliability * 100}%` }} />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-text-tertiary">Quality</span>
                  <span className="text-[12px] font-mono text-text-secondary">{(m.quality * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-text-tertiary">Suppliers</span>
                  <span className="text-[12px] font-mono text-text-secondary">
                    {m.suppliers}{m.atRisk > 0 && <span className="text-danger ml-1">({m.atRisk} at risk)</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
