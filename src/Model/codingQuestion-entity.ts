import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, mongo } from 'mongoose';

@Schema({ timestamps: true })
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

    @Prop({type: mongoose.Schema.ObjectId, ref: 'language'})
    language: mongoose.Types.ObjectId;

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

    @Prop({type: mongoose.Schema.ObjectId, ref: 'tag'})
    tag: mongoose.Types.ObjectId;

    @Prop()
    createdBy: mongoose.Types.ObjectId;

    @Prop()
    updatedBy: mongoose.Types.ObjectId;
}

export const CodingQuestionSchema = SchemaFactory.createForClass(CodingQuestion);
