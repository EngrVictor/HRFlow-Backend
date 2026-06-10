import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Role from '../models/Role.js';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  await mongoose.connect(process.env.MONGODB_URI);

  const adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    console.error('Run seedRBAC.js first');
    process.exit(1);
  }

  let adminUser = await User.findOne({ email: 'admin@company.com' });
  if (!adminUser) {
    const hash = await bcrypt.hash('Admin123!', 10);
    adminUser = await User.create({
      email: 'admin@company.com',
      password: hash,
      roles: [adminRole._id],
      isActive: true
    });
    console.log('Admin user created');
  }

  let adminEmployee = await Employee.findOne({ user: adminUser._id });
  if (!adminEmployee) {
    adminEmployee = await Employee.create({
      user: adminUser._id,
      employeeCode: 'ADMIN001',
      firstName: 'System',
      lastName: 'Admin',
      department: 'IT',
      position: 'Administrator'
    });
    console.log('Admin employee profile created');
  }

  console.log('Bootstrap complete');
  process.exit(0);
}

bootstrap();