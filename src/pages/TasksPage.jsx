import { useEffect, useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function TasksPage() {
  const { tasks, fetchTasks, updateTask, deleteTask, isLoading } = useTaskStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTasks({ status: statusFilter });
  }, [statusFilter]);

  const handleComplete = async (task) => {
    await updateTask(task.id, { status: 'COMPLETED' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
  };

  const priorityColor = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-gray-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tasks.length} tasks</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex gap-2">
          {['', 'PENDING', 'COMPLETED', 'OVERDUE'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner className="h-64" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No tasks found"
          description="Create a task to track follow-ups and reminders"
          action={
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          }
        />
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {/* Priority dot */}
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${priorityColor[task.priority]}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-sm font-medium ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {task.lead && (
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          {task.lead.name} · {task.lead.company}
                        </span>
                      )}
                      <div className={`flex items-center gap-1 text-xs ${
                        task.status === 'OVERDUE' ? 'text-red-500' :
                        isPast(new Date(task.dueDate)) && task.status === 'PENDING' ? 'text-orange-500' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge value={task.status} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => handleComplete(task)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Mark complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditTask(task)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  title="Edit"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task">
        <TaskForm
          onSuccess={() => { setShowCreateModal(false); fetchTasks(); }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm
          task={editTask}
          onSuccess={() => { setEditTask(null); fetchTasks(); }}
          onCancel={() => setEditTask(null)}
        />
      </Modal>
    </div>
  );
}
