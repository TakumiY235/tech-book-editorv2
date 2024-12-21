import { NodeType, NodeStatus } from '@prisma/client';

export interface ValidationResult {
  success: boolean;
  error: Record<string, string[]>;
}

export class ValidationService {
  static validateProjectCreation(data: any): ValidationResult {
    const errors: Record<string, string[]> = {};
    
    if (!data.name || typeof data.name !== 'string') {
      errors.name = ['Project name is required and must be a string'];
    }

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }

  static validateProjectUpdate(data: any): ValidationResult {
    const errors: Record<string, string[]> = {};
    
    if (data.name && typeof data.name !== 'string') {
      errors.name = ['Project name must be a string'];
    }

    if (data.metadata && typeof data.metadata !== 'object') {
      errors.metadata = ['Metadata must be an object'];
    }

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }

  static validateNodeCreation(data: any): ValidationResult {
    const errors: Record<string, string[]> = {};

    if (!data.title || typeof data.title !== 'string') {
      errors.title = ['Title is required and must be a string'];
    }

    if (!data.type || !Object.values(NodeType).includes(data.type)) {
      errors.type = ['Type must be either "section" or "subsection"'];
    }

    if (data.parentId && typeof data.parentId !== 'string') {
      errors.parentId = ['Parent ID must be a string'];
    }

    if (data.description && typeof data.description !== 'string') {
      errors.description = ['Description must be a string'];
    }

    if (data.purpose && typeof data.purpose !== 'string') {
      errors.purpose = ['Purpose must be a string'];
    }

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }

  static validateNodeUpdate(data: any): ValidationResult {
    const errors: Record<string, string[]> = {};

    if (data.title && typeof data.title !== 'string') {
      errors.title = ['Title must be a string'];
    }

    if (data.type && !Object.values(NodeType).includes(data.type)) {
      errors.type = ['Type must be either "section" or "subsection"'];
    }

    if (data.status && !Object.values(NodeStatus).includes(data.status)) {
      errors.status = ['Invalid status value'];
    }

    if (data.description && typeof data.description !== 'string') {
      errors.description = ['Description must be a string'];
    }

    if (data.purpose && typeof data.purpose !== 'string') {
      errors.purpose = ['Purpose must be a string'];
    }

    if (data.content && typeof data.content !== 'string') {
      errors.content = ['Content must be a string'];
    }

    if (data.metadata && typeof data.metadata !== 'object') {
      errors.metadata = ['Metadata must be an object'];
    }

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }

  static validateNodeReorder(data: any): ValidationResult {
    const errors: Record<string, string[]> = {};

    if (!Array.isArray(data.nodes)) {
      errors.nodes = ['Nodes must be an array'];
      return { success: false, error: errors };
    }

    const invalidNodes = data.nodes.filter(
      (node: any) =>
        typeof node !== 'object' ||
        typeof node.id !== 'string' ||
        typeof node.order !== 'number'
    );

    if (invalidNodes.length > 0) {
      errors.nodes = ['Each node must have an id (string) and order (number)'];
    }

    return {
      success: Object.keys(errors).length === 0,
      error: errors
    };
  }
}