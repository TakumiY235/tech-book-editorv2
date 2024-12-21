'use client';

import { useState } from 'react';
import { useToast } from '../../ui/toast';
import { BookMetadata } from '../../../types/project';
import { GenerationProgress } from '../ai-generation/common/GenerationProgress';
import { GenerationOptions } from '../ai-generation/common/GenerationOptions';

interface AIStructureGeneratorProps {
  projectMetadata: BookMetadata;
  onGenerate: (metadata: {
    title: string;
    overview: string;
    targetAudience: string;
    pageCount: number;
  }) => Promise<void>;
  onRefine?: () => Promise<void>;
  hasExistingStructure?: boolean;
}

export function AIStructureGenerator({
  projectMetadata,
  onGenerate,
  onRefine,
  hasExistingStructure = false
}: AIStructureGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const handleGenerateStructure = async () => {
    const { title, overview, targetAudience, pageCount } = projectMetadata;

    if (!title || !targetAudience || !overview || !pageCount) {
      toast({
        title: 'エラー',
        description: '本のタイトル、対象読者、概要、ページ数を入力してください。',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate({
        title,
        overview,
        targetAudience,
        pageCount
      });
      toast({
        title: '成功',
        description: '章立ての生成が完了しました。',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error generating structure:', error);
      toast({
        title: 'エラー',
        description: '章立ての生成に失敗しました。',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineStructure = async () => {
    if (!onRefine) return;

    setIsRefining(true);
    try {
      await onRefine();
      toast({
        title: '成功',
        description: '章立ての洗練が完了しました。',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error refining structure:', error);
      toast({
        title: 'エラー',
        description: '章立ての洗練に失敗しました。',
        variant: 'destructive'
      });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-4">
      <GenerationOptions
        onGenerate={handleGenerateStructure}
        onRefine={hasExistingStructure ? handleRefineStructure : undefined}
        isGenerating={isGenerating}
        isRefining={isRefining}
      />
      {(isGenerating || isRefining) && (
        <GenerationProgress
          message={
            isGenerating
              ? 'AI編集者が章立てを考えています...'
              : 'AI編集者が章立てを洗練中...'
          }
        />
      )}
    </div>
  );
}