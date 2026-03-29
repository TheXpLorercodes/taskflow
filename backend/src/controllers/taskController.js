const Task = require('../models/Task');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const buildTaskQuery = (queryParams, userId, isAdmin) => {
  const filter = isAdmin ? {} : { owner: userId };
  const { status, priority, search, tags } = queryParams;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (tags) filter.tags = { $in: tags.split(',') };
  if (search) filter.$text = { $search: search };
  return filter;
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user._id });
    await task.populate('owner', 'name email');
    return ApiResponse.created(res, { task }, 'Task created');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const isAdmin = req.user.role === 'admin';
    const filter = buildTaskQuery(req.query, req.user._id, isAdmin);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter).populate('owner', 'name email').sort(sort).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    return ApiResponse.paginated(res, { tasks }, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const getTask = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.owner = req.user._id;

    const task = await Task.findOne(query).populate('owner', 'name email');
    if (!task) return ApiResponse.notFound(res, 'Task not found');
    return ApiResponse.success(res, { task });
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.owner = req.user._id;

    const task = await Task.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email');

    if (!task) return ApiResponse.notFound(res, 'Task not found');
    return ApiResponse.success(res, { task }, 'Task updated');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.owner = req.user._id;

    const task = await Task.findOneAndDelete(query);
    if (!task) return ApiResponse.notFound(res, 'Task not found');
    return ApiResponse.success(res, {}, 'Task deleted');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const getTaskStats = async (req, res) => {
  try {
    const matchStage = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPriority: {
            $avg: { $switch: { branches: [
              { case: { $eq: ['$priority', 'low'] }, then: 1 },
              { case: { $eq: ['$priority', 'medium'] }, then: 2 },
              { case: { $eq: ['$priority', 'high'] }, then: 3 },
            ], default: 0 } },
          },
        },
      },
    ]);

    const overdue = await Task.countDocuments({
      ...matchStage,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    });

    return ApiResponse.success(res, { stats, overdue }, 'Stats fetched');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

// Admin only
const getAllUsers = async (req, res) => {
  const User = require('../models/User');
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);
    return ApiResponse.paginated(res, { users }, { page: parseInt(page), limit: parseInt(limit), total });
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const toggleUserStatus = async (req, res) => {
  const User = require('../models/User');
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    if (user._id.toString() === req.user._id.toString()) {
      return ApiResponse.badRequest(res, 'Cannot deactivate yourself');
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats, getAllUsers, toggleUserStatus };
