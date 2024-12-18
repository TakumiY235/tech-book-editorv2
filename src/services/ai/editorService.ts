import Anthropic from '@anthropic-ai/sdk';
import { generateBookStructurePrompt } from './prompts/bookStructure';
import { generateSubsectionStructurePrompt } from './prompts/subsectionStructure';
import { generateSectionContentPrompt } from './prompts/sectionContent';
import { BookMetadata, ChapterStructure, NodeType } from './types';

export class AIEditorService {
  private anthropic: Anthropic;

  constructor(private anthropicApiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: this.anthropicApiKey
    });
  }

  async generateChapterStructure(metadata: BookMetadata): Promise<ChapterStructure[]> {
    try {
      console.log('Sending request to Anthropic API with metadata:', metadata);

      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: generateBookStructurePrompt(metadata)
        }]
      });

      console.log('Received response from Anthropic API:', response);

      const messageContent = response.content[0];
      if (!messageContent || typeof messageContent.type !== 'string' || messageContent.type !== 'text') {
        throw new Error('Invalid response format from API');
      }

      const yamlContent = messageContent.type === 'text' ? messageContent.text : '';
      if (!yamlContent) {
        throw new Error('No YAML content received from API');
      }
      
      // Clean up the YAML content by removing markdown code block markers
      const cleanYamlContent = yamlContent
        .replace(/```ya?ml\n/g, '') // Remove opening ```yaml or ```yml
        .replace(/```\n?/g, '')     // Remove closing ```
        .trim();
      
      console.log('Cleaned YAML content:', cleanYamlContent);

      const yaml = require('js-yaml');
      const parsedYaml = yaml.load(cleanYamlContent);
      console.log('Parsed YAML:', parsedYaml);

      if (!parsedYaml || !parsedYaml.nodes || !Array.isArray(parsedYaml.nodes)) {
        throw new Error('Invalid YAML structure returned from API');
      }

      let validatedNodes = this.validateAndTransformStructure(parsedYaml.nodes);
      console.log('Validated nodes:', validatedNodes);

      // 分節化が必要なノードを処理
      validatedNodes = await this.processNodeSplitting(validatedNodes);
      console.log('Nodes after splitting:', validatedNodes);

      return validatedNodes;
    } catch (error) {
      console.error('Detailed error in generateChapterStructure:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate chapter structure: ${errorMessage}`);
    }
  }

  private validateAndTransformStructure(nodes: any[]): ChapterStructure[] {
    if (!Array.isArray(nodes)) {
      throw new Error('Invalid chapter structure format');
    }

    return nodes.map((node, index): ChapterStructure => {
      const requiredFields = ['id', 'type', 'title', 'description', 'purpose', 'n_pages', 'should_split'];
      const missingFields = requiredFields.filter(field => {
        if (field === 'should_split') {
          return typeof node[field] !== 'boolean';
        }
        return !node[field] && node[field] !== 0;
      });
      
      if (missingFields.length > 0) {
        console.error('Invalid node structure:', node);
        throw new Error(`Missing required fields in node at index ${index}: ${missingFields.join(', ')}`);
      }

      if (typeof node.description !== 'string' || node.description.trim() === '') {
        throw new Error(`Node at index ${index} has empty or invalid description`);
      }

      if (typeof node.purpose !== 'string' || node.purpose.trim() === '') {
        throw new Error(`Node at index ${index} has empty or invalid purpose`);
      }

      if (typeof node.n_pages !== 'number' || node.n_pages <= 0) {
        throw new Error(`Node at index ${index} has invalid n_pages: ${node.n_pages}`);
      }

      return {
        id: node.id,
        type: node.type as NodeType,
        title: node.title,
        description: node.description,
        purpose: node.purpose,
        order: typeof node.order === 'number' ? node.order : index,
        parentId: node.parentId ?? null,
        n_pages: node.n_pages,
        should_split: Boolean(node.should_split)
      };
    });
  }

  private async processNodeSplitting(nodes: ChapterStructure[]): Promise<ChapterStructure[]> {
    const result: ChapterStructure[] = [];
    const nodesToProcess = [...nodes];

    while (nodesToProcess.length > 0) {
      const node = nodesToProcess.shift()!;
      
      if (node.should_split) {
        try {
          // 現在のノードを分節化
          const subsections = await this.generateSubsections(node);
          const updatedNode = {
            ...node,
            should_split: false // 分節化完了を示す
          };
          result.push(updatedNode); // 更新された親ノードを追加

          // 生成された子ノードを再帰的に処理
          const processedSubsections = await this.processNodeSplitting(subsections);
          result.push(...processedSubsections);
        } catch (error) {
          console.error(`Failed to split node ${node.id}:`, error);
          // エラーが発生した場合は元のノードをそのまま使用（should_splitはtrueのまま）
          result.push(node);
        }
      } else {
        result.push(node);
      }
    }

    return result;
  }

  async generateSectionContent(
    bookTitle: string,
    targetAudience: string,
    node: ChapterStructure
  ): Promise<string> {
    try {
      console.log(`Generating content for node: ${node.id}`);

      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: generateSectionContentPrompt(bookTitle, targetAudience, node)
        }]
      });

      const messageContent = response.content[0];
      if (!messageContent || typeof messageContent.type !== 'string' || messageContent.type !== 'text') {
        throw new Error('Invalid response format from API');
      }

      const content = messageContent.type === 'text' ? messageContent.text : '';
      if (!content) {
        throw new Error('No content received from API');
      }

      // Convert newlines to <br> tags for proper rendering in the editor
      return content.replace(/\n/g, '<br>');
    } catch (error) {
      console.error(`Error generating content for node ${node.id}:`, error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateSubsections(node: ChapterStructure): Promise<ChapterStructure[]> {
    try {
      console.log(`Generating subsections for node: ${node.id}`);

      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: generateSubsectionStructurePrompt(node)
        }]
      });

      const messageContent = response.content[0];
      if (!messageContent || typeof messageContent.type !== 'string' || messageContent.type !== 'text') {
        throw new Error('Invalid response format from API');
      }

      const yamlContent = messageContent.type === 'text' ? messageContent.text : '';
      if (!yamlContent) {
        throw new Error('No YAML content received from API');
      }

      // Clean up and fix YAML content indentation
      const cleanYamlContent = yamlContent
        .replace(/```ya?ml\n/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Process YAML content
      const yaml = require('js-yaml');
      let parsedYaml;
      
      try {
        parsedYaml = yaml.load(cleanYamlContent);
      } catch (yamlError) {
        console.error('YAML parsing error:', yamlError);
        // Try to fix common YAML issues
        const fixedYamlContent = cleanYamlContent
          .split('\n')
          .filter(line => line.trim() && !line.trim().startsWith('#')) // Remove comments and empty lines
          .map(line => {
            // Ensure proper indentation for array items
            if (line.trim().startsWith('-')) {
              return '  ' + line.trim();
            }
            return line;
          })
          .join('\n');
        
        console.log('Attempting to parse fixed YAML:', fixedYamlContent);
        parsedYaml = yaml.load(fixedYamlContent);
      }

      if (!parsedYaml || !parsedYaml.nodes || !Array.isArray(parsedYaml.nodes)) {
        throw new Error(`Invalid YAML structure returned from API for subsections. Expected array of nodes but got: ${JSON.stringify(parsedYaml)}`);
      }

      // 分節化されたノードを検証して変換
      const subsections = this.validateAndTransformStructure(parsedYaml.nodes);
      subsections.forEach(subsection => {
        if (subsection.type !== 'subsection') {
          throw new Error(`Invalid subsection type for node ${subsection.id}`);
        }

        if (!subsection.parentId) {
          throw new Error(`Subsection ${subsection.id} must have a parent ID`);
        }

        // parentIdが存在することを型アサーションで明示
        const parentId: string = subsection.parentId;

        // parentIdが現在のノードのIDと一致することを確認
        if (parentId !== node.id) {
          throw new Error(`Invalid parentId for subsection ${subsection.id}. Must be ${node.id}`);
        }

        // IDの形式を検証（親ID_subN）
        const expectedPrefix = `${node.id}_sub`;
        if (!subsection.id.startsWith(expectedPrefix)) {
          throw new Error(`Invalid ID format for subsection ${subsection.id}. Must start with ${expectedPrefix}`);
        }

        const subNumber = subsection.id.slice(expectedPrefix.length);
        if (!/^\d+$/.test(subNumber)) {
          throw new Error(`Invalid subsection number in ID ${subsection.id}. Expected number after '${expectedPrefix}'`);
        }
      });

      return subsections;
    } catch (error) {
      console.error(`Error generating subsections for node ${node.id}:`, error);
      throw error;
    }
  }
}
