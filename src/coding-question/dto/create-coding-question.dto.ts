import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TestCase {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '1' })
  input: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '3' })
  output: string;
}
export class TemplateType {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'js' })
  templateLanguage: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'const var = 2' })
  template: string;
}

export class CodingQuestionDto {
  @ApiProperty({
    example: 'Sample Title',
    description: 'The title of the coding question.',
  })
  @IsNotEmpty()
  title: string;

  @ApiHideProperty()
  questionType: string;

  @ApiHideProperty()
  questionCategory: string;

  @ApiProperty({
    example: 'Sample Description',
    description: 'The description of the coding question.',
  })
  description: string;

  @ApiProperty({
    example: 'javascript',
    description: 'The programming language refid used for the question.',
  })
  @IsOptional()
  language: string;

  @ApiProperty({
    example: true,
    description: 'choose the template (single or multiple). true for multiple',
  })
  @IsBoolean()
  isSingleTemplate: boolean;

  @ApiProperty({
    example: [{ templateLanguage: 'javascript', template: '' }],
    description: 'the template for the given langauge.',
    type: [TemplateType],
  })
  // @IsOptional()
  templates: TemplateType[];

  // @ApiProperty({
  //   example: 'calculateSum',
  //   description: 'The name of the function to be implemented.',
  // })
  // functionName: string;

  @ApiProperty({
    example: '652194b0b14d13342cb3c77e',
    description: 'ref id for tag',
  })
  tag: string;
  // @ApiProperty({
  //   example: ['652194b0b14d13342cb3c77e'],
  //   description: 'ref ids for tags',
  // })
  // @IsString({ each: true })
  // tags: string[];

  @ApiProperty({
    example: [{ input: '1', output: '3' }],
    description: 'Test cases for the question in JSON format.',
    type: [TestCase],
  })
  // @IsString({ each: true })
  testCases: TestCase[];

  @ApiProperty({
    example: 'medium',
    description: 'The difficulty Level of the Question',
  })
  @IsOptional()
  difficultyLevel: string;

  @ApiHideProperty()
  createdBy: string;

  @ApiHideProperty()
  updatedBy: string;
}

export class CreateMultipleCodingQuestionsDto {
  @ApiProperty({
    type: [CodingQuestionDto],
    description: 'Array of coding questions to be created',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one Question must be provided' })
  @ValidateNested({ each: true })
  @Type(() => CodingQuestionDto)
  codingQuestions: CodingQuestionDto[];
}