import { Activity, Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border bg-bg-glass backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-12 flex items-center justify-between">
        {/* Logo + branding */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan to-blue flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"/>
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-xl bg-cyan/20 blur-md -z-10" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold text-text-primary tracking-tight">Vikram-Stratos</span>
            <span className="text-[10px] text-text-dim font-mono bg-bg-elevated px-1.5 py-0.5 rounded border border-border">v1.0</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-border mx-1" />
          <span className="hidden md:block text-[11px] text-text-muted font-light tracking-wide">Production Readiness</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="status-live absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green" />
            </span>
            <span className="text-[11px] font-medium text-green">Operational</span>
          </div>

          <span className="text-[11px] text-text-dim font-mono font-light">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 rounded-lg bg-bg-elevated/50 border border-border flex items-center justify-center hover:border-border-bright hover:bg-bg-hover transition-all duration-300">
              <Bell size={13} className="text-text-muted" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-bg-elevated/50 border border-border flex items-center justify-center hover:border-border-bright hover:bg-bg-hover transition-all duration-300">
              <Settings size={13} className="text-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
