const taskService = require('../services/task.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class TaskController {
  async create(req, res) {
    try {
      const { taskName, description, requirement, status, customer, members } = req.body;
      if (!taskName) return errorResponse(res, 'Task name is required', 400);

      const attachment = req.file ? req.file.filename : null;
      const memberIds = members ? JSON.parse(members) : [];

      const task = await taskService.createTask({
        taskName, description, requirement, attachment, status, customer, members: memberIds,
      });
      return successResponse(res, { task }, 'Task created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { taskName, description, requirement, status, customer, members } = req.body;
      const memberIds = members ? JSON.parse(members) : undefined;
      const task = await taskService.updateTask(id, { taskName, description, requirement, status, customer, members: memberIds });
      return successResponse(res, { task }, 'Task updated successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }

  async getAll(req, res) {
    try {
      const tasks = await taskService.getAllTasks();
      return successResponse(res, { tasks }, 'Tasks fetched successfully', 200);
    } catch (error) {
      return errorResponse(res, error.message, 500, error);
    }
  }
}

module.exports = new TaskController();
