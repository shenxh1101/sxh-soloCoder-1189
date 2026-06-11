import { useMemo } from 'react';
import { GAME_COLORS, OXYGEN_CONFIG } from '../../utils/constants';

interface OxygenBarProps {
  oxygen: number;
  isLow: boolean;
  isNearVent: boolean;
  isDepleted?: boolean;
}

export function OxygenBar({ oxygen, isLow, isNearVent, isDepleted }: OxygenBarProps) {
  const percentage = (oxygen / OXYGEN_CONFIG.maxOxygen) * 100;

  const barColor = useMemo(() => {
    if (isDepleted) return '#ff0000';
    if (isNearVent) return GAME_COLORS.vent;
    if (percentage > 50) return GAME_COLORS.oxygenGood;
    if (percentage > OXYGEN_CONFIG.warningThreshold) return GAME_COLORS.oxygenWarning;
    return GAME_COLORS.oxygenDanger;
  }, [percentage, isNearVent, isDepleted]);

  const labelText = isDepleted
    ? 'DEPLETED - FIND VENT!'
    : isNearVent
    ? 'OXYGEN [REFILLING]'
    : 'OXYGEN';

  return (
    <div className="absolute top-4 left-4 w-64">
      <div
        className={`text-xs font-mono mb-1 tracking-wider ${
          isDepleted
            ? 'text-red-400 font-bold animate-pulse'
            : isNearVent
            ? 'text-blue-400'
            : 'text-gray-400'
        }`}
      >
        {labelText}
      </div>
      <div
        className={`relative h-6 bg-gray-900/80 rounded overflow-hidden border ${
          isDepleted ? 'border-red-500 animate-pulse' : 'border-gray-700'
        }`}
      >
        <div
          className={`h-full transition-all duration-200 ${
            (isLow && !isNearVent) || isDepleted ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barColor}40`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-white drop-shadow-lg">
            {Math.round(oxygen)} / {OXYGEN_CONFIG.maxOxygen}
          </span>
        </div>
      </div>
      <div className="mt-1 h-1 bg-gray-800 rounded overflow-hidden">
        <div
          className="h-full bg-red-500/30"
          style={{ width: `${OXYGEN_CONFIG.warningThreshold}%` }}
        />
      </div>
    </div>
  );
}
