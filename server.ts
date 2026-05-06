import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate-plan', async (req, res) => {
  const { prompt, sources } = req.body;
  
  // RAG-lite: Inject sources into context
  const context = sources.map((s: any) => `Source (${s.type}): ${s.title}`).join('\n');
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional video producer. Generate a 20-scene video script in JSON format.
          Format: { "scenes": [ { "id": 1, "type": "title", "title": "...", "subtitle": "...", "data": { ... } }, ... ] }
          Scene types: title, split, terminal, meme, stats, tips, outro.
          Use the provided sources as context for accuracy.`
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nUser Prompt: ${prompt}`
        }
      ],
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(response.choices[0].message.content || '{}'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`AI Proxy Server running on http://localhost:${PORT}`);
});
