import { Injectable } from '@nestjs/common';
import { openai_model } from './ai/google.genai.provider'
import { CodingQuestionDto } from './dto/coding-question.dto';

export interface codingQuestion {
  languages: string[];
  type: string;
  difficulty: string;
  Count?: number;
}

export type AICodingResponse = {
  title: string;
  description: string;
  languages: string[];
  difficultyLevel: string;
  tags: string[];
  templates: {
    templateLanguage: string;
    template: string;
  }[];
  Solution: string;
  testCases: {
    input: string;
    output: string;
  }[];
};

@Injectable()
export class AICodingQuestionService {
  async generateQuestion(options: codingQuestion): Promise<CodingQuestionDto[]> {
    const prompt = this.buildPrompt(options);

    // Using Responses API with parse method
    const response = await openai_model.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        { role: "system", content: "You are a helpful professional assistant in generating coding questions. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "AICodingQuestionResponse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              languages: {
                type: "array",
                items: { type: "string" }
              },
              difficultyLevel: { type: "string" },
              tags: {
                type: "array",
                items: { type: "string" }
              },
              templates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    templateLanguage: { type: "string" },
                    template: { type: "string" }
                  },
                  required: ["templateLanguage", "template"],
                  additionalProperties: false
                }
              },
              Solution: { type: "string" },
              testCases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    input: { type: "string" },
                    output: { type: "string" }
                  },
                  required: ["input", "output"],
                  additionalProperties: false
                }
              }
            },
            required: ["title", "description", "languages", "difficultyLevel", "tags", "templates", "Solution", "testCases"],
            additionalProperties: false
          }
        }
      },
      temperature: 0.7,
    });

    // Access parsed output directly - .parse() returns already parsed object
    const parsed = response.output_text as unknown as AICodingResponse;

    if (!parsed) {
      throw new Error('No parsed output in AI response');
    }

    // Transform to DTO
    const codingQuestionDto: CodingQuestionDto = {
      ...parsed,
      isSingleTemplate: parsed.templates.length === 1,
      tag: parsed.tags.length ? parsed.tags[0] : ""
    };

    console.log("Generated question:", codingQuestionDto.title);
    return [codingQuestionDto];
  }

  private buildPrompt(data: codingQuestion): string {
    return `Generate ${data.Count || 1} coding question(s) in strict JSON format.

REQUIREMENTS:
1. Create a unique, descriptive title for each question
2. Problem type: ${data.type} of difficulty level: ${data.difficulty}
3. Provide templates for languages: ${data.languages.join(', ')}
4. Provide a COMPLETE WORKING SOLUTION in ${data.languages[0]} that:
   - Reads input from stdin (one input per line)
   - Processes the input according to the problem
   - Prints the output to stdout
   - Can be directly executed with the test cases
5. Provide at least 4 test cases with input and output
6. Include relevant tags for the question type

IMPORTANT: Return ONLY valid JSON matching the schema. No additional text or explanations.`;
  }

  async *generateQuestionsStream(options: {
    languages: string[];
    type: string;
    difficulty: string;
    Count?: number;
  }): AsyncGenerator<CodingQuestionDto> {
    const count = options.Count || 1;

    for (let i = 0; i < count; i++) {
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          console.log(`\nGenerating question ${i + 1}/${count} (attempt ${retries + 1})`);

          const questions = await this.generateQuestion({
            ...options,
            Count: 1,
          });

          if (questions.length > 0) {
            console.log(`Successfully generated question ${i + 1}: "${questions[0].title}"`);
            yield questions[0];
            break;
          }
        } catch (error) {
          retries++;
          console.error(
            `Error generating question ${i + 1} (attempt ${retries}/${maxRetries}):`,
            (error as Error).message
          );

          if (retries >= maxRetries) {
            console.error(`Failed to generate question ${i + 1} after ${maxRetries} attempts. Skipping...`);
            break;
          }

          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
        }
      }
    }

    console.log(`\nFinished generating questions`);
  }

  async checkAI(): Promise<string> {
    const prompt = 'Hello AI, are you up?';

    // Using Responses API
    const response = await openai_model.responses.create({
      model: "gpt-4o",
      input: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Extract text from response output
    const outputItem = response.output[0];
    
    if (!outputItem) {
      return 'No response';
    }

    // Handle different output types
    if ('content' in outputItem && Array.isArray(outputItem.content)) {
      const textContent = outputItem.content.find((item: any) => item.type === 'text');
      if (textContent && 'text' in textContent) {
        return (textContent as any).text || 'No response';
      }
    }
    
    return 'No response';
  }
}