import { ChapterStructure, BookMetadata } from '../../../types/project';
import { AIServiceError } from '../errors/AIServiceError';

export class NodeValidator {
  validateSubsections(subsections: ChapterStructure[], parentId: string): void {
    subsections.forEach(subsection => {
      if (subsection.type !== 'subsection') {
        throw AIServiceError.validation(
          `Invalid subsection type for node ${subsection.id}`,
          { nodeId: subsection.id, type: subsection.type }
        );
      }

      if (subsection.parentId !== parentId) {
        throw AIServiceError.validation(
          `Invalid parentId for subsection ${subsection.id}. Must be ${parentId}`,
          { nodeId: subsection.id, parentId: subsection.parentId, expectedParentId: parentId }
        );
      }

      this.validateSubsectionId(subsection.id, parentId);
    });
  }

  validateSubsectionId(id: string, parentId: string): void {
    const expectedPrefix = `${parentId}_sub`;
    if (!id.startsWith(expectedPrefix)) {
      throw AIServiceError.validation(
        `Invalid ID format for subsection ${id}. Must start with ${expectedPrefix}`,
        { id, expectedPrefix }
      );
    }

    const subNumber = id.slice(expectedPrefix.length);
    if (!/^\d+$/.test(subNumber)) {
      throw AIServiceError.validation(
        `Invalid subsection number in ID ${id}`,
        { id, subNumber }
      );
    }
  }

  validateContentGenerationInputs(
    bookTitle: string,
    targetAudience: string,
    node: ChapterStructure
  ): void {
    if (!bookTitle?.trim()) {
      throw AIServiceError.validation('Book title cannot be empty');
    }

    if (!targetAudience?.trim()) {
      throw AIServiceError.validation('Target audience cannot be empty');
    }

    if (!node.id || !node.title || !node.type) {
      throw AIServiceError.validation(
        'Invalid node structure: missing required fields',
        {
          nodeId: node.id,
          title: node.title,
          type: node.type
        }
      );
    }
  }

  validateGeneratedContent(content: string): void {
    if (!content?.trim() || content.trim().length < 10) {
      throw AIServiceError.validation('Generated content is too short or invalid', {
        contentLength: content?.length ?? 0
      });
    }
  }

  validateBookMetadata(metadata: BookMetadata): void {
    const requiredFields: (keyof BookMetadata)[] = [
      'title',
      'overview',
      'targetAudience',
      'pageCount'
    ];

    const missingFields = requiredFields.filter(
      field => !metadata[field]
    );

    if (missingFields.length > 0) {
      throw AIServiceError.validation(
        'Missing required metadata fields',
        { missingFields }
      );
    }

    if (metadata.pageCount <= 0) {
      throw AIServiceError.validation(
        'Page count must be greater than 0',
        { pageCount: metadata.pageCount }
      );
    }
  }
}