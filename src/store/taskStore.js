import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useTaskStore = create((set) => ({
  tasks: [],
  upcomingTasks: [],
  pagination: null,
  isLoading: false,

  fetchTasks: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/tasks', { params });
      set({ tasks: data.tasks, pagination: data.pagination, isLoading: false });
    } catch {
      set({ isLoading: false });
      toast.error('Failed to fetch tasks');
    }
  },

  fetchUpcomingTasks: async () => {
    try {
      const { data } = await api.get('/tasks/upcoming');
      set({ upcomingTasks: data });
    } catch {
      toast.error('Failed to fetch upcoming tasks');
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData);
      set((state) => ({ tasks: [data, ...state.tasks] }));
      toast.success('Task created');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
      return { success: false };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? data : t)),
      }));
      toast.success('Task updated');
      return { success: true };
    } catch {
      toast.error('Failed to update task');
      return { success: false };
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      toast.success('Task deleted');
      return { success: true };
    } catch {
      toast.error('Failed to delete task');
      return { success: false };
    }
  },
}));
