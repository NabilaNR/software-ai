export interface DocumentChunk {
  id: string;
  text: string;
  source: string;
  score?: number;
}

export interface IndexedDocument {
  id: string;
  filename: string;
  projectId: string;
  text: string;
  sizeBytes: number;
  status: 'Indexed' | 'Embedding Complete' | 'Ready for AI';
  uploadedAt: string;
}

export class RAGService {
  /**
   * Split a text document into overlapping chunks
   */
  static chunkText(text: string, filename: string, chunkSize: number = 800, overlap: number = 150): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    let start = 0;
    let index = 0;

    while (start < cleanedText.length) {
      const end = Math.min(start + chunkSize, cleanedText.length);
      let chunkText = cleanedText.slice(start, end);

      // Adjust start for next chunk
      start += chunkSize - overlap;

      chunks.push({
        id: `${filename}-chunk-${index++}`,
        text: chunkText,
        source: filename
      });

      if (end === cleanedText.length) {
        break;
      }
    }

    return chunks;
  }

  /**
   * Retrieve relevant chunks using a simple TF-IDF / Term Overlap search
   */
  static retrieve(query: string, documents: IndexedDocument[], limit: number = 5): DocumentChunk[] {
    if (!documents || documents.length === 0 || !query.trim()) {
      return [];
    }

    // 1. Gather all chunks
    const allChunks: DocumentChunk[] = [];
    for (const doc of documents) {
      const chunks = this.chunkText(doc.text, doc.filename);
      allChunks.push(...chunks);
    }

    // 2. Tokenize query (lowercase, alphanumeric words)
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return allChunks.slice(0, limit);
    }

    // 3. Compute score for each chunk based on token matches (simple BM25-like overlap)
    const scoredChunks = allChunks.map(chunk => {
      const chunkTokens = this.tokenize(chunk.text);
      const chunkTokenSet = new Set(chunkTokens);
      
      let score = 0;
      queryTokens.forEach(token => {
        // TF: How many times does token appear in the chunk?
        const count = chunkTokens.filter(t => t === token).length;
        if (count > 0) {
          // Simple scoring: term frequency + unique term bonus
          score += count * 1.5;
          score += 1.0; // keyword presence boost
        }
      });

      // Normalize by length slightly to avoid favoring excessively long chunks
      const lengthPenalty = Math.log(chunkTokens.length + 1);
      const finalScore = score / (lengthPenalty || 1);

      return {
        ...chunk,
        score: finalScore
      };
    });

    // 4. Sort and return top chunks with scores > 0
    return scoredChunks
      .filter(c => (c.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2); // Filter out short stop words like 'is', 'a', 'to', 'di', 'ke', etc.
  }
}
