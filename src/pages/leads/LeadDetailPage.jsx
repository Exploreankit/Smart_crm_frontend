import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Plus, Phone, Mail,
  Building2, DollarSign, Calendar, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useLeadStore } from '../../store/leadStore';
import { useAuthStore } from '../../store/authStore';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LeadForm from '../../components/leads/LeadForm';
import TaskForm from '../../components/tasks/TaskForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const activityIcons = {
  LEAD_CREATED: '🆕', STATUS_CHANGE: '🔄', NOTE: '📝',
  CALL: '📞', MEETING: '🤝', EMAIL: '📧',
  TASK_CREATED: '✅', TASK_COMPLETED: '🎉',
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentLead, fetchLeadById, deleteLead, addNote, logActivity, isLoading } = useLeadStore();
  const { user } = useAuthStore();

  const [editModal, setEditModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activityForm, setActivityForm] = useState({ type: 'CALL', description: '' });
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    fetchLeadById(id);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    const result = await deleteLead(id);
    if (result.success) navigate('/leads');
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    await addNote(id, noteText);
    setNoteText('');
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.description.trim()) return;
    await logActivity(id, activityForm);
    setActivityForm({ type: 'CALL', description: '' });
  };

  if (isLoading || !currentLead) return <LoadingSpinner className="h-64" />;

  const lead = currentLead;
  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditModal(true)} className="btn-secondary">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          {user?.role === 'ADMIN' && (
            <button onClick={handleDelete} className="btn-danger">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lead info */}
        <div className="space-y-4">
          {/* Main card */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
                {lead.company && (
                  <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400">
                    <Building2 className="w-4 h-4" />
                    <span>{lead.company}</span>
                  </div>
                )}
              </div>
              <Badge value={lead.temperature} showIcon />
            </div>

            {/* Score */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Lead Score</span>
                <span className="font-bold text-gray-900 dark:text-white">{lead.score}/100</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    lead.score >= 70 ? 'bg-red-500' : lead.score >= 40 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${lead.score}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${lead.email}`} className="text-primary-600 hover:underline">{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(lead.dealValue)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  Created {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Badge value={lead.status} />
              {lead.source && (
                <span className="text-xs text-gray-500 dark:text-gray-400">via {lead.source}</span>
              )}
            </div>

            {lead.assignedTo && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {lead.assignedTo.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Assigned to <span className="font-medium text-gray-900 dark:text-white">{lead.assignedTo.name}</span>
                </span>
              </div>
            )}

            {lead.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Tasks ({lead.tasks?.length || 0})</h3>
              <button onClick={() => setTaskModal(true)} className="text-primary-600 hover:text-primary-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {lead.tasks?.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {lead.tasks?.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      task.status === 'COMPLETED' ? 'bg-green-500' :
                      task.status === 'OVERDUE' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due {format(new Date(task.dueDate), 'MMM d')} · <Badge value={task.status} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity, Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="card">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {['activity', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab} ({tab === 'activity' ? lead.activities?.length : lead.notes?.length})
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {/* Log activity form */}
                  <form onSubmit={handleLogActivity} className="flex gap-2">
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                      className="input w-32 flex-shrink-0"
                    >
                      <option value="CALL">📞 Call</option>
                      <option value="MEETING">🤝 Meeting</option>
                      <option value="EMAIL">📧 Email</option>
                    </select>
                    <input
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                      placeholder="Describe the activity..."
                      className="input flex-1"
                    />
                    <button type="submit" className="btn-primary flex-shrink-0">Log</button>
                  </form>

                  {/* Activity list */}
                  <div className="space-y-3">
                    {lead.activities?.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <span className="text-lg">{activityIcons[activity.type] || '📌'}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {activity.user?.name} · {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {/* Add note form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      rows={3}
                      className="input resize-none"
                    />
                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary">
                        <MessageSquare className="w-4 h-4" />
                        Add Note
                      </button>
                    </div>
                  </form>

                  {/* Notes list */}
                  <div className="space-y-3">
                    {lead.notes?.map((note) => (
                      <div key={note.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                            {note.user?.name?.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {note.user?.name} · {format(new Date(note.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Lead" size="lg">
        <LeadForm
          lead={lead}
          onSuccess={() => { setEditModal(false); fetchLeadById(id); }}
          onCancel={() => setEditModal(false)}
        />
      </Modal>

      {/* Task modal */}
      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Create Task">
        <TaskForm
          leadId={id}
          onSuccess={() => { setTaskModal(false); fetchLeadById(id); }}
          onCancel={() => setTaskModal(false)}
        />
      </Modal>
    </div>
  );
}
