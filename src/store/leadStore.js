import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useLeadStore = create((set, get) => ({
  leads: [],
  pipeline: { NEW: [], CONTACTED: [], QUALIFIED: [], CLOSED: [] },
  currentLead: null,
  pagination: null,
  isLoading: false,

  fetchLeads: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/leads', { params });
      set({ leads: data.leads, pagination: data.pagination, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch leads');
    }
  },

  fetchPipeline: async () => {
    try {
      const { data } = await api.get('/leads/pipeline');
      set({ pipeline: data });
    } catch (error) {
      toast.error('Failed to fetch pipeline');
    }
  },

  fetchLeadById: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/leads/${id}`);
      set({ currentLead: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch lead');
    }
  },

  createLead: async (leadData) => {
    try {
      const { data } = await api.post('/leads', leadData);
      set((state) => ({
        leads: [data, ...state.leads],
        pipeline: {
          ...state.pipeline,
          [data.status]: [data, ...state.pipeline[data.status]],
        },
      }));
      toast.success('Lead created successfully');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create lead');
      return { success: false };
    }
  },

  updateLead: async (id, leadData) => {
    try {
      const { data } = await api.put(`/leads/${id}`, leadData);
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? data : l)),
        currentLead: state.currentLead?.id === id ? data : state.currentLead,
      }));
      toast.success('Lead updated successfully');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update lead');
      return { success: false };
    }
  },

  updateLeadStatus: async (id, status) => {
    try {
      const { data } = await api.patch(`/leads/${id}/status`, { status });

      // Update pipeline state optimistically
      set((state) => {
        const newPipeline = { ...state.pipeline };
        // Remove from all stages
        Object.keys(newPipeline).forEach((stage) => {
          newPipeline[stage] = newPipeline[stage].filter((l) => l.id !== id);
        });
        // Add to new stage
        const existingLead = state.leads.find((l) => l.id === id);
        if (existingLead) {
          newPipeline[status] = [{ ...existingLead, status }, ...newPipeline[status]];
        }

        return {
          pipeline: newPipeline,
          leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
        };
      });

      return { success: true };
    } catch (error) {
      toast.error('Failed to update lead status');
      return { success: false };
    }
  },

  deleteLead: async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }));
      toast.success('Lead deleted');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete lead');
      return { success: false };
    }
  },

  addNote: async (leadId, content) => {
    try {
      const { data } = await api.post(`/leads/${leadId}/notes`, { content });
      set((state) => ({
        currentLead: state.currentLead
          ? { ...state.currentLead, notes: [data, ...state.currentLead.notes] }
          : null,
      }));
      toast.success('Note added');
      return { success: true, data };
    } catch (error) {
      toast.error('Failed to add note');
      return { success: false };
    }
  },

  logActivity: async (leadId, activityData) => {
    try {
      const { data } = await api.post(`/leads/${leadId}/activities`, activityData);
      set((state) => ({
        currentLead: state.currentLead
          ? { ...state.currentLead, activities: [data, ...state.currentLead.activities] }
          : null,
      }));
      toast.success('Activity logged');
      return { success: true };
    } catch (error) {
      toast.error('Failed to log activity');
      return { success: false };
    }
  },
}));
