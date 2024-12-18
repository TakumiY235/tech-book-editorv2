'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

interface BookMetadata {
  title: string;
  overview: string;
  targetAudience: string;
  pageCount: number;
}

interface BookMetadataFormProps {
  onGenerateStructure: (metadata: BookMetadata) => Promise<void>;
  isLoading: boolean;
}

export default function BookMetadataForm({ onGenerateStructure, isLoading }: BookMetadataFormProps) {
  const [metadata, setMetadata] = useState<BookMetadata>({
    title: '',
    overview: '',
    targetAudience: '',
    pageCount: 0
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metadata.title || !metadata.overview || !metadata.targetAudience || metadata.pageCount <= 0) {
      toast({
        title: '入力エラー',
        description: 'すべての項目を入力してください。',
        variant: 'destructive'
      });
      return;
    }

    try {
      await onGenerateStructure(metadata);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '章立ての生成に失敗しました。',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">本のタイトル</label>
        <Input
          value={metadata.title}
          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          placeholder="例: 実践で学ぶソフトウェアアーキテクチャ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">概要</label>
        <Textarea
          value={metadata.overview}
          onChange={(e) => setMetadata(prev => ({ ...prev, overview: e.target.value }))}
          placeholder="本の概要を入力してください"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">想定読者</label>
        <Textarea
          value={metadata.targetAudience}
          onChange={(e) => setMetadata(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="想定読者を具体的に入力してください"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">ページ数</label>
        <Input
          type="number"
          value={metadata.pageCount || ''}
          onChange={(e) => setMetadata(prev => ({ ...prev, pageCount: parseInt(e.target.value) || 0 }))}
          min={1}
          step={1}
          placeholder="例: 200"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'AI編集者が章立てを考えています...' : 'AIで章立てを生成'}
      </Button>
    </form>
  );
}