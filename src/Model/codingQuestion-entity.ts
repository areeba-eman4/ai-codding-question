import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CodingQuestion extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    questionType: string;

    @Prop()
    questionCategory: string;

    @Prop()
    description: string;

    @Prop()
    isSingleTemplate: boolean;

    @Prop()
    language: string;

    @Prop([
        {
            templateLanguage: String,
            template: String,
        },
    ])
    templates: {
        templateLanguage: string;
        template: string;
    }[];

    @Prop([
        {
            input: String,
            output: String,
        },
    ])
    testCases: {
        input: string;
        output: string;
    }[];

    @Prop()
    difficultyLevel: string;

    @Prop()
    tag: string;

    @Prop()
    createdBy: string;

    @Prop()
    updatedBy: string;
}

export const CodingQuestionSchema = SchemaFactory.createForClass(CodingQuestion);
