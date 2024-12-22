import * as yaml from 'js-yaml';
import { OrganizedNode } from '../../../types/project';
import { AIServiceError } from '../errors/AIServiceError';

export class YAMLService {
  parseAndValidateYaml(content: string): OrganizedNode[] {
    console.log('📄 YAML Parse Start:', {
      contentLength: content.length,
      firstLine: content.split('\n')[0]
    });

    try {
      const parsedYaml = yaml.load(content) as { nodes: any[] };
      
      if (!parsedYaml?.nodes || !Array.isArray(parsedYaml.nodes)) {
        console.error('❌ YAML Parse Error: Invalid structure - missing or invalid nodes array');
        throw AIServiceError.parsing('Invalid YAML structure: missing or invalid nodes array');
      }

      console.log('✅ YAML Parse Success:', {
        nodesCount: parsedYaml.nodes.length
      });

      return this.validateAndTransformStructure(parsedYaml.nodes);
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw AIServiceError.parsing(
        `YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateAndTransformStructure(nodes: any[]): OrganizedNode[] {
    console.log('🔍 Starting structure validation for', nodes.length, 'nodes');
    return nodes.map((node, index) => this.validateAndTransformNode(node, index));
  }

  private validateAndTransformNode(node: any, index: number): OrganizedNode {
    console.log(`🔍 Validating node ${index}:`, {
      id: node.id,
      title: node.title
    });

    this.validateRequiredFields(node, index);
    
    const transformedNode = {
      id: node.id,
      type: node.type,
      title: node.title,
      description: String(node.description),
      purpose: String(node.purpose),
      order: typeof node.order === 'number' ? node.order : index,
      parentId: node.parentId ?? null,
      n_pages: node.n_pages,
      should_split: Boolean(node.should_split),
      children: node.children ? this.validateAndTransformStructure(node.children) : []
    };

    console.log(`✅ Node ${index} validated successfully`);
    return transformedNode;
  }

  private validateRequiredFields(node: any, index: number): void {
    console.log(`🔍 Validating required fields for node ${index}`);
    
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
      console.error('❌ Validation Error:', {
        nodeIndex: index,
        missingFields,
        nodeId: node.id
      });
      
      throw AIServiceError.validation(
        `Missing or invalid fields in node at index ${index}: ${missingFields.join(', ')}`,
        { index, missingFields }
      );
    }

    console.log(`✅ Required fields validated for node ${index}`);
    this.validateFieldContent(node, index);
  }

  private validateFieldContent(node: any, index: number): void {
    const description = String(node.description);
    const purpose = String(node.purpose);

    if (!description.trim()) {
      throw AIServiceError.validation(`Node at index ${index} has empty description`, {
        index,
        field: 'description'
      });
    }

    if (!purpose.trim()) {
      throw AIServiceError.validation(`Node at index ${index} has empty purpose`, {
        index,
        field: 'purpose'
      });
    }

    if (typeof node.n_pages !== 'number' || node.n_pages <= 0) {
      throw AIServiceError.validation(`Node at index ${index} has invalid n_pages: ${node.n_pages}`, {
        index,
        field: 'n_pages',
        value: node.n_pages
      });
    }
  }

  cleanYAMLContent(content: string): string {
    return content
      .replace(/```ya?ml\n/g, '')
      .replace(/```\n?/g, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>\n?/g, '')  // Remove thinking tags and their content
      .trim();
  }
}