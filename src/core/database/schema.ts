import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * WatermelonDB Schema for Gorakh Chat 
 * 
 * Why WatermelonDB? 
 * It's lazy-loaded and built on SQLite. Even if a user has 100,000 offline 
 * mesh messages or 10,000 images, the UI thread (React Native) won't freeze.
 */
export const schema = appSchema({
  version: 1,
  tables: [
    // 1. users Table: Stores nearby mesh users & their public keys (IDs)
    tableSchema({
      name: 'users',
      columns: [
        { name: 'public_key', type: 'string', isIndexed: true }, // The Device/User ID
        { name: 'display_name', type: 'string' },
        { name: 'last_seen', type: 'number' },                   // Timestamp when last detected on Mesh
        { name: 'is_nearby', type: 'boolean' },                  // Currently in range?
        { name: 'avatar_uri', type: 'string', isOptional: true } // Local Base64 or path
      ]
    }),

    // 2. messages Table: The high-speed offline chat ledger
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'sender_public_key', type: 'string', isIndexed: true },
        { name: 'receiver_public_key', type: 'string', isIndexed: true },
        { name: 'text_content', type: 'string', isOptional: true },
        { name: 'media_uri', type: 'string', isOptional: true }, // For Images/Voice notes
        { name: 'media_type', type: 'string', isOptional: true }, // 'image/jpeg', 'audio/aac'
        { name: 'timestamp', type: 'number', isIndexed: true },
        
        // Delivery states: 
        // 0: Sending, 1: Mesh Queued, 2: Relayed (Sent to a hopper), 3: Delivered (End target got it), 4: Read
        { name: 'status', type: 'number' }, 
        { name: 'is_mine', type: 'boolean' } // Did I send this?
      ]
    })
  ]
});
