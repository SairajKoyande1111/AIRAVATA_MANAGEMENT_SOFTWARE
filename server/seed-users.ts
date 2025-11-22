import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';

const USERS = [
  { email: 'raneaniket23@gmail.com', password: 'Aniket@132231', name: 'Aniket Rane' },
  { email: 'sairajkoyande@gmail.com', password: 'Sairaj@132231', name: 'Sairaj Koyande' },
  { email: 'sejalyadav351@gmail.com', password: 'Sejal@132231', name: 'Sejal Yadav' },
  { email: 'pratikkadam2244@gmail.com', password: 'Pratik@132231', name: 'Pratik Kadam' },
  { email: 'abhijeet18012001@gmail.com', password: 'Abhijeet@132231', name: 'Abhijeet' },
];

async function seedUsers() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  for (const userData of USERS) {
    const existingUser = await User.findOne({ email: userData.email });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      });
      await user.save();
      console.log(`✅ Created user: ${userData.email}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }

  console.log('✅ User seeding completed');
  await mongoose.disconnect();
  process.exit(0);
}

seedUsers().catch(console.error);
