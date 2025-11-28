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
      this.codingService
        .generateQuestion({
          languages: languages.split(','),
          type,
          difficulty,
          Count: Number(count) || 1,
        })
        .then((questions) => {
          // Stream each question one by one
          for (const q of questions) {
            subscriber.next({ data: q });
          }
          subscriber.complete();
        })
        .catch((e) => subscriber.error(e));
    });
  }
}
