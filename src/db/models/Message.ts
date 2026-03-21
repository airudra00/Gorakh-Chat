import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Message extends Model {
  static table = 'messages';

  @field('text') text!: string;
  @field('is_mine') isMine!: boolean;
  @field('peer_id') peerId!: string;
  @readonly @date('created_at') createdAt!: Date;
}
