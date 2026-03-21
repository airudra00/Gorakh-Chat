import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const appDatabaseSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'public_key', type: 'string' },
        { name: 'mac_address', type: 'string' },
        { name: 'last_seen', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'text', type: 'string' },
        { name: 'is_mine', type: 'boolean' },
        { name: 'peer_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
