interface UseContentGenerationProps {
  onGenerateContent?: () => Promise<{ success: boolean }>;
}

export function useContentGeneration({ onGenerateContent }: UseContentGenerationProps) {
  const handleGenerateContent = async () => {
    if (!onGenerateContent) {
      return { success: false };
    }
    return onGenerateContent();
  };

  return {
    handleGenerateContent
  };
}