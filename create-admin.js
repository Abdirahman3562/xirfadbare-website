// Script to create admin user
import fetch from 'node-fetch';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
  try {
    // Create admin user directly in database or via API
    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@xirfadbare.com",
      password: "admin123", // This will be hashed
      phone: "252619537487",
      role: "admin"
    };

    console.log('Creating admin user...');
    console.log('Email: admin@xirfadbare.com');
    console.log('Password: admin123');

    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    console.log('Response:', result);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdminUser();

