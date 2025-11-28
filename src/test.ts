import 'dotenv/config'; // automatically loads .env into process.env
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY); // check it prints correctly

const client = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
});

async function test() {
  try {
    const response = await client.invoke("Hello, this is Areeba");
    console.log(response.content);
  } catch (e) {
    console.error(e);
  }
}

test();
