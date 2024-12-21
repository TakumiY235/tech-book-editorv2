import Anthropic from '@anthropic-ai/sdk';
import { AIServiceConfig, AnthropicTextResponse } from '../types';
import { AIServiceError } from '../errors/AIServiceError';

export class AnthropicClient {
  private anthropic: Anthropic;
  private config: AIServiceConfig;

  constructor(apiKey: string, config: AIServiceConfig) {
    this.anthropic = new Anthropic({
      apiKey
    });
    this.config = config;
  }

  async makeRequest(prompt: string): Promise<string> {
    try {
      console.log('🤖 Anthropic API Request:', {
        model: this.config.model,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        prompt: prompt.substring(0, 100) + '...' // 長いプロンプトは省略
      });

      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [{ role: "user", content: prompt }]
      }) as AnthropicTextResponse;

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') {
        throw new Error('Expected text response from API');
      }

      console.log('🤖 Anthropic API Response:', {
        status: 'success',
        contentLength: firstContent.text.length,
        tokens: response.usage
      });

      console.log('📝 Response Content:', firstContent.text.substring(0, 100) + '...');

      return firstContent.text;
    } catch (error) {
      this.handleApiError(error);
      throw error; // This line will never be reached due to handleApiError always throwing
    }
  }

  private extractTextContent(response: AnthropicTextResponse): string {
    if (!response.content?.[0] || response.content[0].type !== 'text') {
      throw AIServiceError.api('Invalid response format from API');
    }
    return response.content[0].text;
  }

  private handleApiError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw AIServiceError.rateLimit();
      }
      if (error.message.includes('invalid_api_key')) {
        throw AIServiceError.authentication();
      }
      throw AIServiceError.api(error.message);
    }
    throw AIServiceError.unknown(error);
  }
}