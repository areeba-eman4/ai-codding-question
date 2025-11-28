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

    const first = response.content[0];
    console.log('AI Raw Response::::', response);
    let raw: string;

    if (typeof first === 'string') raw = first;
    else if (typeof first === 'object' && 'text' in first) raw = first.text as string;
    else raw = JSON.stringify(first);

    raw = raw.replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        console.log('Answerss::', parsed);
        return parsed;
      }
      else return [parsed];
    } catch (e) {
      console.error('Failed to parse JSON from AI:', raw);
      throw new Error('AI returned invalid JSON');
    }
  }


  private buildPrompt(options: {
      languages: string[];
      type: string;
      difficulty: string;
      Count?: number;
    }): string {
      return `
  Generate ${options.Count || 1} coding question(s) of type "${options.type}" and difficulty "${options.difficulty}".
  Return ONLY valid JSON with this structure (no markdown, no explanation):

  {
    "title": "",
    "description": "",
    "tags": ["tag1"],
    "templates": [
      {"templateLanguage": "${options.languages.join('","')}", "template": "..."}
    ],
    "testCases": [
      { "input": "1", "output": "2" },
      { "input": "2", "output": "4" },
      { "input": "3", "output": "6" },
      { "input": "4", "output": "8" }
    ],
    "difficultyLevel": "${options.difficulty}"
  }

  Languages to provide templates for: ${options.languages.join(', ')}.
  ONLY return strict JSON.
  `;
    }

  async checkAI(): Promise<string> {
    const prompt = 'Hello AI, are you up?';
    const response = await googlechatmodel.invoke(prompt);
    return response.content as string;
  }
}
