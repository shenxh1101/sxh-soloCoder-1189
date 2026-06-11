interface InteractHintProps {
  text: string;
  keyHint?: string;
}

export function InteractHint({ text, keyHint = 'E' }: InteractHintProps) {
  return (
    <div className="absolute left-1/2 top-2/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 animate-bounce">
      <div className="bg-gray-900/90 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-emerald-500/60 shadow-lg shadow-emerald-500/20 flex items-center gap-2.5">
        <kbd className="px-2.5 py-1 bg-emerald-600/80 rounded text-white text-xs font-mono font-bold border border-emerald-400/50 shadow-inner">
          {keyHint}
        </kbd>
        <span className="text-emerald-300 text-xs font-mono tracking-wide">
          {text}
        </span>
      </div>
    </div>
  );
}
