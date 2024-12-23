import { BookMetadata, Node, OrganizedNode } from '../../types/project';
import { AIServiceConfig } from './types';
import { AIServiceError } from './errors/AIServiceError';
import { YAMLService } from './formatters/YAMLService';
import { NodeValidator } from './validators/NodeValidator';
import { AnthropicClient } from './client/AnthropicClient';
import { ContentFormatter } from './formatters/ContentFormatter';
import { generateBookStructurePrompt } from './prompts/StructureGenerator';
import { generateSectionContentPrompt } from './prompts/ContentWriter';
import { generateRefineStructurePrompt } from './prompts/StructureImprover';
import { useNodeSplitting } from '../../hooks/useNodeSplitting';

export class AIEditorService {
  private readonly yamlService: YAMLService;
  private readonly validator: NodeValidator;
  private readonly client: AnthropicClient;
  private readonly formatter: ContentFormatter;
  public readonly nodeSplitting: ReturnType<typeof useNodeSplitting>;

  private static readonly DEFAULT_CONFIG: AIServiceConfig = {
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 4000,
    temperature: 0.7
  };

  constructor(
    anthropicApiKey: string,
    config: Partial<AIServiceConfig> = {}
  ) {
    const finalConfig = { ...AIEditorService.DEFAULT_CONFIG, ...config };
    
    this.yamlService = new YAMLService();
    this.validator = new NodeValidator();
    this.client = new AnthropicClient(anthropicApiKey, finalConfig);
    this.formatter = new ContentFormatter();
    this.nodeSplitting = useNodeSplitting(this.client);
  }

  async generateChapterStructure(metadata: BookMetadata): Promise<OrganizedNode[]> {
    try {
      this.validator.validateBookMetadata(metadata);

      const yamlContent = await this.client.makeRequest(
        generateBookStructurePrompt(metadata)
      );
      
      const cleanedContent = this.yamlService.cleanYAMLContent(yamlContent);
      const parsedNodes = this.yamlService.parseAndValidateYaml(cleanedContent);
      const validatedNodes = await this.nodeSplitting.processNodeSplitting(parsedNodes);
      
      return validatedNodes;
    } catch (error) {
      throw this.enhanceError('Failed to generate chapter structure', error);
    }
  }

  async refineChapterStructure(existingNodes: OrganizedNode[]): Promise<OrganizedNode[]> {
    try {
      const yamlContent = await this.client.makeRequest(
        generateRefineStructurePrompt(existingNodes)
      );
      
      const cleanedContent = this.yamlService.cleanYAMLContent(yamlContent);
      const refinedNodes = this.yamlService.parseAndValidateYaml(cleanedContent);
      
      // 既存のノードのIDと内容を保持
      const existingContents = new Map(
        existingNodes.map(node => [node.id, node.content])
      );

      // 洗練されたノードに既存の内容を引き継ぐ
      const nodesWithContent = refinedNodes.map(node => ({
        ...node,
        content: existingContents.get(node.id) || node.content || ''
      }));

      return nodesWithContent;
    } catch (error) {
      throw this.enhanceError('Failed to refine chapter structure', error);
    }
  }

  async generateSectionContent(
    bookTitle: string,
    targetAudience: string,
    currentNode: Node,
    previousNode: Node | null,
    nextNode: Node | null
  ): Promise<string> {
    try {
      // 必須フィールドの存在を確認
      if (!currentNode.description) {
        throw AIServiceError.validation('Node description is required for content generation');
      }

      // バリデーション
      this.validator.validateContentGenerationInputs(bookTitle, targetAudience, currentNode);

      // ContentWriter用の部分的なノード情報を作成
      const nodeForPrompt = {
        title: currentNode.title,
        description: currentNode.description,
        purpose: currentNode.purpose,
        n_pages: currentNode.n_pages
      };

      const prevNodeForPrompt = previousNode ? {
        title: previousNode.title,
        description: previousNode.description || '',
        content: previousNode.content
      } : null;

      const nextNodeForPrompt = nextNode ? {
        title: nextNode.title,
        description: nextNode.description || '',
        content: nextNode.content
      } : null;

      const content = await this.client.makeRequest(
        generateSectionContentPrompt(
          bookTitle,
          targetAudience,
          nodeForPrompt,
          prevNodeForPrompt,
          nextNodeForPrompt
        )
      );

      this.validator.validateGeneratedContent(content);
      return this.formatter.formatContent(content);
    } catch (error) {
      throw this.enhanceError(`Failed to generate content for "${currentNode.title}"`, error, {
        nodeId: currentNode.id,
        nodeType: currentNode.type,
        nodeTitle: currentNode.title
      });
    }
  }

  private enhanceError(message: string, error: unknown, context?: Record<string, unknown>): Error {
    if (error instanceof AIServiceError) {
      return new AIServiceError(
        `${message}: ${error.message}`,
        error.code,
        { ...error.context, ...context }
      );
    }
    return AIServiceError.unknown(error, { message, ...context });
  }
}
