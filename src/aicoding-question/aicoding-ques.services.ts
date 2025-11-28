import { Injectable } from '@nestjs/common';
import { googlechatmodel } from './ai/google.genai.provider';
import { CodingQuestionDto } from './dto/coding-question.dto';

@Injectable()
export class AICodingQuestionService {
  async generateQuestion(options: {
    languages: string[];
    type: string;
    difficulty: string;
    Count?: number;
  }): Promise<CodingQuestionDto[]> {
    const prompt = this.buildPrompt(options);
    const response = await googlechatmodel.invoke(prompt);
    console.log('AI Full Response:', response);
    
    // Extract the raw text from the response
    let raw: string;

    // Check if content is a string directly
    if (typeof response.content === 'string') {
      raw = response.content;
    } 
    // Check if content is an array
    else if (Array.isArray(response.content)) {
      const first = response.content[0];

      if (typeof first === "string") {
        raw = first;
      } 
      else if (
        typeof first === "object" &&
        first !== null &&
        "text" in first &&
        typeof first.text === "string"
      ) {
        raw = first.text;
      } 
      else {
        raw = JSON.stringify(first);
      }
    }
    // Fallback
    else {
      raw = JSON.stringify(response.content);
    }

    console.log("AI Raw Content:", raw);

    // Remove markdown code blocks and trim
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    console.log("AI Cleaned Content:", raw);

    try {
      const parsed = JSON.parse(raw);
      console.log('Parsed AI JSON:', parsed);
      // Normalize: always return an array
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      console.error('Failed to parse AI JSON:', raw);
      console.error('Parse error:', err.message);
      throw new Error(`AI returned invalid JSON: ${err.message}`);
    }
  }

  private buildPrompt(options: {
    languages: string[];
    type: string;
    difficulty: string;
    Count?: number;
  }): string {
    const count = options.Count || 1;
    const languagesList = options.languages.join('", "');
    
    return `
Generate ${count} coding question(s) of type "${options.type}" and difficulty "${options.difficulty}".
Return ONLY valid JSON array (no markdown, no explanation, no code blocks).

${count === 1 ? 'Return a single object:' : 'Return an array of objects:'}

${count === 1 ? '{' : '['}
  {
    "title": "Question Title",
    "description": "Detailed question description",
    "tags": ["tag1", "tag2"],
    "templates": [
      {"templateLanguage": "js", "template": "function code here..."},
      {"templateLanguage": "python", "template": "class Solution:\\n    def method..."}
    ],
    "testCases": [
      { "input": "1", "output": "2" },
      { "input": "2", "output": "4" },
      { "input": "3", "output": "6" },
      { "input": "4", "output": "8" }
    ],
    "difficultyLevel": "${options.difficulty}"
  }${count === 1 ? '' : ','}
  ${count > 1 ? '...' : ''}
${count === 1 ? '}' : ']'}

Languages to provide templates for: ${languagesList}.

CRITICAL: Return ONLY the JSON, no markdown blocks, no explanation text.
`;
  }

  async checkAI(): Promise<string> {
    const prompt = 'Hello AI, are you up?';
    const response = await googlechatmodel.invoke(prompt);
    
    // Handle string content directly
    if (typeof response.content === 'string') {
      return response.content;
    }
    
    // Handle array content
    if (Array.isArray(response.content)) {
      const first = response.content[0];
      
      if (typeof first === 'string') {
        return first;
      }

      if (first && typeof first === 'object') {
        const obj = first as unknown as { content?: unknown; text?: string };

        // Check for text property first
        if (typeof obj.text === 'string') {
          return obj.text;
        }

        if (obj.content !== undefined) {
          const contentStr = Array.isArray(obj.content)
            ? obj.content.join('')
            : String(obj.content);

          return contentStr.replace(/```/g, '').trim();
        }
      }

      return JSON.stringify(first);
    }

    return JSON.stringify(response.content);
  }
}