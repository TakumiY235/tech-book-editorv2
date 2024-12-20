import { ChapterStructure } from './types';

export interface AILogger {
  logRequest(prompt: string): void;
  logResponse(response: string): void;
  logFormatting(before: string, after: string): void;
  logValidation(structure: ChapterStructure[]): void;
  logError(error: Error, context?: Record<string, unknown>): void;
}

export class ConsoleAILogger implements AILogger {
  logRequest(prompt: string) {
    console.log('\n=== AI Request ===');
    console.log(prompt);
  }

  logResponse(response: string) {
    console.log('\n=== AI Response ===');
    console.log(response);
  }

  logFormatting(before: string, after: string) {
    console.log('\n=== Content Formatting ===');
    console.log('Before:', before);
    console.log('After:', after);
  }

  logValidation(structure: ChapterStructure[]) {
    console.log('\n=== Structure Validation ===');
    console.log(JSON.stringify(structure, null, 2));
  }

  logError(error: Error, context?: Record<string, unknown>) {
    console.error('\n=== Error ===');
    console.error('Message:', error.message);
    if (context) {
      console.error('Context:', context);
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}