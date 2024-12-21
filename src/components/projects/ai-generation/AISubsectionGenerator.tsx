'use client';

import { useState } from 'react';
import { useToast } from '../../ui/toast';
import { GenerationProgress } from './common/GenerationProgress';

interface AISubsectionGeneratorProps {
  nodeId: string;
  onGenerate: (nodeId: string) => Promise<boolean>;
}

export function AISubsectionGenerator({
  nodeId,
  onGenerate
}: AISubsectionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateSubsections = async () => {
    setIsGenerating(true);
    try {
      const success = await onGenerate(nodeId);
      if (success) {
        toast({
          title: '成功',
          description: 'サブセクションの生成が完了しました。',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error generating subsections:', error);
      toast({
        title: 'エラー',
        description: 'サブセクションの生成に失敗しました。',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerateSubsections}
        disabled={isGenerating}
        className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md font-semibold text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        AIでサブセクションを生成
      </button>
      {isGenerating && (
        <GenerationProgress message="AI編集者がサブセクションを考えています..." />
      )}
    </div>
  );
}