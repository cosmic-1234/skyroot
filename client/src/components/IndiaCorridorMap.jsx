import { useState } from 'react';
import { MapPin, X, Building2, Users, Gauge, Shield, Package, Wrench, ChevronRight } from 'lucide-react';

const facilities = [
  {
    id: 'nagpur', label: 'Nagpur', sub: 'Fire-test stand\nin operation',
    img: '/images/nagpur.png', x: 28, y: 18, region: 'Nagpur',
    details: {
      fullName: 'Nagpur Engine Testing & Propellant Facility',
      type: 'Testing & Manufacturing',
      capabilities: ['Static fire testing (Dhawan engines)', 'Solid propellant grain casting', 'HTPB mixing & curing', 'Nozzle thermal qualification'],
      keyMaterials: ['HTPB Solid Propellant', 'Ammonium Perchlorate', 'Nozzle Extension Segment', 'Ablative Nozzle Insert'],
      suppliers: [
        { name: 'L&T Defence', reliability: 0.93 },
        { name: 'Solar Industries', reliability: 0.88 },
        { name: 'Economic Explosives Ltd', reliability: 0.85 },
      ],
      throughput: '4 units/month',
      currentLoad: 72,
      coordinates: '21.1458° N, 79.0882° E',
      riskFactors: ['Monsoon season road closures (Jul-Sep)', 'Single propellant mixing facility', 'NH-44 corridor dependency'],
    },
  },
  {
    id: 'hyderabad', label: 'Hyderabad', sub: 'Avionics bay\nintegration clean-room',
    img: '/images/hyderabad.png', x: 10, y: 55, region: 'Hyderabad',
    details: {
      fullName: 'Hyderabad Assembly & Avionics Integration Complex',
      type: 'Assembly & Integration',
      capabilities: ['Vehicle assembly (Stage 1-3)', 'Avionics clean-room integration', 'Quality control & X-ray inspection', 'Wiring harness fabrication'],
      keyMaterials: ['Inconel 718 Superalloy', 'IMU Sensor Unit', 'Star Tracker Sensor', 'Flight Computer Board', 'Carbon Fiber Prepreg'],
      suppliers: [
        { name: 'MIDHANI', reliability: 0.92 },
        { name: 'Godrej Aerospace', reliability: 0.88 },
        { name: 'MTAR Technologies', reliability: 0.91 },
        { name: 'Astra Microwave', reliability: 0.87 },
        { name: 'VEM Technologies', reliability: 0.89 },
      ],
      throughput: '3 units/month',
      currentLoad: 85,
      coordinates: '17.3850° N, 78.4867° E',
      riskFactors: ['Highest supplier concentration', 'QC bottleneck (single X-ray line)', 'Inconel 718 single-source dependency'],
    },
  },
  {
    id: 'sriharikota', label: 'Sriharikota', sub: 'Launch pad service\nstructure',
    img: '/images/sriharikota.png', x: 55, y: 70, region: 'Sriharikota',
    details: {
      fullName: 'Satish Dhawan Space Centre — Launch Complex',
      type: 'Launch & Final Assembly',
      capabilities: ['Vehicle final assembly (VAB)', 'Launch pad servicing', 'Payload integration & encapsulation', 'Pre-launch systems checkout', 'Countdown sequencing'],
      keyMaterials: ['Payload Fairing Half-Shell', 'Interstage Adapter Ring', 'Umbilical Cable Assembly', 'Pyrotechnic Valve'],
      suppliers: [],
      throughput: '2 launches/month capacity',
      currentLoad: 45,
      coordinates: '13.7199° N, 80.2304° E',
      riskFactors: ['Cyclone season (Oct-Dec)', 'ISRO launch window coordination', 'Limited pad availability'],
    },
  },
];

const corridorPath = "M 180 95 Q 200 160 165 215 Q 180 250 265 280";

export default function IndiaCorridorMap({ corridorData = [] }) {
  const [selected, setSelected] = useState(null);

  const getScore = (region) => {
    const d = corridorData.find(c => c.region === region);
    return d ? parseFloat(d.avg_reliability) || 0.85 : 0.85;
  };

  const getCorridorInfo = (region) => {
    return corridorData.find(c => c.region === region) || {};
  };

  return (
    <div className="relative w-full" style={{ minHeight: '340px' }}>
      {/* SVG India outline + corridor lines */}
      <svg viewBox="0 0 400 360" className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
        <path d="M 160 20 Q 200 15 240 30 Q 280 45 300 80 Q 310 120 290 160 Q 280 200 300 240 Q 310 280 280 320 Q 250 350 220 340 Q 190 360 160 340 Q 130 320 120 280 Q 100 250 110 210 Q 90 180 100 140 Q 110 100 130 60 Q 140 35 160 20Z"
          fill="rgba(59, 130, 246, 0.04)" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="1" />
        <path d={corridorPath} fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="6 4" />
        <circle r="3" fill="#3b82f6" opacity="0.8">
          <animateMotion dur="4s" repeatCount="indefinite" path={corridorPath} />
        </circle>
        <circle r="3" fill="#06b6d4" opacity="0.6">
          <animateMotion dur="4s" begin="2s" repeatCount="indefinite" path={corridorPath} />
        </circle>
        <circle cx="180" cy="95" r="4" fill="#3b82f6" opacity="0.8" />
        <circle cx="165" cy="215" r="4" fill="#3b82f6" opacity="0.8" />
        <circle cx="265" cy="280" r="4" fill="#22c55e" opacity="0.8" />
        <circle cx="180" cy="95" r="8" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
        <circle cx="165" cy="215" r="8" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
        <circle cx="265" cy="280" r="8" fill="none" stroke="rgba(34,197,94,0.2)" strokeWidth="1" />
      </svg>

      {/* Facility cards overlaid on map */}
      {facilities.map(f => {
        const score = getScore(f.region);
        return (
          <div key={f.id} className="absolute group" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
            <div
              onClick={() => setSelected(f)}
              className="card p-0 overflow-hidden w-[170px] hover:border-blue/40 transition-all hover:shadow-lg hover:shadow-blue/10 cursor-pointer"
            >
              <div className="card-inner p-0">
                <div className="img-overlay h-[80px]">
                  <img src={f.img} alt={f.label} loading="lazy" />
                </div>
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={10} className="text-blue" />
                    <span className="text-[12px] font-semibold text-text-primary">{f.label}</span>
                    <span className={`ml-auto text-[10px] font-mono font-semibold ${score >= 0.88 ? 'text-green' : score >= 0.75 ? 'text-yellow' : 'text-red'}`}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight whitespace-pre-line">{f.sub}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View details</span>
                    <ChevronRight size={8} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Detail modal overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="w-[520px] max-h-[85vh] overflow-y-auto bg-bg-card border border-border rounded-xl shadow-2xl shadow-black/40"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-[140px] overflow-hidden rounded-t-xl">
              <img src={selected.img} alt={selected.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/40 to-transparent" />
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-bg-base/80 border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                <X size={14} />
              </button>
              <div className="absolute bottom-3 left-4">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue" />
                  <h2 className="text-[16px] font-bold text-white">{selected.label}</h2>
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    getScore(selected.region) >= 0.88 ? 'bg-green/20 text-green' : getScore(selected.region) >= 0.75 ? 'bg-yellow/20 text-yellow' : 'bg-red/20 text-red'
                  }`}>
                    {(getScore(selected.region) * 100).toFixed(0)}% Health
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">{selected.details.fullName}</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Building2, label: 'Type', value: selected.details.type },
                  { icon: Gauge, label: 'Throughput', value: selected.details.throughput },
                  { icon: Wrench, label: 'Load', value: `${selected.details.currentLoad}%`, color: selected.details.currentLoad > 80 ? 'text-red' : 'text-green' },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg bg-bg-base/60 border border-border p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <s.icon size={10} className="text-text-dim" />
                      <span className="text-[8px] text-text-dim uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className={`text-[11px] font-semibold ${s.color || 'text-text-primary'} font-mono`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">Capabilities</h3>
                <div className="grid grid-cols-2 gap-1">
                  {selected.details.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-1.5 py-1">
                      <span className="w-1 h-1 rounded-full bg-blue mt-1.5 shrink-0" />
                      <span className="text-[10px] text-text-secondary leading-snug">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Materials */}
              <div>
                <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
                  <Package size={10} className="inline mr-1" />Key Materials
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selected.details.keyMaterials.map((mat, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-bg-base border border-border text-text-secondary">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suppliers */}
              {selected.details.suppliers.length > 0 && (
                <div>
                  <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
                    <Users size={10} className="inline mr-1" />Suppliers ({selected.details.suppliers.length})
                  </h3>
                  <div className="space-y-1.5">
                    {selected.details.suppliers.map((sup, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-bg-base/40 border border-border/50">
                        <span className="text-[11px] text-text-secondary font-medium">{sup.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 rounded-full bg-bg-base overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sup.reliability >= 0.9 ? 'bg-green' : sup.reliability >= 0.85 ? 'bg-yellow' : 'bg-red'}`}
                              style={{ width: `${sup.reliability * 100}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-mono font-semibold ${sup.reliability >= 0.9 ? 'text-green' : sup.reliability >= 0.85 ? 'text-yellow' : 'text-red'}`}>
                            {(sup.reliability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Corridor data from API */}
              {(() => {
                const cd = getCorridorInfo(selected.region);
                if (!cd.total_suppliers && cd.total_suppliers !== 0) return null;
                return (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Avg Quality', value: `${(parseFloat(cd.avg_quality || 0) * 100).toFixed(1)}%` },
                      { label: 'Active Suppliers', value: cd.active_suppliers || 0 },
                      { label: 'At Risk', value: cd.at_risk_suppliers || 0, color: (cd.at_risk_suppliers || 0) > 0 ? 'text-red' : 'text-green' },
                    ].map((s, i) => (
                      <div key={i} className="rounded-lg bg-bg-base/60 border border-border p-2">
                        <p className="text-[8px] text-text-dim uppercase tracking-wider mb-0.5">{s.label}</p>
                        <p className={`text-[12px] font-bold font-mono ${s.color || 'text-text-primary'}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Risk Factors */}
              <div>
                <h3 className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
                  <Shield size={10} className="inline mr-1 text-orange" />Risk Factors
                </h3>
                <div className="space-y-1">
                  {selected.details.riskFactors.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange mt-1 shrink-0" />
                      <span className="text-[10px] text-text-secondary leading-snug">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinates */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[9px] text-text-dim font-mono">{selected.details.coordinates}</span>
                <span className="text-[9px] text-text-dim">{selected.details.type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
