import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Error: GOOGLE_API_KEY is not set in the environment variables.");
  process.exit(1);
}

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.listen(port, () => {
  console.log(`Gemini Chatbot running on http://localhost:${port}`);
});

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    res.status(500).json({ error: 'An error occurred on the server.' });
  }
});
