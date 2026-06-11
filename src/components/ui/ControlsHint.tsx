interface ControlsHintProps {
  isPointerLocked: boolean;
}

export function ControlsHint({ isPointerLocked }: ControlsHintProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
      <div className="bg-gray-900/60 backdrop-blur-sm px-6 py-3 rounded-lg border border-gray-700/50">
        <div className="flex items-center gap-6 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">WASD</kbd>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">Mouse</kbd>
            <span>Look</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">Space</kbd>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">Shift</kbd>
            <span>Sprint</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">E</kbd>
            <span>Pickup</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">Q</kbd>
            <span>Place</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">V</kbd>
            <span>God View</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">O</kbd>
            <span>Export OBJ</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 border border-gray-600">R</kbd>
            <span>Regenerate</span>
          </div>
        </div>

        {!isPointerLocked && (
          <div className="mt-3 text-center">
            <div className="text-sm font-mono text-yellow-400 animate-pulse">
              Click anywhere to start exploring
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
