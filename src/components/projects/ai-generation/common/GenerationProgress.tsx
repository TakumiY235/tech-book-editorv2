'use client';

interface GenerationProgressProps {
  message: string;
}

export function GenerationProgress({ message }: GenerationProgressProps) {
  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    </div>
  );
}