import ChunkEngine, { FileMetadata, DataChunk, HeaderChunk, Packet } from './ChunkingProtocol';
// import ConnectionManager from './ConnectionManager'; 
// import Encryptor from '../crypto/Encryptor';

class MediaRelay {
  // A queue for packets waiting to be sent over Mesh
  private outboundQueue: {
    targetUserId: string;
    packet: string; // The fully encrypted payload JSON
  }[] = [];
  
  private isProcessingQueue = false;

  /**
   * Main Entry point to SEND Media (Image/Voice/Video)
   */
  public async sendMedia(
    base64Data: string, 
    fileName: string, 
    fileType: string, 
    senderId: string, 
    targetUserId: string
  ) {
    console.log(`[Media Relay] Starting process to send ${fileType} to ${targetUserId}`);
    
    // Step 1: Split Media into manageable chunks
    const { metadata, chunks } = await ChunkEngine.prepareMediaChunks(
      base64Data, 
      fileName, 
      fileType, 
      senderId
    );

    // Step 2: Create HEADER packet
    const headerPacket: HeaderChunk = {
      type: 'HEADER',
      metadata
    };
    await this.queuePacket(targetUserId, headerPacket);

    // Step 3: Create CHUNK packets
    console.log(`[Media Relay] Queueing ${chunks.length} data packets...`);
    for (const chunk of chunks) {
      await this.queuePacket(targetUserId, chunk);
    }
  }

  /**
   * Queue the payload for processing. We apply encryption here, right before enqueueing.
   */
  private async queuePacket(targetUserId: string, unencryptedPacket: Packet) {
    const rawString = JSON.stringify(unencryptedPacket);

    // TODO: Encrypt using Signal Protocol with targetUserId's public key
    // const encryptedString = Encryptor.encrypt(rawString, targetUserId);
    const mockEncryptedString = rawString; 

    this.outboundQueue.push({
      targetUserId,
      packet: mockEncryptedString
    });

    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  /**
   * Dequeue and execute Mesh Sending ONE BY ONE with delays
   * This is CRITICAL because BLE connections have tiny buffers. Sending 100 packets instantly drops 90 of them.
   */
  private async processQueue() {
    this.isProcessingQueue = true;

    while (this.outboundQueue.length > 0) {
      const task = this.outboundQueue.shift();
      if (!task) continue;

      try {
        // Send packet via native SDK or Bridgefy layer
        // await ConnectionManager.sendPacket(task.targetUserId, task.packet);
        console.log(`[Media Relay] Sending packet... (${this.outboundQueue.length} remaining)`);
        
        // THROTTLING IS KEY FOR MESH NETWORKS
        // Need to wait ~100-300ms depending on whether it's BLE or Wi-Fi Direct.
        // E.g. Wi-Fi direct can handle no-delay, but BLE needs breathing room.
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error("[Media Relay] Failed to send packet, re-queueing", error);
        // Put it back to the top of the queue upon failure
        this.outboundQueue.unshift(task);
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait before retry
      }
    }

    console.log(`[Media Relay] Queue processing finished! Empty queue.`);
    this.isProcessingQueue = false;
  }

  /**
   * Main Entry point to RECEIVE Packets from Mesh Network (Called from ConnectionManager)
   */
  public async onMeshPacketReceived(encryptedPacketStr: string, senderId: string) {
    try {
        // Step 1: Decrypt
        // const rawString = Encryptor.decrypt(encryptedPacketStr, myPrivateKey);
        const rawString = encryptedPacketStr;
        const parsedPacket = JSON.parse(rawString) as Packet;

        // Step 2: Push into Chunk Engine
        if (parsedPacket.type === 'HEADER') {
            ChunkEngine.handleHeader(parsedPacket);
        } else if (parsedPacket.type === 'CHUNK') {
            const { isComplete, finalBase64, metadata } = ChunkEngine.handleChunk(
                parsedPacket as DataChunk, 
                (fileId, progress) => {
                    // Bubble event to React UI
                    console.log(`[Media Relay UI] File ${fileId} progress: ${progress.toFixed(2)}%`);
                }
            );

            // Step 3: Reassembly completed!
            if (isComplete && finalBase64 && metadata) {
                console.log(`[Media Relay UI] 🎉 MEDIA SUCCESSFULLY ASSEMBLED! ${metadata.fileName}`);
                // TODO: Save to File system or SQLite Database
                // FileSystem.save(finalBase64, metadata.fileName, metadata.fileType);
                // Dispatch Redux Action: ChatStore.addMessage({ media: localUri });
            }
        }
    } catch (error) {
         console.error("[Media Relay] Packet dropping - Corrupted or wrong encryption key", error);
    }
  }
}

export default new MediaRelay();
