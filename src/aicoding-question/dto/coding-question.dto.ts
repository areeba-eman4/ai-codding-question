import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ example: 'const a = 2;' })
  template: string;
}

export class CodingQuestionDto {
  @ApiProperty({ example: 'Sample Title', description: 'The title of the coding question.' })
  @IsNotEmpty()
  title: string;

  @ApiHideProperty()
  questionType?: string;

  @ApiHideProperty()
  questionCategory?: string;

  @ApiProperty({ example: 'Sample Description', description: 'Description of the question.' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'javascript', description: 'Programming language.' })
  @IsOptional()
  language?: string;

  @ApiProperty({ example: true, description: 'True if multiple templates.' })
  @IsBoolean()
  isSingleTemplate: boolean;

  @ApiProperty({ type: [TemplateType], description: 'Starter code templates.' })
  templates: TemplateType[];

  @ApiProperty({ example: '652194b0b14d13342cb3c77e', description: 'Tag ID' })
  tag: string;

  @ApiProperty({ type: [TestCase], description: 'Test cases for the question.' })
  testCases: TestCase[];

  @ApiProperty({ example: 'medium', description: 'Difficulty level.' })
  @IsOptional()
  difficultyLevel?: string;

  @ApiHideProperty()
  createdBy?: string;

  @ApiHideProperty()
  updatedBy?: string;
}
