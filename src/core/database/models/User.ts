import { Model } from '@nozbe/watermelondb';
import { field, boolean, date } from '@nozbe/watermelondb/decorators';

/**
 * WatermelonDB User Model (Mapped to 'users' table)
 * A user in Gorakh Chat is any device/person identified by Ed25519 Public Key.
 */
export default class User extends Model {
  static table = 'users';

  // @field means it will be stored exactly as string/number in DB
  @field('public_key') publicKey!: string;
  @field('display_name') displayName!: string;
  @field('avatar_uri') avatarUri?: string;

  // Real-time Mesh connection state (Is this user currently reachable via BLE/Wi-Fi?)
  @boolean('is_nearby') isNearby!: boolean;

  // Used for keeping track of the last time we saw this user mesh-broadcasting.
  @date('last_seen') lastSeen!: Date;
}
