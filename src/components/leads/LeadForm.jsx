import { useState, useEffect } from 'react';
import { useLeadStore } from '../../store/leadStore';
import api from '../../lib/api';

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'];
const SOURCE_OPTIONS = ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Conference', 'Email', 'Other'];

export default function LeadForm({ lead, onSuccess, onCancel }) {
  const { createLead, updateLead } = useLeadStore();
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    dealValue: lead?.dealValue || '',
    status: lead?.status || 'NEW',
    source: lead?.source || '',
    assignedToId: lead?.assignedToId || '',
    tags: lead?.tags?.join(', ') || '',
  });

  useEffect(() => {
    // Fetch users for assignment dropdown
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      dealValue: parseFloat(form.dealValue) || 0,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    const result = lead
      ? await updateLead(lead.id, payload)
      : await createLead(payload);

    setIsSubmitting(false);
    if (result.success) onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="input"
            placeholder="john@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input"
            placeholder="+1-555-0100"
          />
        </div>
        <div>
          <label className="label">Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            className="input"
            placeholder="Acme Corp"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Deal Value ($)</label>
          <input
            name="dealValue"
            type="number"
            min="0"
            value={form.dealValue}
            onChange={handleChange}
            className="input"
            placeholder="10000"
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Source</label>
          <select name="source" value={form.source} onChange={handleChange} className="input">
            <option value="">Select source</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assign To</label>
          <select name="assignedToId" value={form.assignedToId} onChange={handleChange} className="input">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Tags (comma-separated)</label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          className="input"
          placeholder="enterprise, priority, q1"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
