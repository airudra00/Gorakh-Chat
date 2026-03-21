import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { appDatabaseSchema } from './schema';
import Message from './models/Message';
import User from './models/User';

const adapter = new SQLiteAdapter({
  schema: appDatabaseSchema,
  jsi: true, // Absolutely maximum C++ thread efficiency 
  onSetUpError: error => {
    console.error('🚨 [WatermelonDB] Setup error:', error);
  }
});

const database = new Database({
  adapter,
  modelClasses: [Message, User],
});

export default database;
