import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CodingQuestionDto } from './dto/create-coding-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { CodingQuestion } from 'src/Model/codingQuestion-entity';

@Injectable()
export class CodingQuestionService {
  constructor(
    @InjectModel(CodingQuestion.name)
    private readonly codingQuestionModel: Model<CodingQuestion>
  ) {}

  private toObjectId(
    value: string | mongoose.Types.ObjectId | undefined,
    fieldName: string,
    questionTitle: string,
  ): mongoose.Types.ObjectId | undefined {
    if (!value) return undefined;
    
    if (value instanceof mongoose.Types.ObjectId) {
      return value;
    }

    if (typeof value === 'string') {
      if (mongoose.Types.ObjectId.isValid(value)) {
        return new mongoose.Types.ObjectId(value);
      } else {
        throw new BadRequestException(
          `Invalid ${fieldName} ID: ${value} for question "${questionTitle}"`,
        );
      }
    }

    return undefined;
  }

  async createMultipleCodingQuestions(questions: CodingQuestionDto[]) {
    const titles = questions.map((q) => q.title);
    const createdBy = questions[0].createdBy;

    const existingQuestions = await this.codingQuestionModel
      .find({
        title: { $in: titles },
        createdBy,
      })
      .select('title');

    const existingTitles = new Set(existingQuestions.map((q) => q.title));

    const duplicateTitles = questions
      .filter((q) => existingTitles.has(q.title))
      .map((q) => q.title);

    if (duplicateTitles.length > 0) {
      throw new BadRequestException(
        `Coding questions with titles "${duplicateTitles.join(', ')}" already exist`,
      );
    }

    const uniqueQuestions = questions.filter(
      (q, index, self) => index === self.findIndex((x) => x.title === q.title)
    );

    const questionsWithObjectIds = uniqueQuestions.map((question) => ({
      ...question,
      language: this.toObjectId(question.language as any, 'language', question.title),
      tag: this.toObjectId(question.tag as any, 'tag', question.title),
      createdBy: this.toObjectId(question.createdBy as any, 'createdBy', question.title),
    }));

    const createdQuestions = await this.codingQuestionModel.insertMany(
      questionsWithObjectIds,
    );

    return createdQuestions;
  }



  async getQuestionById(id: string) {
    const question = await this.codingQuestionModel
      .findById({ _id: id })
      .exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }
  async getQuestionByIdPopulatedTag(id: string) {
    const question = await this.codingQuestionModel
      .findById({ _id: id })
      .populate('tag')
      .exec()

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

}
