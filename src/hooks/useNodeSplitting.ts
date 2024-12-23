import { Node, OrganizedNode } from '../types/project';
import { YAMLService } from '../services/ai/formatters/YAMLService';
import { NodeValidator } from '../services/ai/validators/NodeValidator';
import { generateSubsectionStructurePrompt } from '../services/ai/prompts/StructureSplitter';
import { AnthropicClient } from '../services/ai/client/AnthropicClient';
import { AIServiceError } from '../services/ai/errors/AIServiceError';

export function useNodeSplitting(client: AnthropicClient) {
  const yamlService = new YAMLService();
  const validator = new NodeValidator();

  const generateSubsections = async (
    node: OrganizedNode,
    parentNodes: OrganizedNode[],
    siblings: OrganizedNode[]
  ): Promise<OrganizedNode[]> => {
    try {
      const yamlContent = await client.makeRequest(
        generateSubsectionStructurePrompt(node, parentNodes, siblings)
      );

      const cleanedContent = yamlService.cleanYAMLContent(yamlContent);
      const subsections = yamlService.parseAndValidateYaml(cleanedContent);
      
      validator.validateSubsections(subsections, node.id);
      return subsections;
    } catch (error) {
      throw enhanceError(`Failed to generate subsections for node ${node.id}`, error);
    }
  };

  const processNodeSplitting = async (nodes: Node[]): Promise<OrganizedNode[]> => {
    const result: OrganizedNode[] = [];
    const nodesToProcess = [...nodes];

    while (nodesToProcess.length > 0) {
      const node = nodesToProcess.shift()!;
      const organizedNode: OrganizedNode = { ...node, children: [] };
      
      if (node.should_split) {
        try {
          const subsections = await generateSubsections(organizedNode, [], []);
          const processedSubsections = await processNodeSplitting(
            subsections.map(sub => ({ ...sub, children: [] }))
          );
          result.push({
            ...organizedNode,
            should_split: false,
            children: processedSubsections
          });
        } catch (error) {
          console.error(`Failed to split node ${node.id}:`, error);
          result.push(organizedNode);
        }
      } else {
        result.push(organizedNode);
      }
    }

    return result;
  };

  const enhanceError = (message: string, error: unknown): Error => {
    if (error instanceof AIServiceError) {
      return new AIServiceError(
        `${message}: ${error.message}`,
        error.code,
        error.context
      );
    }
    return AIServiceError.unknown(error, { message });
  };

  return {
    generateSubsections,
    processNodeSplitting
  };
}