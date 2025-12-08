
import 'dotenv/config';
import OpenAI from 'openai';

export const openai_model = new OpenAI({
    apiKey: process.env.GOOGLE_API_KEY,
})