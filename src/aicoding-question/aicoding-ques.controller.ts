import { Controller, Query, Sse, Get } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AICodingQuestionService } from './aicoding-ques.services';

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
  ): Observable<any> {
    return new Observable((subscriber) => {
      this.codingService
        .generateQuestion({
          languages: languages.split(','),
          type,
          difficulty,
          Count: Number(count) || 1,
        })
        .then((result) => {
          subscriber.next({ data: result });
          subscriber.complete();
        })
        .catch((e) => subscriber.error(e));
    });
  }
}
