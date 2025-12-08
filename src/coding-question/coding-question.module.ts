import { Module } from '@nestjs/common';
import { CodingQuestionService } from './coding-question.service';
import { CodingQuestionController } from './coding-question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CodingQuestion, CodingQuestionSchema } from 'src/Model/codingQuestion-entity';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: CodingQuestion.name, schema: CodingQuestionSchema }
    ]),
  ],
  controllers: [CodingQuestionController],
  providers: [CodingQuestionService],
})
export class CodingQuestionModule {}