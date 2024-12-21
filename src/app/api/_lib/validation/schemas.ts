import { NodeType } from '@prisma/client';

// 共通のバリデーション関数
export const validateStringField = (value: any, fieldName: string): string[] => {
  if (!value || typeof value !== 'string') {
    return [`${fieldName} is required and must be a string`];
  }
  return [];
};

export const validateOptionalStringField = (value: any, fieldName: string): string[] => {
  if (value !== undefined && typeof value !== 'string') {
    return [`${fieldName} must be a string`];
  }
  return [];
};

export const validateObjectField = (value: any, fieldName: string): string[] => {
  if (value !== undefined && typeof value !== 'object') {
    return [`${fieldName} must be an object`];
  }
  return [];
};

// プロジェクト関連のスキーマ
export const createProjectSchema = {
  validate: (data: any) => {
    const errors: Record<string, string[]> = {};
    const nameErrors = validateStringField(data.name, 'Project name');
    if (nameErrors.length) errors.name = nameErrors;

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }
};

export const updateProjectSchema = {
  validate: (data: any) => {
    const errors: Record<string, string[]> = {};
    
    const nameErrors = validateOptionalStringField(data.name, 'Project name');
    if (nameErrors.length) errors.name = nameErrors;

    const metadataErrors = validateObjectField(data.metadata, 'Metadata');
    if (metadataErrors.length) errors.metadata = metadataErrors;

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }
};

// ノード関連のスキーマ
export const createNodeSchema = {
  validate: (data: any) => {
    const errors: Record<string, string[]> = {};

    const titleErrors = validateStringField(data.title, 'Title');
    if (titleErrors.length) errors.title = titleErrors;

    if (!data.type || !Object.values(NodeType).includes(data.type)) {
      errors.type = ['Type must be either "section" or "subsection"'];
    }

    const parentIdErrors = validateOptionalStringField(data.parentId, 'Parent ID');
    if (parentIdErrors.length) errors.parentId = parentIdErrors;

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }
};