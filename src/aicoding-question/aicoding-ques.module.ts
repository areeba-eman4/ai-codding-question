import { Module } from '@nestjs/common';
import { AICoddingQuesController } from './aicoding-ques.controller';
import { AICodingQuestionService } from './aicoding-ques.services';

@Module({
  controllers: [AICoddingQuesController],
  providers: [AICodingQuestionService],
})
export class AICodingQuestionsModule {}
