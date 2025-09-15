#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const prisma = new PrismaClient();

  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@studygroup.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'System Administrator';

    console.log(`Creating admin account: ${adminEmail}`);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists:', adminEmail);
      console.log('   ID:', existingAdmin.id);
      console.log('   Role:', existingAdmin.role);
      return existingAdmin;
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isProfileComplete: true
      }
    });

    console.log('✅ Default admin account created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('   ID:', admin.id);

    return admin;

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('Admin setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdmin };