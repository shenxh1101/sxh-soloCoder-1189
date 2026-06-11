import { GAME_COLORS } from '../../utils/constants';

interface InventoryProps {
  glowSticks: number;
  isGodMode: boolean;
}

export function Inventory({ glowSticks, isGodMode }: InventoryProps) {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-2 rounded border border-gray-700">
        <div
          className="w-4 h-8 rounded"
          style={{
            backgroundColor: GAME_COLORS.glowStick,
            boxShadow: `0 0 8px ${GAME_COLORS.glowStick}80`,
          }}
        />
        <span className="font-mono text-sm text-white">
          GLOW STICKS: <span className="text-green-400 font-bold">{glowSticks}</span>
        </span>
        <span className="text-[10px] text-gray-500 font-mono">[Q] Place</span>
      </div>

      {isGodMode && (
        <div className="bg-yellow-900/80 px-3 py-2 rounded border border-yellow-600">
          <span className="font-mono text-xs text-yellow-400 font-bold tracking-wider">
            ⚡ GOD MODE ACTIVE
          </span>
        </div>
      )}
    </div>
  );
}
