import { Controller, Query, Sse, Get } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AICodingQuestionService } from './aicoding-ques.services';
import { CodingQuestionDto } from './dto/coding-question.dto';

@Controller('aicoding-question')
export class AICoddingQuesController {
  constructor(private readonly codingService: AICodingQuestionService) {}

  @Get('checkAI')
  async checkAI(): Promise<string> {
    try {
      const response = await this.codingService.checkAI();
      return response;
    } catch(e){
      return `Error: ${e.message}`;
    }
  }

  @Get('generate')
  @Sse()
  generate(
    @Query('languages') languages: string,
    @Query('type') type: string,
    @Query('difficulty') difficulty: string,
    @Query('count') count: number,
  ): Observable<{ data: CodingQuestionDto }> {
    return new Observable((subscriber) => {
      (async () => {
        try {
          const generator = this.codingService.generateQuestionsStream({
            languages: languages.split(','),
            type,
            difficulty,
            Count: Number(count) || 1,
          });
          
          let questionCount = 0;
          
          for await (const question of generator) {
            questionCount++;
            subscriber.next({ data: question });
            console.log(` Streamed question ${questionCount} to client`);
          }
          
          console.log(` Stream completed. Total questions sent: ${questionCount}`);
          subscriber.complete();
          
        } catch (error) {
          console.error('❌ Streaming error:', error);
          subscriber.error(error);
        }
      })();
    });
  }
  
  // @Get('generate-batch')
  // async generateBatch(
  //   @Query('languages') languages: string,
  //   @Query('type') type: string,
  //   @Query('difficulty') difficulty: string,
  //   @Query('count') count: number,
  // ): Promise<CodingQuestionDto[]> {
  //   return this.codingService.generateQuestion({
  //     languages: languages.split(','),
  //     type,
  //     difficulty,
  //     Count: Number(count) || 1,
  //   });
  // }
}