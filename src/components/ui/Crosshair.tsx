interface CrosshairProps {
  visible: boolean;
}

export function Crosshair({ visible }: CrosshairProps) {
  if (!visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="relative w-6 h-6">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/60 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/60 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
