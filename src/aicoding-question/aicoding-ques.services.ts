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
        { role: "system", content: "You are a helpful coding assistant that generates valid JSON responses." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
    console.log('AI Full Response:', response);

    // Extract AI response
    let raw = response.choices[0].message?.content || '';
    console.log('AI Raw Output:', raw);
    
    // Remove markdown code blocks
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    raw = raw.replace(/,(\s*[}\]])/g, '$1');
    
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      console.error('Initial parse failed, trying aggressive sanitization:', err.message);
      const aggressiveClean = this.aggressiveSanitize(raw);
      const parsed = JSON.parse(aggressiveClean);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
  }

  private aggressiveSanitize(jsonStr: string): string {
    // Remove any control characters except newlines in strings
    jsonStr = jsonStr.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
    
    // Fix common JSON issues
    jsonStr = jsonStr
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix multiple commas
      .replace(/,+/g, ',')
      .replace(/,(\s*\])/g, '$1')
      .replace(/,(\s*})/g, '$1');

    return jsonStr;
  }

  private buildPrompt(options: {
    languages: string[];
    type: string;
    difficulty: string;
    Count?: number;
  }): string {
    const count = options.Count || 1;
    const languagesList = options.languages.join(', ');

    return `
Generate ${count} coding question(s) of type "${options.type}" and difficulty "${options.difficulty}".

REQUIREMENTS:
1. Create a unique, descriptive title for each question
2. provide starter code templates for these languages: ${languagesList}
3. Provide a COMPLETE WORKING SOLUTION in ${options.languages[0]} that:
   - Reads input from stdin (one input per line)
   - Processes the input according to the problem
   - Prints the output to stdout
   - Can be directly executed with the test cases
4. Provide 4 test cases with input and expected output

CRITICAL JSON FORMATTING:
- Return ONLY valid JSON (no markdown, no explanations, no code blocks)
- Use \\n for line breaks inside strings
- Escape all special characters: \\t for tabs, \\" for quotes
- No actual newlines inside string values
- No trailing commas
- Ensure proper JSON structure

${count === 1 ? 'Return a single object in this exact format:' : 'Return an array of objects in this exact format:'}

${count === 1 ? '' : '['}
{
  "title": "Descriptive Question Title",
  "languages": [${options.languages.map(lang => `"${lang}"`).join(', ')}],
  "description": "Clear problem description. Use \\n for line breaks. Include input/output format explanation.",
  "tags": ["relevant", "tags", "here"],
  "templates": [
${options.languages.map(lang => `    {
      "templateLanguage": "${lang}",
      "template": "// Starter code for ${lang}\\n// Function signature and basic structure only"
    }`).join(',\n')}
  ],
  "Solution": "Complete working ${options.languages[0]} code that reads from stdin and prints to stdout. Must work with provided test cases.",
  "testCases": [
    { "input": "test input 1", "output": "expected output 1" },
    { "input": "test input 2", "output": "expected output 2" },
    { "input": "test input 3", "output": "expected output 3" },
    { "input": "test input 4", "output": "expected output 4" }
  ],
  "difficultyLevel": "${options.difficulty.toLowerCase()}"
}${count === 1 ? '' : ','}
${count > 1 ? '... more objects ...' : ''}
${count === 1 ? '' : ']'}

EXAMPLE SOLUTION FORMAT for JavaScript:
"Solution": "const readline = require('readline');\\nconst rl = readline.createInterface({ input: process.stdin });\\n\\nrl.on('line', (input) => {\\n  const num = parseInt(input);\\n  console.log(num * 2);\\n  rl.close();\\n});"

EXAMPLE SOLUTION FORMAT for Python:
"Solution": "import sys\\nfor line in sys.stdin:\\n    num = int(line.strip())\\n    print(num * 2)"

Double-check your response is valid JSON before returning it.
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
            console.log(`Successfully generated question ${i + 1}: "${questions[0].title}"`);
            yield questions[0];
            break;
          }
        } catch (error) {
          retries++;
          console.error(`Error generating question ${i + 1} (attempt ${retries}/${maxRetries}):`, error.message);

          if (retries >= maxRetries) {
            console.error(`Failed to generate question ${i + 1} after ${maxRetries} attempts. Skipping...`);
            break;
          }

          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    console.log(`\n Finished generating questions`);
  }
}