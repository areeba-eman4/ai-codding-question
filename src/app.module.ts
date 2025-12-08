import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AICodingQuestionsModule } from './aicoding-question/aicoding-ques.module';
import { ConfigModule } from '@nestjs/config';
import { CodingQuestionModule } from './coding-question/coding-question.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL!, {}),
    AICodingQuestionsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CodingQuestionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
