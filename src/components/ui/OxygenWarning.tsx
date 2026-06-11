interface OxygenWarningProps {
  show: boolean;
}

export function OxygenWarning({ show }: OxygenWarningProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(255, 68, 68, 0.3) 100%)',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-red-500 font-mono text-2xl font-bold animate-pulse tracking-widest">
          ⚠ OXYGEN LOW ⚠
        </div>
      </div>
    </div>
  );
}
