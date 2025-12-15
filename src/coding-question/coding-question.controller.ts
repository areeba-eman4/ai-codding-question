import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { CodingQuestionService } from './coding-question.service';
import { CodingQuestionDto, CreateMultipleCodingQuestionsDto } from './dto/create-coding-question.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { isValidObjectId } from 'mongoose';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Coding Questions')
@Controller('/api')
export class CodingQuestionController {
  constructor(private readonly codingQuestionService: CodingQuestionService) { }


  @Post('multiple-coding-questions')
  @ApiOperation({ summary: 'Create Multiple coding questions' })
  @ApiResponse({
    status: 200,
    description: 'Returns created coding questions',
    type: CreateMultipleCodingQuestionsDto,
  })
  async createMultiple(
    @Body() dto: CreateMultipleCodingQuestionsDto,
    // @Req() req: any,
  ) {
    if (!dto.codingQuestions || dto.codingQuestions.length === 0) {
      throw new BadRequestException('At least one coding question is required');
    }

    // const userId = req.user?._id; 

    const enrichedQuestions = dto.codingQuestions.map((q) => ({
      ...q,
      questionType: 'general',
      questionCategory: 'codingQuestion',
      createdBy: '65180a56c3f19457f7e49a07',
      updatedBy: '65180a56c3f19457f7e49a07',
    }));

    const result =
      await this.codingQuestionService.createMultipleCodingQuestions(
        enrichedQuestions,
      );

    return {
      success: true,
      message: 'Coding questions created successfully',
      count: result.length,
      data: result,
    };
  }

  @Get('/coding-questions/:id')
  @ApiOperation({ summary: 'Get coding question By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a Coding Question',
    type: CodingQuestionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Question not found',
  })

  getQuestionById(@Param('id') id: string) {
    const isValidId = isValidObjectId(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid coding question id');
    }
    return this.codingQuestionService.getQuestionByIdPopulatedTag(id);
  }

}