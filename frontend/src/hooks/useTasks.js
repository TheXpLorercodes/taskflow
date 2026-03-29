import { useState, useCallback } from 'react';
import { taskAPI } from '../services/api';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try {
      const { data } = await taskAPI.getAll(params);
      setTasks(data.data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await taskAPI.getStats();
      setStats(data.data);
    } catch (_) {}
  }, []);

  const createTask = async (taskData) => {
    const { data } = await taskAPI.create(taskData);
    setTasks(prev => [data.data.task, ...prev]);
    return data.data.task;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await taskAPI.update(id, taskData);
    setTasks(prev => prev.map(t => t._id === id ? data.data.task : t));
    return data.data.task;
  };

  const deleteTask = async (id) => {
    await taskAPI.delete(id);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  return { tasks, stats, pagination, loading, error, fetchTasks, fetchStats, createTask, updateTask, deleteTask };
};

export default useTasks;
