import { useState, useEffect } from 'react';
import Header from './components/Header';
import LaunchReadinessGauge from './components/LaunchReadinessGauge';
import CentralRocketViz from './components/CentralRocketViz';
import IndiaCorridorMap from './components/IndiaCorridorMap';
import BottleneckTrendline from './components/BottleneckTrendline';
import MaterialInventory from './components/MaterialInventory';
import StressTestSidebar from './components/StressTestSidebar';
import { fetchDashboard } from './api/client';
import {
  Calendar, AlertTriangle, Package, ShieldAlert,
  ChevronRight, Loader2, AlertCircle
} from 'lucide-react';

const DEMO = {
  launches: [
    { mission_name: 'Vikram-1 Demo Flight', target_date: '2026-08-30', material_readiness_percent: 62.5, critical_path_delay_days: 14, total_materials: 98, materials_short: 12 },
    { mission_name: 'Vikram-1 Alpha', target_date: '2026-11-28', material_readiness_percent: 41.2, critical_path_delay_days: 28, total_materials: 98, materials_short: 23 },
    { mission_name: 'Vikram-1 Bravo', target_date: '2027-02-25', material_readiness_percent: 18.7, critical_path_delay_days: 45, total_materials: 98, materials_short: 51 },
    { mission_name: 'Vikram-1 Charlie', target_date: '2027-07-01', material_readiness_percent: 8.3, critical_path_delay_days: 60, total_materials: 98, materials_short: 72 },
  ],
  corridor_health: [
    { region: 'Nagpur', avg_reliability: '0.887', avg_quality: '0.910', total_suppliers: 3, active_suppliers: 3, at_risk_suppliers: 0 },
    { region: 'Hyderabad', avg_reliability: '0.862', avg_quality: '0.900', total_suppliers: 8, active_suppliers: 8, at_risk_suppliers: 1 },
    { region: 'Sriharikota', avg_reliability: '0.920', avg_quality: '0.950', total_suppliers: 0, active_suppliers: 0, at_risk_suppliers: 0 },
    { region: 'Bangalore', avg_reliability: '0.873', avg_quality: '0.912', total_suppliers: 4, active_suppliers: 4, at_risk_suppliers: 0 },
    { region: 'Global', avg_reliability: '0.927', avg_quality: '0.950', total_suppliers: 3, active_suppliers: 3, at_risk_suppliers: 0 },
  ],
  recent_events: [
    { event_type: 'QC_Failure', severity: 'Critical', description: 'Inconel 718 batch rejection — 21-day replacement lead time.', impact_days: 21, event_date: '2026-07-15' },
    { event_type: 'Weather_Disruption', severity: 'High', description: 'Monsoon flooding on NH-44 corridor. Road transport halted.', impact_days: 12, event_date: '2026-08-20' },
    { event_type: 'Geopolitical', severity: 'High', description: 'Carbon fiber export control review — 14-day customs hold.', impact_days: 14, event_date: '2026-11-10' },
  ],
  inventory_trends: Array.from({ length: 60 }, (_, i) => {
    const mats = ['Inconel 718 Superalloy', 'T700 Carbon Fiber Prepreg', 'HTPB Solid Propellant', 'IMU Sensor Unit', 'Ti-6Al-4V Billet'];
    const mat = mats[i % 5];
    const month = Math.floor(i / 5);
    const base = [45, 180, 450, 2.8, 22][i % 5];
    const qty = base * (1 - month * 0.06 + Math.random() * 0.08);
    const d = new Date(2026, 5 + month, 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    return { snapshot_date: dateStr, material_name: mat, days_of_supply: Math.max(3, qty / (base * 0.12)).toFixed(1) };
  }),
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetchDashboard()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(DEMO); setIsDemo(true); setLoading(false); });
  }, []);

  const next = data?.launches?.[0];
  const readiness = next ? parseFloat(next.material_readiness_percent) || 0 : 0;
  const daysOut = next?.target_date ? Math.max(0, Math.ceil((new Date(next.target_date) - new Date()) / 86400000)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 size={24} className="animate-spin text-cyan" />
          <div className="absolute -inset-2 rounded-full bg-cyan/10 blur-lg" />
        </div>
        <span className="text-[12px] text-text-muted font-light tracking-wide">Connecting to mission telemetry...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base relative">
      <Header />

      {/* Pre-Flight Status Ticker */}
      <div className="border-b border-border bg-bg-surface/60 overflow-hidden h-7 flex items-center">
        <span className="shrink-0 text-[9px] font-medium text-text-dim uppercase tracking-[0.1em] px-5 border-r border-border h-full flex items-center">
          Live
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-animate whitespace-nowrap flex items-center gap-10 text-[11px] font-light">
            {isDemo && <span className="text-yellow/80">Connecting to live telemetry</span>}
            <span className="text-text-muted">SPOF: <span className="text-orange font-normal">Inconel 718 — Batch rejection, replacement in transit</span></span>
            <span className="text-text-dim">·</span>
            <span className="text-text-muted">Corridor: <span className="text-green font-normal">Nagpur 89% → Hyderabad 86% → Sriharikota 92%</span></span>
            <span className="text-text-dim">·</span>
            <span className="text-text-muted">Milestone: <span className="text-cyan font-normal">Stage-2 integration T-45 days</span></span>
            <span className="text-text-dim">·</span>
            <span className="text-text-muted">Weather: <span className="text-yellow/80 font-normal">Monsoon approaching NH-44</span></span>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-5 relative z-10">
        <div className="grid grid-cols-12 gap-5">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="col-span-12 lg:col-span-3 space-y-5">

            {/* KPI Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Calendar, label: 'NEXT LAUNCH', value: `T-${daysOut}d`, sub: next?.mission_name },
                { icon: AlertTriangle, label: 'DELAY RISK', value: `${next?.critical_path_delay_days || 0}d`, sub: 'Critical path estimate' },
                { icon: Package, label: 'MATERIALS SHORT', value: next?.materials_short || 0, sub: `of ${next?.total_materials || 0} required` },
                { icon: ShieldAlert, label: 'ACTIVE EVENTS', value: data?.recent_events?.length || 0, sub: 'Disruptions tracked' },
              ].map((s, i) => {
                const Icon = s.icon;
                const danger = (i === 1 && next?.critical_path_delay_days > 14) || (i === 2 && next?.materials_short > 10);
                return (
                  <div key={i} className="card">
                    <div className="card-inner p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon size={10} className="text-text-dim" />
                        <span className="text-[8px] text-text-dim font-medium uppercase tracking-[0.12em]">{s.label}</span>
                      </div>
                      <span className={`text-[22px] font-semibold font-mono tracking-tight leading-none ${danger ? 'text-red' : 'text-text-primary'}`}>{s.value}</span>
                      <p className="text-[10px] text-text-dim mt-1.5 font-light truncate">{s.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Readiness Gauge */}
            <div className="card">
              <div className="card-inner p-5 flex items-center justify-center">
                <LaunchReadinessGauge percent={readiness} missionName={next?.mission_name} targetDate={`T-${daysOut} days`} />
              </div>
            </div>

            {/* Mission Pipeline */}
            <div className="card">
              <div className="card-inner p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-semibold text-text-primary tracking-wide uppercase">Mission Pipeline</h2>
                  <span className="text-[10px] text-text-dim font-mono">{data?.launches?.length || 0} missions</span>
                </div>
                <div className="space-y-1">
                  {(data?.launches || []).map((l, i) => {
                    const pct = parseFloat(l.material_readiness_percent || 0);
                    const delay = l.critical_path_delay_days || 0;
                    const color = pct >= 60 ? 'bg-green' : pct >= 30 ? 'bg-yellow' : 'bg-red';
                    const textColor = pct >= 60 ? 'text-green' : pct >= 30 ? 'text-yellow' : 'text-red';
                    return (
                      <div key={i} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-hover/60 transition-all duration-300 cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-text-primary truncate">{l.mission_name}</span>
                            {delay > 14 && (
                              <span className="text-[8px] font-semibold text-red bg-red-dim px-1.5 py-0.5 rounded-full">+{delay}d</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-text-dim font-mono font-light">{l.target_date}</span>
                            <span className={`text-[10px] font-medium ${textColor}`}>{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-16">
                          <div className="h-1 rounded-full bg-bg-hover">
                            <div className={`h-1 rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                        <ChevronRight size={11} className="text-text-dim opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CENTER COLUMN ═══ */}
          <div className="col-span-12 lg:col-span-6 space-y-5">

            {/* Critical SPOF Banner */}
            <div className="card border-orange/15 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange/5 via-transparent to-transparent" />
              <div className="flex items-center gap-3 px-5 py-3 relative">
                <div className="relative">
                  <AlertCircle size={14} className="text-orange" />
                  <div className="absolute -inset-1 rounded-full bg-orange/15 blur-sm" />
                </div>
                <p className="text-[11px] text-text-secondary font-light leading-relaxed">
                  <span className="font-medium text-orange">Critical SPOF:</span> Inconel 718 batch rejection — metallurgical defect detected. 21-day replacement cycle active. Est. cost impact: $94,500.
                </p>
              </div>
            </div>

            {/* Central Rocket Visualization */}
            <div className="card">
              <div className="card-inner">
                <CentralRocketViz percent={readiness} missionName={next?.mission_name} daysOut={daysOut} />
              </div>
            </div>

            {/* Supply Chain Corridor */}
            <div className="card">
              <div className="card-inner p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-semibold text-text-primary tracking-wide uppercase">Supply Chain Corridor</h2>
                  <span className="text-[10px] text-text-dim font-light">Nagpur → Hyderabad → Sriharikota</span>
                </div>
                <IndiaCorridorMap corridorData={data?.corridor_health || []} />
              </div>
            </div>

            {/* Bottleneck Trendline */}
            <div className="card">
              <div className="card-inner p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[11px] font-semibold text-text-primary tracking-wide uppercase">Bottleneck Trendline</h2>
                  <span className="text-[10px] text-text-dim font-light">12-month · Days of Supply</span>
                </div>
                <BottleneckTrendline inventoryData={data?.inventory_trends || []} />
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-14 space-y-5">

              {/* Stress Test */}
              <StressTestSidebar />

              {/* Inventory with material images */}
              <div className="card">
                <div className="card-inner p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[11px] font-semibold text-text-primary tracking-wide uppercase">Inventory</h2>
                    <span className="text-[10px] text-text-dim font-light">Days of Supply</span>
                  </div>
                  <MaterialInventory inventoryData={data?.inventory_trends || []} />
                </div>
              </div>

              {/* Disruption events */}
              <div className="card">
                <div className="card-inner p-5">
                  <h2 className="text-[11px] font-semibold text-text-primary tracking-wide uppercase mb-4">Recent Disruptions</h2>
                  <div className="space-y-3">
                    {(data?.recent_events || []).slice(0, 4).map((evt, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          evt.severity === 'Critical' ? 'bg-red' : evt.severity === 'High' ? 'bg-orange' : 'bg-yellow'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-text-secondary font-light leading-relaxed">{evt.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] text-text-dim font-mono font-light">{evt.event_date}</span>
                            {evt.impact_days > 0 && (
                              <span className="text-[9px] font-mono font-medium text-red">+{evt.impact_days}d</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
