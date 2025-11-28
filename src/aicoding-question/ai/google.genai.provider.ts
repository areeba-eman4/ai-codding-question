import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import 'dotenv/config';

export const genAIClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!); 

export const googlechatmodel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
     model: "gemini-2.5-flash",
})