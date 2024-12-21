'use client';

import { useState } from 'react';
import { useToast } from "@/components/ui/toast";
import { BookMetadata } from "@/types/project";

interface StructureGeneratorProps {
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

export function StructureGenerator({ 
  projectMetadata, 
  onGenerate, 
  onRefine,
  hasExistingStructure = false 
}: StructureGeneratorProps) {
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
    <div className="flex gap-2">
      <button
        onClick={handleGenerateStructure}
        disabled={isGenerating || isRefining}
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md font-semibold text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'AI編集者が章立てを考えています...' : 'AIで章立てを生成'}
      </button>
      {hasExistingStructure && onRefine && (
        <button
          onClick={handleRefineStructure}
          disabled={isGenerating || isRefining}
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md font-semibold text-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefining ? 'AI編集者が章立てを洗練中...' : 'AIで章立てを洗練'}
        </button>
      )}
    </div>
  );
}
