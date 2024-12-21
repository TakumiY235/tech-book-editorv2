'use client';

// Types
type ErrorResponse = {
  error?: string;
  message?: string;
  statusText?: string;
};

type ErrorHandlerOptions = {
  shouldThrow?: boolean;
  customMessage?: string;
};

// Error Messages
const ERROR_MESSAGES = {
  AI: {
    CONTENT_GENERATION: 'Failed to generate content',
    STRUCTURE_GENERATION: 'Failed to generate structure',
    SUBSECTION_GENERATION: 'Failed to generate subsections'
  },
  PROJECT: {
    IMPORT: 'Failed to import YAML',
    METADATA_UPDATE: 'Failed to update project metadata',
    FETCH: 'Failed to fetch project'
  },
  NODE: {
    DELETE: 'Failed to delete node',
    UPDATE_TITLE: 'Failed to update title',
    CREATE_SUBSECTION: 'Failed to create subsection',
    REORDER: 'Failed to reorder nodes'
  }
};

// Utility Functions
const createErrorHandler = (
  context: string,
  options: ErrorHandlerOptions = { shouldThrow: true }
) => {
  return (error: unknown, additionalInfo?: Record<string, unknown>) => {
    const errorMessage = extractErrorMessage(error);
    const fullMessage = options.customMessage || errorMessage;
    
    // Structured error logging
    console.error(`Error in ${context}:`, {
      message: fullMessage,
      originalError: error,
      ...additionalInfo
    });

    if (options.shouldThrow) {
      throw new Error(fullMessage);
    }
  };
};

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as ErrorResponse;
    return errorObj.error || errorObj.message || errorObj.statusText || 'Unknown error';
  }
  return 'Unknown error occurred';
};

// AI Operations Error Handlers
export const handleAIOperationsError = {
  handleContentGenerationError: createErrorHandler('AI Content Generation', {
    customMessage: ERROR_MESSAGES.AI.CONTENT_GENERATION
  }),

  handleStructureGenerationError: createErrorHandler('AI Structure Generation', {
    customMessage: ERROR_MESSAGES.AI.STRUCTURE_GENERATION
  }),

  handleSubsectionGenerationError: createErrorHandler('AI Subsection Generation', {
    customMessage: ERROR_MESSAGES.AI.SUBSECTION_GENERATION
  })
};

// Project Import Error Handlers
export const handleProjectImportError = {
  handleYamlImportError: createErrorHandler('Project Import', {
    customMessage: ERROR_MESSAGES.PROJECT.IMPORT
  })
};

// Project Metadata Error Handlers
export const handleProjectMetadataError = {
  handleUpdateError: createErrorHandler('Project Metadata Update', {
    shouldThrow: false,
    customMessage: ERROR_MESSAGES.PROJECT.METADATA_UPDATE
  })
};

// Project Editor Error Handlers
export const handleProjectEditorError = {
  handleFetchError: async (response: Response, projectId: string) => {
    if (!response.ok) {
      const errorHandler = createErrorHandler('Project Fetch', {
        customMessage: ERROR_MESSAGES.PROJECT.FETCH
      });
      
      errorHandler(response.statusText, { projectId, status: response.status });
    }
    return await response.json();
  }
};

// Node Operations Error Handlers
export const handleNodeOperationsError = {
  handleDeleteError: createErrorHandler('Node Delete', {
    shouldThrow: false,
    customMessage: ERROR_MESSAGES.NODE.DELETE
  }),

  handleUpdateTitleError: createErrorHandler('Node Title Update', {
    shouldThrow: false,
    customMessage: ERROR_MESSAGES.NODE.UPDATE_TITLE
  }),

  handleCreateSubsectionError: createErrorHandler('Node Subsection Creation', {
    shouldThrow: false,
    customMessage: ERROR_MESSAGES.NODE.CREATE_SUBSECTION
  }),

  handleReorderError: createErrorHandler('Node Reorder', {
    shouldThrow: false,
    customMessage: ERROR_MESSAGES.NODE.REORDER
  })
};