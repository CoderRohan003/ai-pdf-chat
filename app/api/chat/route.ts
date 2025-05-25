import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { cosineSimilarity } from '@/lib/similarity';
import { getStoredChunks } from '@/lib/memory-store';
import { NextRequest, NextResponse } from 'next/server';

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  modelName: 'embedding-001',
});

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: 'models/gemini-2.0-flash', // Must be a valid model
  temperature: 0.2,
});

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    console.log('Received question:', question);

    const questionEmbedding = await embeddings.embedQuery(question);
    const chunks = getStoredChunks();

    console.log('Stored chunks count:', chunks.length);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No PDF data available for context' }, { status: 400 });
    }

    const scored = chunks.map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }));

    scored.forEach(c => {
      console.log(`Chunk ${c.id} score:`, c.score.toFixed(4));
    });

    const topChunks = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    const context = topChunks.map((c) => c.text).join('\n---\n');

    console.log('Constructed context:\n', context.substring(0, 1000)); // limit log size

    const prompt = `
Answer the question based only on the context below.
If the answer isn't in the context, say "I couldn't find that in the PDF."
Answer with a good interaction style, as if you were a helpful assistant. If I say good bye or bye, end the conversation.

Context:
${context}

Question: ${question}
`;

    console.log('Sending prompt to Gemini:\n', prompt.substring(0, 1000));

    const response = await llm.invoke(prompt);

    console.log('LLM response:', response);

    return NextResponse.json({ answer: response.text });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
