const Task = require('../models/Task');

class TaskService {
  async createTask({ taskName, description, requirement, attachment, status, customer, members }) {
    const task = new Task({ taskName, description, requirement, attachment, status, customer, members });
    await task.save();
    return await Task.findById(task._id)
      .populate('customer', 'name email')
      .populate('members', 'name email role');
  }

  async getAllTasks() {
    return await Task.find()
      .populate('customer', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });
  }

  async updateTask(id, { taskName, description, requirement, status, customer, members }) {
    const task = await Task.findById(id);
    if (!task) throw new Error('Task not found');
    if (taskName)             task.taskName    = taskName;
    if (description !== undefined) task.description = description;
    if (requirement !== undefined) task.requirement = requirement;
    if (status)               task.status      = status;
    if (customer !== undefined)    task.customer    = customer || null;
    if (members)              task.members     = members;
    await task.save();
    return await Task.findById(task._id)
      .populate('customer', 'name email')
      .populate('members', 'name email role');
  }

  async getTaskById(id) {
    const task = await Task.findById(id)
      .populate('customer', 'name email')
      .populate('members', 'name email role');
    if (!task) throw new Error('Task not found');
    return task;
  }
}

module.exports = new TaskService();
