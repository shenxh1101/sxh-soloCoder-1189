interface LoadingScreenProps {
  progress: number;
  isGenerating: boolean;
}

export function LoadingScreen({ progress, isGenerating }: LoadingScreenProps) {
  if (!isGenerating) return null;

  return (
    <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-2xl font-mono text-green-400 mb-6 tracking-widest animate-pulse">
          GENERATING CAVE SYSTEM...
        </h2>
        <div className="w-80 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 font-mono text-sm text-gray-500">
          {progress.toFixed(0)}% Complete
        </p>
        <p className="mt-2 font-mono text-xs text-gray-600">
          {progress < 50 ? 'Sampling 3D Perlin noise...' : 'Extracting surface with Marching Cubes...'}
        </p>
      </div>
    </div>
  );
}
