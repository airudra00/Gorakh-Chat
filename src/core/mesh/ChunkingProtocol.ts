export const CHUNK_SIZE = 20 * 1024; // 20 KB per packet - optimal for BLE and Wi-Fi Direct

export type FileMetadata = {
  fileId: string;
  fileName: string;
  fileType: string;         // 'image/jpeg', 'video/mp4'
  totalChunks: number;
  fileSize: number;
  senderId: string;
};

export type DataChunk = {
  type: 'CHUNK';
  fileId: string;
  chunkIndex: number;
  payload: string;          // We will use Base64 string for text-based mesh APIs
};

export type HeaderChunk = {
  type: 'HEADER';
  metadata: FileMetadata;
};

export type Packet = HeaderChunk | DataChunk;

export class ChunkingEngine {
  // A temporary store for assembling incoming packets
  // Key: fileId, Value: map of chunkIndex -> payload
  private incomingMedia: Map<string, { 
    metadata: FileMetadata; 
    chunks: Map<number, string>;
    lastUpdate: number;
  }> = new Map();

  /**
   * 1. PREPARE TO SEND
   * Takes a full Base64 string of the file (Image/Video) and splits it into smaller Chunks
   */
  public async prepareMediaChunks(
    base64Data: string, 
    fileName: string, 
    fileType: string, 
    senderId: string
  ): Promise<{ metadata: FileMetadata; chunks: DataChunk[] }> {
    
    const fileId = this.generateUUID();
    const fileSize = base64Data.length; // Base64 length representation
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    
    console.log(`[Chunking Engine] Splitting ${fileName} into ${totalChunks} chunks...`);

    const metadata: FileMetadata = {
      fileId,
      fileName,
      fileType,
      totalChunks,
      fileSize,
      senderId
    };

    const chunks: DataChunk[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileSize);
        const chunkPayload = base64Data.slice(start, end);

        chunks.push({
            type: 'CHUNK',
            fileId,
            chunkIndex: i,
            payload: chunkPayload
        });
    }

    return { metadata, chunks };
  }

  /**
   * 2. RECEIVE HEADER
   * When the other device announces it is sending a file
   */
  public handleHeader(header: HeaderChunk) {
      console.log(`[Chunking Engine] Incoming file announced: ${header.metadata.fileName} (${header.metadata.totalChunks} chunks)`);
      this.incomingMedia.set(header.metadata.fileId, {
          metadata: header.metadata,
          chunks: new Map(),
          lastUpdate: Date.now()
      });
  }

  /**
   * 3. RECEIVE & ASSEMBLE CHUNK
   * Continuously assemble pieces back together.
   * Emits progress percentage for the UI.
   */
  public handleChunk(chunk: DataChunk, onProgress: (fileId: string, progress: number) => void): { isComplete: boolean, finalBase64?: string, metadata?: FileMetadata } {
      const fileRecord = this.incomingMedia.get(chunk.fileId);
      if (!fileRecord) {
          console.warn(`[Chunking Engine] Received chunk for unknown file ID: ${chunk.fileId}`);
          return { isComplete: false }; // Missing header packet
      }

      // Save the piece
      fileRecord.chunks.set(chunk.chunkIndex, chunk.payload);
      fileRecord.lastUpdate = Date.now();

      const receivedChunksCount = fileRecord.chunks.size;
      const progress = (receivedChunksCount / fileRecord.metadata.totalChunks) * 100;
      
      // Notify the UI (e.g. ChatBubble progress bar)
      onProgress(chunk.fileId, progress);

      // Check if file is fully received
      if (receivedChunksCount === fileRecord.metadata.totalChunks) {
          console.log(`[Chunking Engine] File fully assembled: ${fileRecord.metadata.fileName}`);
          return {
              isComplete: true,
              finalBase64: this.assembleFile(chunk.fileId),
              metadata: fileRecord.metadata
          };
      }

      return { isComplete: false };
  }

  /**
   * 4. FINAL ASSEMBLE
   * Merge all chunks in order back into a single Base64 string
   */
  private assembleFile(fileId: string): string {
      const fileRecord = this.incomingMedia.get(fileId);
      if (!fileRecord) return '';

      const { metadata, chunks } = fileRecord;
      let completeBase64 = '';

      // Reconstruct in EXACT sequential order
      for (let i = 0; i < metadata.totalChunks; i++) {
          const part = chunks.get(i);
          if (part) {
              completeBase64 += part;
          } else {
              console.error(`[Chunking Engine] 🔴 Fatal: Missing chunk index ${i}`);
              // In a real app we would request the sender to re-transmit chunk `i`
          }
      }

      // Cleanup memory
      this.incomingMedia.delete(fileId);
      return completeBase64;
  }

  /**
   * Utilities
   */
  private generateUUID(): string {
      return 'file-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
}

export default new ChunkingEngine();
