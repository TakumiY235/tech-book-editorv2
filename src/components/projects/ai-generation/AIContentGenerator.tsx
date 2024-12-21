'use client';

import { useState } from 'react';
import { useToast } from '../../ui/toast';
import { GenerationProgress } from './common/GenerationProgress';

interface AIContentGeneratorProps {
  nodeId: string;
  bookTitle: string;
  targetAudience: string;
  onGenerate: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

export function AIContentGenerator({
  nodeId,
  bookTitle,
  targetAudience,
  onGenerate
}: AIContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateContent = async () => {
    if (!bookTitle || !targetAudience) {
      toast({
        title: 'エラー',
        description: '本のタイトルと対象読者が必要です。',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const success = await onGenerate(nodeId, bookTitle, targetAudience);
      if (success) {
        toast({
          title: '成功',
          description: 'コンテンツの生成が完了しました。',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'エラー',
        description: 'コンテンツの生成に失敗しました。',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerateContent}
        disabled={isGenerating}
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md font-semibold text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        AIでコンテンツを生成
      </button>
      {isGenerating && (
        <GenerationProgress message="AI編集者がコンテンツを執筆しています..." />
      )}
    </div>
  );
}