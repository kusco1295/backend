const materialService = require('../services/material.service');
const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class MaterialController {
  async getAll(req, res) {
    try {
      const materials = await materialService.getAllMaterials();
      return successResponse(res, { materials }, 'Materials fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }

  async add(req, res) {
    try {
      const { name, materialType, description, quantity } = req.body;
      const admin = await adminService.getAdminById(req.user.id);
      const material = await materialService.addMaterial({
        name,
        materialType,
        description,
        quantity,
        performedBy: admin.name,
      });
      return successResponse(res, { material }, 'Material added successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async withdraw(req, res) {
    try {
      const { name, materialType, description, quantity } = req.body;
      const admin = await adminService.getAdminById(req.user.id);
      const material = await materialService.withdrawMaterial({
        name,
        materialType,
        description,
        quantity,
        performedBy: admin.name,
      });
      return successResponse(res, { material }, 'Material withdrawn successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }
}

module.exports = new MaterialController();
