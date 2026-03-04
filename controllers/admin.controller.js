const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class AdminController {
  async signup(req, res) {
    try {
      const { name, email, password, confirmPassword, role, department } = req.body;

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        return errorResponse(res, 'All fields are required', 400);
      }

      const result = await adminService.registerAdmin(name, email, password, confirmPassword, role, department);

      return successResponse(
        res,
        result,
        'Admin registered successfully',
        201
      );
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 400);
      }

      const result = await adminService.loginAdmin(email, password);

      return successResponse(res, result, 'Login successful', 200);
    } catch (error) {
      return errorResponse(res, error.message, 401, error);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, department } = req.body;
      const admin = await adminService.updateAdmin(id, { name, email, role, department });
      return successResponse(res, { admin }, 'Member updated successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async getAll(req, res) {
    try {
      const admins = await adminService.getAllAdmins();
      return successResponse(res, { admins }, 'Members fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async getMe(req, res) {
    try {
      const admin = await adminService.getAdminById(req.user.id);
      return successResponse(res, { admin }, 'Admin fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }
}

module.exports = new AdminController();
