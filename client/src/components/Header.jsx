import { Rocket, Activity, Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border bg-bg-card/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-5 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue to-cyan flex items-center justify-center shadow-md shadow-blue/20">
            <Rocket size={14} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-text-primary tracking-tight">Vikram-Stratos</span>
          <span className="text-[10px] text-text-dim font-mono px-1.5 py-0.5 rounded-md bg-bg-elevated border border-border">v1.0</span>
          <span className="hidden md:block text-[11px] text-text-muted ml-1">Production Readiness</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-green" />
            <span className="text-[11px] font-medium text-green">Operational</span>
          </div>
          <span className="text-[11px] text-text-dim font-mono">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 rounded-lg bg-bg-elevated border border-border flex items-center justify-center hover:border-border-bright transition-colors">
              <Bell size={13} className="text-text-muted" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-bg-elevated border border-border flex items-center justify-center hover:border-border-bright transition-colors">
              <Settings size={13} className="text-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
