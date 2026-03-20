import { Model, relation } from '@nozbe/watermelondb';
import { field, boolean, date } from '@nozbe/watermelondb/decorators';
import User from './User';

/**
 * Message Model
 * Handles both Chat Texts and Media messages (Image, Voice Note)
 */
export default class Message extends Model {
  static table = 'messages';

  // To whom is the message sent, and who sent it?
  @field('sender_public_key') senderPublicKey!: string;
  @field('receiver_public_key') receiverPublicKey!: string;

  // The actual text (or null if it's pure media)
  @field('text_content') textContent?: string;

  // Paths / Metadata for files
  @field('media_uri') mediaUri?: string;     // file:// path or content://
  @field('media_type') mediaType?: string;   // 'image/jpeg', 'audio/aac'

  // Metadata
  @date('timestamp') timestamp!: Date;
  @boolean('is_mine') isMine!: boolean;      // Did I write this?
  
  // Delivery status is especially important for Mesh Networks
  // 0: sending (loading..)
  // 1: queued (waiting for network/mesh)
  // 2: relayed (Hop took the message but target hasn't received it yet)
  // 3: delivered (Target phone got it)
  // 4: read (Double blue tick)
  @field('status') deliveryStatus!: number;
}
