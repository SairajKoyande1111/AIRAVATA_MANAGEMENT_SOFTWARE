import mongoose from 'mongoose';
import User from './models/User';

async function deleteAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const result = await User.deleteOne({ email: 'admin@company.com' });
  
  if (result.deletedCount > 0) {
    console.log('✅ Deleted admin user');
  } else {
    console.log('ℹ️  No admin user found');
  }

  await mongoose.disconnect();
  process.exit(0);
}

deleteAdmin().catch(console.error);
