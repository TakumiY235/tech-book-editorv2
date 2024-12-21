import { useCallback } from 'react';
import { ContentGenerationProps, GenerationResult } from '../core/types/editor-types';

export function useContentGeneration({ 
  nodeId, 
  bookTitle, 
  targetAudience, 
  onGenerateContent 
}: ContentGenerationProps) {
  const handleGenerateContent = useCallback(async (): Promise<GenerationResult> => {
    if (!nodeId || !bookTitle || !targetAudience || !onGenerateContent) {
      return {
        success: false,
        reason: {
          hasNodeId: !!nodeId,
          hasBookTitle: !!bookTitle,
          hasTargetAudience: !!targetAudience,
          hasOnGenerateContent: !!onGenerateContent
        }
      };
    }

    try {
      await onGenerateContent(nodeId, bookTitle, targetAudience);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, [nodeId, bookTitle, targetAudience, onGenerateContent]);

  return { handleGenerateContent };
}