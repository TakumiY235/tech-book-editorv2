'use client';

interface GenerationOptionsProps {
  onGenerate: () => Promise<void>;
  onRefine?: () => Promise<void>;
  isGenerating: boolean;
  isRefining: boolean;
}

export function GenerationOptions({
  onGenerate,
  onRefine,
  isGenerating,
  isRefining
}: GenerationOptionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onGenerate}
        disabled={isGenerating || isRefining}
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md font-semibold text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        AIで章立てを生成
      </button>
      {onRefine && (
        <button
          onClick={onRefine}
          disabled={isGenerating || isRefining}
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md font-semibold text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          AIで章立てを洗練
        </button>
      )}
    </div>
  );
}