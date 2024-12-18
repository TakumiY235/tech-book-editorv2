'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectEditor, BookMetadata } from '@/hooks/useProjectEditor';
import BookMetadataForm from '@/components/projects/book-metadata-form';
import { NodeList } from '@/components/projects/node-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToastProvider, useToast } from '@/components/ui/toast';

function ProjectStructureContent() {
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const {
    project,
    organizedNodes,
    selectedNodeId,
    onDragEnd,
    setSelectedNodeId,
    handleDeleteNode,
    handleUpdateNodeTitle,
    handleCreateSubsection,
    generateStructureWithAI,
  } = useProjectEditor({
    id: params.id as string,
    name: '',
    nodes: []
  });

  const handleGenerateStructure = async (metadata: BookMetadata) => {
    setIsGenerating(true);
    try {
      await generateStructureWithAI(metadata);
      toast({
        title: '章立ての生成が完了しました',
        description: 'AIによって生成された章立てを確認・編集できます。',
      });
    } catch (error) {
      toast({
        title: 'エラーが発生しました',
        description: '章立ての生成に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">本のメタデータ</h2>
          <BookMetadataForm
            onGenerateStructure={handleGenerateStructure}
            isLoading={isGenerating}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">章立て構造</h2>
          {organizedNodes.length > 0 ? (
            <NodeList
              organizedNodes={organizedNodes}
              selectedNodeId={selectedNodeId}
              onDragEnd={onDragEnd}
              onSelect={setSelectedNodeId}
              onDelete={handleDeleteNode}
              onUpdateTitle={handleUpdateNodeTitle}
              onCreateSubsection={handleCreateSubsection}
            />
          ) : (
            <Alert>
              <AlertDescription>
                章立てがまだ作成されていません。左のフォームからAIに章立ての生成を依頼するか、
                手動で章を追加してください。
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectStructurePage() {
  return (
    <ToastProvider>
      <ProjectStructureContent />
    </ToastProvider>
  );
}