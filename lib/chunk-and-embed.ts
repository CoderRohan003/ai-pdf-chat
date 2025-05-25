import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { storeChunksInMemory, EmbeddedChunk } from './memory-store';

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  modelName: 'embedding-001',
});

export async function processAndStorePDFText(text: string) {
  console.log('Original PDF text length:', text.length);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]);
  console.log('Chunk count:', docs.length);

  const embeddedChunks: EmbeddedChunk[] = await Promise.all(
    docs.map(async (doc, i) => {
      const embedding = await embeddings.embedQuery(doc.pageContent);
      return {
        id: `chunk_${i}`,
        text: doc.pageContent,
        embedding,
      };
    })
  );

  storeChunksInMemory(embeddedChunks);
  console.log('Chunks stored in memory.');
}
