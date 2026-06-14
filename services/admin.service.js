const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt.util');
const ROLES = require('../constants/roles');

class AdminService {
  async registerAdmin(name, email, password, confirmPassword, role, department) {
    // Validation
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new Error('Email already registered');
    }

    const assignedRole = role && [ROLES.ADMIN, ROLES.MEMBER].includes(role) ? role : ROLES.MEMBER;

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      role: assignedRole,
      department: department || null,
    });

    await admin.save();

    const token = generateToken(admin._id);

    return {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
    };
  }

  async loginAdmin(email, password) {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error('Invalid email');
    }

    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new Error('Invalid password');
    }

    const token = generateToken(admin._id);

    return {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async updateAdmin(id, { name, email, role, department }) {
    const admin = await Admin.findById(id);
    if (!admin) throw new Error('Member not found');

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role && [ROLES.ADMIN, ROLES.MEMBER].includes(role)) admin.role = role;
    if (department !== undefined) admin.department = department || null;

    await admin.save();

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
    };
  }

  async changePassword(id, currentPassword, newPassword, confirmPassword) {
    const admin = await Admin.findById(id);
    if (!admin) throw new Error('Admin not found');

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error('All password fields are required');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New passwords do not match');
    }

    const isCurrentPasswordCorrect = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      throw new Error('Current password is incorrect');
    }

    admin.password = newPassword;
    await admin.save();

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
    };
  }

  async getAllAdmins() {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    return admins.map((admin) => ({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
      createdAt: admin.createdAt,
    }));
  }

  async getAdminById(id) {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new Error('Admin not found');
    }

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
      createdAt: admin.createdAt,
    };
  }
}

module.exports = new AdminService();
