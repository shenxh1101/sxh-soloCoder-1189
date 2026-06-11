import { useMemo } from 'react';

interface CompassProps {
  playerYaw: number;
}

export function Compass({ playerYaw }: CompassProps) {
  const rotation = useMemo(() => {
    return -playerYaw;
  }, [playerYaw]);

  const cardinalAngles = [
    { label: 'N', angle: 0, color: '#ff4444' },
    { label: 'E', angle: Math.PI / 2, color: '#888888' },
    { label: 'S', angle: Math.PI, color: '#888888' },
    { label: 'W', angle: -Math.PI / 2, color: '#888888' },
  ];

  return (
    <div className="absolute top-4 right-4 w-28 h-28">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full bg-gray-900/80 border-2 border-gray-600 shadow-lg overflow-hidden">
          <div className="absolute inset-2 rounded-full border border-gray-700/50" />
          <div className="absolute inset-5 rounded-full border border-gray-700/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/20 to-transparent" />

          <div
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{ transform: `rotate(${rotation}rad)` }}
          >
            {cardinalAngles.map(({ label, angle, color }) => (
              <div
                key={label}
                className="absolute left-1/2 top-1/2 origin-[0_0]"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(-44px)`,
                }}
              >
                <span
                  className="font-mono font-bold text-[11px]"
                  style={{
                    color,
                    transform: `rotate(${-rotation - angle}rad)`,
                    display: 'inline-block',
                    textShadow: label === 'N' ? '0 0 6px #ff444480' : 'none',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-0.5 h-10 bg-gradient-to-t from-transparent to-gray-500/60 origin-bottom" />

            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              width="80"
              height="80"
              viewBox="0 0 80 80"
            >
              <polygon
                points="40,8 43,32 40,28 37,32"
                fill="#ff4444"
                style={{ filter: 'drop-shadow(0 0 4px #ff444460)' }}
              />
              <polygon
                points="40,72 43,48 40,52 37,48"
                fill="#555555"
              />
            </svg>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-gray-800" />
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 112 112">
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i * Math.PI * 2) / 36;
              const x1 = 56 + Math.sin(angle) * 52;
              const y1 = 56 - Math.cos(angle) * 52;
              const x2 = 56 + Math.sin(angle) * (i % 3 === 0 ? 46 : 49);
              const y2 = 56 - Math.cos(angle) * (i % 3 === 0 ? 46 : 49);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 3 === 0 ? '#666666' : '#444444'}
                  strokeWidth={i % 3 === 0 ? 1.5 : 1}
                />
              );
            })}
          </svg>
        </div>

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-500 whitespace-nowrap tracking-wider">
          COMPASS
        </div>
      </div>
    </div>
  );
}
