import { Injectable } from '@nestjs/common';
import { openai_model } from './ai/google.genai.provider'
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
    const response = await openai_model.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
    console.log('AI Full Response:', response);


    // Extract AI response
    let raw = response.choices[0].message?.content || '';
    console.log('AI Raw Output:', raw);
    // Remove markdown code blocks
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    raw = this.sanitizeJSON(raw);
    raw = raw.replace(/\r?\n/g, '');

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      const aggressiveClean = this.aggressiveSanitize(raw);
      const parsed = JSON.parse(aggressiveClean);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

  }
  private sanitizeJSON(jsonStr: string): string {
    // This function fixes common JSON issues that AI models produce

    // 1. Replace unescaped newlines in string values
    // Match string values and escape newlines within them
    jsonStr = jsonStr.replace(
      /"([^"\\]*(\\.[^"\\]*)*)"/g,
      (match) => {
        // Replace literal newlines with \n
        return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      }
    );

    return jsonStr;
  }

  private aggressiveSanitize(jsonStr: string): string {
    // Remove any actual newlines, tabs, etc. and replace with escaped versions
    jsonStr = jsonStr
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');

    // Remove any control characters
    jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, '');

    return jsonStr;
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
    You are an assistant to generate coding questions. I have a plateform where I take assessments from candidates. I need a template students will attempt and a complete solution code that will be sent to compiler with your provided test cases as input. Solution code should be able to read test cases inputs..
Generate ${count} coding question(s) of type "${options.type}" and difficulty "${options.difficulty} also create unique title.".
Return ONLY valid JSON array (no markdown, no explanation, no code blocks). 

CRITICAL JSON FORMATTING RULES:
1. All string values MUST escape special characters: \\n for newlines, \\t for tabs, \\" for quotes
2. No actual line breaks inside string values
3. All strings must be on a single line or use \\n for line breaks
4. Ensure proper comma placement between array elements and object properties

${count === 1 ? 'Return a single object:' : 'Return an array of objects:'}

${count === 1 ? '{' : '['}
  {
    "title": "Question Title",
    "languages": ["${options.languages.join('","')}"],
    "description": "Detailed question description. Use \\n for line breaks.",
    "tags": ["tag1", "tag2"],
    "templates": [
      {
        "templateLanguage": "javascript", 
        "template": "function solution() {\\n  // Code here\\n}"
      },
      {
        "templateLanguage": "python",
        "template": "class Solution:\\n    def method(self):\\n        # Code here"
      }
    ],
    "Solution": "give the solution to 1 of the template(starter code) also call that function to generate output using input",
    "testCases": [
      { "input": "1", "output": "2" },
      { "input": "2", "output": "4" },
      { "input": "3", "output": "6" },
      { "input": "4", "output": "8" }
    ],
    "difficultyLevel": "${options.difficulty.toLowerCase()}"",
  }${count === 1 ? '' : ','}
  ${count > 1 ? '' : ''}
${count === 1 ? '}' : ']'}

Languages to provide templates for: ${languagesList}.

IMPORTANT: 
- Double-check JSON validity before responding
- Escape all newlines as \\n
-in template just give the starter code only
- No raw line breaks in strings
- Valid JSON only, parseable by JSON.parse()
`;
  }

  async checkAI(): Promise<string> {
    const prompt = 'Hello AI, are you up?';
    const response = await openai_model.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
    let raw = response.choices[0].message?.content || ''

    return raw;
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
          console.log(`\n Generating question ${i + 1}/${count} (attempt ${retries + 1})`);

          const questions = await this.generateQuestion({
            ...options,
            Count: 1,
          });

          if (questions.length > 0) {
            console.log(` Successfully generated question ${i + 1}: "${questions[0].title}"`);
            yield questions[0];
            break; // Success, move to next question
          }
        } catch (error) {
          retries++;
          console.error(`❌ Error generating question ${i + 1} (attempt ${retries}/${maxRetries}):`, error.message);

          if (retries >= maxRetries) {
            console.error(`🚫 Failed to generate question ${i + 1} after ${maxRetries} attempts. Skipping...`);
            // Optionally yield an error object or just skip
            // yield { error: true, message: error.message } as any;
            break; // Skip this question and continue with next
          }

          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.log(`\n✨ Finished generating questions`);
  }
}