interface OxygenWarningProps {
  show: boolean;
  isDepleted?: boolean;
}

export function OxygenWarning({ show, isDepleted }: OxygenWarningProps) {
  if (!show) return null;

  const bgColor = isDepleted
    ? 'radial-gradient(ellipse at center, transparent 20%, rgba(255, 0, 0, 0.5) 100%)'
    : 'radial-gradient(ellipse at center, transparent 30%, rgba(255, 68, 68, 0.3) 100%)';

  const text = isDepleted ? '⛔ OXYGEN DEPLETED ⛔' : '⚠ OXYGEN LOW ⚠';
  const textColor = isDepleted ? 'text-red-400' : 'text-red-500';
  const fontSize = isDepleted ? 'text-3xl' : 'text-2xl';

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div
        className={`absolute inset-0 ${isDepleted ? 'animate-pulse' : 'animate-pulse'}`}
        style={{ background: bgColor }}
      />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '38%' }}>
        <div className={`${textColor} font-mono ${fontSize} font-bold animate-pulse tracking-widest text-center`}>
          {text}
        </div>
        {isDepleted && (
          <div className="text-yellow-400 font-mono text-center text-sm mt-4 animate-pulse tracking-wide">
            Teleported to spawn. Find a vent!
          </div>
        )}
      </div>
    </div>
  );
}
