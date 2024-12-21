import { useCallback } from 'react';

interface ContentGenerationProps {
  nodeId: string;
  bookTitle?: string;
  targetAudience?: string;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

interface GenerationResult {
  success: boolean;
  reason?: {
    hasBookTitle: boolean;
    hasTargetAudience: boolean;
    hasOnGenerateContent: boolean;
  };
  error?: string;
}

export function useContentGeneration({ 
  nodeId, 
  bookTitle, 
  targetAudience, 
  onGenerateContent 
}: ContentGenerationProps) {
  const handleGenerateContent = useCallback(async (): Promise<GenerationResult> => {
    if (!bookTitle || !targetAudience || !onGenerateContent) {
      return {
        success: false,
        reason: {
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