import { BookMetadata, Node, OrganizedNode } from '../../types/project';
import { AIServiceConfig } from './types';
import { AIServiceError } from './errors/AIServiceError';
import { YAMLService } from './formatters/YAMLService';
import { NodeValidator } from './validators/NodeValidator';
import { AnthropicClient } from './client/AnthropicClient';
import { ContentFormatter } from './formatters/ContentFormatter';
import { generateBookStructurePrompt } from './prompts/StructureGenerator';
import { generateSubsectionStructurePrompt } from './prompts/StructureSplitter';
import { generateSectionContentPrompt } from './prompts/ContentWriter';
import { generateRefineStructurePrompt } from './prompts/StructureImprover';

export class AIEditorService {
  private readonly yamlService: YAMLService;
  private readonly validator: NodeValidator;
  private readonly client: AnthropicClient;
  private readonly formatter: ContentFormatter;

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
  }

  async generateChapterStructure(metadata: BookMetadata): Promise<OrganizedNode[]> {
    try {
      this.validator.validateBookMetadata(metadata);

      const yamlContent = await this.client.makeRequest(
        generateBookStructurePrompt(metadata)
      );
      
      const cleanedContent = this.yamlService.cleanYAMLContent(yamlContent);
      const parsedNodes = this.yamlService.parseAndValidateYaml(cleanedContent);
      const validatedNodes = await this.processNodeSplitting(parsedNodes);
      
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
    node: Node,
    previousNode: Node | null,
    nextNode: Node | null
  ): Promise<string> {
    try {
      this.validator.validateContentGenerationInputs(bookTitle, targetAudience, node);

      const content = await this.client.makeRequest(
        generateSectionContentPrompt(bookTitle, targetAudience, node, previousNode, nextNode)
      );

      this.validator.validateGeneratedContent(content);
      return this.formatter.formatContent(content);
    } catch (error) {
      throw this.enhanceError(`Failed to generate content for "${node.title}"`, error, {
        nodeId: node.id,
        nodeType: node.type,
        nodeTitle: node.title
      });
    }
  }

  async generateNodeSubsections(
    node: OrganizedNode,
    parentNodes: OrganizedNode[],
    siblings: OrganizedNode[]
  ): Promise<OrganizedNode[]> {
    try {
      const yamlContent = await this.client.makeRequest(
        generateSubsectionStructurePrompt(node, parentNodes, siblings)
      );

      const cleanedContent = this.yamlService.cleanYAMLContent(yamlContent);
      const subsections = this.yamlService.parseAndValidateYaml(cleanedContent);
      
      this.validator.validateSubsections(subsections, node.id);
      return subsections;
    } catch (error) {
      throw this.enhanceError(`Failed to generate subsections for node ${node.id}`, error);
    }
  }

  private async processNodeSplitting(nodes: OrganizedNode[]): Promise<OrganizedNode[]> {
    const result: OrganizedNode[] = [];
    const nodesToProcess = [...nodes];

    while (nodesToProcess.length > 0) {
      const node = nodesToProcess.shift()!;
      
      if (node.should_split) {
        try {
          const subsections = await this.generateNodeSubsections(node, [], []);
          // 分割されたノードを子ノードとして追加
          const processedSubsections = await this.processNodeSplitting(
            subsections.map(sub => ({ ...sub, children: [] }))
          );
          result.push({
            ...node,
            should_split: false,
            children: processedSubsections
          });
        } catch (error) {
          console.error(`Failed to split node ${node.id}:`, error);
          result.push({ ...node, children: [] });
        }
      } else {
        result.push({ ...node, children: [] });
      }
    }

    return result;
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