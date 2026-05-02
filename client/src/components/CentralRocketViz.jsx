import { useEffect, useRef } from 'react';
import { Rocket, ArrowUp, Clock, Target } from 'lucide-react';

export default function CentralRocketViz({ percent = 63, missionName = 'Vikram-1 Demo Flight', daysOut = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = 140;
    const startAngle = -0.5 * Math.PI;
    const sweep = 2 * Math.PI;

    let current = 0;
    const draw = () => {
      current += (percent - current) * 0.04;
      if (Math.abs(current - percent) < 0.3) current = percent;

      ctx.clearRect(0, 0, size, size);

      // Subtle outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Track ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Tick marks around the ring
      for (let i = 0; i < 72; i++) {
        const angle = startAngle + (sweep * i / 72);
        const isMajor = i % 6 === 0;
        const innerR = r - (isMajor ? 12 : 6);
        const outerR = r - 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.strokeStyle = isMajor ? 'rgba(148, 163, 184, 0.2)' : 'rgba(71, 85, 105, 0.12)';
        ctx.lineWidth = isMajor ? 1.2 : 0.6;
        ctx.stroke();
      }

      // Value arc — gradient from blue to cyan to green
      const valueAngle = startAngle + (sweep * current / 100);
      const grad = ctx.createConicGradient(startAngle, cx, cy);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(Math.min(current / 200, 0.49), '#06b6d4');
      grad.addColorStop(Math.min(current / 100, 0.99), current >= 60 ? '#22c55e' : current >= 30 ? '#eab308' : '#ef4444');
      grad.addColorStop(Math.min(current / 100 + 0.001, 1), 'transparent');
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, valueAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 5;
      ctx.lineCap = 'butt';
      ctx.stroke();

      // Soft glow behind the arc
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, valueAngle);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 18;
      ctx.filter = 'blur(10px)';
      ctx.stroke();
      ctx.restore();

      // End indicator dot
      const dotX = cx + Math.cos(valueAngle) * r;
      const dotY = cy + Math.sin(valueAngle) * r;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = current >= 60 ? '#22c55e' : current >= 30 ? '#eab308' : '#ef4444';
      ctx.fill();

      if (current < percent) requestAnimationFrame(draw);
    };
    draw();
  }, [percent]);

  const status = percent >= 60 ? 'On Track' : percent >= 30 ? 'At Risk' : 'Critical';
  const statusColor = percent >= 60 ? 'text-green' : percent >= 30 ? 'text-yellow' : 'text-red';
  const statusBg = percent >= 60 ? 'bg-green/10 border-green/20' : percent >= 30 ? 'bg-yellow/10 border-yellow/20' : 'bg-red/10 border-red/20';

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="relative">
        <canvas ref={canvasRef} />
        {/* Center content — overlaid inside the gauge ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center mb-3">
            <Rocket size={18} className="text-blue" />
          </div>
          <span className="text-[42px] font-bold text-text-primary tracking-tight leading-none font-mono">
            {Math.round(percent)}%
          </span>
          <span className="text-[11px] text-text-muted mt-1.5 uppercase tracking-widest">Readiness</span>
          <div className={`mt-3 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${statusBg} ${statusColor}`}>
            {status}
          </div>
        </div>
      </div>

      {/* Mission info below gauge */}
      <div className="text-center mt-4">
        <p className="text-[15px] font-semibold text-text-primary">{missionName}</p>
        <p className="text-[12px] text-text-muted font-mono mt-1">T-{daysOut} days</p>
      </div>

      {/* Quick stats row */}
      <div className="flex items-center gap-6 mt-5">
        {[
          { icon: Target, label: 'Orbit', value: 'LEO 400km' },
          { icon: ArrowUp, label: 'Payload', value: '300 kg' },
          { icon: Clock, label: 'Window', value: `${daysOut}d` },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <s.icon size={12} className="text-text-dim" />
            <div>
              <p className="text-[9px] text-text-dim uppercase tracking-wider">{s.label}</p>
              <p className="text-[12px] font-medium text-text-secondary font-mono">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
