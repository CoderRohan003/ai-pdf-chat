declare module 'pdf-parse' {
  interface PDFMetadata {
    metadata: any;
    info: any;
    version: string;
  }

  interface PDFParseData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  export default function pdf(
    dataBuffer: Buffer
  ): Promise<PDFParseData>;
}
