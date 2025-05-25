import fs from 'fs';
import path from 'path';

export type EmbeddedChunk = {
  id: string;
  text: string;
  embedding: number[];
};

const FILE_PATH = path.join(process.cwd(), 'chunks.json');

export function storeChunksInMemory(chunks: EmbeddedChunk[]) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(chunks, null, 2), 'utf-8');
}

export function getStoredChunks(): EmbeddedChunk[] {
  if (!fs.existsSync(FILE_PATH)) return [];
  const raw = fs.readFileSync(FILE_PATH, 'utf-8');
  return JSON.parse(raw) as EmbeddedChunk[];
}
