import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import api from '../../lib/api';
import { format } from 'date-fns';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export default function TaskForm({ task, leadId, onSuccess, onCancel }) {
  const { createTask, updateTask } = useTaskStore();
  const [leads, setLeads] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : '',
    priority: task?.priority || 'MEDIUM',
    leadId: task?.leadId || leadId || '',
  });

  useEffect(() => {
    if (!leadId) {
      api.get('/leads', { params: { limit: 100 } })
        .then(({ data }) => setLeads(data.leads))
        .catch(() => {});
    }
  }, [leadId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = task
      ? await updateTask(task.id, form)
      : await createTask(form);

    setIsSubmitting(false);
    if (result.success) onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Task Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="input"
          placeholder="Follow up with client"
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="input resize-none"
          placeholder="Task details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Due Date *</label>
          <input
            name="dueDate"
            type="datetime-local"
            value={form.dueDate}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input">
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {!leadId && (
        <div>
          <label className="label">Linked Lead *</label>
          <select name="leadId" value={form.leadId} onChange={handleChange} required className="input">
            <option value="">Select a lead</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name} — {l.company}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
