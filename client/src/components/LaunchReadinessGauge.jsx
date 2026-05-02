import { useEffect, useRef } from 'react';

export default function LaunchReadinessGauge({ percent = 0, missionName = '', targetDate = '' }) {
  const canvasRef = useRef(null);
  const pct = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 160;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = 60;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const sweep = endAngle - startAngle;

    let current = 0;
    const draw = () => {
      current += (pct - current) * 0.08;
      if (Math.abs(current - pct) < 0.3) current = pct;

      ctx.clearRect(0, 0, size, size);

      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Value
      if (current > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + (sweep * current / 100));
        ctx.strokeStyle = current >= 70 ? '#22c55e' : current >= 40 ? '#eab308' : '#ef4444';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fafafa';
      ctx.font = "600 26px 'Inter'";
      ctx.fillText(`${Math.round(current)}%`, cx, cy - 2);
      ctx.fillStyle = '#71717a';
      ctx.font = "500 10px 'Inter'";
      ctx.fillText('Readiness', cx, cy + 16);

      if (current < pct) requestAnimationFrame(draw);
    };
    draw();
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      {missionName && (
        <div className="text-center">
          <p className="text-[13px] font-medium text-text-primary">{missionName}</p>
          {targetDate && <p className="text-[11px] text-text-tertiary font-mono mt-0.5">{targetDate}</p>}
        </div>
      )}
    </div>
  );
}
