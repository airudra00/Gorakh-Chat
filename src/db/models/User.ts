import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @field('public_key') publicKey!: string;
  @field('mac_address') macAddress!: string;
  @date('last_seen') lastSeen!: Date;
}
