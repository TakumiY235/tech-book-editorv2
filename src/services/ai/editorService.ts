import Anthropic from '@anthropic-ai/sdk';
import { generateBookStructurePrompt } from './prompts/bookStructure';
import { generateSubsectionStructurePrompt } from './prompts/subsectionStructure';
import { generateSectionContentPrompt } from './prompts/sectionContent';
import { BookMetadata, ChapterStructure, NodeType } from './types';
import * as yaml from 'js-yaml';

interface AnthropicTextResponse {
  content: Array<{ type: string; text: string }>;
}

export class AIEditorService {
  private anthropic: Anthropic;
  private static readonly MODEL = "claude-3-5-sonnet-20241022";
  private static readonly MAX_TOKENS = 4000;
  private static readonly TEMPERATURE = 0.7;

  constructor(private anthropicApiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: this.anthropicApiKey
    });
  }

  // Public API Methods
  async generateChapterStructure(metadata: BookMetadata): Promise<ChapterStructure[]> {
    try {
      const yamlContent = await this.makeAnthropicRequest(
        generateBookStructurePrompt(metadata)
      );
      
      const parsedNodes = this.parseAndValidateYaml(yamlContent);
      let validatedNodes = this.validateAndTransformStructure(parsedNodes);
      validatedNodes = await this.processNodeSplitting(validatedNodes);
      
      return validatedNodes;
    } catch (error) {
      throw this.enhanceError('Failed to generate chapter structure', error);
    }
  }

  async generateSectionContent(
    bookTitle: string,
    targetAudience: string,
    node: ChapterStructure,
    previousNode: ChapterStructure | null,
    nextNode: ChapterStructure | null
  ): Promise<string> {
    try {
      this.validateContentGenerationInputs(bookTitle, targetAudience, node);

      const content = await this.makeAnthropicRequest(
        generateSectionContentPrompt(bookTitle, targetAudience, node, previousNode, nextNode)
      );

      return this.formatContent(content);
    } catch (error) {
      throw this.enhanceError(`Failed to generate content for "${node.title}"`, error, {
        nodeId: node.id,
        nodeType: node.type,
        nodeTitle: node.title
      });
    }
  }

  async generateNodeSubsections(
    node: ChapterStructure,
    parentNodes: ChapterStructure[],
    siblings: ChapterStructure[]
  ): Promise<ChapterStructure[]> {
    try {
      return await this.generateSubsections(node, parentNodes, siblings);
    } catch (error) {
      throw this.enhanceError(`Failed to generate subsections for node ${node.id}`, error);
    }
  }

  // Private Helper Methods
  private async makeAnthropicRequest(prompt: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: AIEditorService.MODEL,
        max_tokens: AIEditorService.MAX_TOKENS,
        temperature: AIEditorService.TEMPERATURE,
        messages: [{ role: "user", content: prompt }]
      });

      return this.extractTextContent(response as AnthropicTextResponse);
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  private extractTextContent(response: AnthropicTextResponse): string {
    if (!response.content?.[0] || response.content[0].type !== 'text') {
      throw new Error('Invalid response format from API');
    }
    return this.cleanContent(response.content[0].text);
  }

  private cleanContent(content: string): string {
    return this.removeThinkingTags(
      content
        .replace(/```ya?ml\n/g, '')
        .replace(/```\n?/g, '')
        .trim()
    );
  }

  private parseAndValidateYaml(content: string): any[] {
    try {
      const parsedYaml = yaml.load(content) as { nodes: any[] };
      if (!parsedYaml?.nodes || !Array.isArray(parsedYaml.nodes)) {
        throw new Error('Invalid YAML structure: missing or invalid nodes array');
      }
      return parsedYaml.nodes;
    } catch (error) {
      throw new Error(`YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndTransformStructure(nodes: any[]): ChapterStructure[] {
    return nodes.map((node, index) => this.validateAndTransformNode(node, index));
  }

  private validateAndTransformNode(node: any, index: number): ChapterStructure {
    this.validateRequiredFields(node, index);
    
    return {
      id: node.id,
      type: node.type as NodeType,
      title: node.title,
      description: String(node.description),
      purpose: String(node.purpose),
      order: typeof node.order === 'number' ? node.order : index,
      parentId: node.parentId ?? null,
      n_pages: node.n_pages,
      should_split: Boolean(node.should_split)
    };
  }

  private validateRequiredFields(node: any, index: number): void {
    const requiredFields = ['id', 'type', 'title', 'description', 'purpose', 'n_pages', 'should_split'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'should_split') return typeof node[field] !== 'boolean';
      if (field === 'n_pages') return typeof node[field] !== 'number';
      if (field === 'description') {
        return !node[field] || String(node[field]).trim() === '';
      }
      if (field === 'purpose') {
        return node[field] === undefined || node[field] === null || String(node[field]).trim() === '';
      }
      return !node[field];
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing or invalid fields in node at index ${index}: ${missingFields.join(', ')}`);
    }

    this.validateFieldContent(node, index);
  }

  private validateFieldContent(node: any, index: number): void {
    const description = String(node.description);
    const purpose = String(node.purpose);

    if (!description.trim()) {
      throw new Error(`Node at index ${index} has empty description`);
    }
    if (!purpose.trim()) {
      throw new Error(`Node at index ${index} has empty purpose`);
    }
    if (typeof node.n_pages !== 'number' || node.n_pages <= 0) {
      throw new Error(`Node at index ${index} has invalid n_pages: ${node.n_pages}`);
    }
  }

  private async processNodeSplitting(nodes: ChapterStructure[]): Promise<ChapterStructure[]> {
    const result: ChapterStructure[] = [];
    const nodesToProcess = [...nodes];

    while (nodesToProcess.length > 0) {
      const node = nodesToProcess.shift()!;
      
      if (node.should_split) {
        try {
          const subsections = await this.generateSubsections(node, [], []);
          result.push({ ...node, should_split: false });
          const processedSubsections = await this.processNodeSplitting(subsections);
          result.push(...processedSubsections);
        } catch (error) {
          console.error(`Failed to split node ${node.id}:`, error);
          result.push(node);
        }
      } else {
        result.push(node);
      }
    }

    return result;
  }

  private async generateSubsections(
    node: ChapterStructure,
    parentNodes: ChapterStructure[],
    siblings: ChapterStructure[]
  ): Promise<ChapterStructure[]> {
    const yamlContent = await this.makeAnthropicRequest(
      generateSubsectionStructurePrompt(node, parentNodes, siblings)
    );

    const subsections = this.validateAndTransformStructure(
      this.parseAndValidateYaml(yamlContent)
    );

    this.validateSubsections(subsections, node.id);
    return subsections;
  }

  private validateSubsections(subsections: ChapterStructure[], parentId: string): void {
    subsections.forEach(subsection => {
      if (subsection.type !== 'subsection') {
        throw new Error(`Invalid subsection type for node ${subsection.id}`);
      }
      if (subsection.parentId !== parentId) {
        throw new Error(`Invalid parentId for subsection ${subsection.id}. Must be ${parentId}`);
      }
      this.validateSubsectionId(subsection.id, parentId);
    });
  }

  private validateSubsectionId(id: string, parentId: string): void {
    const expectedPrefix = `${parentId}_sub`;
    if (!id.startsWith(expectedPrefix)) {
      throw new Error(`Invalid ID format for subsection ${id}. Must start with ${expectedPrefix}`);
    }
    const subNumber = id.slice(expectedPrefix.length);
    if (!/^\d+$/.test(subNumber)) {
      throw new Error(`Invalid subsection number in ID ${id}`);
    }
  }

  private validateContentGenerationInputs(
    bookTitle: string,
    targetAudience: string,
    node: ChapterStructure
  ): void {
    if (!bookTitle?.trim()) throw new Error('Book title cannot be empty');
    if (!targetAudience?.trim()) throw new Error('Target audience cannot be empty');
    if (!node.id || !node.title || !node.type) {
      throw new Error('Invalid node structure: missing required fields');
    }
  }

  private formatContent(content: string): string {
    if (!content?.trim() || content.trim().length < 10) {
      throw new Error('Generated content is too short or invalid');
    }
    return content.replace(/\n/g, '<br>');
  }

  private removeThinkingTags(content: string): string {
    return content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
  }

  private handleApiError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new Error('AI service rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('invalid_api_key')) {
        throw new Error('Invalid API key configuration');
      }
    }
    throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  private enhanceError(message: string, error: unknown, context?: Record<string, unknown>): Error {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const contextStr = context ? ` (Context: ${JSON.stringify(context)})` : '';
    return new Error(`${message}: ${errorMessage}${contextStr}`);
  }
}
