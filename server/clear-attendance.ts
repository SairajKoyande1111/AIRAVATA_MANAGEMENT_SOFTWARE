import mongoose from 'mongoose';
import Attendance from './models/Attendance';

async function clearAttendance() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const result = await Attendance.deleteMany({});
  
  console.log(`✅ Deleted ${result.deletedCount} attendance records`);

  await mongoose.disconnect();
  process.exit(0);
}

clearAttendance().catch(console.error);
