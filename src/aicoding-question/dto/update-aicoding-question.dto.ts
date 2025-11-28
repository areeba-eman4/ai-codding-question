import { PartialType } from '@nestjs/mapped-types';
import { CodingQuestionDto } from './coding-question.dto';

export class UpdateAicodingQuestionDto extends PartialType(CodingQuestionDto) {}
