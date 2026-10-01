const User = require('../models/User');
const connectDB = require('../config/db');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Seed script: Create initial admin user.
 * Run: npm run seed:admin
 */
async function seedAdmin() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@docterapp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Platform Admin';

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(` Admin user already exists: ${adminEmail}`);
      process.exit(0);
    }

    const admin = new User({
      name: adminName,
      email: adminEmail,
      role: 'admin',
      isActive: true,
    });

    await User.register(admin, adminPassword);

    console.log(`Admin user created successfully!`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: admin`);
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
